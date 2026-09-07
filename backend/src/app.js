import express from 'express';
import cors from 'cors';
import { mockAuth } from './middleware/mockAuth.js';
import { errorHandler } from './middleware/errorHandler.js';

import userRoutes from './routes/userRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import shareRoutes from './routes/shareRoutes.js';
import importRoutes from './routes/importRoutes.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global Mock Authentication Middleware
app.use(mockAuth);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'DocSpace API Engine'
  });
});

// REST API Routes
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/documents', shareRoutes);
app.use('/api/import', importRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Route '${req.originalUrl}' not found.` });
});

// Global Error Handler
app.use(errorHandler);

export default app;
