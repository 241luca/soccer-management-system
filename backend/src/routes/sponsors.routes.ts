import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  authenticate,
  requireOrganization,
  extractOrganization,
  AuthRequest
} from '../middleware/multi-tenant.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { validateSponsorCreate, validateSponsorUpdate, handleValidationErrors } from '../validators/sponsor.validator';

const router = Router();
const prisma = new PrismaClient();

// GET /api/v1/organizations/:orgId/sponsors
router.get('/organizations/:orgId/sponsors', 
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const { orgId } = req.params;
      const { type, active } = req.query;
      
      // Build where clause
      const where: any = {
        organizationId: orgId,
        ...(type && { sponsorType: type }),
        ...(active !== undefined && { isActive: active === 'true' })
      };
      
      const sponsors = await prisma.sponsor.findMany({
        where,
        orderBy: [
          { sponsorType: 'asc' },
          { annualAmount: 'desc' }
        ]
      });
      
      // Calculate summary
      const summary = {
        total: sponsors.length,
        byType: {} as Record<string, number>,
        totalAnnualValue: 0
      };
      
      const types = ['main', 'technical', 'gold', 'silver', 'bronze', 'partner'];
      types.forEach(type => {
        summary.byType[type] = sponsors.filter(s => s.sponsorType === type).length;
      });
      
      summary.totalAnnualValue = sponsors
        .filter(s => s.isActive && s.annualAmount)
        .reduce((sum, s) => sum + Number(s.annualAmount), 0);
      
      res.json({
        sponsors,
        summary
      });
    } catch (error) {
      console.error('Error fetching sponsors:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch sponsors'
      });
    }
  })
);

// POST /api/v1/organizations/:orgId/sponsors
router.post('/organizations/:orgId/sponsors',
  authenticate,
  validateSponsorCreate,
  handleValidationErrors,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const { orgId } = req.params;
      const sponsorData = {
        ...req.body,
        organizationId: orgId
      };
      
      const sponsor = await prisma.sponsor.create({
        data: sponsorData
      });
      
      res.status(201).json({
        success: true,
        data: sponsor
      });
    } catch (error) {
      console.error('Error creating sponsor:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create sponsor'
      });
    }
  })
);

// PUT /api/v1/sponsors/:id
router.put('/sponsors/:id',
  authenticate,
  validateSponsorUpdate,
  handleValidationErrors,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const user = req.user;
      
      // Verify sponsor belongs to user's organization
      const sponsor = await prisma.sponsor.findUnique({
        where: { id }
      });
      
      if (!sponsor) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Sponsor not found'
        });
      }
      
      // Check permissions
      if (user?.role !== 'SUPER_ADMIN' && 
          user?.organizationId !== sponsor.organizationId) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Cannot modify sponsor from another organization'
        });
      }
      
      const updated = await prisma.sponsor.update({
        where: { id },
        data: req.body
      });
      
      res.json({
        success: true,
        data: updated
      });
    } catch (error) {
      console.error('Error updating sponsor:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update sponsor'
      });
    }
  })
);

// DELETE /api/v1/sponsors/:id
router.delete('/sponsors/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const user = req.user;
      
      // Verify sponsor belongs to user's organization
      const sponsor = await prisma.sponsor.findUnique({
        where: { id }
      });
      
      if (!sponsor) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Sponsor not found'
        });
      }
      
      // Check permissions
      if (user?.role !== 'SUPER_ADMIN' && 
          user?.organizationId !== sponsor.organizationId) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Cannot delete sponsor from another organization'
        });
      }
      
      // Soft delete - just set isActive to false
      await prisma.sponsor.update({
        where: { id },
        data: { isActive: false }
      });
      
      res.json({
        success: true,
        message: 'Sponsor deactivated successfully'
      });
    } catch (error) {
      console.error('Error deleting sponsor:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete sponsor'
      });
    }
  })
);

export default router;
