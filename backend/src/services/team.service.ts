import { PrismaClient, Team, Prisma } from '@prisma/client';
import { NotFoundError, ConflictError, BadRequestError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { notificationService } from './notification.service';

const prisma = new PrismaClient();

export interface CreateTeamInput {
  name: string;
  category: string;
  minAge: number;
  maxAge: number;
  season: string;
  description?: string;
  budget?: number;
}

export interface UpdateTeamInput extends Partial<CreateTeamInput> {
  isActive?: boolean;
}

export class TeamService {
  async findAll(organizationId: string, params?: {
    includeInactive?: boolean;
    category?: string;
    season?: string;
  }) {
    const where: Prisma.TeamWhereInput = { 
      organizationId,
      ...(params?.includeInactive ? {} : { isActive: true }),
      ...(params?.category && { category: params.category as any }),
      ...(params?.season && { season: params.season })
    };

    const teams = await prisma.team.findMany({
      where,
      include: {
        _count: {
          select: {
            athletes: true,
            homeMatches: true,
            awayMatches: true
          }
        }
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    return teams.map(team => ({
      ...team,
      athleteCount: team._count.athletes,
      totalMatches: team._count.homeMatches + team._count.awayMatches
    }));
  }

  async findById(id: string, organizationId: string) {
    const team = await prisma.team.findFirst({
      where: { id, organizationId },
      include: {
        athletes: {
          where: { status: 'ACTIVE' },
          include: {
            position: true,
            documents: {
              where: {
                status: 'VALID',
                expiryDate: { gte: new Date() }
              },
              include: { documentType: true }
            }
          },
          orderBy: { jerseyNumber: 'asc' }
        },
        homeMatches: {
          include: {
            awayTeam: true,
            venue: true
          },
          orderBy: { matchDate: 'desc' },
          take: 5
        },
        awayMatches: {
          include: {
            homeTeam: true,
            venue: true
          },
          orderBy: { matchDate: 'desc' },
          take: 5
        }
      }
    });

    if (!team) {
      throw NotFoundError('Team');
    }

    // Combine and sort matches
    const recentMatches = [...team.homeMatches, ...team.awayMatches]
      .sort((a, b) => b.matchDate.getTime() - a.matchDate.getTime())
      .slice(0, 5);

    // Calculate team statistics
    const stats = await this.getTeamStatistics(id);

    return {
      ...team,
      recentMatches,
      statistics: stats
    };
  }

  async create(data: CreateTeamInput, organizationId: string) {
    // Validate age range
    if (data.minAge >= data.maxAge) {
      throw BadRequestError('Minimum age must be less than maximum age');
    }

    // Check for duplicate team name in same organization and season
    const existing = await prisma.team.findFirst({
      where: {
        organizationId,
        name: data.name,
        season: data.season
      }
    });

    if (existing) {
      throw ConflictError(`A team named "${data.name}" already exists for season ${data.season}`);
    }



    const team = await prisma.team.create({
      data: {
        ...data,
        organizationId
      },

    });

    logger.info(`New team created: ${team.name} (${team.category})`);

    // Create notification
    await notificationService.create({
      organizationId,
      type: 'team_created',
      severity: 'info',
      title: 'Nuova Squadra Creata',
      message: `La squadra ${team.name} è stata creata per la stagione ${team.season}`,
      relatedEntityType: 'team',
      relatedEntityId: team.id
    });

    return team;
  }

  async update(id: string, data: UpdateTeamInput, organizationId: string) {
    const team = await this.findById(id, organizationId);

    // Validate age range if provided
    if (data.minAge !== undefined || data.maxAge !== undefined) {
      const minAge = data.minAge ?? team.minAge;
      const maxAge = data.maxAge ?? team.maxAge;
      
      if (minAge >= maxAge) {
        throw BadRequestError('Minimum age must be less than maximum age');
      }
    }

    // Check for duplicate name if changing
    if (data.name && data.name !== team.name) {
      const existing = await prisma.team.findFirst({
        where: {
          organizationId,
          name: data.name,
          season: data.season || team.season,
          id: { not: id }
        }
      });

      if (existing) {
        throw ConflictError(`A team named "${data.name}" already exists`);
      }
    }

    const updated = await prisma.team.update({
      where: { id },
      data,

    });

    // Check if age limits changed and verify athlete eligibility
    if (data.minAge !== undefined || data.maxAge !== undefined) {
      await this.checkAthletesEligibility(id);
    }

    logger.info(`Team updated: ${updated.name}`);

    return updated;
  }

  async delete(id: string, organizationId: string) {
    const team = await this.findById(id, organizationId);

    // Check if team has athletes
    const athleteCount = await prisma.athlete.count({
      where: { teamId: id }
    });

    if (athleteCount > 0) {
      throw BadRequestError(`Cannot delete team with ${athleteCount} athletes. Please reassign athletes first.`);
    }

    // Check if team has scheduled matches
    const matchCount = await prisma.match.count({
      where: {
        OR: [
          { homeTeamId: id },
          { awayTeamId: id }
        ],
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
      }
    });

    if (matchCount > 0) {
      throw BadRequestError(`Cannot delete team with ${matchCount} scheduled matches.`);
    }

    await prisma.team.delete({ where: { id } });

    logger.info(`Team deleted: ${team.name}`);

    return { message: 'Team deleted successfully' };
  }

  async getTeamStatistics(teamId: string) {
    const [matches, athletes, documents] = await Promise.all([
      // Match statistics
      prisma.match.findMany({
        where: {
          OR: [
            { homeTeamId: teamId },
            { awayTeamId: teamId }
          ],
          status: 'COMPLETED'
        },
        select: {
          homeTeamId: true,
          homeScore: true,
          awayScore: true
        }
      }),

      // Athlete statistics
      prisma.athlete.groupBy({
        by: ['status'],
        where: { teamId },
        _count: true
      }),

      // Document status
      prisma.document.findMany({
        where: {
          athlete: { teamId },
          status: 'VALID'
        },
        select: {
          expiryDate: true,
          documentType: {
            select: { category: true }
          }
        }
      })
    ]);

    // Calculate match statistics
    let wins = 0, draws = 0, losses = 0;
    let goalsFor = 0, goalsAgainst = 0;

    matches.forEach(match => {
      const isHome = match.homeTeamId === teamId;
      const teamScore = isHome ? match.homeScore! : match.awayScore!;
      const opponentScore = isHome ? match.awayScore! : match.homeScore!;

      goalsFor += teamScore;
      goalsAgainst += opponentScore;

      if (teamScore > opponentScore) wins++;
      else if (teamScore === opponentScore) draws++;
      else losses++;
    });

    // Calculate document statistics
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const expiringDocuments = documents.filter(doc => 
      doc.expiryDate <= thirtyDaysFromNow
    ).length;

    const expiredDocuments = documents.filter(doc => 
      doc.expiryDate < today
    ).length;

    // Aggregate athlete status
    const athleteStats = athletes.reduce((acc, curr) => {
      acc[curr.status.toLowerCase()] = curr._count;
      return acc;
    }, {} as Record<string, number>);

    return {
      matches: {
        played: matches.length,
        wins,
        draws,
        losses,
        points: wins * 3 + draws,
        goalsFor,
        goalsAgainst,
        goalDifference: goalsFor - goalsAgainst
      },
      athletes: {
        total: athletes.reduce((sum, a) => sum + a._count, 0),
        active: athleteStats.active || 0,
        injured: athleteStats.injured || 0,
        suspended: athleteStats.suspended || 0
      },
      documents: {
        expiring: expiringDocuments,
        expired: expiredDocuments
      }
    };
  }

  async checkAthletesEligibility(teamId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        athletes: true
      }
    });

    if (!team) return;

    for (const athlete of team.athletes) {
      const age = this.calculateAge(athlete.birthDate);
      const needsPromotion = age < team.minAge || age > team.maxAge;

      if (needsPromotion !== athlete.needsPromotion) {
        await prisma.athlete.update({
          where: { id: athlete.id },
          data: { needsPromotion }
        });

        if (needsPromotion) {
          await notificationService.create({
            organizationId: team.organizationId,
            type: 'age_violation',
            severity: 'warning',
            title: 'Atleta Fuori Categoria',
            message: `${athlete.firstName} ${athlete.lastName} (${age} anni) non rientra nei limiti ${team.minAge}-${team.maxAge} anni per ${team.name}`,
            relatedEntityType: 'athlete',
            relatedEntityId: athlete.id
          });
        }
      }
    }
  }

  async getTeamBudgetSummary(teamId: string, organizationId: string) {
    const team = await this.findById(teamId, organizationId);

    const expenses = await prisma.payment.aggregate({
      where: {
        athlete: { teamId },
        type: 'EXPENSE'
      },
      _sum: { amount: true }
    });

    const income = await prisma.payment.aggregate({
      where: {
        athlete: { teamId },
        type: 'INCOME'
      },
      _sum: { amount: true }
    });

    const pendingPayments = await prisma.payment.aggregate({
      where: {
        athlete: { teamId },
        status: 'PENDING'
      },
      _sum: { amount: true }
    });

    return {
      budget: team.budget || 0,
      totalExpenses: Number(expenses._sum.amount || 0),
      totalIncome: Number(income._sum.amount || 0),
      pendingPayments: Number(pendingPayments._sum.amount || 0),
      remainingBudget: (team.budget || 0) - Number(expenses._sum.amount || 0)
    };
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }
}

export const teamService = new TeamService();
