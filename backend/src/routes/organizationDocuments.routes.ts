import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { 
  authenticate,
  requireOrganization,
  extractOrganization,
  AuthRequest
} from '../middleware/multi-tenant.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/documents/organizations');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, and GIF are allowed.'));
    }
  }
});

// GET /api/v1/organizations/:orgId/documents
router.get('/organizations/:orgId/documents', 
  authenticate, 
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const { orgId } = req.params;
      const { category, year, isPublic } = req.query;
      
      const where: any = {
        organizationId: orgId,
        ...(category && { category: category as string }),
        ...(year && { year: parseInt(year as string) }),
        ...(isPublic !== undefined && { isPublic: isPublic === 'true' })
      };
      
      const documents = await prisma.organizationDocument.findMany({
        where,
        include: {
          uploadedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: [
          { createdAt: 'desc' }
        ]
      });
      
      res.json(documents);
    } catch (error) {
      console.error('Error fetching organization documents:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch organization documents'
      });
    }
  })
);

// POST /api/v1/organizations/:orgId/documents
router.post('/organizations/:orgId/documents',
  authenticate,
  upload.single('file'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const { orgId } = req.params;
      const user = req.user;
      const file = req.file;
      
      if (!file) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'No file uploaded'
        });
        return;
      }
      
      const documentData = {
        organizationId: orgId,
        name: req.body.name || file.originalname,
        description: req.body.description,
        category: req.body.category || 'other',
        fileUrl: `/uploads/documents/organizations/${file.filename}`,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        year: req.body.year ? parseInt(req.body.year) : new Date().getFullYear(),
        uploadedById: user?.id || user?.userId || '',
        isPublic: req.body.isPublic === 'true',
        tags: req.body.tags ? JSON.parse(req.body.tags) : []
      };
      
      const document = await prisma.organizationDocument.create({
        data: documentData,
        include: {
          uploadedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });
      
      res.status(201).json({
        success: true,
        data: document
      });
    } catch (error) {
      console.error('Error uploading organization document:', error);
      
      // Delete uploaded file if database operation failed
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to upload organization document'
      });
    }
  })
);

// GET /api/v1/documents/:id/download
router.get('/documents/:id/download',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const user = req.user;
      
      const document = await prisma.organizationDocument.findUnique({
        where: { id }
      });
      
      if (!document) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Document not found'
        });
        return;
      }
      
      // Check permissions - only organization members or if document is public
      if (!document.isPublic) {
        if (user?.role !== 'SUPER_ADMIN' && 
            user?.organizationId !== document.athlete.organizationId) {
          // Check if user has access via UserOrganization
          const hasAccess = await prisma.userOrganization.findFirst({
            where: {
              userId: user?.id || user?.userId || '',
              organizationId: document.athlete.organizationId
            }
          });
          
          if (!hasAccess) {
            res.status(403).json({
              error: 'Forbidden',
              message: 'No access to this document'
            });
            return;
          }
        }
      }
      
      // Build file path
      const filePath = path.join(__dirname, '../..', document.fileUrl);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        res.status(404).json({
          error: 'Not Found',
          message: 'File not found on server'
        });
        return;
      }
      
      // Set appropriate headers
      res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);
      res.setHeader('Content-Length', document.fileSize || 0);
      
      // Stream file to response
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error downloading document:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to download document'
      });
    }
  })
);

// PUT /api/v1/documents/:id
router.put('/documents/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const user = req.user;
      const updateData = req.body;
      
      // Get document to check permissions
      const document = await prisma.organizationDocument.findUnique({
        where: { id }
      });
      
      if (!document) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Document not found'
        });
        return;
      }
      
      // Check permissions
      if (user?.role !== 'SUPER_ADMIN' && 
          user?.organizationId !== document.athlete.organizationId) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Cannot modify document from another organization'
        });
        return;
      }
      
      // Update only allowed fields
      const allowedUpdates = ['name', 'description', 'category', 'year', 'isPublic', 'tags'];
      const filteredData: any = {};
      
      allowedUpdates.forEach(field => {
        if (updateData[field] !== undefined) {
          if (field === 'tags' && typeof updateData[field] === 'string') {
            filteredData[field] = JSON.parse(updateData[field]);
          } else {
            filteredData[field] = updateData[field];
          }
        }
      });
      
      const updated = await prisma.organizationDocument.update({
        where: { id },
        data: filteredData,
        include: {
          uploadedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });
      
      res.json({
        success: true,
        data: updated
      });
    } catch (error) {
      console.error('Error updating document:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update document'
      });
    }
  })
);

// DELETE /api/v1/documents/:id
router.delete('/documents/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const user = req.user;
      
      // Get document to check permissions and get file path
      const document = await prisma.organizationDocument.findUnique({
        where: { id }
      });
      
      if (!document) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Document not found'
        });
        return;
      }
      
      // Check permissions
      if (user?.role !== 'SUPER_ADMIN' && 
          user?.organizationId !== document.athlete.organizationId) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Cannot delete document from another organization'
        });
        return;
      }
      
      // Delete from database
      await prisma.organizationDocument.delete({
        where: { id }
      });
      
      // Delete physical file
      const filePath = path.join(__dirname, '../..', document.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      res.json({
        success: true,
        message: 'Document deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete document'
      });
    }
  })
);

export default router;
