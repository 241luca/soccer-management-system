import { Router } from 'express';
import { athleteService } from '../services/athlete.service';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.middleware';
import { createAthleteSchema, updateAthleteSchema, paginationSchema, idParamSchema } from '../utils/validation';
import { z } from 'zod';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all athletes
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const params = {
      ...paginationSchema.parse(req.query),
      search: req.query.search as string,
      teamId: req.query.teamId as string,
      status: req.query.status as string,
      needsPromotion: req.query.needsPromotion === 'true',
      usesTransport: req.query.usesTransport === 'true'
    };
    
    const result = await athleteService.findAll(req.user?.organizationId || "", params);
    return res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: error.errors
        }
      });
    }
    return next(error);
  }
});

// Get single athlete
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const athlete = await athleteService.findById(id, req.user?.organizationId || "");
    return res.json(athlete);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid athlete ID',
          details: error.errors
        }
      });
    }
    return next(error);
  }
});

// Get athlete statistics
router.get('/:id/statistics', async (req: AuthRequest, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const stats = await athleteService.getStatistics(id, req.user?.organizationId || "");
    return res.json(stats);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid athlete ID',
          details: error.errors
        }
      });
    }
    return next(error);
  }
});

// Create athlete (coach and above)
router.post('/', authorize('ADMIN', 'COACH'), async (req: AuthRequest, res, next) => {
  try {
    const data = createAthleteSchema.parse(req.body);
    const athlete = await athleteService.create(data, req.user?.organizationId || "");
    return res.status(201).json(athlete);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid athlete data',
          details: error.errors
        }
      });
    }
    return next(error);
  }
});

// Update athlete (coach and above)
router.put('/:id', authorize('ADMIN', 'COACH'), async (req: AuthRequest, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = updateAthleteSchema.parse(req.body);
    const athlete = await athleteService.update(id, data, req.user?.organizationId || "");
    return res.json(athlete);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid athlete data',
          details: error.errors
        }
      });
    }
    return next(error);
  }
});

// Delete athlete (admin only)
router.delete('/:id', authorize('ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const result = await athleteService.delete(id, req.user?.organizationId || "");
    return res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid athlete ID',
          details: error.errors
        }
      });
    }
    return next(error);
  }
});

// Bulk check documents (admin/coach)
router.post('/bulk-check-documents', authorize('ADMIN', 'COACH'), async (req: AuthRequest, res, next) => {
  try {
    const result = await athleteService.bulkCheckDocuments(req.user?.organizationId || "");
    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

// Check age eligibility
router.post('/:id/check-eligibility', authorize('ADMIN', 'COACH'), async (req: AuthRequest, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    await athleteService.checkAgeEligibility(id);
    return res.json({ message: 'Eligibility checked' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid athlete ID',
          details: error.errors
        }
      });
    }
    return next(error);
  }
});

export default router;
