import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import routes
import authRoutes from '../src/routes/auth.js';
import codeRoutes from '../src/routes/codes.js';
import patientRoutes from '../src/routes/patients.js';
import auditRoutes from '../src/routes/audit.js';
import userRoutes from '../src/routes/users.js';

// Import middleware
import { errorHandler } from '../src/middleware/errorHandler.js';
import { rateLimiter } from '../src/middleware/rateLimiter.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Updated CORS configuration for production
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://codeveda-frontend.vercel.app',
        process.env.FRONTEND_URL || 'https://codeveda-frontend.vercel.app',
        'https://*.vercel.app',
        /https:\/\/.*\.vercel\.app$/
      ]
    : [
        'http://localhost:5173', 
        'http://localhost:5174', 
        'http://localhost:5175', 
        'http://localhost:3000'
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Conditional logging for serverless
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('combined'));
} else {
  // Simplified logging for serverless
  app.use(morgan('short'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting (adjusted for serverless)
app.use(rateLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'CodeVeda API is running on Vercel Serverless',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'CodeVeda API is running on Vercel Serverless',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/health',
      '/api/auth',
      '/api/codes',
      '/api/patients',
      '/api/audit',
      '/api/users'
    ]
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/codes', codeRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/users', userRoutes);

// 404 handler for all unmatched routes
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      '/api/health',
      '/api/auth',
      '/api/codes', 
      '/api/patients',
      '/api/audit',
      '/api/users'
    ]
  });
});

// Error handling middleware
app.use(errorHandler);

// Export the Express app for Vercel serverless functions
export default app;