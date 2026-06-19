import { logger } from '../lib/logger.js';

/**
 * Global error handling middleware.
 * Must be registered LAST in Express (after all routes).
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;

  // Log the error for observability
  logger.error(`[ERROR] ${req.method} ${req.originalUrl} → ${statusCode}: ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    logger.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    status: statusCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Helper to create an error with a custom status code.
 * Usage: throw createError(404, 'Movie not found')
 */
export const createError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.status = statusCode;
  return err;
};
