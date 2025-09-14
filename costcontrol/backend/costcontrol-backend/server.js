const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { AppDataSource } = require('./data-source');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 4000;

// CORS configuration - Must be first to handle preflight requests
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting - More permissive for development
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // Much higher limit for development
  message: {
    error: 'Too many requests from this IP',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for certain endpoints in development
    if (process.env.NODE_ENV === 'development') {
      return req.path.includes('/api/auth/verify') || req.path.includes('/api/configuracion');
    }
    return false;
  }
});

app.use(limiter);

// Body parsing middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.json());
app.use(cookieParser());

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Import modular routes
const authRoutes = require('./routes/auth');
const centrosCostoRoutes = require('./routes/centrosCosto');
const pagosRoutes = require('./routes/pagos');
const cuentasPorPagarRoutes = require('./routes/cuentasPorPagar');
const configuracionRoutes = require('./routes/configuracion');
const usersRoutes = require('./routes/users');
const proyectosRoutes = require('./routes/proyectos');

// Registrar rutas (auth debe ir primero)
app.use('/api/auth', authRoutes);
app.use('/api/centros-costo', centrosCostoRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/cuentas-por-pagar', cuentasPorPagarRoutes);
app.use('/api/configuracion', configuracionRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/proyectos', proyectosRoutes);

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    console.log('🔄 Initializing database connection...');
    
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connection established successfully');
    }

    const server = app.listen(port, () => {
      console.log('🚀 Cost Control Backend Server Started');
      console.log('===================================');
      console.log(`🌐 Server running on port: ${port}`);
      console.log(`🗄️  Database: SQLite (${process.env.NODE_ENV || 'development'})`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📱 API Base URL: http://localhost:${port}/api`);
      console.log('===================================');
      
      // Log available routes
      console.log('Available API Routes:');
      console.log('📍 POST   /api/auth/verify');
      console.log('📍 GET    /api/health');
      console.log('📍 GET    /api/configuracion');
      console.log('📍 *      /api/centros-costo');
      console.log('📍 *      /api/pagos');
      console.log('📍 *      /api/cuentas-por-pagar');
      console.log('📍 *      /api/users');
      console.log('📍 *      /api/proyectos');
      console.log('===================================');
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('🛑 SIGTERM received, shutting down gracefully...');
      server.close(async () => {
        try {
          if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log('✅ Database connection closed.');
          }
          console.log('✅ Server shut down complete.');
          process.exit(0);
        } catch (err) {
          console.error('❌ Error during shutdown:', err);
          process.exit(1);
        }
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();