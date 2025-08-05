import { PrismaClient, Document, DocumentStatus } from '@prisma/client';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const prisma = new PrismaClient();

export interface CreateDocumentInput {
  athleteId: string;
  organizationId: string;
  type: string;
  name: string;
  description?: string;
  expiryDate?: Date;
  file?: Express.Multer.File;
}

export interface UpdateDocumentInput {
  id: string;
  organizationId: string;
  name?: string;
  description?: string;
  expiryDate?: Date;
  status?: DocumentStatus;
}

export interface DocumentWithAthlete extends Document {
  athlete?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export class DocumentService {
  private uploadPath = process.env.UPLOAD_PATH || './uploads';
  
  constructor() {
    // Ensure upload directory exists
    this.ensureUploadDir();
  }
  
  private async ensureUploadDir(): Promise<void> {
    try {
      await fs.access(this.uploadPath);
    } catch {
      await fs.mkdir(this.uploadPath, { recursive: true });
      await fs.mkdir(path.join(this.uploadPath, 'documents'), { recursive: true });
    }
  }
  
  // Get all documents for an organization
  async getDocuments(organizationId: string, filters?: any): Promise<DocumentWithAthlete[]> {
    try {
      const where: any = { organizationId };
      
      if (filters?.athleteId) {
        where.athleteId = filters.athleteId;
      }
      
      if (filters?.status) {
        where.status = filters.status;
      }
      
      if (filters?.type) {
        where.type = filters.type;
      }
      
      // Filter for expiring documents
      if (filters?.expiring === 'true') {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        where.expiryDate = {
          lte: thirtyDaysFromNow,
          gte: new Date()
        };
      }
      
      const documents = await prisma.document.findMany({
        where,
        include: {
          athlete: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: [
          { status: 'asc' },
          { expiryDate: 'asc' }
        ]
      });
      
      // Update status based on expiry date
      const updatedDocuments = await Promise.all(
        documents.map(async (doc) => {
          const newStatus = this.calculateDocumentStatus(doc.expiryDate);
          if (newStatus !== doc.status) {
            return await prisma.document.update({
              where: { id: doc.id },
              data: { status: newStatus },
              include: {
                athlete: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            });
          }
          return doc;
        })
      );
      
      return updatedDocuments;
    } catch (error) {
      logger.error('Error fetching documents:', error);
      throw error;
    }
  }
  
  // Get documents for a specific athlete
  async getAthleteDocuments(athleteId: string, organizationId: string): Promise<Document[]> {
    const documents = await prisma.document.findMany({
      where: {
        athleteId,
        organizationId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return documents;
  }
  
  // Get single document
  async getDocumentById(id: string, organizationId: string): Promise<Document> {
    const document = await prisma.document.findFirst({
      where: {
        id,
        organizationId
      }
    });
    
    if (!document) {
      throw new NotFoundError('Document not found');
    }
    
    return document;
  }
  
  // Upload and create document
  async uploadDocument(data: CreateDocumentInput): Promise<Document> {
    try {
      // Verify athlete exists
      const athlete = await prisma.athlete.findFirst({
        where: {
          id: data.athleteId,
          organizationId: data.organizationId
        }
      });
      
      if (!athlete) {
        throw new NotFoundError('Athlete not found');
      }
      
      let fileUrl: string | undefined;
      let fileName: string | undefined;
      let fileSize: number | undefined;
      let mimeType: string | undefined;
      
      // Handle file upload
      if (data.file) {
        // Generate unique filename
        const fileExt = path.extname(data.file.originalname);
        const uniqueName = `${crypto.randomBytes(16).toString('hex')}${fileExt}`;
        const filePath = path.join(this.uploadPath, 'documents', uniqueName);
        
        // Save file
        await fs.writeFile(filePath, data.file.buffer);
        
        fileUrl = `/uploads/documents/${uniqueName}`;
        fileName = data.file.originalname;
        fileSize = data.file.size;
        mimeType = data.file.mimetype;
        
        logger.info(`File uploaded: ${fileName} -> ${fileUrl}`);
      }
      
      // Calculate status based on expiry date
      const status = data.expiryDate ? this.calculateDocumentStatus(data.expiryDate) : 'VALID';
      
      // Create document record
      const document = await prisma.document.create({
        data: {
          athleteId: data.athleteId,
          organizationId: data.organizationId,
          type: data.type,
          name: data.name,
          description: data.description,
          fileUrl,
          fileName,
          fileSize,
          mimeType,
          expiryDate: data.expiryDate,
          status,
          uploadedById: data.athleteId // Should be current user ID in production
        }
      });
      
      logger.info(`Document created: ${document.fileName} (${document.id})`);
      
      // Create notification if document is expiring soon
      if (status === 'EXPIRING') {
        await this.createExpiryNotification(data.organizationId, document, athlete);
      }
      
      return document;
    } catch (error) {
      logger.error('Error uploading document:', error);
      throw error;
    }
  }
  
  // Update document
  async updateDocument(data: UpdateDocumentInput): Promise<Document> {
    try {
      const existing = await prisma.document.findFirst({
        where: {
          id: data.id,
          organizationId: data.organizationId
        }
      });
      
      if (!existing) {
        throw new NotFoundError('Document not found');
      }
      
      // Calculate new status if expiry date changed
      let status = data.status;
      if (data.expiryDate && !data.status) {
        status = this.calculateDocumentStatus(data.expiryDate);
      }
      
      const document = await prisma.document.update({
        where: { id: data.id },
        data: {
          name: data.name,
          description: data.description,
          expiryDate: data.expiryDate,
          status,
          updatedAt: new Date()
        }
      });
      
      logger.info(`Document updated: ${document.fileName} (${document.id})`);
      
      return document;
    } catch (error) {
      logger.error('Error updating document:', error);
      throw error;
    }
  }
  
  // Delete document
  async deleteDocument(id: string, organizationId: string): Promise<void> {
    try {
      const document = await prisma.document.findFirst({
        where: {
          id,
          organizationId
        }
      });
      
      if (!document) {
        throw new NotFoundError('Document not found');
      }
      
      // Delete file if exists
      if (document.fileUrl) {
        const filePath = path.join(this.uploadPath, document.fileUrl.replace('/uploads/', ''));
        try {
          await fs.unlink(filePath);
          logger.info(`File deleted: ${filePath}`);
        } catch (error) {
          logger.error(`Error deleting file: ${filePath}`, error);
        }
      }
      
      // Delete database record
      await prisma.document.delete({
        where: { id }
      });
      
      logger.info(`Document deleted: ${document.fileName} (${id})`);
    } catch (error) {
      logger.error('Error deleting document:', error);
      throw error;
    }
  }
  
  // Download document
  async downloadDocument(id: string, organizationId: string): Promise<{ path: string; filename: string; mimetype: string }> {
    const document = await prisma.document.findFirst({
      where: {
        id,
        organizationId
      }
    });
    
    if (!document) {
      throw new NotFoundError('Document not found');
    }
    
    if (!document.fileUrl) {
      throw new BadRequestError('Document has no file attached');
    }
    
    const filePath = path.join(this.uploadPath, document.fileUrl.replace('/uploads/', ''));
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      throw new NotFoundError('File not found on server');
    }
    
    return {
      path: filePath,
      filename: document.fileName || 'document',
      mimetype: document.mimeType || 'application/octet-stream'
    };
  }
  
  // Get expiring documents
  async getExpiringDocuments(organizationId: string, days: number = 30): Promise<DocumentWithAthlete[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    const documents = await prisma.document.findMany({
      where: {
        organizationId,
        expiryDate: {
          lte: futureDate,
          gte: new Date()
        }
      },
      include: {
        athlete: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        expiryDate: 'asc'
      }
    });
    
    return documents;
  }
  
  // Check and update document statuses
  async updateDocumentStatuses(organizationId: string): Promise<number> {
    const documents = await prisma.document.findMany({
      where: {
        organizationId,
        expiryDate: { not: undefined }
      }
    });
    
    let updatedCount = 0;
    
    for (const doc of documents) {
      if (doc.expiryDate) {
        const newStatus = this.calculateDocumentStatus(doc.expiryDate);
        if (newStatus !== doc.status) {
          await prisma.document.update({
            where: { id: doc.id },
            data: { status: newStatus }
          });
          updatedCount++;
          
          // Create notification for newly expiring documents
          if (newStatus === 'EXPIRING' || newStatus === 'EXPIRED') {
            const athlete = await prisma.athlete.findUnique({
              where: { id: doc.athleteId }
            });
            
            if (athlete) {
              await this.createExpiryNotification(organizationId, doc, athlete);
            }
          }
        }
      }
    }
    
    logger.info(`Updated status for ${updatedCount} documents`);
    return updatedCount;
  }
  
  // Helper functions
  private calculateDocumentStatus(expiryDate: Date | null): DocumentStatus {
    if (!expiryDate) return 'VALID';
    
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'EXPIRED';
    if (daysUntilExpiry <= 30) return 'EXPIRING';
    return 'VALID';
  }
  
  private async createExpiryNotification(
    organizationId: string,
    document: Document,
    athlete: any
  ): Promise<void> {
    try {
      const daysUntilExpiry = document.expiryDate
        ? Math.floor((new Date(document.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      
      const message = daysUntilExpiry > 0
        ? `Document "${document.fileName}" for ${athlete.firstName} ${athlete.lastName} expires in ${daysUntilExpiry} days`
        : `Document "${document.fileName}" for ${athlete.firstName} ${athlete.lastName} has expired`;
      
      await prisma.notification.create({
        data: {
          organizationId,
          type: 'DOCUMENT_EXPIRY',
          title: 'Document Expiry Warning',
          message,
          priority: daysUntilExpiry <= 7 ? 'high' : 'medium',
          isRead: false,
          metadata: {
            documentId: document.id,
            athleteId: athlete.id,
            daysUntilExpiry
          }
        }
      });
    } catch (error) {
      logger.error('Error creating expiry notification:', error);
    }
  }
}

export const documentService = new DocumentService();
