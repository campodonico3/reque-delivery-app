import 'dotenv/config';
import express, { type Express } from "express";
import type { Request, Response } from "express";
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Importar routes
import authRoutes from './routes/auth.js';
import restaurantCategoriesRoutes from './routes/restaurantCategories.js';

const app:Express = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad
app.use(helmet());

// Rate limiting 
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana de tiempo
  message: {
    success: false,
    message: 'Demasiadas solicitudes, intenta de nuevo más tarde'
  }
});

app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tu-app.com'] 
    : true, // En desarrollo permite cualquier origin
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurant-categories', restaurantCategoriesRoutes);

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from TypeScript Express server!");
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// 404 handler
/* app.use('/', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});
 */


app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

