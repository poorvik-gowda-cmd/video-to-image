const { Worker } = require('bullmq');
const { redisConfig } = require('../config/redisConfig');
const jobService = require('../services/jobService');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const logger = require('../utils/logger');

const PROCESSED_DIR = process.env.PROCESSED_DIR || 'processed';

const videoWorker = new Worker(
  'video-processing',
  async (job) => {
    const { jobId, filePath, fileName } = job.data;
    const jobFolder = path.join(process.cwd(), PROCESSED_DIR, jobId);
    const framesFolder = path.join(jobFolder, 'frames');

    try {
      logger.info(`Processing job: ${jobId}`);
      await jobService.updateJobStatus(jobId, 'PROCESSING');

      // Create folders
      if (!fs.existsSync(jobFolder)) fs.mkdirSync(jobFolder, { recursive: true });
      if (!fs.existsSync(framesFolder)) fs.mkdirSync(framesFolder, { recursive: true });

      // Frame extraction
      await new Promise((resolve, reject) => {
        ffmpeg(filePath)
          .on('progress', (progress) => {
            if (progress.percent) {
              job.updateProgress(Math.round(progress.percent));
            }
          })
          .on('error', (err) => {
            logger.error(`FFmpeg error: ${err.message}`);
            reject(err);
          })
          .on('end', () => {
            logger.info(`Frames extracted for job: ${jobId}`);
            resolve();
          })
          .output(path.join(framesFolder, 'frame_%04d.png'))
          .fps(1) // Extract 1 frame per second
          .run();
      });

      // Zipping
      await new Promise((resolve, reject) => {
        const output = fs.createWriteStream(path.join(jobFolder, 'output.zip'));
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
          logger.info(`ZIP created for job: ${jobId} (${archive.pointer()} total bytes)`);
          resolve();
        });

        archive.on('error', (err) => {
          logger.error(`Archiver error: ${err.message}`);
          reject(err);
        });

        archive.pipe(output);
        archive.directory(framesFolder, false);
        archive.finalize();
      });

      // Cleanup frames folder after zipping to save space
      fs.rmSync(framesFolder, { recursive: true, force: true });
      // Optionally cleanup original video
      // fs.unlinkSync(filePath);

      await jobService.updateJobStatus(jobId, 'COMPLETED');
      logger.info(`Job completed: ${jobId}`);
    } catch (error) {
      logger.error(`Worker failed job: ${jobId} with error: ${error.message}`);
      await jobService.updateJobStatus(jobId, 'FAILED', error.message);
      throw error;
    }
  },
  { connection: redisConfig, concurrency: 1 }
);

videoWorker.on('completed', (job) => {
  logger.info(`Worker finished processing ${job.id}`);
});

videoWorker.on('failed', (job, err) => {
  logger.error(`Worker failed processing ${job.id}: ${err.message}`);
});

module.exports = videoWorker;
