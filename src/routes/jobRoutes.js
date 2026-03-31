const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const upload = require('../middleware/uploadMiddleware');

// @route   POST /api/upload
// @desc    Upload a video and create a processing job
router.post('/upload', upload.single('video'), jobController.uploadVideo);

// @route   GET /api/status/:jobId
// @desc    Check job status
router.get('/status/:jobId', jobController.getJobStatus);

// @route   GET /api/download/:jobId
// @desc    Download processed frames ZIP
router.get('/download/:jobId', jobController.downloadResults);

module.exports = router;
