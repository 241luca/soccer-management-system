import { Router, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { AuthRequest } from '../types/auth.types';
import { transportService } from '../services/transport.service';
import { z } from 'zod';
import { BadRequestError } from '../utils/errors';

const router = Router();
router.use(authenticate);

// Validation schemas
const createZoneSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  coordinates: z.any().optional(),
  athleteIds: z.array(z.string()).optional()
});

const createBusSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  plateNumber: z.string().min(1, 'Plate number is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  driverName: z.string().optional(),
  driverPhone: z.string().optional(),
  notes: z.string().optional()
});

const assignTransportSchema = z.object({
  athleteId: z.string().min(1, 'Athlete ID is required'),
  zoneId: z.string().min(1, 'Zone ID is required'),
  busId: z.string().optional()
});

// ZONES ROUTES

// Get all zones
router.get('/zones', async (req: AuthRequest, res: Response, next) => {
  try {
    const zones = await transportService.getZones(req.user?.organizationId || '');
    res.json({ success: true, data: { zones } });
  } catch (error) {
    next(error);
  }
});

// Get single zone
router.get('/zones/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const zone = await transportService.getZoneById(req.params.id, req.user?.organizationId || '');
    res.json({ success: true, data: zone });
  } catch (error) {
    next(error);
  }
});

// Create zone (admin/coach)
router.post('/zones', authorize('Admin', 'Coach'), async (req: AuthRequest, res: Response, next) => {
  try {
    const data = createZoneSchema.parse(req.body);
    const zone = await transportService.createZone({
      ...data,
      organizationId: req.user?.organizationId || ''
    });
    res.status(201).json({ success: true, data: zone });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new BadRequestError('Invalid zone data'));
    }
    next(error);
  }
});

// Update zone (admin/coach)
router.put('/zones/:id', authorize('Admin', 'Coach'), async (req: AuthRequest, res: Response, next) => {
  try {
    const data = createZoneSchema.partial().parse(req.body);
    const zone = await transportService.updateZone(
      req.params.id,
      req.user?.organizationId || '',
      data
    );
    res.json({ success: true, data: zone });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new BadRequestError('Invalid zone data'));
    }
    next(error);
  }
});

// Delete zone (admin only)
router.delete('/zones/:id', authorize('Admin'), async (req: AuthRequest, res: Response, next) => {
  try {
    await transportService.deleteZone(req.params.id, req.user?.organizationId || '');
    res.json({ success: true, message: 'Zone deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// BUSES ROUTES

// Get all buses
router.get('/buses', async (req: AuthRequest, res: Response, next) => {
  try {
    const buses = await transportService.getBuses(req.user?.organizationId || '');
    res.json({ success: true, data: { buses } });
  } catch (error) {
    next(error);
  }
});

// Get single bus
router.get('/buses/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const bus = await transportService.getBusById(req.params.id, req.user?.organizationId || '');
    res.json({ success: true, data: bus });
  } catch (error) {
    next(error);
  }
});

// Create bus (admin/coach)
router.post('/buses', authorize('Admin', 'Coach'), async (req: AuthRequest, res: Response, next) => {
  try {
    const data = createBusSchema.parse(req.body);
    const bus = await transportService.createBus({
      ...data,
      organizationId: req.user?.organizationId || ''
    });
    res.status(201).json({ success: true, data: bus });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new BadRequestError('Invalid bus data'));
    }
    next(error);
  }
});

// Update bus (admin/coach)
router.put('/buses/:id', authorize('Admin', 'Coach'), async (req: AuthRequest, res: Response, next) => {
  try {
    const data = createBusSchema.partial().parse(req.body);
    const bus = await transportService.updateBus(
      req.params.id,
      req.user?.organizationId || '',
      data
    );
    res.json({ success: true, data: bus });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new BadRequestError('Invalid bus data'));
    }
    next(error);
  }
});

// Delete bus (admin only)
router.delete('/buses/:id', authorize('Admin'), async (req: AuthRequest, res: Response, next) => {
  try {
    await transportService.deleteBus(req.params.id, req.user?.organizationId || '');
    res.json({ success: true, message: 'Bus deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// ATHLETE TRANSPORT

// Assign athlete to transport
router.post('/athletes/assign', authorize('Admin', 'Coach'), async (req: AuthRequest, res: Response, next) => {
  try {
    const data = assignTransportSchema.parse(req.body);
    await transportService.assignAthleteTransport({
      ...data,
      organizationId: req.user?.organizationId || ''
    });
    res.json({ success: true, message: 'Athlete assigned to transport' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new BadRequestError('Invalid assignment data'));
    }
    next(error);
  }
});

// Remove athlete from transport
router.delete('/athletes/:athleteId/transport', authorize('Admin', 'Coach'), async (req: AuthRequest, res: Response, next) => {
  try {
    await transportService.removeAthleteTransport(
      req.params.athleteId,
      req.user?.organizationId || ''
    );
    res.json({ success: true, message: 'Athlete removed from transport' });
  } catch (error) {
    next(error);
  }
});

// Get transport statistics
router.get('/stats', async (req: AuthRequest, res: Response, next) => {
  try {
    const stats = await transportService.getTransportStats(req.user?.organizationId || '');
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

export default router;
