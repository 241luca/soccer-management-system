import { PrismaClient, Match, MatchStatus } from '@prisma/client';
import { BadRequestError, NotFoundError, ConflictError } from '../utils/errors';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface CreateMatchInput {
  organizationId: string;
  homeTeamId: string;
  awayTeamId?: string;
  awayTeamName?: string;
  competitionId?: string;
  date: Date;
  time?: string;
  venueId?: string;
  venue?: string;
  type: 'FRIENDLY' | 'LEAGUE' | 'CUP' | 'TOURNAMENT';
  season: string;
  notes?: string;
}

export interface UpdateMatchInput extends Partial<CreateMatchInput> {
  id: string;
  status?: MatchStatus;
  homeScore?: number;
  awayScore?: number;
}

export interface MatchRosterInput {
  matchId: string;
  organizationId: string;
  roster: {
    athleteId: string;
    position?: string;
    jerseyNumber?: number;
    isStarter: boolean;
  }[];
}

export interface MatchWithDetails extends Match {
  homeTeam?: any;
  awayTeam?: any;
  competition?: any;
  venue?: any;
  roster?: any[];
  stats?: any;
}

export class MatchService {
  // Get all matches
  async getMatches(organizationId: string, filters?: any): Promise<MatchWithDetails[]> {
    try {
      const where: any = { organizationId };
      
      if (filters?.teamId) {
        where.OR = [
          { homeTeamId: filters.teamId },
          { awayTeamId: filters.teamId }
        ];
      }
      
      if (filters?.status) {
        where.status = filters.status;
      }
      
      if (filters?.type) {
        where.type = filters.type;
      }
      
      if (filters?.upcoming === 'true') {
        where.date = {
          gte: new Date()
        };
        where.status = {
          in: ['SCHEDULED', 'POSTPONED']
        };
      }
      
      if (filters?.month && filters?.year) {
        const startDate = new Date(filters.year, filters.month - 1, 1);
        const endDate = new Date(filters.year, filters.month, 0);
        
        where.date = {
          gte: startDate,
          lte: endDate
        };
      }
      
      const matches = await prisma.match.findMany({
        where,
        include: {
          homeTeam: {
            select: {
              id: true,
              name: true,
              category: true
            }
          },
          awayTeam: {
            select: {
              id: true,
              name: true,
              category: true
            }
          },
          competition: {
            select: {
              id: true,
              name: true,
              type: true
            }
          },
          venue: {
            select: {
              id: true,
              name: true,
              address: true
            }
          },
          matchAthletes: {
            include: {
              athlete: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        },
        orderBy: [
          { date: 'desc' },
          { time: 'desc' }
        ]
      });
      
      // Update match statuses based on date
      const updatedMatches = await Promise.all(
        matches.map(async (match) => {
          const newStatus = this.calculateMatchStatus(match);
          if (newStatus !== match.status && match.status === 'SCHEDULED') {
            return await prisma.match.update({
              where: { id: match.id },
              data: { status: newStatus },
              include: {
                homeTeam: true,
                awayTeam: true,
                competition: true,
                venue: true,
                matchAthletes: {
                  include: {
                    athlete: true
                  }
                }
              }
            });
          }
          return match;
        })
      );
      
      return updatedMatches;
    } catch (error) {
      logger.error('Error fetching matches:', error);
      throw error;
    }
  }
  
  // Get single match
  async getMatchById(id: string, organizationId: string): Promise<MatchWithDetails> {
    const match = await prisma.match.findFirst({
      where: {
        id,
        organizationId
      },
      include: {
        homeTeam: {
          include: {
            athletes: {
              where: { status: 'ACTIVE' },
              select: {
                id: true,
                firstName: true,
                lastName: true,
                photoUrl: true
              }
            }
          }
        },
        awayTeam: true,
        competition: true,
        venue: true,
        matchAthletes: {
          include: {
            athlete: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                photoUrl: true,
                birthDate: true
              }
            }
          },
          orderBy: [
            { isStarter: 'desc' },
            { jerseyNumber: 'asc' }
          ]
        },
        matchEvents: {
          orderBy: {
            minute: 'asc'
          }
        }
      }
    });
    
    if (!match) {
      throw new NotFoundError('Match not found');
    }
    
    return match;
  }
  
