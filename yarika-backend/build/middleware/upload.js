// middleware/upload.js
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary } = require("../config/cloudinary");

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed!'), false);
  }

  // Check file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    return cb(new Error('File size too large! Maximum size is 10MB.'), false);
  }

  cb(null, true);
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "yarika-products",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ width: 640, height: 700, crop: "limit" }],
  },
});

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files (1 main + 4 additional)
  }
});

// Error handling middleware
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'File size should not exceed 10MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: 'Maximum 5 files allowed (1 main + 4 additional)'
      });
    }
    return res.status(400).json({
      error: 'Upload error',
      message: err.message
    });
  }
  
  if (err.message === 'Only image files are allowed!') {
    return res.status(400).json({
      error: 'Invalid file type',
      message: err.message
    });
  }

  console.error('Upload error:', err);
  return res.status(500).json({
    error: 'Upload failed',
    message: 'Failed to upload file to storage'
  });
};

module.exports = {
  upload,
  handleUploadError
};
