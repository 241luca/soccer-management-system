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

// GET /api/v1/organizations/:orgId/staff
router.get('/organizations/:orgId/staff', 
  authenticate, 
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const { orgId } = req.params;
      const { includeInactive } = req.query;
      
      const where: any = {
        organizationId: orgId,
        ...(includeInactive !== 'true' && { isActive: true })
      };
      
      const staff = await prisma.staffMember.findMany({
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
          { role: 'asc' },
          { lastName: 'asc' }
        ]
      });
      
      res.json(staff);
    } catch (error) {
      console.error('Error fetching staff:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch staff members'
      });
    }
  })
);

// GET /api/v1/staff/:id
router.get('/staff/:id', 
  authenticate, 
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      const staff = await prisma.staffMember.findUnique({
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
      
      if (!staff) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Staff member not found'
        });
        return;
      }
      
      // Check permissions
      const user = req.user;
      if (user?.role !== 'SUPER_ADMIN' && 
          user?.organizationId !== staff.organizationId) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Cannot access staff from another organization'
        });
        return;
      }
      
      res.json(staff);
    } catch (error) {
      console.error('Error fetching staff member:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch staff member'
      });
    }
  })
);

// POST /api/v1/organizations/:orgId/staff
router.post('/organizations/:orgId/staff',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const { orgId } = req.params;
      const staffData = {
        ...req.body,
        organizationId: orgId
      };
      
      const staff = await prisma.staffMember.create({
        data: staffData,
        include: {
          team: true
        }
      });
      
      res.status(201).json({
        success: true,
        data: staff
      });
    } catch (error) {
      console.error('Error creating staff member:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create staff member'
      });
    }
  })
);

// PUT /api/v1/staff/:id - Update to include new fields
router.put('/staff/:id', 
  authenticate, 
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const user = req.user;
      
      // Get staff member to check organization
      const existingStaff = await prisma.staffMember.findUnique({
        where: { id }
      });
      
      if (!existingStaff) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Staff member not found'
        });
        return;
      }
      
      // Check permissions
      if (user?.role !== 'SUPER_ADMIN' && 
          user?.organizationId !== existingStaff.organizationId) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Cannot modify staff from another organization'
        });
        return;
      }
      
      // Validate salary if provided
      if (updateData.salary !== undefined && updateData.salary < 0) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Salary cannot be negative'
        });
        return;
      }
      
      // Validate contractType if provided
      const validContractTypes = ['full-time', 'part-time', 'volunteer', 'consultant'];
      if (updateData.contractType && !validContractTypes.includes(updateData.contractType)) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid contract type'
        });
        return;
      }
      
      // Validate paymentFrequency if provided
      const validPaymentFrequencies = ['monthly', 'weekly', 'hourly', 'per-event'];
      if (updateData.paymentFrequency && !validPaymentFrequencies.includes(updateData.paymentFrequency)) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid payment frequency'
        });
        return;
      }
      
      const staff = await prisma.staffMember.update({
        where: { id },
        data: updateData,
        include: {
          team: true
        }
      });
      
      res.json({
        success: true,
        data: staff
      });
    } catch (error) {
      console.error('Error updating staff member:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update staff member'
      });
    }
  })
);

// DELETE /api/v1/staff/:id
router.delete('/staff/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const user = req.user;
      
      // Get staff member to check organization
      const staff = await prisma.staffMember.findUnique({
        where: { id }
      });
      
      if (!staff) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Staff member not found'
        });
        return;
      }
      
      // Check permissions
      if (user?.role !== 'SUPER_ADMIN' && 
          user?.organizationId !== staff.organizationId) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Cannot delete staff from another organization'
        });
        return;
      }
      
      // Soft delete
      await prisma.staffMember.update({
        where: { id },
        data: { isActive: false }
      });
      
      res.json({
        success: true,
        message: 'Staff member deactivated successfully'
      });
    } catch (error) {
      console.error('Error deleting staff member:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete staff member'
      });
    }
  })
);

export default router;