  // Create new match
  async createMatch(data: CreateMatchInput): Promise<Match> {
    try {
      // Verify home team exists
      const homeTeam = await prisma.team.findFirst({
        where: {
          id: data.homeTeamId,
          organizationId: data.organizationId
        }
      });
      
      if (!homeTeam) {
        throw new NotFoundError('Home team not found');
      }
      
      // Verify away team if internal match
      if (data.awayTeamId) {
        const awayTeam = await prisma.team.findFirst({
          where: {
            id: data.awayTeamId,
            organizationId: data.organizationId
          }
        });
        
        if (!awayTeam) {
          throw new NotFoundError('Away team not found');
        }
        
        if (data.homeTeamId === data.awayTeamId) {
          throw new BadRequestError('Home and away team cannot be the same');
        }
      }
      
      // Check for scheduling conflicts
      const conflictingMatch = await prisma.match.findFirst({
        where: {
          date: data.date,
          time: data.time,
          OR: [
            { homeTeamId: data.homeTeamId },
            { awayTeamId: data.homeTeamId },
            { homeTeamId: data.awayTeamId },
            { awayTeamId: data.awayTeamId }
          ]
        }
      });
      
      if (conflictingMatch) {
        throw new ConflictError('A match is already scheduled for one of these teams at this time');
      }
      
      const match = await prisma.match.create({
        data: {
          organizationId: data.organizationId,
          homeTeamId: data.homeTeamId,
          awayTeamId: data.awayTeamId,
          awayTeamName: data.awayTeamName || null,
          competitionId: data.competitionId,
          date: data.date,
          time: data.time,
          venueId: data.venueId,
          venue: data.venue,
          type: data.type,
          season: data.season,
          status: 'SCHEDULED',
          notes: data.notes
        }
      });
      
      logger.info(`Match created: ${match.id}`);
      
      // Create notification
      await this.createMatchNotification(
        data.organizationId,
        'NEW_MATCH',
        `New match scheduled: ${homeTeam.name} vs ${data.awayTeamName || 'TBD'} on ${new Date(data.date).toLocaleDateString()}`,
        match.id
      );
      
      return match;
    } catch (error) {
      logger.error('Error creating match:', error);
      throw error;
    }
  }
  
  // Update match
  async updateMatch(data: UpdateMatchInput): Promise<Match> {
    try {
      const existing = await prisma.match.findFirst({
        where: {
          id: data.id,
          organizationId: data.organizationId
        }
      });
      
      if (!existing) {
        throw new NotFoundError('Match not found');
      }
      
      // Don't allow changing teams for completed matches
      if (existing.status === 'COMPLETED' && (data.homeTeamId || data.awayTeamId)) {
        throw new BadRequestError('Cannot change teams for completed match');
      }
      
      const match = await prisma.match.update({
        where: { id: data.id },
        data: {
          homeTeamId: data.homeTeamId,
          awayTeamId: data.awayTeamId,
          awayTeamName: data.awayTeamName,
          competitionId: data.competitionId,
          date: data.date,
          time: data.time,
          venueId: data.venueId,
          venue: data.venue,
          type: data.type,
          season: data.season,
          status: data.status,
          homeScore: data.homeScore,
          awayScore: data.awayScore,
          notes: data.notes,
          updatedAt: new Date()
        }
      });
      
      logger.info(`Match updated: ${match.id}`);
      
      // Create notification if match was postponed or cancelled
      if (data.status && ['POSTPONED', 'CANCELLED'].includes(data.status)) {
        await this.createMatchNotification(
          data.organizationId!,
          'MATCH_UPDATE',
          `Match ${data.status.toLowerCase()}: Check match details for updates`,
          match.id
        );
      }
      
      return match;
    } catch (error) {
      logger.error('Error updating match:', error);
      throw error;
    }
  }
  
  // Delete match
  async deleteMatch(id: string, organizationId: string): Promise<void> {
    try {
      const match = await prisma.match.findFirst({
        where: {
          id,
          organizationId
        }
      });
      
      if (!match) {
        throw new NotFoundError('Match not found');
      }
      
      if (match.status === 'COMPLETED') {
        throw new BadRequestError('Cannot delete completed match');
      }
      
      // Delete related data
      await prisma.matchAthlete.deleteMany({
        where: { matchId: id }
      });
      
      await prisma.matchEvent.deleteMany({
        where: { matchId: id }
      });
      
      await prisma.match.delete({
        where: { id }
      });
      
      logger.info(`Match deleted: ${id}`);
    } catch (error) {
      logger.error('Error deleting match:', error);
      throw error;
    }
  }
  
  // Update match roster
  async updateMatchRoster(data: MatchRosterInput): Promise<void> {
    try {
      const match = await prisma.match.findFirst({
        where: {
          id: data.matchId,
          organizationId: data.organizationId
        },
        include: {
          homeTeam: true
        }
      });
      
      if (!match) {
        throw new NotFoundError('Match not found');
      }
      
      if (match.status === 'COMPLETED') {
        throw new BadRequestError('Cannot update roster for completed match');
      }
      
      // Verify all athletes belong to the team
      const athleteIds = data.roster.map(r => r.athleteId);
      const athletes = await prisma.athlete.findMany({
        where: {
          id: { in: athleteIds },
          teamId: match.homeTeamId,
          status: 'ACTIVE'
        }
      });
      
      if (athletes.length !== athleteIds.length) {
        throw new BadRequestError('Some athletes are not eligible for this team');
      }
      
      // Delete existing roster
      await prisma.matchAthlete.deleteMany({
        where: { matchId: data.matchId }
      });
      
      // Create new roster
      await prisma.matchAthlete.createMany({
        data: data.roster.map(r => ({
          matchId: data.matchId,
          athleteId: r.athleteId,
          position: r.position,
          jerseyNumber: r.jerseyNumber,
          isStarter: r.isStarter,
          isCaptain: false
        }))
      });
      
      logger.info(`Match roster updated: ${data.matchId} with ${data.roster.length} players`);
      
      // Create notification
      await this.createMatchNotification(
        data.organizationId,
        'ROSTER_UPDATE',
        `Match roster updated for ${match.homeTeam.name}`,
        match.id
      );
    } catch (error) {
      logger.error('Error updating match roster:', error);
      throw error;
    }
  }
  
