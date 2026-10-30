import { HttpError } from '../utils/HttpError.js';

export function notFound(_req, _res, next) {
  next(new HttpError(404, 'Route not found'));
}

export function errorHandler(error, _req, res, _next) {
  if (res.headersSent) return;
  if (error?.name === 'ValidationError') {
    const errors = Object.values(error.errors).map((item) => ({ field: item.path, message: item.message }));
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  if (error?.code === 11000) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists' });
  }
  if (error?.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid resource identifier' });
  }
  const status = error instanceof HttpError ? error.status : 500;
  const message = status === 500 ? 'Something went wrong. Please try again.' : error.message;
  const response = { success: false, message };
  if (error instanceof HttpError && error.errors) response.errors = error.errors;
  if (process.env.NODE_ENV !== 'production' && status === 500) response.debug = error.message;
  return res.status(status).json(response);
}
