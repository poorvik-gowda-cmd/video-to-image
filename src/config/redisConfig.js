// config/redisConfig.js
const Redis = require('ioredis');
require('dotenv').config();

let redisClient;

if (process.env.REDIS_URL) {
  const options = { maxRetriesPerRequest: null }; // Needed for BullMQ stability
  if (process.env.REDIS_URL.startsWith('rediss://')) {
    options.tls = { rejectUnauthorized: false };
  }
  redisClient = new Redis(process.env.REDIS_URL, options);
} else {
  // Fallback to local Redis if running locally
  redisClient = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
  });
}

redisClient.on('connect', () => console.log('Redis connected'));
redisClient.on('error', (err) => console.error('Redis error:', err));

module.exports = { redisClient };

