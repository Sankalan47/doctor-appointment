// server/src/app.ts
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createStream } from 'rotating-file-stream';
import path from 'path';
import { errorHandler, notFound } from './middleware/error.middleware';
import config from './config';
import routes from './routes';

// Create a rotating write stream for access logs
const accessLogStream = createStream('access.log', {
  interval: '1d',
  path: path.join(__dirname, '../logs'),
});

const app: Application = express();

// Security middleware
app.use(cors(config.corsOptions));
app.use(helmet());
app.use(compression());

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: accessLogStream }));
}

// API Routes
app.use('/api/v1', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
