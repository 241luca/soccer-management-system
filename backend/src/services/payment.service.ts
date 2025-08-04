import { PrismaClient, Payment, PaymentStatus } from '@prisma/client';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface CreatePaymentInput {
  organizationId: string;
  athleteId: string;
  paymentTypeId?: string;
  type?: string;
  description: string;
  amount: number;
  dueDate: Date;
  notes?: string;
}

export interface UpdatePaymentInput {
  id: string;
  organizationId: string;
  description?: string;
  amount?: number;
  dueDate?: Date;
  status?: PaymentStatus;
  notes?: string;
}

export interface RecordPaymentInput {
  id: string;
  organizationId: string;
  paidDate: Date;
  paymentMethod: string;
  transactionId?: string;
  notes?: string;
}

export interface PaymentWithDetails extends Payment {
  athlete?: {
    id: string;
    firstName: string;
    lastName: string;
    teamId?: string;
  };
  paymentType?: {
    id: string;
    name: string;
  };
}

export class PaymentService {
  // Get all payments for organization
  async getPayments(organizationId: string, filters?: any): Promise<PaymentWithDetails[]> {
    try {
      const where: any = { organizationId };
      
      if (filters?.athleteId) {
        where.athleteId = filters.athleteId;
      }
      
      if (filters?.status) {
        where.status = filters.status;
      }
      
      if (filters?.overdue === 'true') {
        where.status = 'PENDING';
        where.dueDate = {
          lt: new Date()
        };
      }
      
      if (filters?.month && filters?.year) {
        const startDate = new Date(filters.year, filters.month - 1, 1);
        const endDate = new Date(filters.year, filters.month, 0);
        
        where.dueDate = {
          gte: startDate,
          lte: endDate
        };
      }
      
      const payments = await prisma.payment.findMany({
        where,
        include: {
          athlete: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              teamId: true
            }
          },
          paymentType: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: [
          { status: 'asc' },
          { dueDate: 'desc' }
        ]
      });
      
      // Update overdue payments
      const updatedPayments = await Promise.all(
        payments.map(async (payment) => {
          if (payment.status === 'PENDING' && new Date(payment.dueDate) < new Date()) {
            return await prisma.payment.update({
              where: { id: payment.id },
              data: { status: 'OVERDUE' },
              include: {
                athlete: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    teamId: true
                  }
                },
                paymentType: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            });
          }
          return payment;
        })
      );
      
