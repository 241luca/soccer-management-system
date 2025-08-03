import { PrismaClient, TransportZone, Bus, Prisma } from '@prisma/client';
import { NotFoundError, ConflictError, BadRequestError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { notificationService } from './notification.service';

const prisma = new PrismaClient();

export interface CreateTransportZoneInput {
  id: string;
  name: string;
  distanceRange: string;
  monthlyFee: number;
  color: string;
}

export interface UpdateTransportZoneInput extends Partial<CreateTransportZoneInput> {
  isActive?: boolean;
}

export interface CreateBusInput {
  name: string;
  capacity: number;
  plateNumber?: string;
  driverName?: string;
  driverPhone?: string;
}

export interface UpdateBusInput extends Partial<CreateBusInput> {
  isActive?: boolean;
}

export interface CreateBusRouteInput {
  name: string;
  zonesCovered: string[];
  departureTime?: Date;
  returnTime?: Date;
}

export interface AssignAthleteTransportInput {
  athleteId: string;
  zoneId: string;
  busRouteId?: string;
  pickupAddress?: string;
  pickupTime?: Date;
}

export class TransportService {
  // Transport Zones
  async findAllZones(organizationId: string, includeInactive = false) {
    const zones = await prisma.transportZone.findMany({
      where: {
        organizationId,
        ...(includeInactive ? {} : { isActive: true })
      },
      include: {
        _count: {
          select: { transports: true }
        }
      },
      orderBy: { monthlyFee: 'asc' }
    });

    return zones.map(zone => ({
      ...zone,
      athleteCount: zone._count.transports,
      monthlyRevenue: zone._count.transports * Number(zone.monthlyFee)
    }));
  }

  async findZoneById(id: string, organizationId: string) {
    const zone = await prisma.transportZone.findFirst({
      where: { id, organizationId },
      include: {
        transports: {
          include: {
            athlete: {
              include: {
                team: true
              }
            },
            busRoute: {
              include: {
                bus: true
              }
            }
          }
        }
      }
    });

    if (!zone) {
      throw NotFoundError('Transport Zone');
    }

    // Calculate zone statistics
    const stats = {
      totalAthletes: zone.transports.length,
      activeAthletes: zone.transports.filter(t => t.isActive).length,
      monthlyRevenue: zone.transports.filter(t => t.isActive).length * Number(zone.monthlyFee),
      busRoutes: [...new Set(zone.transports.map(t => t.busRouteId).filter(Boolean))].length
    };

    return {
      ...zone,
      statistics: stats
    };
  }

  async createZone(data: CreateTransportZoneInput, organizationId: string) {
    // Check for duplicate zone ID
    const existing = await prisma.transportZone.findFirst({
      where: { id: data.id, organizationId }
    });

    if (existing) {
      throw ConflictError(`Zone with ID "${data.id}" already exists`);
    }

    const zone = await prisma.transportZone.create({
      data: {
        ...data,
        organizationId
      }
    });

    logger.info(`New transport zone created: ${zone.name} (${zone.id})`);

    return zone;
  }

  async updateZone(id: string, data: UpdateTransportZoneInput, organizationId: string) {
    await this.findZoneById(id, organizationId);

    const updated = await prisma.transportZone.update({
      where: { id_organizationId: { id, organizationId } },
      data
    });

    // If fee changed, notify affected athletes
    if (data.monthlyFee !== undefined) {
      const affectedCount = await prisma.athleteTransport.count({
        where: { zoneId: id, isActive: true }
      });

      if (affectedCount > 0) {
        await notificationService.create({
          organizationId,
          type: 'transport_fee_changed',
          severity: 'warning',
          title: 'Tariffa Trasporto Aggiornata',
          message: `La tariffa per la zona ${updated.name} è stata aggiornata a €${updated.monthlyFee}`,
          relatedEntityType: 'transportZone',
          relatedEntityId: id
        });
      }
    }

    logger.info(`Transport zone updated: ${updated.name}`);

    return updated;
  }

  async deleteZone(id: string, organizationId: string) {
    const zone = await this.findZoneById(id, organizationId);

    // Check if zone has active transports
    const activeTransports = await prisma.athleteTransport.count({
      where: { zoneId: id, isActive: true }
    });

    if (activeTransports > 0) {
      throw BadRequestError(`Cannot delete zone with ${activeTransports} active athlete transports`);
    }

    await prisma.transportZone.delete({
      where: { id_organizationId: { id, organizationId } }
    });

    logger.info(`Transport zone deleted: ${zone.name}`);

    return { message: 'Transport zone deleted successfully' };
  }

  // Buses
  async findAllBuses(organizationId: string, includeInactive = false) {
    const buses = await prisma.bus.findMany({
      where: {
        organizationId,
        ...(includeInactive ? {} : { isActive: true })
      },
      include: {
        routes: {
          where: includeInactive ? {} : { isActive: true },
          include: {
            _count: {
              select: { transports: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return buses.map(bus => ({
      ...bus,
      totalRoutes: bus.routes.length,
      totalAthletes: bus.routes.reduce((sum, route) => sum + route._count.transports, 0),
      utilization: Math.round((bus.routes.reduce((sum, route) => sum + route._count.transports, 0) / bus.capacity) * 100)
    }));
  }

  async findBusById(id: string, organizationId: string) {
    const bus = await prisma.bus.findFirst({
      where: { id, organizationId },
      include: {
        routes: {
          include: {
            transports: {
              include: {
                athlete: {
                  include: { team: true }
                },
                zone: true
              }
            }
          }
        }
      }
    });

    if (!bus) {
      throw NotFoundError('Bus');
    }

    // Calculate bus statistics
    const stats = {
      totalRoutes: bus.routes.length,
      activeRoutes: bus.routes.filter(r => r.isActive).length,
      totalAthletes: bus.routes.reduce((sum, route) => 
        sum + route.transports.filter(t => t.isActive).length, 0),
      capacityUtilization: Math.round((bus.routes.reduce((sum, route) => 
        sum + route.transports.filter(t => t.isActive).length, 0) / bus.capacity) * 100),
      zonesCovered: [...new Set(bus.routes.flatMap(r => r.zonesCovered))].length
    };

    return {
      ...bus,
      statistics: stats
    };
  }

  async createBus(data: CreateBusInput, organizationId: string) {
    // Check for duplicate plate number if provided
    if (data.plateNumber) {
      const existing = await prisma.bus.findUnique({
        where: { plateNumber: data.plateNumber }
      });

      if (existing) {
        throw ConflictError(`Bus with plate number "${data.plateNumber}" already exists`);
      }
    }

    const bus = await prisma.bus.create({
      data: {
        ...data,
        organizationId
      }
    });

    logger.info(`New bus created: ${bus.name}`);

    return bus;
  }

  async updateBus(id: string, data: UpdateBusInput, organizationId: string) {
    await this.findBusById(id, organizationId);

    // Check plate number uniqueness if changing
    if (data.plateNumber) {
      const existing = await prisma.bus.findFirst({
        where: {
          plateNumber: data.plateNumber,
          id: { not: id }
        }
      });

      if (existing) {
        throw ConflictError(`Bus with plate number "${data.plateNumber}" already exists`);
      }
    }

    const updated = await prisma.bus.update({
      where: { id },
      data
    });

    logger.info(`Bus updated: ${updated.name}`);

    return updated;
  }

  async deleteBus(id: string, organizationId: string) {
    const bus = await this.findBusById(id, organizationId);

    // Check if bus has active routes
    const activeRoutes = await prisma.busRoute.count({
      where: { busId: id, isActive: true }
    });

    if (activeRoutes > 0) {
      throw BadRequestError(`Cannot delete bus with ${activeRoutes} active routes`);
    }

    await prisma.bus.delete({ where: { id } });

    logger.info(`Bus deleted: ${bus.name}`);

    return { message: 'Bus deleted successfully' };
  }

  // Bus Routes
  async createBusRoute(busId: string, data: CreateBusRouteInput, organizationId: string) {
    const bus = await this.findBusById(busId, organizationId);

    // Validate zones exist
    const zones = await prisma.transportZone.findMany({
      where: {
        id: { in: data.zonesCovered },
        organizationId
      }
    });

    if (zones.length !== data.zonesCovered.length) {
      throw BadRequestError('Some zones do not exist');
    }

    const route = await prisma.busRoute.create({
      data: {
        ...data,
        busId
      }
    });

    logger.info(`New bus route created: ${route.name} for bus ${bus.name}`);

    return route;
  }

  async updateBusRoute(routeId: string, data: Partial<CreateBusRouteInput>, organizationId: string) {
    const route = await prisma.busRoute.findFirst({
      where: { id: routeId },
      include: { bus: true }
    });

    if (!route || route.bus.organizationId !== organizationId) {
      throw NotFoundError('Bus Route');
    }

    const updated = await prisma.busRoute.update({
      where: { id: routeId },
      data
    });

    // Notify athletes if times changed
    if (data.departureTime || data.returnTime) {
      const affectedAthletes = await prisma.athleteTransport.count({
        where: { busRouteId: routeId, isActive: true }
      });

      if (affectedAthletes > 0) {
        await notificationService.create({
          organizationId,
          type: 'transport_schedule_changed',
          severity: 'warning',
          title: 'Orari Trasporto Modificati',
          message: `Gli orari del percorso ${updated.name} sono stati aggiornati`,
          relatedEntityType: 'busRoute',
          relatedEntityId: routeId
        });
      }
    }

    return updated;
  }

  async deleteBusRoute(routeId: string, organizationId: string) {
    const route = await prisma.busRoute.findFirst({
      where: { id: routeId },
      include: { bus: true }
    });

    if (!route || route.bus.organizationId !== organizationId) {
      throw NotFoundError('Bus Route');
    }

    // Check for active transports
    const activeTransports = await prisma.athleteTransport.count({
      where: { busRouteId: routeId, isActive: true }
    });

    if (activeTransports > 0) {
      throw BadRequestError(`Cannot delete route with ${activeTransports} active athlete transports`);
    }

    await prisma.busRoute.delete({ where: { id: routeId } });

    logger.info(`Bus route deleted: ${route.name}`);

    return { message: 'Bus route deleted successfully' };
  }

  // Athlete Transport Assignment
  async assignAthleteTransport(data: AssignAthleteTransportInput, organizationId: string) {
    // Validate athlete exists and uses transport
    const athlete = await prisma.athlete.findFirst({
      where: {
        id: data.athleteId,
        organizationId,
        usesTransport: true
      }
    });

    if (!athlete) {
      throw BadRequestError('Athlete not found or does not use transport');
    }

    // Validate zone exists
    const zone = await prisma.transportZone.findFirst({
      where: { id: data.zoneId, organizationId }
    });

    if (!zone) {
      throw BadRequestError('Invalid transport zone');
    }

    // Validate bus route if provided
    if (data.busRouteId) {
      const route = await prisma.busRoute.findFirst({
        where: {
          id: data.busRouteId,
          zonesCovered: { has: data.zoneId }
        },
        include: { bus: true }
      });

      if (!route || route.bus.organizationId !== organizationId) {
        throw BadRequestError('Invalid bus route for this zone');
      }

      // Check bus capacity
      const currentOccupancy = await prisma.athleteTransport.count({
        where: { busRouteId: data.busRouteId, isActive: true }
      });

      if (currentOccupancy >= route.bus.capacity) {
        throw BadRequestError('Bus route is at full capacity');
      }
    }

    const transport = await prisma.athleteTransport.upsert({
      where: { athleteId: data.athleteId },
      update: {
        zoneId: data.zoneId,
        busRouteId: data.busRouteId,
        pickupAddress: data.pickupAddress,
        pickupTime: data.pickupTime,
        isActive: true
      },
      create: {
        athleteId: data.athleteId,
        zoneId: data.zoneId,
        busRouteId: data.busRouteId,
        pickupAddress: data.pickupAddress,
        pickupTime: data.pickupTime
      },
      include: {
        athlete: true,
        zone: true,
        busRoute: { include: { bus: true } }
      }
    });

    logger.info(`Transport assigned for athlete ${athlete.firstName} ${athlete.lastName}`);

    // Create payment for transport
    await this.createTransportPayment(athlete.id, zone.monthlyFee, organizationId);

    return transport;
  }

  async removeAthleteTransport(athleteId: string, organizationId: string) {
    const transport = await prisma.athleteTransport.findFirst({
      where: {
        athleteId,
        athlete: { organizationId }
      }
    });

    if (!transport) {
      throw NotFoundError('Athlete transport assignment');
    }

    await prisma.athleteTransport.update({
      where: { id: transport.id },
      data: { isActive: false }
    });

    logger.info(`Transport removed for athlete ${athleteId}`);

    return { message: 'Athlete transport removed successfully' };
  }

  // Transport Analytics
  async getTransportAnalytics(organizationId: string) {
    const [zones, buses, transports, payments] = await Promise.all([
      prisma.transportZone.count({ where: { organizationId, isActive: true } }),
      prisma.bus.count({ where: { organizationId, isActive: true } }),
      prisma.athleteTransport.findMany({
        where: {
          athlete: { organizationId },
          isActive: true
        },
        include: { zone: true }
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

    // Calculate revenue by zone
    const revenueByZone = transports.reduce((acc, transport) => {
      const zoneId = transport.zoneId;
      if (!acc[zoneId]) {
        acc[zoneId] = {
          zone: transport.zone.name,
          athletes: 0,
          revenue: 0
        };
      }
      acc[zoneId].athletes++;
      acc[zoneId].revenue += Number(transport.zone.monthlyFee);
      return acc;
    }, {} as Record<string, any>);

    // Calculate bus utilization
    const busUtilization = await prisma.bus.findMany({
      where: { organizationId, isActive: true },
      include: {
        routes: {
          include: {
            _count: { select: { transports: true } }
          }
        }
      }
    });

    const avgUtilization = busUtilization.reduce((sum, bus) => {
      const occupied = bus.routes.reduce((s, r) => s + r._count.transports, 0);
      return sum + (occupied / bus.capacity);
    }, 0) / busUtilization.length * 100;

    return {
      summary: {
        totalZones: zones,
        totalBuses: buses,
        totalAthletes: transports.length,
        monthlyRevenue: transports.reduce((sum, t) => sum + Number(t.zone.monthlyFee), 0),
        collectedThisMonth: Number(payments._sum.amount || 0),
        averageBusUtilization: Math.round(avgUtilization)
      },
      byZone: Object.values(revenueByZone),
      busUtilization: busUtilization.map(bus => ({
        id: bus.id,
        name: bus.name,
        capacity: bus.capacity,
        occupied: bus.routes.reduce((sum, r) => sum + r._count.transports, 0),
        utilization: Math.round((bus.routes.reduce((sum, r) => sum + r._count.transports, 0) / bus.capacity) * 100)
      }))
    };
  }

  // Helper method to create transport payment
  private async createTransportPayment(athleteId: string, amount: number, organizationId: string) {
    // Find or create transport payment type
    const paymentType = await prisma.paymentType.findFirst({
      where: {
        organizationId,
        category: 'transport',
        name: 'Trasporto Mensile'
      }
    });

    if (!paymentType) {
      logger.warn('Transport payment type not found');
      return;
    }

    // Create payment for current month
    const dueDate = new Date();
    dueDate.setDate(10); // Due on 10th of the month

    await prisma.payment.create({
      data: {
        organizationId,
        athleteId,
        paymentTypeId: paymentType.id,
        amount,
        dueDate,
        status: 'PENDING',
        createdById: 'system' // This should be the actual user ID
      }
    });
  }
}

export const transportService = new TransportService();
