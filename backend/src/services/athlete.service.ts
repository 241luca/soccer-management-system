import { PrismaClient, Athlete, Prisma } from '@prisma/client';
import { CreateAthleteInput, UpdateAthleteInput, PaginationParams } from '../utils/validation';
import { NotFoundError, ConflictError, BadRequestError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { notificationService } from './notification.service';

const prisma = new PrismaClient();

export class AthleteService {
  async findAll(organizationId: string, params: PaginationParams & {
    search?: string;
    teamId?: string;
    status?: string;
    needsPromotion?: boolean;
    usesTransport?: boolean;
  }) {
    const { page = 1, limit = 20, sortBy = 'lastName', sortOrder = 'asc' } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.AthleteWhereInput = { organizationId };

    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { fiscalCode: { contains: params.search, mode: 'insensitive' } }
      ];
    }

    if (params.teamId) {
      where.teamId = params.teamId;
    }

    if (params.status) {
      where.status = params.status as any;
    }

    if (params.needsPromotion !== undefined) {
      where.needsPromotion = params.needsPromotion;
    }

    if (params.usesTransport !== undefined) {
      where.usesTransport = params.usesTransport;
    }

    const [data, total] = await Promise.all([
      prisma.athlete.findMany({
        where,
        include: {
          team: true,
          position: true,
          documents: {
            include: { documentType: true },
            orderBy: { expiryDate: 'asc' }
          },
          payments: {
            where: { status: 'PENDING' },
            include: { paymentType: true }
          },
          transportZone: true,
          busAthletes: {
            include: {
              bus: true,
              busRoute: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.athlete.count({ where })
    ]);

    const enrichedData = data.map(athlete => this.enrichAthleteData(athlete));

    return {
      data: enrichedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id: string, organizationId: string) {
    const athlete = await prisma.athlete.findFirst({
      where: { id, organizationId },
      include: {
        team: true,
        position: true,
        documents: {
          include: { documentType: true },
          orderBy: { expiryDate: 'asc' }
        },
        payments: {
          include: { paymentType: true },
          orderBy: { dueDate: 'desc' }
        },
        transportZone: true,
        busAthletes: {
          include: {
            bus: true,
            busRoute: true
          }
        },
        matchRosters: {
          include: {
            match: {
              include: {
                homeTeam: true,
                awayTeam: true,
                venue: true
              }
            }
          },
          orderBy: { match: { date: 'desc' } },
          take: 10
        },
        matchStats: {
          orderBy: { match: { date: 'desc' } },
          take: 10
        }
      }
    });

    if (!athlete) {
      throw NotFoundError('Athlete');
    }

    return this.enrichAthleteData(athlete);
  }

  async create(data: CreateAthleteInput, organizationId: string) {
    // Check if fiscal code already exists
    if (data.fiscalCode) {
      const existing = await prisma.athlete.findUnique({
        where: { fiscalCode: data.fiscalCode }
      });
      if (existing) {
        throw ConflictError('An athlete with this fiscal code already exists');
      }
    }

    // Check jersey number uniqueness within team
    if (data.teamId && data.jerseyNumber) {
      const existingJersey = await prisma.athlete.findFirst({
        where: {
          teamId: data.teamId,
          jerseyNumber: data.jerseyNumber
        }
      });
      if (existingJersey) {
        throw ConflictError('Jersey number already taken in this team');
      }
    }

    // Validate team belongs to organization
    if (data.teamId) {
      const team = await prisma.team.findFirst({
        where: { id: data.teamId, organizationId }
      });
      if (!team) {
        throw BadRequestError('Invalid team ID');
      }
    }

    const athlete = await prisma.athlete.create({
      data: {
        ...data,
        organizationId,
        birthDate: new Date(data.birthDate)
      },
      include: {
        team: true,
        position: true
      }
    });

    // Check if athlete needs promotion based on age
    if (athlete.team) {
      await this.checkAgeEligibility(athlete.id);
    }

    logger.info(`New athlete created: ${athlete.firstName} ${athlete.lastName}`);

    // Create welcome notification
    await notificationService.create({
      organizationId,
      type: 'athlete_created',
      severity: 'success',
      title: 'Nuova Atleta Registrata',
      message: `${athlete.firstName} ${athlete.lastName} è stata registrata con successo`,
      relatedEntityType: 'athlete',
      relatedEntityId: athlete.id
    });

    return athlete;
  }

  async update(id: string, data: UpdateAthleteInput, organizationId: string) {
    const athlete = await this.findById(id, organizationId);

    // Check jersey number uniqueness if changed
    if (data.teamId && data.jerseyNumber && 
        (data.teamId !== athlete.teamId || data.jerseyNumber !== athlete.jerseyNumber)) {
      const existingJersey = await prisma.athlete.findFirst({
        where: {
          teamId: data.teamId,
          jerseyNumber: data.jerseyNumber,
          id: { not: id }
        }
      });
      if (existingJersey) {
        throw ConflictError('Jersey number already taken in this team');
      }
    }

    const updated = await prisma.athlete.update({
      where: { id },
      data: {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined
      },
      include: {
        team: true,
        position: true
      }
    });

    // Check age eligibility if team changed
    if (data.teamId && data.teamId !== athlete.teamId) {
      await this.checkAgeEligibility(id);
    }

    logger.info(`Athlete updated: ${updated.firstName} ${updated.lastName}`);

    return updated;
  }

  async delete(id: string, organizationId: string) {
    await this.findById(id, organizationId);

    await prisma.athlete.delete({
      where: { id }
    });

    logger.info(`Athlete deleted: ${id}`);

    return { message: 'Athlete deleted successfully' };
  }

  async getStatistics(id: string, organizationId: string) {
    await this.findById(id, organizationId);

    const stats = await prisma.matchStat.aggregate({
      where: { athleteId: id },
      _sum: {
        minutesPlayed: true,
        goals: true,
        assists: true,
        yellowCards: true,
        redCards: true,
        saves: true
      },
      _count: {
        id: true
      }
    });

    const recentMatches = await prisma.matchStat.findMany({
      where: { athleteId: id },
      include: {
        match: {
          include: {
            homeTeam: true,
            awayTeam: true
          }
        }
      },
      orderBy: { match: { date: 'desc' } },
      take: 5
    });

    return {
      totals: {
        matchesPlayed: stats._count.id,
        minutesPlayed: stats._sum.minutesPlayed || 0,
        goals: stats._sum.goals || 0,
        assists: stats._sum.assists || 0,
        yellowCards: stats._sum.yellowCards || 0,
        redCards: stats._sum.redCards || 0,
        saves: stats._sum.saves || 0
      },
      averages: {
        minutesPerMatch: stats._count.id > 0 ? (stats._sum.minutesPlayed || 0) / stats._count.id : 0,
        goalsPerMatch: stats._count.id > 0 ? (stats._sum.goals || 0) / stats._count.id : 0,
        assistsPerMatch: stats._count.id > 0 ? (stats._sum.assists || 0) / stats._count.id : 0
      },
      recentMatches
    };
  }

  async checkAgeEligibility(athleteId: string) {
    const athlete = await prisma.athlete.findUnique({
      where: { id: athleteId },
      include: { team: true }
    });

    if (!athlete || !athlete.team) return;

    const age = this.calculateAge(athlete.birthDate);
    const needsPromotion = age < athlete.team.minAge || age > athlete.team.maxAge;

    if (needsPromotion !== athlete.needsPromotion) {
      await prisma.athlete.update({
        where: { id: athleteId },
        data: { needsPromotion }
      });

      if (needsPromotion) {
        // Find suggested team
        const suggestedTeam = await prisma.team.findFirst({
          where: {
            organizationId: athlete.organizationId,
            minAge: { lte: age },
            maxAge: { gte: age },
            isActive: true
          }
        });

        // Create notification
        await notificationService.create({
          organizationId: athlete.organizationId,
          type: 'age_violation',
          severity: 'warning',
          title: 'Violazione Categoria Età',
          message: `${athlete.firstName} ${athlete.lastName} (${age} anni) non rispetta i limiti di età per ${athlete.team.name}${suggestedTeam ? `. Categoria suggerita: ${suggestedTeam.name}` : ''}`,
          relatedEntityType: 'athlete',
          relatedEntityId: athlete.id
        });
      }
    }
  }

  async bulkCheckDocuments(organizationId: string) {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const expiringDocuments = await prisma.document.findMany({
      where: {
        athlete: { organizationId },
        expiryDate: {
          gte: today,
          lte: thirtyDaysFromNow
        },
        status: 'VALID'
      },
      include: {
        athlete: true,
        documentType: true
      }
    });

    for (const doc of expiringDocuments) {
      const daysUntilExpiry = Math.ceil((doc.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      await notificationService.create({
        organizationId,
        type: 'document_expiry',
        severity: daysUntilExpiry <= 7 ? 'error' : daysUntilExpiry <= 15 ? 'warning' : 'info',
        title: `${doc.documentType.name} in Scadenza`,
        message: `Il ${doc.documentType.name} di ${doc.athlete.firstName} ${doc.athlete.lastName} scade tra ${daysUntilExpiry} giorni`,
        relatedEntityType: 'document',
        relatedEntityId: doc.id,
        actions: [
          { label: 'Visualizza Atleta', action: 'view_athlete', style: 'primary' },
          { label: 'Documenti', action: 'view_documents', style: 'secondary' }
        ]
      });
    }

    return { checked: expiringDocuments.length };
  }

  private enrichAthleteData(athlete: any) {
    const today = new Date();
    const age = this.calculateAge(athlete.birthDate);

    // Document status
    const documents = {
      medical: null as any,
      insurance: null as any,
      otherExpiring: [] as any[]
    };

    athlete.documents.forEach((doc: any) => {
      const daysUntilExpiry = Math.ceil((doc.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const status = daysUntilExpiry < 0 ? 'expired' : daysUntilExpiry <= 30 ? 'expiring' : 'valid';
      
      const docInfo = {
        id: doc.id,
        status,
        expiryDate: doc.expiryDate,
        daysUntilExpiry,
        fileUrl: doc.fileUrl
      };

      if (doc.documentType.category === 'medical') {
        documents.medical = docInfo;
      } else if (doc.documentType.category === 'insurance') {
        documents.insurance = docInfo;
      } else if (status === 'expiring' || status === 'expired') {
        documents.otherExpiring.push({
          ...docInfo,
          type: doc.documentType.name
        });
      }
    });

    // Payment summary
    const payments = {
      pending: athlete.payments.length,
      totalDue: athlete.payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0),
      overdue: athlete.payments.filter((p: any) => new Date(p.dueDate) < today).length
    };

    return {
      ...athlete,
      age,
      documents,
      payments,
      isAgeValid: athlete.team ? age >= athlete.team.minAge && age <= athlete.team.maxAge : true
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

export const athleteService = new AthleteService();
