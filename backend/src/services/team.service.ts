import { PrismaClient, Team, Athlete } from '@prisma/client';
import { BadRequestError, NotFoundError, ConflictError } from '../utils/errors';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface CreateTeamInput {
  organizationId: string;
  name: string;
  category: string;
  season: string;
  minAge: number;
  maxAge: number;
  budget?: number;
}

export interface UpdateTeamInput extends Partial<CreateTeamInput> {
  id: string;
  organizationId: string;
}

export interface TeamWithStats extends Team {
  athleteCount?: number;
  athletes?: any[];
  upcomingMatches?: number;
  _count?: any;
  homeMatches?: any[];
  awayMatches?: any[];
}

export class TeamService {
  // Get all teams
  async getTeams(organizationId: string, filters?: any): Promise<TeamWithStats[]> {
    try {
      const where: any = { organizationId };
      
      if (filters?.category) {
        where.category = filters.category;
      }
      
      if (filters?.season) {
        where.season = filters.season;
      }
      
      if (filters?.isActive !== undefined) {
        where.isActive = filters.isActive === 'true';
      }
      
      const teams = await prisma.team.findMany({
        where,
        include: {
          _count: {
            select: { 
              athletes: true,
              homeMatches: true,
              awayMatches: true
            }
          },
          athletes: {
            where: { status: 'ACTIVE' },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              jerseyNumber: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });
      
      return teams.map((team: any) => ({
        ...team,
        athleteCount: team._count.athletes,
        upcomingMatches: team._count.homeMatches + team._count.awayMatches
      }));
    } catch (error) {
      logger.error('Error fetching teams:', error);
      throw error;
    }
  }
  
  // Get single team
  async getTeamById(id: string, organizationId: string): Promise<TeamWithStats> {
    const team = await prisma.team.findFirst({
      where: {
        id,
        organizationId
      },
      include: {
        _count: {
          select: { 
            athletes: true,
            homeMatches: true,
            awayMatches: true
          }
        },
        athletes: {
          where: { status: 'ACTIVE' },
          orderBy: {
            jerseyNumber: 'asc'
          }
        },
        homeMatches: {
          where: { status: 'SCHEDULED' },
          orderBy: { matchTime: 'desc' },
          take: 5
        },
        awayMatches: {
          where: { status: 'SCHEDULED' },
          orderBy: { matchTime: 'desc' },
          take: 5
        }
      }
    });
    
    if (!team) {
      throw new NotFoundError('Team not found');
    }
    
    return {
      ...team,
      athleteCount: team._count.athletes,
      upcomingMatches: team._count.homeMatches + team._count.awayMatches
    };
  }
  
  // Create team
  async createTeam(data: CreateTeamInput): Promise<Team> {
    try {
      // Check for duplicate
      const existing = await prisma.team.findFirst({
        where: {
          organizationId: data.organizationId,
          name: data.name,
          season: data.season
        }
      });
      
      if (existing) {
        throw new ConflictError('Team with this name already exists for this season');
      }
      
      const team = await prisma.team.create({
        data: {
          organizationId: data.organizationId,
          name: data.name,
          category: data.category,
          season: data.season,
          minAge: data.minAge,
          maxAge: data.maxAge,
          budget: data.budget || 0,
          isActive: true
        }
      });
      
      logger.info(`Team created: ${team.name} (${team.id})`);
      
      return team;
    } catch (error) {
      logger.error('Error creating team:', error);
      throw error;
    }
  }
  
  // Update team
  async updateTeam(data: UpdateTeamInput): Promise<Team> {
    try {
      const existing = await prisma.team.findFirst({
        where: {
          id: data.id,
          organizationId: data.organizationId
        }
      });
      
      if (!existing) {
        throw new NotFoundError('Team not found');
      }
      
      // Check for duplicate name if changing
      if (data.name && data.name !== existing.name) {
        const duplicate = await prisma.team.findFirst({
          where: {
            organizationId: data.organizationId,
            name: data.name,
            season: data.season || existing.season,
            id: { not: data.id }
          }
        });
        
        if (duplicate) {
          throw new ConflictError('Another team with this name already exists');
        }
      }
      
      const team = await prisma.team.update({
        where: { id: data.id },
        data: {
          name: data.name,
          category: data.category,
          season: data.season,
          minAge: data.minAge,
          maxAge: data.maxAge,
          budget: data.budget,
          updatedAt: new Date()
        }
      });
      
      logger.info(`Team updated: ${team.name} (${team.id})`);
      
      return team;
    } catch (error) {
      logger.error('Error updating team:', error);
      throw error;
    }
  }
  
  // Delete team
  async deleteTeam(id: string, organizationId: string): Promise<void> {
    try {
      const team = await prisma.team.findFirst({
        where: { id, organizationId },
        include: {
          _count: {
            select: { athletes: true }
          }
        }
      });
      
      if (!team) {
        throw new NotFoundError('Team not found');
      }
      
      if (team._count.athletes > 0) {
        throw new ConflictError('Cannot delete team with assigned athletes');
      }
      
      await prisma.team.delete({
        where: { id }
      });
      
      logger.info(`Team deleted: ${team.name} (${id})`);
    } catch (error) {
      logger.error('Error deleting team:', error);
      throw error;
    }
  }
  
  // Add athlete to team
  async addAthleteToTeam(teamId: string, athleteId: string, organizationId: string): Promise<void> {
    try {
      // Verify team exists
      const team = await prisma.team.findFirst({
        where: { id: teamId, organizationId }
      });
      
      if (!team) {
        throw new NotFoundError('Team not found');
      }
      
      // Verify athlete exists and belongs to same organization
      const athlete = await prisma.athlete.findFirst({
        where: { id: athleteId, organizationId }
      });
      
      if (!athlete) {
        throw new NotFoundError('Athlete not found');
      }
      
      // Check age eligibility
      const age = new Date().getFullYear() - new Date(athlete.birthDate).getFullYear();
      if (age < team.minAge || age > team.maxAge) {
        throw new BadRequestError(`Athlete age (${age}) is outside team age range (${team.minAge}-${team.maxAge})`);
      }
      
      // Add to team
      await prisma.athlete.update({
        where: { id: athleteId },
        data: { teamId }
      });
      
      logger.info(`Athlete ${athleteId} added to team ${teamId}`);
    } catch (error) {
      logger.error('Error adding athlete to team:', error);
      throw error;
    }
  }
  
  // Remove athlete from team
  async removeAthleteFromTeam(teamId: string, athleteId: string, organizationId: string): Promise<void> {
    try {
      const athlete = await prisma.athlete.findFirst({
        where: {
          id: athleteId,
          teamId,
          organizationId
        }
      });
      
      if (!athlete) {
        throw new NotFoundError('Athlete not found in this team');
      }
      
      await prisma.athlete.update({
        where: { id: athleteId },
        data: { teamId: null }
      });
      
      logger.info(`Athlete ${athleteId} removed from team ${teamId}`);
    } catch (error) {
      logger.error('Error removing athlete from team:', error);
      throw error;
    }
  }
  
  // Get team statistics
  async getTeamStats(teamId: string, organizationId: string): Promise<any> {
    const team = await prisma.team.findFirst({
      where: { id: teamId, organizationId },
      include: {
        athletes: {
          where: { status: 'ACTIVE' }
        },
        homeMatches: {
          where: { status: 'COMPLETED' }
        },
        awayMatches: {
          where: { status: 'COMPLETED' }
        }
      }
    });
    
    if (!team) {
      throw new NotFoundError('Team not found');
    }
    
    const stats = {
      totalAthletes: team.athletes.length,
      matches: {
        played: team.homeMatches.length + team.awayMatches.length,
        wins: 0,
        draws: 0,
        losses: 0
      },
      ageDistribution: {
        under12: 0,
        under14: 0,
        under16: 0,
        under18: 0,
        over18: 0
      }
    };
    
    // Calculate match results
    team.homeMatches.forEach(match => {
      if (match.homeScore !== null && match.awayScore !== null) {
        if (match.homeScore > match.awayScore) stats.matches.wins++;
        else if (match.homeScore === match.awayScore) stats.matches.draws++;
        else stats.matches.losses++;
      }
    });
    
    team.awayMatches.forEach(match => {
      if (match.homeScore !== null && match.awayScore !== null) {
        if (match.awayScore > match.homeScore) stats.matches.wins++;
        else if (match.awayScore === match.homeScore) stats.matches.draws++;
        else stats.matches.losses++;
      }
    });
    
    // Calculate age distribution
    team.athletes.forEach(athlete => {
      const age = new Date().getFullYear() - new Date(athlete.birthDate).getFullYear();
      if (age < 12) stats.ageDistribution.under12++;
      else if (age < 14) stats.ageDistribution.under14++;
      else if (age < 16) stats.ageDistribution.under16++;
      else if (age < 18) stats.ageDistribution.under18++;
      else stats.ageDistribution.over18++;
    });
    
    return stats;
  }
  
  // Create team notification
  private async createTeamNotification(
    organizationId: string,
    type: string,
    message: string,
    teamId: string
  ): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          organizationId,
          type,
          title: 'Team Update',
          message,
          severity: 'info',
          isRead: false,
          relatedEntityType: 'team',
          relatedEntityId: teamId
        }
      });
    } catch (error) {
      logger.error('Error creating team notification:', error);
    }
  }
}

export const teamService = new TeamService();
