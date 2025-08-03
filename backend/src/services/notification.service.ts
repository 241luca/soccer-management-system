import { PrismaClient, Notification } from '@prisma/client';
import { CreateNotificationInput } from '../utils/validation';
import { NotFoundError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { io } from '../server';

const prisma = new PrismaClient();

export class NotificationService {
  async findAll(organizationId: string, userId?: string, params: {
    unread?: boolean;
    type?: string;
    severity?: string;
    limit?: number;
  } = {}) {
    const where: any = { organizationId };

    if (userId) {
      where.OR = [
        { userId },
        { userId: null } // Include organization-wide notifications
      ];
    }

    if (params.unread !== undefined) {
      where.isRead = !params.unread;
    }

    if (params.type) {
      where.type = params.type;
    }

    if (params.severity) {
      where.severity = params.severity;
    }

    // Remove expired notifications
    where.OR = where.OR || [];
    where.OR.push(
      { expiresAt: null },
      { expiresAt: { gt: new Date() } }
    );

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: params.limit || 50
    });

    const unreadCount = await prisma.notification.count({
      where: { ...where, isRead: false }
    });

    return {
      data: notifications,
      unreadCount
    };
  }

  async create(data: CreateNotificationInput & { organizationId: string }) {
    const notification = await prisma.notification.create({
      data: {
        ...data,
        actions: data.actions || []
      }
    });

    // Send real-time notification via WebSocket
    this.broadcastNotification(notification);

    logger.info(`Notification created: ${notification.type} - ${notification.title}`);

    return notification;
  }

  async markAsRead(id: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        OR: [
          { userId },
          { userId: null }
        ]
      }
    });

    if (!notification) {
      throw NotFoundError('Notification');
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    return updated;
  }

  async markAllAsRead(organizationId: string, userId: string) {
    await prisma.notification.updateMany({
      where: {
        organizationId,
        OR: [
          { userId },
          { userId: null }
        ],
        isRead: false
      },
      data: { isRead: true }
    });

    return { message: 'All notifications marked as read' };
  }

  async delete(id: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        OR: [
          { userId },
          { userId: null }
        ]
      }
    });

    if (!notification) {
      throw NotFoundError('Notification');
    }

    await prisma.notification.delete({
      where: { id }
    });

    return { message: 'Notification deleted' };
  }

  async clearAll(organizationId: string, userId: string) {
    await prisma.notification.deleteMany({
      where: {
        organizationId,
        OR: [
          { userId },
          { userId: null }
        ]
      }
    });

    return { message: 'All notifications cleared' };
  }

  async checkAndCreateAutomaticNotifications(organizationId: string) {
    // Check document expiries
    await this.checkDocumentExpiries(organizationId);
    
    // Check payment overdue
    await this.checkPaymentOverdue(organizationId);
    
    // Check upcoming matches
    await this.checkUpcomingMatches(organizationId);
    
    // Check transport capacity
    await this.checkTransportCapacity(organizationId);

    logger.info(`Automatic notifications check completed for organization: ${organizationId}`);
  }

  private async checkDocumentExpiries(organizationId: string) {
    const today = new Date();
    const checkDates = [7, 15, 30]; // Days before expiry to notify

    for (const days of checkDates) {
      const checkDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
      
      const expiringDocs = await prisma.document.findMany({
        where: {
          athlete: { organizationId },
          expiryDate: {
            gte: checkDate,
            lt: new Date(checkDate.getTime() + 24 * 60 * 60 * 1000)
          },
          status: 'VALID'
        },
        include: {
          athlete: true,
          documentType: true
        }
      });

      for (const doc of expiringDocs) {
        // Check if notification already exists
        const existing = await prisma.notification.findFirst({
          where: {
            organizationId,
            type: 'document_expiry',
            relatedEntityId: doc.id,
            createdAt: {
              gte: new Date(today.getTime() - 24 * 60 * 60 * 1000)
            }
          }
        });

        if (!existing) {
          await this.create({
            organizationId,
            type: 'document_expiry',
            severity: days <= 7 ? 'error' : days <= 15 ? 'warning' : 'info',
            title: `${doc.documentType.name} in Scadenza`,
            message: `Il ${doc.documentType.name} di ${doc.athlete.firstName} ${doc.athlete.lastName} scade tra ${days} giorni`,
            relatedEntityType: 'document',
            relatedEntityId: doc.id,
            actions: [
              { label: 'Visualizza Atleta', action: 'view_athlete', style: 'primary' },
              { label: 'Documenti', action: 'view_documents', style: 'secondary' }
            ]
          });
        }
      }
    }
  }

  private async checkPaymentOverdue(organizationId: string) {
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

    for (const payment of overduePayments) {
      // Check if notification already exists
      const existing = await prisma.notification.findFirst({
        where: {
          organizationId,
          type: 'payment_overdue',
          relatedEntityId: payment.id,
          createdAt: {
            gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) // Weekly reminder
          }
        }
      });

      if (!existing) {
        const daysOverdue = Math.floor((today.getTime() - payment.dueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        await this.create({
          organizationId,
          type: 'payment_overdue',
          severity: daysOverdue > 30 ? 'error' : 'warning',
          title: 'Pagamento in Ritardo',
          message: `${payment.athlete.firstName} ${payment.athlete.lastName} ha un pagamento di €${payment.amount} in ritardo di ${daysOverdue} giorni`,
          relatedEntityType: 'payment',
          relatedEntityId: payment.id,
          actions: [
            { label: 'Visualizza Pagamento', action: 'view_payment', style: 'primary' },
            { label: 'Contatta Atleta', action: 'contact_athlete', style: 'secondary' }
          ]
        });
      }
    }
  }

  private async checkUpcomingMatches(organizationId: string) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);
    
    const upcomingMatches = await prisma.match.findMany({
      where: {
        organizationId,
        matchDate: {
          gte: tomorrow,
          lt: dayAfter
        },
        status: 'SCHEDULED'
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        venue: true
      }
    });

    for (const match of upcomingMatches) {
      // Check if notification already exists
      const existing = await prisma.notification.findFirst({
        where: {
          organizationId,
          type: 'match_reminder',
          relatedEntityId: match.id
        }
      });

      if (!existing) {
        await this.create({
          organizationId,
          type: 'match_reminder',
          severity: 'info',
          title: 'Partita Domani',
          message: `${match.homeTeam.name} vs ${match.awayTeam.name} - ${match.matchTime}${match.venue ? ` presso ${match.venue.name}` : ''}`,
          relatedEntityType: 'match',
          relatedEntityId: match.id,
          actions: [
            { label: 'Visualizza Partita', action: 'view_match', style: 'primary' },
            { label: 'Convocazioni', action: 'view_roster', style: 'secondary' }
          ]
        });
      }
    }
  }

  private async checkTransportCapacity(organizationId: string) {
    const busRoutes = await prisma.busRoute.findMany({
      where: {
        bus: { organizationId },
        isActive: true
      },
      include: {
        bus: true,
        transports: {
          where: { isActive: true }
        }
      }
    });

    for (const route of busRoutes) {
      const utilization = (route.transports.length / route.bus.capacity) * 100;
      
      if (utilization >= 90) {
        // Check if notification already exists this week
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const existing = await prisma.notification.findFirst({
          where: {
            organizationId,
            type: 'transport_capacity',
            relatedEntityId: route.id,
            createdAt: { gte: weekAgo }
          }
        });

        if (!existing) {
          await this.create({
            organizationId,
            type: 'transport_capacity',
            severity: utilization >= 100 ? 'error' : 'warning',
            title: utilization >= 100 ? 'Pulmino Sovraccarico' : 'Pulmino Quasi Pieno',
            message: `Il percorso ${route.name} ha ${route.transports.length} persone su ${route.bus.capacity} posti disponibili (${Math.round(utilization)}%)`,
            relatedEntityType: 'transport',
            relatedEntityId: route.id,
            actions: [
              { label: 'Gestisci Trasporti', action: 'view_transport', style: 'primary' }
            ]
          });
        }
      }
    }
  }

  private broadcastNotification(notification: Notification) {
    // Broadcast to organization
    io.to(`org:${notification.organizationId}`).emit('notification:new', notification);
    
    // Broadcast to specific user if targeted
    if (notification.userId) {
      io.to(`user:${notification.userId}`).emit('notification:new', notification);
    }
  }
}

export const notificationService = new NotificationService();
