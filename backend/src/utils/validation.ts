import { z } from 'zod';

// Common validation schemas
export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc').optional()
});

export const idParamSchema = z.object({
  id: z.string().uuid()
});

export const dateRangeSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional()
});

// Athlete validation schemas
export const createAthleteSchema = z.object({
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  birthDate: z.string().datetime(),
  fiscalCode: z.string().regex(/^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/).optional(),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?\d{10,15}$/).optional(),
  address: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  province: z.string().length(2).optional(),
  postalCode: z.string().regex(/^\d{5}$/).optional(),
  teamId: z.string().uuid().optional(),
  positionId: z.number().int().positive().optional(),
  jerseyNumber: z.number().int().min(1).max(99).optional(),
  usesTransport: z.boolean().default(false),
  notes: z.string().optional()
});

export const updateAthleteSchema = createAthleteSchema.partial();

// Team validation schemas
export const createTeamSchema = z.object({
  name: z.string().min(3).max(100),
  category: z.string().min(3).max(50),
  season: z.string().regex(/^\d{4}-\d{2}$/),
  minAge: z.number().int().min(5).max(99),
  maxAge: z.number().int().min(5).max(99),
  budget: z.number().min(0).default(0)
}).refine(data => data.maxAge >= data.minAge, {
  message: "Max age must be greater than or equal to min age",
  path: ["maxAge"]
});

// Document validation schemas
export const uploadDocumentSchema = z.object({
  athleteId: z.string().uuid(),
  documentTypeId: z.number().int().positive(),
  issueDate: z.string().datetime(),
  expiryDate: z.string().datetime(),
  notes: z.string().optional()
});

// Payment validation schemas
export const createPaymentSchema = z.object({
  athleteId: z.string().uuid(),
  paymentTypeId: z.number().int().positive(),
  amount: z.number().positive(),
  dueDate: z.string().datetime(),
  notes: z.string().optional()
});

export const recordPaymentSchema = z.object({
  paidDate: z.string().datetime(),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'credit_card', 'other']),
  transactionId: z.string().optional(),
  notes: z.string().optional()
});

// Match validation schemas
export const createMatchSchema = z.object({
  competitionId: z.number().int().positive().optional(),
  homeTeamId: z.string().uuid(),
  awayTeamId: z.string().uuid(),
  date: z.string().datetime(),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  venueId: z.number().int().positive().optional(),
  notes: z.string().optional()
});

export const updateMatchResultSchema = z.object({
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
  status: z.enum(['COMPLETED', 'CANCELLED', 'POSTPONED'])
});

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  phone: z.string().regex(/^\+?\d{10,15}$/).optional(),
  role: z.enum(['ADMIN', 'COACH', 'STAFF', 'PARENT', 'ATHLETE']),
  organizationId: z.string().uuid()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Transport validation schemas
export const assignTransportSchema = z.object({
  athleteId: z.string().uuid(),
  busRouteId: z.string().uuid().optional(),
  zoneId: z.string(),
  pickupAddress: z.string().optional(),
  pickupTime: z.string().regex(/^\d{2}:\d{2}$/).optional()
});

// Notification validation schemas
export const createNotificationSchema = z.object({
  userId: z.string().uuid().optional(),
  type: z.string(),
  severity: z.enum(['info', 'warning', 'error', 'success']).default('info'),
  title: z.string().max(255),
  message: z.string(),
  relatedEntityType: z.string().optional(),
  relatedEntityId: z.string().uuid().optional(),
  actions: z.array(z.object({
    label: z.string(),
    action: z.string(),
    style: z.enum(['primary', 'secondary', 'danger']).optional()
  })).optional(),
  expiresAt: z.string().datetime().optional()
});

// Export type inference helpers
export type PaginationParams = z.infer<typeof paginationSchema>;
export type CreateAthleteInput = z.infer<typeof createAthleteSchema>;
export type UpdateAthleteInput = z.infer<typeof updateAthleteSchema>;
export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
