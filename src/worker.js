require('dotenv').config();
const videoWorker = require('./workers/videoWorker');
const logger = require('./utils/logger');

logger.info('Video Processing Worker process started inside backend');

// Handle process termination gracefully
process.on('SIGINT', async () => {
  logger.info('Shutting down worker...');
  await videoWorker.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down worker...');
  await videoWorker.close();
  process.exit(0);
});

module.exports = videoWorker;
