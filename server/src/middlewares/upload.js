/**
 * Image Upload Middleware for PublicDomainDay
 * 
 * This middleware handles file uploads, validates them, stores them on disk,
 * and makes the uploaded file available to subsequent route handlers.
 * 
 * Features:
 * - Secure filename generation using crypto
 * - File type validation (images only)
 * - File size limits
 * - Detailed error handling and debugging
 * - Ensures upload directory exists
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images only - now including WebP format
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    return cb(new Error('Only image files are allowed! Supported formats: JPG, PNG, GIF, WebP, SVG'), false);
  }
  
  // Also check MIME type as a secondary validation
  const acceptedMimeTypes = [
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/webp',
    'image/svg+xml'
  ];
  
  if (!acceptedMimeTypes.includes(file.mimetype)) {
    console.log('Rejected file with mime type:', file.mimetype);
    return cb(new Error(`Invalid file type. Got: ${file.mimetype}`), false);
  }
  
  cb(null, true);
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size (increased from 5MB)
  },
  fileFilter: fileFilter
});

// Add middleware to handle file upload errors
const handleUpload = (req, res, next) => {
  // Debug incoming request in detail
  console.log('Handling upload request', {
    method: req.method,
    url: req.originalUrl,
    contentType: req.headers['content-type'],
    bodyLength: Object.keys(req.body || {}).length,
    files: req.files ? 'Has files' : 'No files yet',
    headers: req.headers,
    origin: req.headers.origin,
    referer: req.headers.referer
  });

  // Ensure uploads directory exists
  if (!fs.existsSync(uploadsDir)) {
    console.log('Creating uploads directory:', uploadsDir);
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ 
        message: err instanceof multer.MulterError 
          ? `Upload error: ${err.message}` 
          : 'Could not upload file',
        error: err.message || 'Unknown error'
      });
    }
    
    if (!req.file) {
      console.error('No file received in request');
      
      // Additional debug info for missing file
      console.log('Request body keys:', Object.keys(req.body));
      console.log('Request files:', req.files);
      
      // Check if this is a multipart request
      if (req.headers['content-type']?.includes('multipart/form-data')) {
        console.log('This is a multipart request but no file was received');
      } else {
        console.log('This is NOT a multipart/form-data request which is required');
      }
      
      return res.status(400).json({ 
        message: 'No file received. Make sure you\'re sending a file with the field name "image".',
        requestContentType: req.headers['content-type']
      });
    }
    
    console.log('File uploaded successfully:', req.file);
    next();
  });
};

module.exports = handleUpload;