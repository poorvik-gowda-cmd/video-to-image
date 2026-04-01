const dotenv = require('dotenv');
// Load environment variables immediately
dotenv.config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorMiddleware');
const jobRoutes = require('./routes/jobRoutes');
const { redisClient } = require('./config/redisConfig');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(limiter);

// Health Check
app.get('/api/health', async (req, res) => {
  let redisStatus = 'disconnected';
  try {
    // Add a timeout to the redis ping to prevent hanging
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Redis Timeout')), 5000)
    );
    const ping = await Promise.race([redisClient.ping(), timeout]);
    if (ping === 'PONG') redisStatus = 'connected';
  } catch (err) {
    logger.error(`Redis Health Check Failed: ${err.message}`);
  }

  res.status(200).json({
    status: 'UP',
    server: 'online',
    redis: redisStatus,
    tlsEnabled: !!process.env.REDIS_URL?.startsWith('rediss://'),
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.get('/', (req, res) => res.json({ success: true, message: 'Video Processing API is running' }));
app.get('/api', (req, res) => res.json({ success: true, message: 'Video Processing API is running' }));
app.use('/api', jobRoutes);

// Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;

// 🔥 Start worker inside backend (Render free tier workaround)
if (process.env.NODE_ENV !== 'test') {
  require('./worker');
}
