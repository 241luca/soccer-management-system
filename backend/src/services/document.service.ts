import { PrismaClient, Document, Prisma } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { notificationService } from './notification.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export interface CreateDocumentInput {
  athleteId: string;
  documentTypeId: string;
  documentNumber?: string;
  issueDate: Date;
  expiryDate: Date;
  fileUrl?: string;
  notes?: string;
}

export interface UpdateDocumentInput extends Partial<CreateDocumentInput> {
  status?: 'VALID' | 'EXPIRED' | 'REVOKED';
}

export interface UploadDocumentInput {
  athleteId: string;
  documentTypeId: string;
  file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
  };
  documentNumber?: string;
  issueDate: Date;
  expiryDate: Date;
  notes?: string;
}

export class DocumentService {
  private uploadPath = process.env.UPLOAD_PATH || './uploads';
  private maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB default

  async findAll(organizationId: string, params?: {
    athleteId?: string;
    documentTypeId?: string;
    status?: string;
    expiringDays?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.DocumentWhereInput = {
      athlete: { organizationId }
    };

    if (params?.athleteId) {
      where.athleteId = params.athleteId;
    }

    if (params?.documentTypeId) {
      where.documentTypeId = params.documentTypeId;
    }

    if (params?.status) {
      where.status = params.status as any;
    }

    // Filter by documents expiring in X days
    if (params?.expiringDays) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + params.expiringDays);
      
      where.expiryDate = {
        gte: new Date(),
        lte: futureDate
      };
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        include: {
          athlete: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              team: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          documentType: true
        },
        skip,
        take: limit,
        orderBy: params?.sortBy ? {
          [params.sortBy]: params.sortOrder || 'asc'
        } : { expiryDate: 'asc' }
      }),
      prisma.document.count({ where })
    ]);

    // Enrich with calculated fields
    const enrichedDocuments = documents.map(doc => {
      const today = new Date();
      const daysUntilExpiry = Math.ceil((doc.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        ...doc,
        athleteName: `${doc.athlete.firstName} ${doc.athlete.lastName}`,
        teamName: doc.athlete.team?.name,
        daysUntilExpiry,
        isExpiring: daysUntilExpiry > 0 && daysUntilExpiry <= 30,
        isExpired: daysUntilExpiry < 0
      };
    });

    return {
      data: enrichedDocuments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id: string, organizationId: string) {
    const document = await prisma.document.findFirst({
      where: {
        id,
        athlete: { organizationId }
      },
      include: {
        athlete: {
          include: { team: true }
        },
        documentType: true
      }
    });

    if (!document) {
      throw NotFoundError('Document');
    }

    const today = new Date();
    const daysUntilExpiry = Math.ceil((document.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return {
      ...document,
      daysUntilExpiry,
      isExpiring: daysUntilExpiry > 0 && daysUntilExpiry <= 30,
      isExpired: daysUntilExpiry < 0
    };
  }

  async create(data: CreateDocumentInput, organizationId: string) {
    // Validate athlete belongs to organization
    const athlete = await prisma.athlete.findFirst({
      where: {
        id: data.athleteId,
        organizationId
      }
    });

    if (!athlete) {
      throw BadRequestError('Invalid athlete ID');
    }

    // Validate document type
    const documentType = await prisma.documentType.findUnique({
      where: { id: data.documentTypeId }
    });

    if (!documentType) {
      throw BadRequestError('Invalid document type');
    }

    // Check if athlete already has this document type
    const existing = await prisma.document.findFirst({
      where: {
        athleteId: data.athleteId,
        documentTypeId: data.documentTypeId,
        status: 'VALID'
      }
    });

    if (existing) {
      // Revoke the existing document
      await prisma.document.update({
        where: { id: existing.id },
        data: { status: 'REVOKED' }
      });
    }

    const document = await prisma.document.create({
      data: {
        ...data,
        issueDate: new Date(data.issueDate),
        expiryDate: new Date(data.expiryDate),
        status: 'VALID'
      },
      include: {
        athlete: true,
        documentType: true
      }
    });

    logger.info(`New document created: ${documentType.name} for ${athlete.firstName} ${athlete.lastName}`);

    // Check if document is already expiring
    const daysUntilExpiry = Math.ceil((document.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= 30) {
      await notificationService.create({
        organizationId,
        type: 'document_expiry',
        severity: daysUntilExpiry <= 7 ? 'error' : 'warning',
        title: `${documentType.name} in Scadenza`,
        message: `Il ${documentType.name} di ${athlete.firstName} ${athlete.lastName} scade tra ${daysUntilExpiry} giorni`,
        relatedEntityType: 'document',
        relatedEntityId: document.id
      });
    }

    return document;
  }

  async upload(data: UploadDocumentInput, organizationId: string) {
    // Validate file size
    if (data.file.size > this.maxFileSize) {
      throw BadRequestError(`File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`);
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(data.file.mimetype)) {
      throw BadRequestError('Invalid file type. Only PDF, JPEG, and PNG files are allowed.');
    }

    // Generate unique filename
    const fileExtension = path.extname(data.file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(this.uploadPath, 'documents', fileName);

    // Ensure upload directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // Save file
    await fs.writeFile(filePath, data.file.buffer);

    // Create document record with file URL
    const documentData: CreateDocumentInput = {
      athleteId: data.athleteId,
      documentTypeId: data.documentTypeId,
      documentNumber: data.documentNumber,
      issueDate: data.issueDate,
      expiryDate: data.expiryDate,
      fileUrl: `/uploads/documents/${fileName}`,
      notes: data.notes
    };

    const document = await this.create(documentData, organizationId);

    logger.info(`Document uploaded: ${fileName}`);

    return document;
  }

  async update(id: string, data: UpdateDocumentInput, organizationId: string) {
    const document = await this.findById(id, organizationId);

    const updated = await prisma.document.update({
      where: { id },
      data: {
        ...data,
        issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined
      },
      include: {
        athlete: true,
        documentType: true
      }
    });

    // Check if expiry date changed and create notification if needed
    if (data.expiryDate && data.expiryDate !== document.expiryDate) {
      const daysUntilExpiry = Math.ceil((new Date(data.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
        await notificationService.create({
          organizationId,
          type: 'document_expiry',
          severity: daysUntilExpiry <= 7 ? 'error' : 'warning',
          title: `${updated.documentType.name} in Scadenza`,
          message: `Il ${updated.documentType.name} di ${updated.athlete.firstName} ${updated.athlete.lastName} scade tra ${daysUntilExpiry} giorni`,
          relatedEntityType: 'document',
          relatedEntityId: updated.id
        });
      }
    }

    logger.info(`Document updated: ${updated.id}`);

    return updated;
  }

  async delete(id: string, organizationId: string) {
    const document = await this.findById(id, organizationId);

    // Delete physical file if exists
    if (document.fileUrl) {
      const filePath = path.join(this.uploadPath, document.fileUrl.replace('/uploads/', ''));
      try {
        await fs.unlink(filePath);
        logger.info(`File deleted: ${filePath}`);
      } catch (error) {
        logger.error(`Failed to delete file: ${filePath}`, error);
      }
    }

    await prisma.document.delete({ where: { id } });

    logger.info(`Document deleted: ${id}`);

    return { message: 'Document deleted successfully' };
  }

  async checkExpiringDocuments(organizationId: string, daysAhead: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const expiringDocuments = await prisma.document.findMany({
      where: {
        athlete: { organizationId },
        status: 'VALID',
        expiryDate: {
          gte: new Date(),
          lte: futureDate
        }
      },
      include: {
        athlete: true,
        documentType: true
      }
    });

    // Group by severity
    const grouped = {
      critical: [] as typeof expiringDocuments,
      warning: [] as typeof expiringDocuments,
      info: [] as typeof expiringDocuments
    };

    const today = new Date();
    
    for (const doc of expiringDocuments) {
      const daysUntilExpiry = Math.ceil((doc.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry <= 7) {
        grouped.critical.push(doc);
      } else if (daysUntilExpiry <= 15) {
        grouped.warning.push(doc);
      } else {
        grouped.info.push(doc);
      }

      // Create or update notification
      await notificationService.create({
        organizationId,
        type: 'document_expiry',
        severity: daysUntilExpiry <= 7 ? 'error' : daysUntilExpiry <= 15 ? 'warning' : 'info',
        title: `${doc.documentType.name} in Scadenza`,
        message: `Il ${doc.documentType.name} di ${doc.athlete.firstName} ${doc.athlete.lastName} scade tra ${daysUntilExpiry} giorni`,
        relatedEntityType: 'document',
        relatedEntityId: doc.id,
        actions: [
          { label: 'Visualizza Documento', action: 'view_document', style: 'primary' },
          { label: 'Carica Nuovo', action: 'upload_document', style: 'secondary' }
        ]
      });
    }

    return {
      total: expiringDocuments.length,
      critical: grouped.critical.length,
      warning: grouped.warning.length,
      info: grouped.info.length,
      documents: grouped
    };
  }

  async getDocumentTypes() {
    return prisma.documentType.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });
  }

  async getDocumentStatsByTeam(organizationId: string) {
    const teams = await prisma.team.findMany({
      where: { 
        organizationId,
        isActive: true
      },
      include: {
        athletes: {
          where: { status: 'ACTIVE' },
          include: {
            documents: {
              where: { status: 'VALID' },
              include: { documentType: true }
            }
          }
        }
      }
    });

    const stats = teams.map(team => {
      const athleteStats = team.athletes.map(athlete => {
        const medicalCert = athlete.documents.find(d => d.documentType.category === 'medical');
        const insurance = athlete.documents.find(d => d.documentType.category === 'insurance');
        
        const today = new Date();
        const isMedicalExpiring = medicalCert && 
          Math.ceil((medicalCert.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) <= 30;
        const isInsuranceExpiring = insurance && 
          Math.ceil((insurance.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) <= 30;

        return {
          athleteId: athlete.id,
          athleteName: `${athlete.firstName} ${athlete.lastName}`,
          hasMedical: !!medicalCert,
          hasInsurance: !!insurance,
          isMedicalExpiring,
          isInsuranceExpiring,
          missingDocuments: !medicalCert || !insurance,
          expiringDocuments: isMedicalExpiring || isInsuranceExpiring
        };
      });

      return {
        teamId: team.id,
        teamName: team.name,
        totalAthletes: team.athletes.length,
        completeDocumentation: athleteStats.filter(a => !a.missingDocuments && !a.expiringDocuments).length,
        missingDocuments: athleteStats.filter(a => a.missingDocuments).length,
        expiringDocuments: athleteStats.filter(a => a.expiringDocuments).length,
        athletes: athleteStats
      };
    });

    return stats;
  }
}

export const documentService = new DocumentService();
