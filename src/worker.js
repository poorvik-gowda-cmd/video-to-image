require('dotenv').config();
const { Worker } = require('bullmq');
const { redisConfig } = require('./config/redisConfig');
const videoProcessor = require('./workers/videoWorker');
const logger = require('./utils/logger');

// Create worker
const worker = new Worker(
  'video-processing',
  async (job) => {
    logger.info(`Processing job ${job.id}`);
    return await videoProcessor(job);
  },
  redisConfig
);

// Logs
worker.on('completed', (job) => {
  logger.info(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  logger.error(`Job ${job?.id} failed: ${err.message}`);
});

worker.on('error', (err) => {
  logger.error(`Worker error: ${err.message}`);
});

logger.info('Worker started inside backend');

module.exports = worker;
