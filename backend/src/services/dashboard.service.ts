import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface DashboardStats {
  athletes: {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    needingPromotion: number;
    byTeam: { teamId: string; teamName: string; count: number }[];
    byStatus: { status: string; count: number }[];
  };
  teams: {
    total: number;
    active: number;
    bySeason: { season: string; count: number }[];
    byCategory: { category: string; count: number }[];
  };
  documents: {
    total: number;
    valid: number;
    expiring: number;
    expired: number;
    missing: number;
    byType: { type: string; count: number; expired: number }[];
    expiringThisMonth: any[];
  };
  payments: {
    totalDue: number;
    totalPaid: number;
    totalOverdue: number;
    pendingCount: number;
    overdueCount: number;
    collectionRate: number;
    monthlyRevenue: { month: string; amount: number }[];
    byType: { type: string; amount: number; count: number }[];
  };
  matches: {
    scheduled: number;
    completed: number;
    thisWeek: number;
    thisMonth: number;
    winRate: number;
    recentResults: any[];
    upcomingMatches: any[];
  };
  transport: {
    athletesUsingTransport: number;
    totalZones: number;
    totalBuses: number;
    monthlyRevenue: number;
    busUtilization: number;
  };
  notifications: {
    unread: number;
    total: number;
    recent: any[];
  };
}

export interface ActivityFeedItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: Date;
  entityType?: string;
  entityId?: string;
  user?: {
    id: string;
    name: string;
  };
}

export class DashboardService {
  async getStats(organizationId: string, userId?: string): Promise<DashboardStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    // Parallel queries for performance
    const [
      athleteStats,
      teamStats,
      documentStats,
      paymentStats,
      matchStats,
      transportStats,
      notificationStats
    ] = await Promise.all([
      this.getAthleteStats(organizationId),
      this.getTeamStats(organizationId),
      this.getDocumentStats(organizationId, thirtyDaysFromNow),
      this.getPaymentStats(organizationId, startOfMonth),
      this.getMatchStats(organizationId, startOfWeek, startOfMonth),
      this.getTransportStats(organizationId),
      this.getNotificationStats(organizationId, userId)
    ]);

