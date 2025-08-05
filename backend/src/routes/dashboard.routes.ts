import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../config/database';

const router = Router();
router.use(authenticate);

// Get dashboard statistics
router.get('/stats', async (req: AuthRequest, res, next) => {
  try {
    const organizationId = req.user!.organizationId;
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [
      totalAthletes,
      activeAthletes,
      totalTeams,
      expiringDocuments,
      pendingPayments,
      upcomingMatches,
      transportUsers,
      needingPromotion
    ] = await Promise.all([
      prisma.athlete.count({ where: { organizationId } }),
      prisma.athlete.count({ where: { organizationId, status: 'ACTIVE' } }),
      prisma.team.count({ where: { organizationId, isActive: true } }),
      prisma.document.count({
        where: {
          athlete: { organizationId },
          expiryDate: { gte: today, lte: thirtyDaysFromNow },
          status: 'VALID'
        }
      }),
      prisma.payment.count({
        where: {
          athlete: { organizationId },
          status: 'PENDING'
        }
      }),
      prisma.match.count({
        where: {
          organizationId,
          date: { gte: today },
          status: 'SCHEDULED'
        }
      }),
      prisma.athlete.count({
        where: { organizationId, usesTransport: true }
      }),
      prisma.athlete.count({
        where: { organizationId, needsPromotion: true }
      })
    ]);

    // Get financial summary
    const pendingPaymentsAmount = await prisma.payment.aggregate({
      where: {
        athlete: { organizationId },
        status: 'PENDING'
      },
      _sum: { amount: true }
    });

    const collectedThisMonth = await prisma.payment.aggregate({
      where: {
        athlete: { organizationId },
        status: 'PAID',
        paidDate: {
          gte: new Date(today.getFullYear(), today.getMonth(), 1),
          lt: new Date(today.getFullYear(), today.getMonth() + 1, 1)
        }
      },
      _sum: { amount: true }
    });

    res.json({
      athletes: {
        total: totalAthletes,
        active: activeAthletes,
        needingPromotion
      },
      teams: {
        total: totalTeams
      },
      documents: {
        expiring30Days: expiringDocuments
      },
      payments: {
        pendingCount: pendingPayments,
        pendingAmount: pendingPaymentsAmount._sum.amount || 0,
        collectedThisMonth: collectedThisMonth._sum.amount || 0
      },
      matches: {
        upcoming: upcomingMatches
      },
      transport: {
        totalUsers: transportUsers
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get recent activity
router.get('/activity', async (req: AuthRequest, res, next) => {
  try {
    const organizationId = req.user!.organizationId;
    const limit = parseInt(req.query.limit as string) || 10;

    const recentAthletes = await prisma.athlete.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        team: { select: { name: true } }
      }
    });

    const recentPayments = await prisma.payment.findMany({
      where: {
        athlete: { organizationId },
        status: 'PAID'
      },
      orderBy: { paidDate: 'desc' },
      take: limit,
      include: {
        athlete: { select: { firstName: true, lastName: true } },
        paymentType: { select: { name: true } }
      }
    });

    res.json({
      recentAthletes,
      recentPayments
    });
  } catch (error) {
    next(error);
  }
});

export default router;
