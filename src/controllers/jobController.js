const jobService = require('../services/jobService');
const videoQueue = require('../queue/videoQueue');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

class JobController {
  async uploadVideo(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const job = await jobService.createJob(req.file.filename);
      
      await videoQueue.add('process-video', {
        jobId: job.id,
        filePath: req.file.path,
        fileName: req.file.filename,
      });

      logger.info(`Job created: ${job.id} for file: ${req.file.filename}`);

      res.status(201).json({
        success: true,
        message: 'Video uploaded and job queued',
        jobId: job.id,
      });
    } catch (error) {
      next(error);
    }
  }

  async getJobStatus(req, res, next) {
    try {
      const { jobId } = req.params;
      const job = await jobService.getJobById(jobId);

      if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found' });
      }

      res.status(200).json({
        success: true,
        status: job.status,
        fileName: job.fileName,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        error: job.error,
      });
    } catch (error) {
      next(error);
    }
  }

  async downloadResults(req, res, next) {
    try {
      const { jobId } = req.params;
      const job = await jobService.getJobById(jobId);

      if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found' });
      }

      if (job.status !== 'COMPLETED') {
        return res.status(400).json({ 
          success: false, 
          message: `Job is currently ${job.status}. Download only available when COMPLETED.` 
        });
      }

      const processedDir = process.env.PROCESSED_DIR || 'processed';
      const zipPath = path.join(process.cwd(), processedDir, jobId, 'output.zip');

      if (!fs.existsSync(zipPath)) {
        return res.status(404).json({ success: false, message: 'Result file not found on server' });
      }

      res.download(zipPath, `frames_${jobId}.zip`);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new JobController();
