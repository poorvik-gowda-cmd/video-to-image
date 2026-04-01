const Redis = require('ioredis');
const logger = require('../utils/logger');

let redisClient;

const redisOptions = {

  maxRetriesPerRequest: null,
  enableReadyCheck: false, // Recommended for BullMQ
};

if (process.env.REDIS_URL) {
  // Production / Upstash
  if (process.env.REDIS_URL.startsWith('rediss://')) {
    redisOptions.tls = { rejectUnauthorized: false };
  }
  redisClient = new Redis(process.env.REDIS_URL, redisOptions);
} else {
  // Local Development
  redisClient = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    ...redisOptions,
  });
}

redisClient.on('connect', () => logger.info('✅ Redis connected successfully'));
redisClient.on('error', (err) => logger.error(`❌ Redis connection error: ${err.message}`));


module.exports = { redisClient };

