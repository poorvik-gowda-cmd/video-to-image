const dotenv = require('dotenv');
const logger = require('./utils/logger');
const videoWorker = require('./workers/videoWorker');

// Load environment variables
dotenv.config();

logger.info('Video Processing Worker process started');

// Handle process termination
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
