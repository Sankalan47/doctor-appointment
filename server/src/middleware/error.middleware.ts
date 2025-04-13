// server/src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'sequelize';
import { ErrorResponse } from '../types';
import logger from '../utils/logger';
import config from '../config';

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
): void => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;
  let errors: Record<string, string[]> | undefined;

  // Log the error
  logger.error(`${req.method} ${req.url} ${statusCode} - ${err.message}`);

  // Handle Sequelize validation errors
  if (err instanceof ValidationError) {
    statusCode = 400;
    message = 'Validation Error';
    errors = {};
    err.errors.forEach(error => {
      const path = error.path || 'unknown';
      if (!errors![path]) {
        errors![path] = [];
      }
      errors![path].push(error.message);
    });
  }

  res.status(statusCode).json({
    message,
    ...(config.env === 'development' && { stack: err.stack }),
    ...(errors && { errors }),
  });
};
