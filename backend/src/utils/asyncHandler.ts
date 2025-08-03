import { Request, Response, NextFunction } from 'express';

/**
 * Wrap async route handlers to automatically catch errors
 */
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};
