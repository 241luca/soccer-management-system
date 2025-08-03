import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    headers: req.headers,
    ip: req.ip
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const code = err.code || 'INTERNAL_ERROR';

  res.status(statusCode).json({
    error: {
      code,
      message,
      ...(process.env.NODE_ENV === 'development' && {
        details: err.details,
        stack: err.stack
      })
    },
    timestamp: new Date().toISOString(),
    path: req.path
  });
};

export class ApiError extends Error implements AppError {
  statusCode: number;
  code: string;
  details?: any;

  constructor(statusCode: number, code: string, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Convenience error creators
export const BadRequestError = (message: string, details?: any) => 
  new ApiError(400, 'BAD_REQUEST', message, details);

export const UnauthorizedError = (message: string = 'Unauthorized') => 
  new ApiError(401, 'UNAUTHORIZED', message);

export const ForbiddenError = (message: string = 'Forbidden') => 
  new ApiError(403, 'FORBIDDEN', message);

export const NotFoundError = (resource: string) => 
  new ApiError(404, 'NOT_FOUND', `${resource} not found`);

export const ConflictError = (message: string, details?: any) => 
  new ApiError(409, 'CONFLICT', message, details);

export const ValidationError = (message: string, details?: any) => 
  new ApiError(422, 'VALIDATION_ERROR', message, details);

export const InternalError = (message: string = 'Internal server error') => 
  new ApiError(500, 'INTERNAL_ERROR', message);
