const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

// ✅ UPDATED FILE FILTER (robust version)
const fileFilter = (req, file, cb) => {
  console.log("MIME TYPE:", file.mimetype); // debug

  const isVideoMime = file.mimetype.startsWith('video/');
  const isVideoExt = /\.(mp4|mkv|avi|mov|wmv|flv|webm)$/i.test(file.originalname);

  if (isVideoMime || isVideoExt) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only video files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024, // Default 100MB
  },
});

module.exports = upload;