      return updatedPayments;
    } catch (error) {
      logger.error('Error fetching payments:', error);
      throw error;
    }
  }
  
  // Get payments for specific athlete
  async getAthletePayments(athleteId: string, organizationId: string): Promise<Payment[]> {
    const payments = await prisma.payment.findMany({
      where: {
        athleteId,
        organizationId
      },
      orderBy: {
        dueDate: 'desc'
      }
    });
    
    return payments;
  }
  
  // Get single payment
  async getPaymentById(id: string, organizationId: string): Promise<PaymentWithDetails> {
    const payment = await prisma.payment.findFirst({
      where: {
        id,
        organizationId
      },
      include: {
        athlete: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            teamId: true,
            email: true,
            phone: true
          }
        },
        paymentType: true
      }
    });
    
    if (!payment) {
      throw new NotFoundError('Payment not found');
    }
    
    return payment;
  }
  
  // Create new payment
  async createPayment(data: CreatePaymentInput): Promise<Payment> {
    try {
      // Verify athlete exists
      const athlete = await prisma.athlete.findFirst({
        where: {
          id: data.athleteId,
          organizationId: data.organizationId
        }
      });
      
      if (!athlete) {
        throw new NotFoundError('Athlete not found');
      }
      
      // Determine initial status
      const status = new Date(data.dueDate) < new Date() ? 'OVERDUE' : 'PENDING';
      
      const payment = await prisma.payment.create({
        data: {
          organizationId: data.organizationId,
          athleteId: data.athleteId,
          paymentTypeId: data.paymentTypeId,
          type: data.type || 'MONTHLY',
          description: data.description,
          amount: data.amount,
          dueDate: data.dueDate,
          status,
          notes: data.notes
        }
      });
      
      logger.info(`Payment created: ${payment.description} (${payment.id})`);
      
      // Create notification for new payment
      await this.createPaymentNotification(
        data.organizationId,
        'NEW_PAYMENT',
        `New payment of €${data.amount} due for ${athlete.firstName} ${athlete.lastName}`,
        payment.id
      );
      
      return payment;
    } catch (error) {
      logger.error('Error creating payment:', error);
      throw error;
    }
  }
  
  // Update payment
  async updatePayment(data: UpdatePaymentInput): Promise<Payment> {
    try {
      const existing = await prisma.payment.findFirst({
        where: {
          id: data.id,
          organizationId: data.organizationId
        }
      });
      
      if (!existing) {
        throw new NotFoundError('Payment not found');
      }
      
      // Don't allow updating paid payments
      if (existing.status === 'PAID') {
        throw new BadRequestError('Cannot update paid payment');
      }
      
      // Update status if due date changed
      let status = data.status;
      if (data.dueDate && !data.status) {
        status = new Date(data.dueDate) < new Date() ? 'OVERDUE' : 'PENDING';
      }
      
      const payment = await prisma.payment.update({
        where: { id: data.id },
        data: {
          description: data.description,
          amount: data.amount,
          dueDate: data.dueDate,
          status,
          notes: data.notes,
          updatedAt: new Date()
        }
      });
      
      logger.info(`Payment updated: ${payment.id}`);
      
      return payment;
    } catch (error) {
      logger.error('Error updating payment:', error);
      throw error;
    }
  }
  
  // Record payment as paid
  async recordPayment(data: RecordPaymentInput): Promise<Payment> {
    try {
      const existing = await prisma.payment.findFirst({
        where: {
          id: data.id,
          organizationId: data.organizationId
        },
        include: {
          athlete: true
        }
      });
      
      if (!existing) {
        throw new NotFoundError('Payment not found');
      }
      
      if (existing.status === 'PAID') {
        throw new BadRequestError('Payment already recorded as paid');
      }
      
      const payment = await prisma.payment.update({
        where: { id: data.id },
        data: {
          status: 'PAID',
          paidDate: data.paidDate,
          paymentMethod: data.paymentMethod,
          transactionId: data.transactionId,
          notes: data.notes ? `${existing.notes || ''}\n${data.notes}` : existing.notes,
          updatedAt: new Date()
        }
      });
      
      logger.info(`Payment recorded as paid: ${payment.id}`);
      
      // Create notification
      await this.createPaymentNotification(
        data.organizationId,
        'PAYMENT_RECEIVED',
        `Payment of €${existing.amount} received from ${existing.athlete.firstName} ${existing.athlete.lastName}`,
        payment.id
      );
      
      return payment;
    } catch (error) {
      logger.error('Error recording payment:', error);
      throw error;
    }
  }
  
  // Delete payment
  async deletePayment(id: string, organizationId: string): Promise<void> {
    try {
      const payment = await prisma.payment.findFirst({
        where: {
          id,
          organizationId
        }
      });
      
      if (!payment) {
        throw new NotFoundError('Payment not found');
      }
      
      if (payment.status === 'PAID') {
        throw new BadRequestError('Cannot delete paid payment');
      }
      
      await prisma.payment.delete({
        where: { id }
      });
      
      logger.info(`Payment deleted: ${id}`);
    } catch (error) {
      logger.error('Error deleting payment:', error);
      throw error;
    }
  }
  
  // Get payment statistics
  async getPaymentStats(organizationId: string, period?: { month?: number; year?: number }): Promise<any> {
    try {
      let dateFilter = {};
      
      if (period?.month && period?.year) {
        const startDate = new Date(period.year, period.month - 1, 1);
        const endDate = new Date(period.year, period.month, 0);
        
        dateFilter = {
          dueDate: {
            gte: startDate,
            lte: endDate
          }
        };
      } else if (period?.year) {
        const startDate = new Date(period.year, 0, 1);
        const endDate = new Date(period.year, 11, 31);
        
        dateFilter = {
          dueDate: {
            gte: startDate,
            lte: endDate
          }
        };
      }
      
      const [totalPayments, paidPayments, pendingPayments, overduePayments] = await Promise.all([
        prisma.payment.aggregate({
          where: {
            organizationId,
            ...dateFilter
          },
          _sum: {
            amount: true
          },
          _count: true
        }),
        prisma.payment.aggregate({
          where: {
            organizationId,
            status: 'PAID',
            ...dateFilter
          },
          _sum: {
            amount: true
          },
          _count: true
        }),
        prisma.payment.aggregate({
          where: {
            organizationId,
            status: 'PENDING',
            ...dateFilter
          },
          _sum: {
            amount: true
          },
          _count: true
        }),
        prisma.payment.aggregate({
          where: {
            organizationId,
            status: 'OVERDUE',
            ...dateFilter
          },
          _sum: {
            amount: true
          },
          _count: true
        })
      ]);
      
      // Get monthly breakdown
      const monthlyBreakdown = await this.getMonthlyBreakdown(organizationId, period?.year || new Date().getFullYear());
      
      return {
        total: {
          count: totalPayments._count,
          amount: totalPayments._sum.amount || 0
        },
        paid: {
          count: paidPayments._count,
          amount: paidPayments._sum.amount || 0
        },
        pending: {
          count: pendingPayments._count,
          amount: pendingPayments._sum.amount || 0
        },
        overdue: {
          count: overduePayments._count,
          amount: overduePayments._sum.amount || 0
        },
        collectionRate: totalPayments._sum.amount 
          ? ((paidPayments._sum.amount || 0) / (totalPayments._sum.amount || 1)) * 100 
          : 0,
        monthlyBreakdown
      };
    } catch (error) {
      logger.error('Error getting payment stats:', error);
      throw error;
    }
  }
  
  // Get overdue payments
  async getOverduePayments(organizationId: string): Promise<PaymentWithDetails[]> {
    const payments = await prisma.payment.findMany({
      where: {
        organizationId,
        status: 'PENDING',
        dueDate: {
          lt: new Date()
        }
      },
      include: {
        athlete: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            parentEmail: true,
            parentPhone: true
          }
        },
        paymentType: true
      },
      orderBy: {
        dueDate: 'asc'
      }
    });
    
    // Update status to OVERDUE
    await prisma.payment.updateMany({
      where: {
        id: {
          in: payments.map(p => p.id)
        }
      },
      data: {
        status: 'OVERDUE'
      }
    });
    
    return payments.map(p => ({ ...p, status: 'OVERDUE' as PaymentStatus }));
  }
  
  // Bulk create recurring payments
  async createRecurringPayments(organizationId: string, month: number, year: number): Promise<number> {
    try {
      // Get all active athletes with recurring payment types
      const athletes = await prisma.athlete.findMany({
        where: {
          organizationId,
          status: 'ACTIVE'
        }
      });
      
      // Get recurring payment types
      const paymentTypes = await prisma.paymentType.findMany({
        where: {
          organizationId,
          isRecurring: true,
          isActive: true
        }
      });
      
      let created = 0;
      const dueDate = new Date(year, month - 1, 10); // 10th of the month
      
      for (const athlete of athletes) {
        for (const paymentType of paymentTypes) {
          // Check if payment already exists
          const existing = await prisma.payment.findFirst({
            where: {
              organizationId,
              athleteId: athlete.id,
              paymentTypeId: paymentType.id,
              dueDate: {
                gte: new Date(year, month - 1, 1),
                lte: new Date(year, month, 0)
              }
            }
          });
          
          if (!existing) {
            await prisma.payment.create({
              data: {
                organizationId,
                athleteId: athlete.id,
                paymentTypeId: paymentType.id,
                type: paymentType.recurrenceType || 'MONTHLY',
                description: `${paymentType.name} - ${month}/${year}`,
                amount: paymentType.amount,
                dueDate,
                status: 'PENDING'
              }
            });
            created++;
          }
        }
      }
      
      logger.info(`Created ${created} recurring payments for ${month}/${year}`);
      
      if (created > 0) {
        await this.createPaymentNotification(
          organizationId,
          'RECURRING_PAYMENTS',
          `${created} recurring payments created for ${month}/${year}`,
          null
        );
      }
      
      return created;
    } catch (error) {
      logger.error('Error creating recurring payments:', error);
      throw error;
    }
  }
  
  // Helper functions
  private async getMonthlyBreakdown(organizationId: string, year: number): Promise<any[]> {
    const breakdown = [];
    
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);
      
      const monthData = await prisma.payment.aggregate({
        where: {
          organizationId,
          dueDate: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: {
          amount: true
        }
      });
      
      const paidData = await prisma.payment.aggregate({
        where: {
          organizationId,
          status: 'PAID',
          dueDate: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: {
          amount: true
        }
      });
      
      breakdown.push({
        month: month + 1,
        monthName: new Date(year, month).toLocaleString('en', { month: 'short' }),
        total: monthData._sum.amount || 0,
        paid: paidData._sum.amount || 0
      });
    }
    
    return breakdown;
  }
  
  private async createPaymentNotification(
    organizationId: string,
    type: string,
    message: string,
    paymentId: string | null
  ): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          organizationId,
          type,
          title: 'Payment Update',
          message,
          priority: type === 'PAYMENT_RECEIVED' ? 'low' : 'medium',
          isRead: false,
          metadata: paymentId ? { paymentId } : {}
        }
      });
    } catch (error) {
      logger.error('Error creating payment notification:', error);
    }
  }
}

export const paymentService = new PaymentService();
