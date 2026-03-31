const Redis = require('ioredis');
require('dotenv').config();

// If REDIS_URL exists → use cloud (Render / Upstash)
// Otherwise → fallback to local Redis
const redisConfig = process.env.REDIS_URL
  ? {
      connection: {
        url: process.env.REDIS_URL,
      },
    }
  : {
      connection: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
      },
    };

// Create client (for direct Redis usage if needed)
const redisClient = new Redis(
  process.env.REDIS_URL
    ? process.env.REDIS_URL
    : {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
      }
);

// Important for BullMQ stability
redisClient.options.maxRetriesPerRequest = null;

module.exports = {
  redisClient,
  redisConfig,
};
