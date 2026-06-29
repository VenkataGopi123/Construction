import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import path from 'path';
import fs from 'fs';
import './config/passport';
import { env } from './config/env';
import routes from './routes';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const app = express();

app.set('trust proxy', 1);

const logsDir = path.resolve('logs');
const uploadsDir = path.resolve(env.upload.uploadDir);
[logsDir, uploadsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

app.use(helmet());
app.use(cors({
  origin: env.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const limiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later' },
});
app.use('/api', limiter);

app.use(passport.initialize());

app.use('/uploads', express.static(uploadsDir));

app.use('/api/v1', routes);

app.get('/', (_req, res) => {
  res.json({
    success: true,
    name: 'BuildMaster ERP API',
    version: '1.0.0',
    docs: '/api/v1/health',
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
