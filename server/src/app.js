import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { getConfig } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { HttpError } from './utils/HttpError.js';

export function createApp() {
  const config = getConfig();
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      if (!origin || config.allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new HttpError(403, 'Origin is not allowed'));
    },
    credentials: true,
  }));
  app.use(express.json({ limit: '16kb' }));
  app.use(cookieParser());
  app.use(rateLimit({ windowMs: 60 * 1000, limit: 120, standardHeaders: 'draft-7', legacyHeaders: false }));

  app.use((req, _res, next) => {
    const origin = req.get('origin');
    if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method) && origin && !config.allowedOrigins.includes(origin)) {
      return next(new HttpError(403, 'Origin is not allowed'));
    }
    next();
  });

  app.get('/api/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));
  app.use('/api/auth', authRoutes);
  app.use('/api/notes', noteRoutes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
