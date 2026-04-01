const { Queue } = require('bullmq');
const { redisClient } = require('../config/redisConfig');
const logger = require('../utils/logger');

const videoQueue = new Queue('video-processing', {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

logger.info('Video processing queue initialized');

module.exports = videoQueue;