  // Record match result
  async recordMatchResult(
    matchId: string,
    organizationId: string,
    homeScore: number,
    awayScore: number,
    events?: any[]
  ): Promise<Match> {
    try {
      const match = await prisma.match.findFirst({
        where: {
          id: matchId,
          organizationId
        },
        include: {
          homeTeam: true,
          awayTeam: true
        }
      });
      
      if (!match) {
        throw new NotFoundError('Match not found');
      }
      
      if (match.status === 'COMPLETED') {
        throw new BadRequestError('Match result already recorded');
      }
      
      // Update match
      const updatedMatch = await prisma.match.update({
        where: { id: matchId },
        data: {
          status: 'COMPLETED',
          homeScore,
          awayScore,
          updatedAt: new Date()
        }
      });
      
      // Record match events if provided
      if (events && events.length > 0) {
        await prisma.matchEvent.createMany({
          data: events.map(event => ({
            matchId,
            athleteId: event.athleteId,
            type: event.type,
            minute: event.minute,
            description: event.description
          }))
        });
      }
      
      logger.info(`Match result recorded: ${matchId} (${homeScore}-${awayScore})`);
      
      // Create notification
      const resultText = `${match.homeTeam.name} ${homeScore} - ${awayScore} ${match.awayTeam?.name || match.awayTeamName}`;
      await this.createMatchNotification(
        organizationId,
        'MATCH_RESULT',
        `Match completed: ${resultText}`,
        matchId
      );
      
      return updatedMatch;
    } catch (error) {
      logger.error('Error recording match result:', error);
      throw error;
    }
  }
  
  // Get match calendar
  async getMatchCalendar(organizationId: string, month: number, year: number): Promise<any> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const matches = await prisma.match.findMany({
      where: {
        organizationId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        homeTeam: {
          select: {
            id: true,
            name: true,
            category: true
          }
        },
        awayTeam: {
          select: {
            id: true,
            name: true
          }
        },
        venue: {
          select: {
            name: true,
            address: true
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ]
    });
    
    // Group matches by date
    const calendar: { [key: string]: any[] } = {};
    
    matches.forEach(match => {
      const dateKey = new Date(match.date).toISOString().split('T')[0];
      if (!calendar[dateKey]) {
        calendar[dateKey] = [];
      }
      calendar[dateKey].push(match);
    });
    
    return {
      month,
      year,
      matches: calendar,
      totalMatches: matches.length,
      upcomingMatches: matches.filter(m => m.status === 'SCHEDULED').length,
      completedMatches: matches.filter(m => m.status === 'COMPLETED').length
    };
  }
  
  // Get team fixtures
  async getTeamFixtures(teamId: string, organizationId: string): Promise<MatchWithDetails[]> {
    const matches = await prisma.match.findMany({
      where: {
        organizationId,
        OR: [
          { homeTeamId: teamId },
          { awayTeamId: teamId }
        ]
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        venue: true,
        competition: true
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    return matches;
  }
  
  // Get upcoming matches
  async getUpcomingMatches(organizationId: string, limit: number = 5): Promise<MatchWithDetails[]> {
    const matches = await prisma.match.findMany({
      where: {
        organizationId,
        date: {
          gte: new Date()
        },
        status: {
          in: ['SCHEDULED', 'POSTPONED']
        }
      },
      include: {
        homeTeam: {
          select: {
            id: true,
            name: true,
            category: true
          }
        },
        awayTeam: {
          select: {
            id: true,
            name: true
          }
        },
        venue: {
          select: {
            name: true,
            address: true
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ],
      take: limit
    });
    
    return matches;
  }
  
  // Helper functions
  private calculateMatchStatus(match: Match): MatchStatus {
    const now = new Date();
    const matchDate = new Date(match.date);
    
    // Set match time if provided
    if (match.time) {
      const [hours, minutes] = match.time.split(':');
      matchDate.setHours(parseInt(hours), parseInt(minutes));
    }
    
    // If match is in the past and not completed, mark as needing update
    if (matchDate < now && match.status === 'SCHEDULED') {
      return 'IN_PROGRESS'; // Or could return a custom status
    }
    
    return match.status;
  }
  
  private async createMatchNotification(
    organizationId: string,
    type: string,
    message: string,
    matchId: string
  ): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          organizationId,
          type,
          title: 'Match Update',
          message,
          priority: type === 'MATCH_RESULT' ? 'low' : 'medium',
          isRead: false,
          metadata: { matchId }
        }
      });
    } catch (error) {
      logger.error('Error creating match notification:', error);
    }
  }
}

export const matchService = new MatchService();
