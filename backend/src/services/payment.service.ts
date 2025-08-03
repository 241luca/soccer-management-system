import { PrismaClient, Payment, Prisma } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { notificationService } from './notification.service';

const prisma = new PrismaClient();

export interface CreatePaymentInput {
  athleteId: string;
  paymentTypeId: string;
  amount: number;
  dueDate: Date;
  description?: string;
  invoiceNumber?: string;
  notes?: string;
}

export interface UpdatePaymentInput extends Partial<CreatePaymentInput> {
  status?: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  paidDate?: Date;
  paymentMethod?: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'CHECK' | 'OTHER';
  transactionReference?: string;
}

export interface RecordPaymentInput {
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'CHECK' | 'OTHER';
  paidDate: Date;
  transactionReference?: string;
  notes?: string;
}

export class PaymentService {
  async findAll(organizationId: string, params?: {
    athleteId?: string;
    teamId?: string;
    paymentTypeId?: string;
    status?: string;
    fromDate?: Date;
    toDate?: Date;
    overdue?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {
      athlete: { organizationId }
    };

    if (params?.athleteId) {
      where.athleteId = params.athleteId;
    }

    if (params?.teamId) {
      where.athlete = { 
        organizationId,
        teamId: params.teamId 
      };
    }

    if (params?.paymentTypeId) {
      where.paymentTypeId = params.paymentTypeId;
    }

    if (params?.status) {
      where.status = params.status as any;
    }

    if (params?.fromDate || params?.toDate) {
      where.dueDate = {
        ...(params.fromDate && { gte: new Date(params.fromDate) }),
        ...(params.toDate && { lte: new Date(params.toDate) })
      };
    }

    // Filter overdue payments
    if (params?.overdue) {
      where.status = 'PENDING';
      where.dueDate = { lt: new Date() };
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          athlete: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              team: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          paymentType: true
        },
        skip,
        take: limit,
        orderBy: params?.sortBy ? {
          [params.sortBy]: params.sortOrder || 'desc'
        } : { dueDate: 'desc' }
      }),
      prisma.payment.count({ where })
    ]);

    // Enrich with calculated fields
    const today = new Date();
    const enrichedPayments = payments.map(payment => {
      const daysOverdue = payment.status === 'PENDING' && payment.dueDate < today
        ? Math.floor((today.getTime() - payment.dueDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        ...payment,
        athleteName: `${payment.athlete.firstName} ${payment.athlete.lastName}`,
        teamName: payment.athlete.team?.name,
        isOverdue: daysOverdue > 0,
        daysOverdue
      };
    });

    return {
      data: enrichedPayments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id: string, organizationId: string) {
    const payment = await prisma.payment.findFirst({
      where: {
        id,
        athlete: { organizationId }
      },
      include: {
        athlete: {
          include: { team: true }
        },
        paymentType: true
      }
    });

    if (!payment) {
      throw NotFoundError('Payment');
    }

    const today = new Date();
    const daysOverdue = payment.status === 'PENDING' && payment.dueDate < today
      ? Math.floor((today.getTime() - payment.dueDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      ...payment,
      isOverdue: daysOverdue > 0,
      daysOverdue
    };
  }

  async create(data: CreatePaymentInput, organizationId: string) {
    // Validate athlete belongs to organization
    const athlete = await prisma.athlete.findFirst({
      where: {
        id: data.athleteId,
        organizationId
      }
    });

    if (!athlete) {
      throw BadRequestError('Invalid athlete ID');
    }

    // Validate payment type
    const paymentType = await prisma.paymentType.findUnique({
      where: { id: data.paymentTypeId }
    });

    if (!paymentType) {
      throw BadRequestError('Invalid payment type');
    }

    const payment = await prisma.payment.create({
      data: {
        ...data,
        amount: new Prisma.Decimal(data.amount),
        dueDate: new Date(data.dueDate),
        status: 'PENDING',
        type: paymentType.type
      },
      include: {
        athlete: true,
        paymentType: true
      }
    });

    logger.info(`New payment created: ${paymentType.name} for ${athlete.firstName} ${athlete.lastName}`);

    // Create notification for new payment
    await notificationService.create({
      organizationId,
      type: 'payment_created',
      severity: 'info',
      title: 'Nuovo Pagamento Registrato',
      message: `Pagamento di €${data.amount} per ${paymentType.name} registrato per ${athlete.firstName} ${athlete.lastName}`,
      relatedEntityType: 'payment',
      relatedEntityId: payment.id
    });

    return payment;
  }

  async update(id: string, data: UpdatePaymentInput, organizationId: string) {
    const payment = await this.findById(id, organizationId);

    const updated = await prisma.payment.update({
      where: { id },
      data: {
        ...data,
        amount: data.amount ? new Prisma.Decimal(data.amount) : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        paidDate: data.paidDate ? new Date(data.paidDate) : undefined
      },
      include: {
        athlete: true,
        paymentType: true
      }
    });

    logger.info(`Payment updated: ${updated.id}`);

    return updated;
  }

  async recordPayment(id: string, data: RecordPaymentInput, organizationId: string) {
    const payment = await this.findById(id, organizationId);

    if (payment.status === 'PAID') {
      throw BadRequestError('Payment has already been recorded');
    }

    if (payment.status === 'CANCELLED') {
      throw BadRequestError('Cannot record payment for cancelled item');
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: {
        status: 'PAID',
        paidDate: new Date(data.paidDate),
        paymentMethod: data.paymentMethod,
        transactionReference: data.transactionReference,
        notes: data.notes
      },
      include: {
        athlete: true,
        paymentType: true
      }
    });

    logger.info(`Payment recorded: ${updated.id} - €${updated.amount}`);

    // Create success notification
    await notificationService.create({
      organizationId,
      type: 'payment_received',
      severity: 'success',
      title: 'Pagamento Ricevuto',
      message: `Pagamento di €${updated.amount} ricevuto da ${updated.athlete.firstName} ${updated.athlete.lastName}`,
      relatedEntityType: 'payment',
      relatedEntityId: updated.id
    });

    return updated;
  }

  async cancelPayment(id: string, reason: string, organizationId: string) {
    const payment = await this.findById(id, organizationId);

    if (payment.status === 'PAID') {
      throw BadRequestError('Cannot cancel a paid payment');
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        notes: reason
      },
      include: {
        athlete: true,
        paymentType: true
      }
    });

    logger.info(`Payment cancelled: ${updated.id}`);

    return updated;
  }

  async delete(id: string, organizationId: string) {
    const payment = await this.findById(id, organizationId);

    if (payment.status === 'PAID') {
      throw BadRequestError('Cannot delete a paid payment. Consider cancelling it instead.');
    }

    await prisma.payment.delete({ where: { id } });

    logger.info(`Payment deleted: ${id}`);

    return { message: 'Payment deleted successfully' };
  }

  async checkOverduePayments(organizationId: string) {
    const today = new Date();
    
    const overduePayments = await prisma.payment.findMany({
      where: {
        athlete: { organizationId },
        status: 'PENDING',
        dueDate: { lt: today }
      },
      include: {
        athlete: true,
        paymentType: true
      }
    });

    // Update status to OVERDUE
    const updatePromises = overduePayments.map(payment => 
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'OVERDUE' }
      })
    );

    await Promise.all(updatePromises);

    // Create notifications for overdue payments
    for (const payment of overduePayments) {
      const daysOverdue = Math.floor((today.getTime() - payment.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      
      await notificationService.create({
        organizationId,
        type: 'payment_overdue',
        severity: daysOverdue > 30 ? 'error' : 'warning',
        title: 'Pagamento Scaduto',
        message: `Il pagamento di €${payment.amount} per ${payment.paymentType.name} di ${payment.athlete.firstName} ${payment.athlete.lastName} è scaduto da ${daysOverdue} giorni`,
        relatedEntityType: 'payment',
        relatedEntityId: payment.id,
        actions: [
          { label: 'Visualizza Dettagli', action: 'view_payment', style: 'primary' },
          { label: 'Invia Sollecito', action: 'send_reminder', style: 'secondary' }
        ]
      });
    }

    return {
      total: overduePayments.length,
      totalAmount: overduePayments.reduce((sum, p) => sum + Number(p.amount), 0),
      payments: overduePayments
    };
  }

  async getPaymentSummary(organizationId: string, params?: {
    teamId?: string;
    fromDate?: Date;
    toDate?: Date;
  }) {
    const where: Prisma.PaymentWhereInput = {
      athlete: { organizationId }
    };

    if (params?.teamId) {
      where.athlete = {
        organizationId,
        teamId: params.teamId
      };
    }

    if (params?.fromDate || params?.toDate) {
      where.dueDate = {
        ...(params.fromDate && { gte: new Date(params.fromDate) }),
        ...(params.toDate && { lte: new Date(params.toDate) })
      };
    }

    const [totalIncome, totalExpenses, pending, overdue] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          ...where,
          type: 'INCOME',
          status: 'PAID'
        },
        _sum: { amount: true }
      }),
      prisma.payment.aggregate({
        where: {
          ...where,
          type: 'EXPENSE',
          status: 'PAID'
        },
        _sum: { amount: true }
      }),
      prisma.payment.aggregate({
        where: {
          ...where,
          status: 'PENDING'
        },
        _sum: { amount: true },
        _count: true
      }),
      prisma.payment.aggregate({
        where: {
          ...where,
          status: 'OVERDUE'
        },
        _sum: { amount: true },
        _count: true
      })
    ]);

    // Get payment breakdown by type
    const paymentTypes = await prisma.payment.groupBy({
      by: ['paymentTypeId', 'status'],
      where,
      _sum: { amount: true },
      _count: true
    });

    // Get payment types info
    const types = await prisma.paymentType.findMany();
    const typeMap = new Map(types.map(t => [t.id, t]));

    const breakdown = paymentTypes.map(pt => ({
      paymentType: typeMap.get(pt.paymentTypeId),
      status: pt.status,
      count: pt._count,
      totalAmount: Number(pt._sum.amount || 0)
    }));

    return {
      totalIncome: Number(totalIncome._sum.amount || 0),
      totalExpenses: Number(totalExpenses._sum.amount || 0),
      netBalance: Number(totalIncome._sum.amount || 0) - Number(totalExpenses._sum.amount || 0),
      pendingAmount: Number(pending._sum.amount || 0),
      pendingCount: pending._count,
      overdueAmount: Number(overdue._sum.amount || 0),
      overdueCount: overdue._count,
      breakdown
    };
  }

  async getAthletePaymentHistory(athleteId: string, organizationId: string) {
    // Verify athlete belongs to organization
    const athlete = await prisma.athlete.findFirst({
      where: {
        id: athleteId,
        organizationId
      }
    });

    if (!athlete) {
      throw NotFoundError('Athlete');
    }

    const payments = await prisma.payment.findMany({
      where: { athleteId },
      include: { paymentType: true },
      orderBy: { createdAt: 'desc' }
    });

    const summary = {
      totalPaid: 0,
      totalPending: 0,
      totalOverdue: 0,
      paymentHistory: [] as any[]
    };

    const today = new Date();

    payments.forEach(payment => {
      if (payment.status === 'PAID') {
        summary.totalPaid += Number(payment.amount);
      } else if (payment.status === 'PENDING') {
        if (payment.dueDate < today) {
          summary.totalOverdue += Number(payment.amount);
        } else {
          summary.totalPending += Number(payment.amount);
        }
      }

      summary.paymentHistory.push({
        ...payment,
        amount: Number(payment.amount)
      });
    });

    return summary;
  }

  async generateInvoice(paymentId: string, organizationId: string) {
    const payment = await this.findById(paymentId, organizationId);

    if (payment.status !== 'PAID') {
      throw BadRequestError('Can only generate invoice for paid payments');
    }

    // TODO: Implement invoice generation
    // This would typically generate a PDF invoice
    
    return {
      invoiceNumber: `INV-${new Date().getFullYear()}-${payment.id.slice(-6)}`,
      payment,
      generatedAt: new Date()
    };
  }

  async getPaymentTypes() {
    return prisma.paymentType.findMany({
      orderBy: [
        { type: 'asc' },
        { name: 'asc' }
      ]
    });
  }
}

export const paymentService = new PaymentService();
