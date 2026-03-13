// T025: Error handling middleware

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware
 */
export function errorHandler(err, req, res, next) {
  // Default to 500 server error
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected error occurred';
  let details = err.details || null;
  
  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      code,
      message,
      stack: err.stack,
      details
    });
  }
  
  // PostgreSQL error handling
  if (err.code && err.code.startsWith('23')) {
    // PostgreSQL constraint violation
    if (err.code === '23505') {
      statusCode = 409;
      code = 'CONFLICT';
      message = 'Resource already exists';
      details = { constraint: err.constraint };
    } else if (err.code === '23503') {
      statusCode = 400;
      code = 'FOREIGN_KEY_VIOLATION';
      message = 'Referenced resource does not exist';
    }
  }
  
  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'An unexpected error occurred';
    details = null;
  }
  
  res.status(statusCode).json({
    error: {
      code,
      message,
      ...(details && { details })
    }
  });
}

/**
 * 404 handler for undefined routes
 */
export function notFound(req, res) {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`
    }
  });
}

/**
 * Async handler wrapper to catch errors in async routes
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default { errorHandler, notFound, asyncHandler, AppError };
