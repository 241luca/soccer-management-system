import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

// Check if rate limiting is enabled (disabled in development by default)
const RATE_LIMIT_ENABLED = process.env.RATE_LIMIT_ENABLED === 'true' || false;

// Dummy middleware that does nothing (for development)
const noOpMiddleware = (req: Request, res: Response, next: NextFunction) => {
  next();
};

// General rate limiter
export const rateLimiter = RATE_LIMIT_ENABLED ? rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'), // increased to 1000 requests
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
}) : noOpMiddleware;

// Strict rate limiter for auth endpoints
export const authRateLimiter = RATE_LIMIT_ENABLED ? rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // increased to 100 requests
  message: {
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
}) : noOpMiddleware;

// File upload rate limiter
export const uploadRateLimiter = RATE_LIMIT_ENABLED ? rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // increased to 50 upload requests
  message: {
    error: {
      code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
      message: 'Too many upload requests, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
}) : noOpMiddleware;

// Admin function to toggle rate limiting (to be used by super admin)
export const toggleRateLimit = (enabled: boolean) => {
  process.env.RATE_LIMIT_ENABLED = enabled ? 'true' : 'false';
  console.log(`Rate limiting ${enabled ? 'enabled' : 'disabled'}`);
};

// Get current rate limit status
export const getRateLimitStatus = () => {
  return {
    enabled: RATE_LIMIT_ENABLED,
    settings: {
      general: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000')
      },
      auth: {
        windowMs: 15 * 60 * 1000,
        maxRequests: 100
      },
      upload: {
        windowMs: 15 * 60 * 1000,
        maxRequests: 50
      }
    }
  };
};
