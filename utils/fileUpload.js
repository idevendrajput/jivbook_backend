const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Base upload directory (parallel to app directory)
const BASE_UPLOAD_DIR = process.env.NODE_ENV === 'production' 
  ? '/var/www/jivbook_files' 
  : path.join(__dirname, '../../uploads');

// Create upload directories if they don't exist
const createUploadDirs = () => {
  const dirs = [
    BASE_UPLOAD_DIR,
    path.join(BASE_UPLOAD_DIR, 'pets'),
    path.join(BASE_UPLOAD_DIR, 'profiles'),
    path.join(BASE_UPLOAD_DIR, 'audio'),
    path.join(BASE_UPLOAD_DIR, 'temp')
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

// Initialize directories
createUploadDirs();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = BASE_UPLOAD_DIR;
    
    // Determine upload path based on file type or route
    if (req.route.path.includes('/pets')) {
      uploadPath = path.join(BASE_UPLOAD_DIR, 'pets');
    } else if (req.route.path.includes('/profile')) {
      uploadPath = path.join(BASE_UPLOAD_DIR, 'profiles');
    } else if (file.mimetype.startsWith('audio/')) {
      uploadPath = path.join(BASE_UPLOAD_DIR, 'audio');
    } else {
      uploadPath = path.join(BASE_UPLOAD_DIR, 'temp');
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedImages = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedAudio = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
  const allowedTypes = [...allowedImages, ...allowedAudio];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files
  }
});

// Utility function to delete file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filePath}`);
      return true;
    }
  } catch (error) {
    console.error(`Error deleting file: ${filePath}`, error);
    return false;
  }
};

// Utility function to get file URL
const getFileUrl = (filename, type = 'pets') => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/uploads/${type}/${filename}`;
};

// Middleware to handle upload errors
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 10MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 10 files allowed.'
      });
    }
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error'
    });
  }
  
  next();
};

module.exports = {
  upload,
  deleteFile,
  getFileUrl,
  handleUploadError,
  BASE_UPLOAD_DIR
};
