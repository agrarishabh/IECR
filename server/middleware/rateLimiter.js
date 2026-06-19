import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter — applied to all /api/* routes.
 * 100 requests per 15 minutes per IP.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 2000, // Very high in development
  standardHeaders: true,  // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

/**
 * Stricter limiter for write operations (POST/PUT/DELETE).
 * 30 requests per 15 minutes per IP.
 */
export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 30 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many write requests from this IP, please try again after 15 minutes.',
  },
});
