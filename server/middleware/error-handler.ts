import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

// Error types
export class GameError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'GameError';
  }
}

export class ValidationError extends GameError {
  constructor(message: string, details?: any) {
    super(400, message, 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends GameError {
  constructor(resource: string = 'Resource') {
    super(404, `${resource} not found`, 'NOT_FOUND');
  }
}

export class InsufficientResourcesError extends GameError {
  constructor(resource: string) {
    super(400, `Insufficient ${resource}`, 'INSUFFICIENT_RESOURCES');
  }
}

export class InvalidOperationError extends GameError {
  constructor(message: string) {
    super(400, message, 'INVALID_OPERATION');
  }
}

// Error handler middleware
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error occurred:', {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Handle known error types
  if (err instanceof GameError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      details: err.details
    });
  }

  // Handle Zod validation errors
  if (err instanceof z.ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: err.errors
    });
  }

  // Handle database errors
  if (err.name === 'PostgresError') {
    console.error('Database error:', err);
    return res.status(500).json({
      error: 'Database error occurred',
      code: 'DATABASE_ERROR'
    });
  }

  // Handle unknown errors
  res.status(500).json({
    error: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'An unexpected error occurred',
    code: 'INTERNAL_ERROR'
  });
}

// Async error wrapper
export function asyncHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return (...args: T): Promise<R> => {
    return Promise.resolve(fn(...args)).catch(args[args.length - 1]);
  };
}

// Request logging middleware
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const isError = res.statusCode >= 400;
    
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent'),
      ip: req.ip
    };

    if (isError) {
      console.error('Request error:', logData);
    } else if (req.path.startsWith('/api')) {
      console.log('API request:', logData);
    }
  });

  next();
}