    return {
      athletes: athleteStats,
      teams: teamStats,
      documents: documentStats,
      payments: paymentStats,
      matches: matchStats,
      transport: transportStats,
      notifications: notificationStats
    };
  }

  private async getAthleteStats(organizationId: string) {
    const [byStatus, byTeam] = await Promise.all([
      prisma.athlete.groupBy({
        by: ['status'],
        where: { organizationId },
        _count: true
      }),
      prisma.athlete.groupBy({
        by: ['teamId'],
        where: { organizationId, teamId: { not: null } },
        _count: true
      })
    ]);

    // Get team names
    const teamIds = byTeam.map(t => t.teamId!).filter(Boolean);
    const teams = await prisma.team.findMany({
      where: { id: { in: teamIds } },
      select: { id: true, name: true }
    });

    const teamMap = teams.reduce((acc, team) => {
      acc[team.id] = team.name;
      return acc;
    }, {} as Record<string, string>);

    const statusCounts = byStatus.reduce((acc, curr) => {
      acc[curr.status.toLowerCase()] = curr._count;
      acc.total += curr._count;
      return acc;
    }, { total: 0, active: 0, inactive: 0, suspended: 0, transferred: 0 } as any);

    const needingPromotion = await prisma.athlete.count({
      where: { organizationId, needsPromotion: true }
    });

    return {
      total: statusCounts.total,
      active: statusCounts.active || 0,
      inactive: statusCounts.inactive || 0,
      suspended: statusCounts.suspended || 0,
      needingPromotion,
      byTeam: byTeam.map(t => ({
        teamId: t.teamId!,
        teamName: teamMap[t.teamId!] || 'Unknown',
        count: t._count
      })),
      byStatus: byStatus.map(s => ({
        status: s.status,
        count: s._count
      }))
    };
  }

  private async getTeamStats(organizationId: string) {
    const [total, active, bySeason, byCategory] = await Promise.all([
      prisma.team.count({ where: { organizationId } }),
      prisma.team.count({ where: { organizationId, isActive: true } }),
      prisma.team.groupBy({
        by: ['season'],
        where: { organizationId },
        _count: true,
        orderBy: { season: 'desc' }
      }),
      prisma.team.groupBy({
        by: ['category'],
        where: { organizationId },
        _count: true,
        orderBy: { category: 'asc' }
      })
    ]);

    return {
      total,
      active,
      bySeason: bySeason.map(s => ({
        season: s.season,
        count: s._count
      })),
      byCategory: byCategory.map(c => ({
        category: c.category,
        count: c._count
      }))
    };
  }

  private async getDocumentStats(organizationId: string, thirtyDaysFromNow: Date) {
    const now = new Date();
    
    const [statusGroups, typeGroups, expiringDocs] = await Promise.all([
      prisma.document.groupBy({
        by: ['status'],
        where: { athlete: { organizationId } },
        _count: true
      }),
      prisma.document.groupBy({
        by: ['documentTypeId'],
        where: { athlete: { organizationId } },
        _count: true
      }),
      prisma.document.findMany({
        where: {
          athlete: { organizationId },
          expiryDate: {
            gte: now,
            lte: thirtyDaysFromNow
          },
          status: 'VALID'
        },
        include: {
          athlete: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              team: { select: { name: true } }
            }
          },
          documentType: true
        },
        orderBy: { expiryDate: 'asc' },
        take: 10
      })
    ]);

    // Get document types
    const typeIds = typeGroups.map(t => t.documentTypeId);
    const types = await prisma.documentType.findMany({
      where: { id: { in: typeIds } }
    });

    const typeMap = types.reduce((acc, type) => {
      acc[type.id] = type.name;
      return acc;
    }, {} as Record<number, string>);

    // Count expired by type
    const expiredByType = await prisma.document.groupBy({
      by: ['documentTypeId'],
      where: {
        athlete: { organizationId },
        status: 'EXPIRED'
      },
      _count: true
    });

    const expiredMap = expiredByType.reduce((acc, item) => {
      acc[item.documentTypeId] = item._count;
      return acc;
    }, {} as Record<number, number>);

    const statusCounts = statusGroups.reduce((acc, curr) => {
      acc[curr.status.toLowerCase()] = curr._count;
      acc.total += curr._count;
      return acc;
    }, { total: 0, valid: 0, expiring: 0, expired: 0, missing: 0 } as any);

    // Calculate missing documents
    const requiredTypes = await prisma.documentType.count({
      where: { organizationId, isRequired: true }
    });
    const athleteCount = await prisma.athlete.count({
      where: { organizationId, status: 'ACTIVE' }
    });
    const expectedDocs = requiredTypes * athleteCount;
    const missing = Math.max(0, expectedDocs - statusCounts.total);

    return {
      total: statusCounts.total,
      valid: statusCounts.valid || 0,
      expiring: expiringDocs.length,
      expired: statusCounts.expired || 0,
      missing,
      byType: typeGroups.map(t => ({
        type: typeMap[t.documentTypeId] || 'Unknown',
        count: t._count,
        expired: expiredMap[t.documentTypeId] || 0
      })),
      expiringThisMonth: expiringDocs.map(doc => ({
        id: doc.id,
        athleteName: `${doc.athlete.firstName} ${doc.athlete.lastName}`,
        teamName: doc.athlete.team?.name || 'N/A',
        documentType: doc.documentType.name,
        expiryDate: doc.expiryDate,
        daysUntilExpiry: Math.ceil((doc.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      }))
    };
  }

  private async getPaymentStats(organizationId: string, startOfMonth: Date) {
    const [statusGroups, typeGroups, monthlyRevenue] = await Promise.all([
      prisma.payment.groupBy({
        by: ['status'],
        where: { organizationId },
        _sum: { amount: true },
        _count: true
      }),
      prisma.payment.groupBy({
        by: ['paymentTypeId'],
        where: { organizationId, status: 'PAID' },
        _sum: { amount: true },
        _count: true
      }),
      this.getMonthlyRevenue(organizationId, 6)
    ]);

    // Get payment types
    const typeIds = typeGroups.map(t => t.paymentTypeId);
    const types = await prisma.paymentType.findMany({
      where: { id: { in: typeIds } }
    });

    const typeMap = types.reduce((acc, type) => {
      acc[type.id] = type.name;
      return acc;
    }, {} as Record<number, string>);

    const statusSums = statusGroups.reduce((acc, curr) => {
      const amount = Number(curr._sum.amount || 0);
      acc[curr.status.toLowerCase()] = {
        amount,
        count: curr._count
      };
      return acc;
    }, {} as Record<string, { amount: number; count: number }>);

    const totalDue = (statusSums.pending?.amount || 0) + (statusSums.overdue?.amount || 0);
    const totalPaid = statusSums.paid?.amount || 0;
    const collectionRate = totalDue > 0 ? Math.round((totalPaid / (totalPaid + totalDue)) * 100) : 100;

    return {
      totalDue,
      totalPaid,
      totalOverdue: statusSums.overdue?.amount || 0,
      pendingCount: statusSums.pending?.count || 0,
      overdueCount: statusSums.overdue?.count || 0,
      collectionRate,
      monthlyRevenue,
      byType: typeGroups.map(t => ({
        type: typeMap[t.paymentTypeId] || 'Unknown',
        amount: Number(t._sum.amount || 0),
        count: t._count
      }))
    };
  }

  private async getMatchStats(organizationId: string, startOfWeek: Date, startOfMonth: Date) {
    const now = new Date();
    const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [statusGroups, thisWeek, thisMonth, recentMatches, upcomingMatches] = await Promise.all([
      prisma.match.groupBy({
        by: ['status'],
        where: { organizationId },
        _count: true
      }),
      prisma.match.count({
        where: {
          organizationId,
          matchDate: { gte: startOfWeek, lte: endOfWeek }
        }
      }),
      prisma.match.count({
        where: {
          organizationId,
          matchDate: { gte: startOfMonth, lte: endOfMonth }
        }
      }),
      prisma.match.findMany({
        where: {
          organizationId,
          status: 'COMPLETED'
        },
        include: {
          homeTeam: { select: { id: true, name: true } },
          awayTeam: { select: { id: true, name: true } }
        },
        orderBy: { matchDate: 'desc' },
        take: 5
      }),
      prisma.match.findMany({
        where: {
          organizationId,
          status: 'SCHEDULED',
          matchDate: { gte: now }
        },
        include: {
          homeTeam: { select: { id: true, name: true } },
          awayTeam: { select: { id: true, name: true } },
          venue: { select: { name: true } }
        },
        orderBy: { matchDate: 'asc' },
        take: 5
      })
    ]);

    const statusCounts = statusGroups.reduce((acc, curr) => {
      acc[curr.status.toLowerCase()] = curr._count;
      return acc;
    }, {} as Record<string, number>);

    // Calculate win rate for organization teams
    const orgTeamIds = await prisma.team.findMany({
      where: { organizationId },
      select: { id: true }
    });
    const teamIds = orgTeamIds.map(t => t.id);

    let wins = 0, total = 0;
    recentMatches.forEach(match => {
      if (teamIds.includes(match.homeTeamId)) {
        total++;
        if (match.homeScore! > match.awayScore!) wins++;
      }
      if (teamIds.includes(match.awayTeamId)) {
        total++;
        if (match.awayScore! > match.homeScore!) wins++;
      }
    });

    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

    return {
      scheduled: statusCounts.scheduled || 0,
      completed: statusCounts.completed || 0,
      thisWeek,
      thisMonth,
      winRate,
      recentResults: recentMatches.map(match => ({
        id: match.id,
        date: match.matchDate,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        result: `${match.homeScore} - ${match.awayScore}`,
        isHome: teamIds.includes(match.homeTeamId),
        isWin: (teamIds.includes(match.homeTeamId) && match.homeScore! > match.awayScore!) ||
               (teamIds.includes(match.awayTeamId) && match.awayScore! > match.homeScore!)
      })),
      upcomingMatches: upcomingMatches.map(match => ({
        id: match.id,
        date: match.matchDate,
        time: match.matchTime,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        venue: match.venue?.name || 'TBD',
        isHome: teamIds.includes(match.homeTeamId)
      }))
    };
  }

  private async getTransportStats(organizationId: string) {
    const [activeTransports, zones, buses, monthlyRevenue] = await Promise.all([
      prisma.athleteTransport.count({
        where: {
          athlete: { organizationId },
          isActive: true
        }
      }),
      prisma.transportZone.count({
        where: { organizationId, isActive: true }
      }),
      prisma.bus.findMany({
        where: { organizationId, isActive: true },
        include: {
          routes: {
            include: {
              _count: { select: { transports: true } }
            }
          }
        }
      }),
      prisma.payment.aggregate({
        where: {
          organizationId,
          paymentType: { category: 'transport' },
          status: 'PAID',
          paidDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: { amount: true }
      })
    ]);

    // Calculate average bus utilization
    let totalCapacity = 0;
    let totalOccupied = 0;

    buses.forEach(bus => {
      totalCapacity += bus.capacity;
      totalOccupied += bus.routes.reduce((sum, route) => sum + route._count.transports, 0);
    });

    const busUtilization = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

    return {
      athletesUsingTransport: activeTransports,
      totalZones: zones,
      totalBuses: buses.length,
      monthlyRevenue: Number(monthlyRevenue._sum.amount || 0),
      busUtilization
    };
  }

  private async getNotificationStats(organizationId: string, userId?: string) {
    const where = {
      organizationId,
      ...(userId && { userId }),
      expiresAt: { gte: new Date() }
    };

    const [unread, total, recent] = await Promise.all([
      prisma.notification.count({
        where: { ...where, isRead: false }
      }),
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    return {
      unread,
      total,
      recent: recent.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        severity: n.severity,
        isRead: n.isRead,
        createdAt: n.createdAt
      }))
    };
  }

  private async getMonthlyRevenue(organizationId: string, months: number) {
    const results = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const revenue = await prisma.payment.aggregate({
        where: {
          organizationId,
          status: 'PAID',
          paidDate: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: { amount: true }
      });

      results.push({
        month: startDate.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' }),
        amount: Number(revenue._sum.amount || 0)
      });
    }

    return results;
  }

  async getActivityFeed(organizationId: string, limit = 20): Promise<ActivityFeedItem[]> {
    // Get recent audit logs
    const logs = await prisma.auditLog.findMany({
      where: { organizationId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    // Transform logs into activity feed items
    return logs.map(log => ({
      id: log.id,
      type: log.action,
      title: this.getActivityTitle(log.action, log.entityType),
      description: this.getActivityDescription(log),
      timestamp: log.createdAt,
      entityType: log.entityType,
      entityId: log.entityId,
      user: log.user ? {
        id: log.user.id,
        name: `${log.user.firstName} ${log.user.lastName}`
      } : undefined
    }));
  }

  private getActivityTitle(action: string, entityType: string): string {
    const titles: Record<string, Record<string, string>> = {
      create: {
        athlete: 'Nuovo Atleta',
        team: 'Nuova Squadra',
        match: 'Nuova Partita',
        payment: 'Nuovo Pagamento',
        document: 'Nuovo Documento'
      },
      update: {
        athlete: 'Atleta Aggiornato',
        team: 'Squadra Aggiornata',
        match: 'Partita Aggiornata',
        payment: 'Pagamento Aggiornato',
        document: 'Documento Aggiornato'
      },
      delete: {
        athlete: 'Atleta Eliminato',
        team: 'Squadra Eliminata',
        match: 'Partita Eliminata',
        payment: 'Pagamento Eliminato',
        document: 'Documento Eliminato'
      }
    };

    return titles[action]?.[entityType] || `${action} ${entityType}`;
  }

  private getActivityDescription(log: any): string {
    const entityLabels: Record<string, string> = {
      athlete: 'atleta',
      team: 'squadra',
      match: 'partita',
      payment: 'pagamento',
      document: 'documento'
    };

    const actionLabels: Record<string, string> = {
      create: 'creato',
      update: 'aggiornato',
      delete: 'eliminato'
    };

    const entityLabel = entityLabels[log.entityType] || log.entityType;
    const actionLabel = actionLabels[log.action] || log.action;

    // Try to extract entity name from newValues
    let entityName = '';
    if (log.newValues && typeof log.newValues === 'object') {
      const values = log.newValues as any;
      entityName = values.name || values.firstName && values.lastName 
        ? `${values.firstName} ${values.lastName}` 
        : '';
    }

    return entityName 
      ? `${log.user.firstName} ha ${actionLabel} ${entityLabel}: ${entityName}`
      : `${log.user.firstName} ha ${actionLabel} un ${entityLabel}`;
  }

  async getKPIs(organizationId: string) {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Current month stats
    const currentStats = await this.getStats(organizationId);

    // Previous month stats for comparison
    const [prevAthletes, prevRevenue, prevMatches] = await Promise.all([
      prisma.athlete.count({
        where: {
          organizationId,
          createdAt: { lte: lastMonthEnd }
        }
      }),
      prisma.payment.aggregate({
        where: {
          organizationId,
          status: 'PAID',
          paidDate: {
            gte: lastMonth,
            lte: lastMonthEnd
          }
        },
        _sum: { amount: true }
      }),
      prisma.match.count({
        where: {
          organizationId,
          status: 'COMPLETED',
          matchDate: {
            gte: lastMonth,
            lte: lastMonthEnd
          }
        }
      })
    ]);

    const currentRevenue = currentStats.payments.monthlyRevenue[currentStats.payments.monthlyRevenue.length - 1]?.amount || 0;
    const previousRevenue = Number(prevRevenue._sum.amount || 0);

    return {
      athletes: {
        current: currentStats.athletes.active,
        previous: prevAthletes,
        growth: prevAthletes > 0 
          ? Math.round(((currentStats.athletes.active - prevAthletes) / prevAthletes) * 100)
          : 0
      },
      revenue: {
        current: currentRevenue,
        previous: previousRevenue,
        growth: previousRevenue > 0
          ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
          : 0
      },
      collectionRate: {
        current: currentStats.payments.collectionRate,
        target: 85,
        status: currentStats.payments.collectionRate >= 85 ? 'good' : 'warning'
      },
      documentCompliance: {
        current: Math.round((currentStats.documents.valid / currentStats.documents.total) * 100),
        target: 90,
        status: (currentStats.documents.valid / currentStats.documents.total) >= 0.9 ? 'good' : 'warning'
      },
      matchActivity: {
        completed: currentStats.matches.completed,
        scheduled: currentStats.matches.scheduled,
        winRate: currentStats.matches.winRate
      }
    };
  }
}

export const dashboardService = new DashboardService();
