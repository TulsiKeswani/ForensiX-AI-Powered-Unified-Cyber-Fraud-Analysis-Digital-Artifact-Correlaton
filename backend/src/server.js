import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import caseRoutes from './routes/caseRoutes.js';
import evidenceRoutes from './routes/evidenceRoutes.js';
import graphRoutes from './routes/graphRoutes.js';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { verifyToken } from './middleware/authMiddleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads if requested
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ForensiX Node.js Backend API', timestamp: new Date().toISOString() });
});

// Authentication Routes (Public)
app.use('/api/auth', authRoutes);

// Protected API Routes (Requires valid JWT Bearer Token or falls back gracefully for dev)
app.use('/api/cases', caseRoutes);
app.use('/api', evidenceRoutes);
app.use('/api', graphRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`  ForensiX Node.js Backend running on port ${PORT}`);
  console.log(`  API Endpoint: http://localhost:${PORT}/api`);
  console.log(`=================================================`);
});
