import { PrismaClient, Match, Prisma, MatchStatus } from '@prisma/client';
import { NotFoundError, ConflictError, BadRequestError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { notificationService } from './notification.service';

const prisma = new PrismaClient();

export interface CreateMatchInput {
  homeTeamId: string;
  awayTeamId: string;
  matchDate: Date;
  matchTime: Date;
  competitionId?: number;
  venueId?: number;
  notes?: string;
}

export interface UpdateMatchInput extends Partial<CreateMatchInput> {
  status?: MatchStatus;
  homeScore?: number;
  awayScore?: number;
}

export interface CreateRosterInput {
  athleteId: string;
  isStarter: boolean;
  status?: 'selected' | 'injured' | 'absent';
  notes?: string;
}

export interface CreateMatchStatInput {
  athleteId: string;
  minutesPlayed?: number;
  goals?: number;
  assists?: number;
  yellowCards?: number;
  redCards?: number;
  saves?: number;
}

export class MatchService {
  async findAll(organizationId: string, params?: {
    teamId?: string;
    competitionId?: number;
    status?: MatchStatus;
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const where: Prisma.MatchWhereInput = {
      organizationId,
      ...(params?.teamId && {
        OR: [
          { homeTeamId: params.teamId },
          { awayTeamId: params.teamId }
        ]
      }),
      ...(params?.competitionId && { competitionId: params.competitionId }),
      ...(params?.status && { status: params.status }),
      ...(params?.fromDate && { matchDate: { gte: params.fromDate } }),
      ...(params?.toDate && { matchDate: { lte: params.toDate } })
    };

    const [matches, total] = await Promise.all([
      prisma.match.findMany({
        where,
        include: {
          homeTeam: {
            select: { id: true, name: true, category: true }
          },
          awayTeam: {
            select: { id: true, name: true, category: true }
          },
          competition: {
            select: { id: true, name: true }
          },
          venue: {
            select: { id: true, name: true, city: true }
          },
          _count: {
            select: { rosters: true }
          }
        },
        orderBy: [
          { matchDate: 'desc' },
          { matchTime: 'desc' }
        ],
        take: params?.limit,
        skip: params?.offset
      }),
      prisma.match.count({ where })
    ]);

    return {
      data: matches.map(match => ({
        ...match,
        rosterCount: match._count.rosters,
        isPlayed: match.status === 'COMPLETED',
        result: match.status === 'COMPLETED' 
          ? `${match.homeScore} - ${match.awayScore}` 
          : null
      })),
      total,
      limit: params?.limit || matches.length,
      offset: params?.offset || 0
    };
  }

  async findById(id: string, organizationId: string) {
    const match = await prisma.match.findFirst({
      where: { id, organizationId },
      include: {
        homeTeam: {
          include: {
            athletes: {
              where: { status: 'ACTIVE' },
              select: {
                id: true,
                firstName: true,
                lastName: true,
                jerseyNumber: true,
                position: true
              }
            }
          }
        },
        awayTeam: {
          include: {
            athletes: {
              where: { status: 'ACTIVE' },
              select: {
                id: true,
                firstName: true,
                lastName: true,
                jerseyNumber: true,
                position: true
              }
            }
          }
        },
        competition: true,
        venue: true,
        rosters: {
          include: {
            athlete: {
              include: { position: true }
            }
          },
          orderBy: [
            { isStarter: 'desc' },
            { athlete: { jerseyNumber: 'asc' } }
          ]
        },
        stats: {
          include: {
            athlete: true
          }
        }
      }
    });

    if (!match) {
      throw NotFoundError('Match');
    }

    // Calculate team statistics for the match
    const homeTeamStats = this.calculateTeamStats(match.stats.filter(s => 
      match.rosters.find(r => r.athleteId === s.athleteId && 
        match.homeTeam.athletes.some(a => a.id === s.athleteId))
    ));

    const awayTeamStats = this.calculateTeamStats(match.stats.filter(s => 
      match.rosters.find(r => r.athleteId === s.athleteId && 
        match.awayTeam.athletes.some(a => a.id === s.athleteId))
    ));

    return {
      ...match,
      homeTeamStats,
      awayTeamStats
    };
  }

  async create(data: CreateMatchInput, organizationId: string) {
    // Validate teams exist and belong to organization
    const [homeTeam, awayTeam] = await Promise.all([
      prisma.team.findFirst({ where: { id: data.homeTeamId, organizationId } }),
      prisma.team.findFirst({ where: { id: data.awayTeamId, organizationId } })
    ]);

    if (!homeTeam) throw BadRequestError('Invalid home team');
    if (!awayTeam) throw BadRequestError('Invalid away team');

    // Check for conflicting matches (same teams on same date)
    const conflictingMatch = await prisma.match.findFirst({
      where: {
        matchDate: data.matchDate,
        OR: [
          {
            AND: [
              { homeTeamId: data.homeTeamId },
              { awayTeamId: data.awayTeamId }
            ]
          },
          {
            AND: [
              { homeTeamId: data.homeTeamId },
              { status: { notIn: ['CANCELLED', 'POSTPONED'] } }
            ]
          },
          {
            AND: [
              { awayTeamId: data.awayTeamId },
              { status: { notIn: ['CANCELLED', 'POSTPONED'] } }
            ]
          }
        ]
      }
    });

    if (conflictingMatch) {
      throw ConflictError('One or both teams already have a match scheduled on this date');
    }

    const match = await prisma.match.create({
      data: {
        ...data,
        organizationId,
        status: 'SCHEDULED'
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        venue: true
      }
    });

    logger.info(`New match created: ${homeTeam.name} vs ${awayTeam.name} on ${data.matchDate}`);

    // Create notifications for both teams
    await Promise.all([
      notificationService.create({
        organizationId,
        type: 'match_scheduled',
        severity: 'info',
        title: 'Nuova Partita Programmata',
        message: `${homeTeam.name} vs ${awayTeam.name} - ${new Date(data.matchDate).toLocaleDateString('it-IT')}`,
        relatedEntityType: 'match',
        relatedEntityId: match.id
      })
    ]);

    return match;
  }

  async update(id: string, data: UpdateMatchInput, organizationId: string) {
    const match = await this.findById(id, organizationId);

    // Validate status transitions
    if (data.status) {
      this.validateStatusTransition(match.status, data.status);

      // If completing match, require scores
      if (data.status === 'COMPLETED' && (data.homeScore === undefined || data.awayScore === undefined)) {
        throw BadRequestError('Scores are required when completing a match');
      }
    }

    // Check for conflicting matches if date is changing
    if (data.matchDate && data.matchDate !== match.matchDate) {
      const conflictingMatch = await prisma.match.findFirst({
        where: {
          id: { not: id },
          matchDate: data.matchDate,
          OR: [
            { homeTeamId: match.homeTeamId },
            { awayTeamId: match.awayTeamId }
          ],
          status: { notIn: ['CANCELLED', 'POSTPONED'] }
        }
      });

      if (conflictingMatch) {
        throw ConflictError('One or both teams already have a match scheduled on this date');
      }
    }

    const updated = await prisma.match.update({
      where: { id },
      data,
      include: {
        homeTeam: true,
        awayTeam: true,
        venue: true
      }
    });

    // Send notifications based on status change
    if (data.status && data.status !== match.status) {
      await this.sendStatusChangeNotification(updated, match.status);
    }

    logger.info(`Match updated: ${updated.homeTeam.name} vs ${updated.awayTeam.name}`);

    return updated;
  }

  async delete(id: string, organizationId: string) {
    const match = await this.findById(id, organizationId);

    if (match.status === 'COMPLETED') {
      throw BadRequestError('Cannot delete completed matches');
    }

    await prisma.match.delete({ where: { id } });

    logger.info(`Match deleted: ${match.homeTeam.name} vs ${match.awayTeam.name}`);

    return { message: 'Match deleted successfully' };
  }

  // Roster Management
  async updateRoster(matchId: string, roster: CreateRosterInput[], organizationId: string) {
    const match = await this.findById(matchId, organizationId);

    if (match.status !== 'SCHEDULED') {
      throw BadRequestError('Can only update roster for scheduled matches');
    }

    // Validate all athletes belong to one of the teams
    const athleteIds = roster.map(r => r.athleteId);
    const validAthletes = await prisma.athlete.findMany({
      where: {
        id: { in: athleteIds },
        teamId: { in: [match.homeTeamId, match.awayTeamId] },
        status: 'ACTIVE'
      }
    });

    if (validAthletes.length !== athleteIds.length) {
      throw BadRequestError('Some athletes are not valid for this match');
    }

    // Delete existing roster and create new one
    await prisma.$transaction(async (tx) => {
      await tx.matchRoster.deleteMany({ where: { matchId } });
      
      await tx.matchRoster.createMany({
        data: roster.map(r => ({
          matchId,
          ...r
        }))
      });
    });

    // Send notification to selected athletes
    const selectedAthletes = roster.filter(r => r.status === 'selected');
    await notificationService.create({
      organizationId,
      type: 'match_roster',
      severity: 'info',
      title: 'Convocazione Partita',
      message: `Sei stato convocato per ${match.homeTeam.name} vs ${match.awayTeam.name}`,
      relatedEntityType: 'match',
      relatedEntityId: matchId
    });

    return { message: 'Roster updated successfully', count: roster.length };
  }

  async getRoster(matchId: string, organizationId: string) {
    await this.findById(matchId, organizationId); // Verify access

    const roster = await prisma.matchRoster.findMany({
      where: { matchId },
      include: {
        athlete: {
          include: {
            position: true,
            team: true
          }
        }
      },
      orderBy: [
        { isStarter: 'desc' },
        { athlete: { jerseyNumber: 'asc' } }
      ]
    });

    // Group by team
    const homeRoster = roster.filter(r => r.athlete.teamId === roster[0]?.athlete.team?.id);
    const awayRoster = roster.filter(r => r.athlete.teamId !== roster[0]?.athlete.team?.id);

    return {
      home: homeRoster,
      away: awayRoster,
      total: roster.length
    };
  }

  // Match Statistics
  async updateStats(matchId: string, stats: CreateMatchStatInput[], organizationId: string) {
    const match = await this.findById(matchId, organizationId);

    if (match.status !== 'IN_PROGRESS' && match.status !== 'COMPLETED') {
      throw BadRequestError('Can only update stats for matches in progress or completed');
    }

    // Validate all athletes are in the roster
    const athleteIds = stats.map(s => s.athleteId);
    const rosterAthletes = await prisma.matchRoster.findMany({
      where: {
        matchId,
        athleteId: { in: athleteIds }
      }
    });

    if (rosterAthletes.length !== athleteIds.length) {
      throw BadRequestError('Some athletes are not in the match roster');
    }

    // Update or create stats
    await prisma.$transaction(async (tx) => {
      for (const stat of stats) {
        await tx.matchStat.upsert({
          where: {
            matchId_athleteId: {
              matchId,
              athleteId: stat.athleteId
            }
          },
          update: stat,
          create: {
            matchId,
            ...stat
          }
        });
      }
    });

    return { message: 'Match statistics updated successfully' };
  }

  async getStats(matchId: string, organizationId: string) {
    const match = await this.findById(matchId, organizationId);

    const stats = await prisma.matchStat.findMany({
      where: { matchId },
      include: {
        athlete: {
          include: {
            position: true,
            team: true
          }
        }
      }
    });

    // Group by team and calculate totals
    const homeStats = stats.filter(s => s.athlete.teamId === match.homeTeamId);
    const awayStats = stats.filter(s => s.athlete.teamId === match.awayTeamId);

    return {
      home: {
        players: homeStats,
        totals: this.calculateTeamStats(homeStats)
      },
      away: {
        players: awayStats,
        totals: this.calculateTeamStats(awayStats)
      }
    };
  }

  // Calendar view
  async getCalendar(organizationId: string, params: {
    teamId?: string;
    month: number;
    year: number;
  }) {
    const startDate = new Date(params.year, params.month - 1, 1);
    const endDate = new Date(params.year, params.month, 0);

    const matches = await this.findAll(organizationId, {
      teamId: params.teamId,
      fromDate: startDate,
      toDate: endDate
    });

    // Group matches by date
    const calendar = matches.data.reduce((acc, match) => {
      const dateKey = match.matchDate.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(match);
      return acc;
    }, {} as Record<string, typeof matches.data>);

    return {
      month: params.month,
      year: params.year,
      dates: calendar,
      totalMatches: matches.total
    };
  }

  // Helper methods
  private calculateTeamStats(stats: any[]) {
    return {
      goals: stats.reduce((sum, s) => sum + (s.goals || 0), 0),
      assists: stats.reduce((sum, s) => sum + (s.assists || 0), 0),
      yellowCards: stats.reduce((sum, s) => sum + (s.yellowCards || 0), 0),
      redCards: stats.reduce((sum, s) => sum + (s.redCards || 0), 0),
      saves: stats.reduce((sum, s) => sum + (s.saves || 0), 0),
      minutesPlayed: stats.reduce((sum, s) => sum + (s.minutesPlayed || 0), 0)
    };
  }

  private validateStatusTransition(current: MatchStatus, next: MatchStatus) {
    const validTransitions: Record<MatchStatus, MatchStatus[]> = {
      SCHEDULED: ['IN_PROGRESS', 'CANCELLED', 'POSTPONED'],
      IN_PROGRESS: ['COMPLETED', 'POSTPONED'],
      COMPLETED: [],
      CANCELLED: ['SCHEDULED'],
      POSTPONED: ['SCHEDULED']
    };

    if (!validTransitions[current].includes(next)) {
      throw BadRequestError(`Cannot transition from ${current} to ${next}`);
    }
  }

  private async sendStatusChangeNotification(match: any, previousStatus: MatchStatus) {
    const statusMessages: Record<MatchStatus, string> = {
      SCHEDULED: 'riprogrammata',
      IN_PROGRESS: 'iniziata',
      COMPLETED: 'conclusa',
      CANCELLED: 'cancellata',
      POSTPONED: 'posticipata'
    };

    await notificationService.create({
      organizationId: match.organizationId,
      type: 'match_status_changed',
      severity: match.status === 'CANCELLED' ? 'warning' : 'info',
      title: 'Aggiornamento Partita',
      message: `La partita ${match.homeTeam.name} vs ${match.awayTeam.name} è stata ${statusMessages[match.status]}`,
      relatedEntityType: 'match',
      relatedEntityId: match.id
    });
  }
}

export const matchService = new MatchService();
