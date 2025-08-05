import { PrismaClient, TransportZone, Bus, BusRoute } from '@prisma/client';
import { BadRequestError, NotFoundError, ConflictError } from '../utils/errors';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface CreateZoneInput {
  organizationId: string;
  name: string;
  description?: string;
  coordinates?: any;
  athleteIds?: string[];
  monthlyFee?: number;
  distanceRange?: string;
  color?: string;
}

export interface CreateBusInput {
  organizationId: string;
  name: string;
  plateNumber: string;
  capacity: number;
  driverName?: string;
  driverPhone?: string;
  notes?: string;
}

export interface CreateRouteInput {
  busId: string;
  organizationId: string;
  name: string;
  zones: string[];
  departureTime: string;
  returnTime?: string;
  days: string[];
  notes?: string;
}

export interface AssignTransportInput {
  athleteId: string;
  zoneId: string;
  busId?: string;
  organizationId: string;
}

export interface ZoneWithStats extends TransportZone {
  athleteCount?: number;
  athletes?: any[];
  buses?: any[];
}

export interface BusWithRoutes extends Bus {
  routes?: BusRoute[];
  currentCapacity?: number;
  athletes?: any[];
}

export class TransportService {
  // ZONES MANAGEMENT
  
  // Get all zones
  async getZones(organizationId: string): Promise<ZoneWithStats[]> {
    try {
      const zones = await prisma.transportZone.findMany({
        where: { organizationId },
        include: {
          athletes: {
            where: { 
              status: 'ACTIVE',
              usesTransport: true 
            },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              address: true,
              city: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });
      
      return zones.map(zone => ({
        ...zone,
        athleteCount: zone.athletes.length
      }));
    } catch (error) {
      logger.error('Error fetching zones:', error);
      throw error;
    }
  }
  
  // Get single zone
  async getZoneById(id: string, organizationId: string): Promise<ZoneWithStats> {
    const zone = await prisma.transportZone.findFirst({
      where: {
        id,
        organizationId
      },
      include: {
        athletes: {
          where: { 
            status: 'ACTIVE',
            usesTransport: true 
          },
          orderBy: [
            { lastName: 'asc' },
            { firstName: 'asc' }
          ]
        }
      }
    });
    
    if (!zone) {
      throw new NotFoundError('Zone not found');
    }
    
    return {
      ...zone,
      athleteCount: zone.athletes.length
    };
  }
  
  // Create zone
  async createZone(data: CreateZoneInput): Promise<TransportZone> {
    try {
      // Check for duplicate name
      const existing = await prisma.transportZone.findFirst({
        where: {
          organizationId: data.organizationId,
          name: data.name
        }
      });
      
      if (existing) {
        throw new ConflictError('Zone with this name already exists');
      }
      
      const zone = await prisma.transportZone.create({
        data: {
          organizationId: data.organizationId,
          name: data.name,
          description: data.description,
          coordinates: data.coordinates || {},
          monthlyFee: data.monthlyFee || 50.00,
          distanceRange: data.distanceRange || '0-5km',
          color: data.color || '#3B82F6'
        }
      });
      
      // Assign athletes to zone if provided
      if (data.athleteIds && data.athleteIds.length > 0) {
        await prisma.athlete.updateMany({
          where: {
            id: { in: data.athleteIds },
            organizationId: data.organizationId
          },
          data: {
            transportZoneId: zone.id
          }
        });
      }
      
      logger.info(`Zone created: ${zone.name} (${zone.id})`);
      
      return zone;
    } catch (error) {
      logger.error('Error creating zone:', error);
      throw error;
    }
  }
  
  // Update zone
  async updateZone(id: string, organizationId: string, data: Partial<CreateZoneInput>): Promise<TransportZone> {
    try {
      const existing = await prisma.transportZone.findFirst({
        where: { id, organizationId }
      });
      
      if (!existing) {
        throw new NotFoundError('Zone not found');
      }
      
      const zone = await prisma.transportZone.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          coordinates: data.coordinates,
          monthlyFee: data.monthlyFee,
          distanceRange: data.distanceRange,
          color: data.color,
          updatedAt: new Date()
        }
      });
      
      logger.info(`Zone updated: ${zone.name} (${zone.id})`);
      
      return zone;
    } catch (error) {
      logger.error('Error updating zone:', error);
      throw error;
    }
  }
  
  // Delete zone
  async deleteZone(id: string, organizationId: string): Promise<void> {
    try {
      const zone = await prisma.transportZone.findFirst({
        where: { id, organizationId },
        include: {
          _count: {
            select: { athletes: true }
          }
        }
      });
      
      if (!zone) {
        throw new NotFoundError('Zone not found');
      }
      
      if (zone._count.athletes > 0) {
        throw new ConflictError('Cannot delete zone with assigned athletes');
      }
      
      await prisma.transportZone.delete({
        where: { id }
      });
      
      logger.info(`Zone deleted: ${zone.name} (${id})`);
    } catch (error) {
      logger.error('Error deleting zone:', error);
      throw error;
    }
  }
  
  // BUSES MANAGEMENT
  
  // Get all buses
  async getBuses(organizationId: string): Promise<BusWithRoutes[]> {
    try {
      const buses = await prisma.bus.findMany({
        where: { organizationId },
        include: {
          routes: {
            include: {
              _count: {
                select: { busAthletes: true }
              }
            }
          },
          busAthletes: {
            include: {
              athlete: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  transportZoneId: true
                }
              }
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });
      
      return buses.map(bus => ({
        ...bus,
        currentCapacity: bus.busAthletes.length
      }));
    } catch (error) {
      logger.error('Error fetching buses:', error);
      throw error;
    }
  }
  
  // Get single bus
  async getBusById(id: string, organizationId: string): Promise<BusWithRoutes> {
    const bus = await prisma.bus.findFirst({
      where: {
        id,
        organizationId
      },
      include: {
        routes: {
          orderBy: {
            departureTime: 'asc'
          }
        },
        busAthletes: {
          include: {
            athlete: {
              include: {
                transportZone: true
              }
            }
          }
        }
      }
    });
    
    if (!bus) {
      throw new NotFoundError('Bus not found');
    }
    
    return {
      ...bus,
      currentCapacity: bus.busAthletes.length
    };
  }
  
  // Create bus
  async createBus(data: CreateBusInput): Promise<Bus> {
    try {
      // Check for duplicate plate number
      if (data.plateNumber) {
        const existing = await prisma.bus.findFirst({
          where: {
            organizationId: data.organizationId,
            plateNumber: data.plateNumber
          }
        });
        
        if (existing) {
          throw new ConflictError('Bus with this plate number already exists');
        }
      }
      
      const bus = await prisma.bus.create({
        data: {
          organizationId: data.organizationId,
          name: data.name,
          plateNumber: data.plateNumber,
          capacity: data.capacity,
          driverName: data.driverName,
          driverPhone: data.driverPhone,
          notes: data.notes,
          isActive: true
        }
      });
      
      logger.info(`Bus created: ${bus.name} (${bus.plateNumber})`);
      
      return bus;
    } catch (error) {
      logger.error('Error creating bus:', error);
      throw error;
    }
  }
  
  // Update bus
  async updateBus(id: string, organizationId: string, data: Partial<CreateBusInput>): Promise<Bus> {
    try {
      const existing = await prisma.bus.findFirst({
        where: { id, organizationId }
      });
      
      if (!existing) {
        throw new NotFoundError('Bus not found');
      }
      
      const bus = await prisma.bus.update({
        where: { id },
        data: {
          name: data.name,
          plateNumber: data.plateNumber,
          capacity: data.capacity,
          driverName: data.driverName,
          driverPhone: data.driverPhone,
          notes: data.notes,
          updatedAt: new Date()
        }
      });
      
      logger.info(`Bus updated: ${bus.name} (${bus.id})`);
      
      return bus;
    } catch (error) {
      logger.error('Error updating bus:', error);
      throw error;
    }
  }
  
  // Delete bus
  async deleteBus(id: string, organizationId: string): Promise<void> {
    try {
      const bus = await prisma.bus.findFirst({
        where: { id, organizationId },
        include: {
          _count: {
            select: { 
              busAthletes: true,
              routes: true 
            }
          }
        }
      });
      
      if (!bus) {
        throw new NotFoundError('Bus not found');
      }
      
      if (bus._count.busAthletes > 0) {
        throw new ConflictError('Cannot delete bus with assigned athletes');
      }
      
      // Delete routes
      await prisma.busRoute.deleteMany({
        where: { busId: id }
      });
      
      await prisma.bus.delete({
        where: { id }
      });
      
      logger.info(`Bus deleted: ${bus.name} (${id})`);
    } catch (error) {
      logger.error('Error deleting bus:', error);
      throw error;
    }
  }
  
  // ROUTES MANAGEMENT
  
  // Create bus route
  async createRoute(data: CreateRouteInput): Promise<BusRoute> {
    try {
      // Verify bus exists
      const bus = await prisma.bus.findFirst({
        where: {
          id: data.busId,
          organizationId: data.organizationId
        }
      });
      
      if (!bus) {
        throw new NotFoundError('Bus not found');
      }
      
      // Verify all zones exist
      const zones = await prisma.transportZone.findMany({
        where: {
          id: { in: data.zones },
          organizationId: data.organizationId
        }
      });
      
      if (zones.length !== data.zones.length) {
        throw new BadRequestError('Some zones do not exist');
      }
      
      const route = await prisma.busRoute.create({
        data: {
          busId: data.busId,
          name: data.name,
          zones: data.zones,
          departureTime: data.departureTime,
          returnTime: data.returnTime,
          days: data.days,
          notes: data.notes,
          isActive: true
        }
      });
      
      logger.info(`Route created: ${route.name} (${route.id})`);
      
      return route;
    } catch (error) {
      logger.error('Error creating route:', error);
      throw error;
    }
  }
  
  // Update route
  async updateRoute(id: string, organizationId: string, data: Partial<CreateRouteInput>): Promise<BusRoute> {
    try {
      // Verify route belongs to organization's bus
      const route = await prisma.busRoute.findFirst({
        where: {
          id,
          bus: {
            organizationId
          }
        }
      });
      
      if (!route) {
        throw new NotFoundError('Route not found');
      }
      
      const updatedRoute = await prisma.busRoute.update({
        where: { id },
        data: {
          name: data.name,
          zones: data.zones,
          departureTime: data.departureTime,
          returnTime: data.returnTime,
          days: data.days,
          notes: data.notes,
          updatedAt: new Date()
        }
      });
      
      logger.info(`Route updated: ${updatedRoute.name} (${updatedRoute.id})`);
      
      return updatedRoute;
    } catch (error) {
      logger.error('Error updating route:', error);
      throw error;
    }
  }
  
  // Delete route
  async deleteRoute(id: string, organizationId: string): Promise<void> {
    try {
      const route = await prisma.busRoute.findFirst({
        where: {
          id,
          bus: {
            organizationId
          }
        }
      });
      
      if (!route) {
        throw new NotFoundError('Route not found');
      }
      
      // Remove athletes from this route
      await prisma.busAthlete.deleteMany({
        where: { busRouteId: id }
      });
      
      await prisma.busRoute.delete({
        where: { id }
      });
      
      logger.info(`Route deleted: ${id}`);
    } catch (error) {
      logger.error('Error deleting route:', error);
      throw error;
    }
  }
  
  // ATHLETE TRANSPORT ASSIGNMENT
  
  // Assign athlete to transport
  async assignAthleteTransport(data: AssignTransportInput): Promise<void> {
    try {
      // Verify athlete exists and uses transport
      const athlete = await prisma.athlete.findFirst({
        where: {
          id: data.athleteId,
          organizationId: data.organizationId
        }
      });
      
      if (!athlete) {
        throw new NotFoundError('Athlete not found');
      }
      
      // Update athlete's zone
      await prisma.athlete.update({
        where: { id: data.athleteId },
        data: {
          transportZoneId: data.zoneId,
          usesTransport: true
        }
      });
      
      // Assign to bus if provided
      if (data.busId) {
        const bus = await prisma.bus.findFirst({
          where: {
            id: data.busId,
            organizationId: data.organizationId
          },
          include: {
            _count: {
              select: { busAthletes: true }
            }
          }
        });
        
        if (!bus) {
          throw new NotFoundError('Bus not found');
        }
        
        if (bus._count.busAthletes >= bus.capacity) {
          throw new BadRequestError('Bus has reached maximum capacity');
        }
        
        // Remove from other buses
        await prisma.busAthlete.deleteMany({
          where: { athleteId: data.athleteId }
        });
        
        // Assign to new bus
        await prisma.busAthlete.create({
          data: {
            busId: data.busId,
            athleteId: data.athleteId
          }
        });
      }
      
      logger.info(`Athlete ${data.athleteId} assigned to zone ${data.zoneId}`);
    } catch (error) {
      logger.error('Error assigning athlete transport:', error);
      throw error;
    }
  }
  
  // Remove athlete from transport
  async removeAthleteTransport(athleteId: string, organizationId: string): Promise<void> {
    try {
      // Update athlete
      await prisma.athlete.update({
        where: { id: athleteId },
        data: {
          transportZoneId: null,
          usesTransport: false
        }
      });
      
      // Remove from bus
      await prisma.busAthlete.deleteMany({
        where: { athleteId }
      });
      
      logger.info(`Athlete ${athleteId} removed from transport`);
    } catch (error) {
      logger.error('Error removing athlete from transport:', error);
      throw error;
    }
  }
  
  // Get transport statistics
  async getTransportStats(organizationId: string): Promise<any> {
    const [zones, buses, athletes] = await Promise.all([
      prisma.transportZone.count({
        where: { organizationId }
      }),
      prisma.bus.aggregate({
        where: { 
          organizationId,
          isActive: true 
        },
        _count: true,
        _sum: {
          capacity: true
        }
      }),
      prisma.athlete.count({
        where: {
          organizationId,
          usesTransport: true,
          status: 'ACTIVE'
        }
      })
    ]);
    
    const busAthletes = await prisma.busAthlete.count({
      where: {
        bus: {
          organizationId
        }
      }
    });
    
    return {
      totalZones: zones,
      totalBuses: buses._count,
      totalCapacity: buses._sum.capacity || 0,
      athletesUsingTransport: athletes,
      athletesAssignedToBus: busAthletes,
      unassignedAthletes: athletes - busAthletes,
      utilizationRate: buses._sum.capacity 
        ? (busAthletes / buses._sum.capacity) * 100 
        : 0
    };
  }
}

export const transportService = new TransportService();
