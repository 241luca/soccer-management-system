import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  authenticate,
  requireOrganization,
  extractOrganization,
  AuthRequest
} from '../middleware/multi-tenant.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
const prisma = new PrismaClient();

// GET /api/v1/organizations/:orgId/kits
router.get('/organizations/:orgId/kits', 
  authenticate, 
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const { orgId } = req.params;
      const { season, kitType, teamId } = req.query;
      
      const where: any = {
        organizationId: orgId,
        ...(season && { season: season as string }),
        ...(kitType && { kitType: kitType as string }),
        ...(teamId && { teamId: teamId as string })
      };
      
      const kits = await prisma.teamKit.findMany({
        where,
        include: {
          team: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: [
          { season: 'desc' },
          { kitType: 'asc' }
        ]
      });
      
      res.json(kits);
    } catch (error) {
      console.error('Error fetching team kits:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch team kits'
      });
    }
  })
);

// GET /api/v1/kits/:id
router.get('/kits/:id', 
  authenticate, 
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      const kit = await prisma.teamKit.findUnique({
        where: { id },
        include: {
          team: true,
          organization: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
      
      if (!kit) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Team kit not found'
        });
        return;
      }
      
      // Check permissions
      const user = req.user;
      if (user?.role !== 'SUPER_ADMIN' && 
          user?.organizationId !== kit.organizationId) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Cannot access kit from another organization'
        });
        return;
      }
      
      res.json(kit);
    } catch (error) {
      console.error('Error fetching team kit:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch team kit'
      });
    }
  })
);

// POST /api/v1/organizations/:orgId/kits
router.post('/organizations/:orgId/kits',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const { orgId } = req.params;
      const kitData = {
        ...req.body,
        organizationId: orgId,
        availableSizes: req.body.availableSizes || []
      };
      
      // Validate kitType
      const validKitTypes = ['home', 'away', 'third', 'goalkeeper'];
      if (!validKitTypes.includes(kitData.kitType)) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid kit type'
        });
        return;
      }
      
      const kit = await prisma.teamKit.create({
        data: kitData,
        include: {
          team: true
        }
      });
      
      res.status(201).json({
        success: true,
        data: kit
      });
    } catch (error) {
      console.error('Error creating team kit:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create team kit'
      });
    }
  })
);

// PUT /api/v1/kits/:id - Update with e-commerce fields
router.put('/kits/:id', 
  authenticate, 
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const user = req.user;
      
      // Get kit to check organization
      const existingKit = await prisma.teamKit.findUnique({
        where: { id }
      });
      
      if (!existingKit) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Team kit not found'
        });
        return;
      }
      
      // Check permissions
      if (user?.role !== 'SUPER_ADMIN' && 
          user?.organizationId !== existingKit.organizationId) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Cannot modify kit from another organization'
        });
        return;
      }
      
      // Validate URLs if provided
      if (updateData.shopUrl && !isValidUrl(updateData.shopUrl)) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid shop URL'
        });
        return;
      }
      
      if (updateData.merchandiseUrl && !isValidUrl(updateData.merchandiseUrl)) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid merchandise URL'
        });
        return;
      }
      
      // Validate price if provided
      if (updateData.price !== undefined && updateData.price < 0) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Price cannot be negative'
        });
        return;
      }
      
      // Ensure availableSizes is an array
      if (updateData.availableSizes && !Array.isArray(updateData.availableSizes)) {
        updateData.availableSizes = [];
      }
      
      const kit = await prisma.teamKit.update({
        where: { id },
        data: updateData,
        include: {
          team: true
        }
      });
      
      res.json({
        success: true,
        data: kit
      });
    } catch (error) {
      console.error('Error updating team kit:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update team kit'
      });
    }
  })
);

// DELETE /api/v1/kits/:id
router.delete('/kits/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const user = req.user;
      
      // Get kit to check organization
      const kit = await prisma.teamKit.findUnique({
        where: { id }
      });
      
      if (!kit) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Team kit not found'
        });
        return;
      }
      
      // Check permissions
      if (user?.role !== 'SUPER_ADMIN' && 
          user?.organizationId !== kit.organizationId) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Cannot delete kit from another organization'
        });
        return;
      }
      
      // Soft delete
      await prisma.teamKit.update({
        where: { id },
        data: { isActive: false }
      });
      
      res.json({
        success: true,
        message: 'Team kit deactivated successfully'
      });
    } catch (error) {
      console.error('Error deleting team kit:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete team kit'
      });
    }
  })
);

// Helper function to validate URLs
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export default router;
