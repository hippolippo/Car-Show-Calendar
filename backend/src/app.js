// T027: Express app setup with middleware, routes, and error handling
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler, notFound } from './api/middleware/errorHandler.js';

dotenv.config();

const app = express();

// CORS configuration
const isDevelopment = process.env.NODE_ENV !== 'production';

// Parse CORS_ORIGIN - supports comma-separated list
const corsOriginEnv = process.env.CORS_ORIGIN || '';
const corsOrigins = corsOriginEnv.split(',').map(origin => origin.trim()).filter(Boolean);

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...corsOrigins
].filter(Boolean);

// Log allowed origins on startup for debugging
if (process.env.NODE_ENV === 'production') {
  console.log('🔒 CORS allowed origins:', allowedOrigins);
  console.log('🔒 Allow Vercel previews:', process.env.ALLOW_VERCEL_PREVIEWS === 'true');
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins from the local network
    if (isDevelopment && origin.startsWith('http://192.168.')) {
      return callback(null, true);
    }
    
    // Check exact match
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // In production, allow all *.vercel.app subdomains if enabled
    if (process.env.ALLOW_VERCEL_PREVIEWS === 'true' && origin?.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    console.log('CORS blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // Allow cookies
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files (uploaded images)
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// T060 & T119: Mount API routes
import authRoutes from './api/routes/authRoutes.js';
import eventRoutes from './api/routes/eventRoutes.js';
import rsvpRoutes from './api/routes/rsvpRoutes.js';
import uploadRoutes from './api/routes/uploadRoutes.js';

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/rsvps', rsvpRoutes);
app.use('/api/v1/upload', uploadRoutes);

// 404 handler
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
