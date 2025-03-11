/**
 * Main server entry point for PublicDomainDay
 * 
 * This Express application serves the backend API for the PublicDomainDay platform,
 * handling authentication, image uploads, metadata, and user management.
 * 
 * The server communicates with a MongoDB database for data persistence and
 * exposes RESTful API endpoints that the React frontend consumes.
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const imagesRoutes = require('./routes/images');
const usersRoutes = require('./routes/users');
const blogRoutes = require('./routes/blog');

const app = express();
const PORT = process.env.PORT || 5000;

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Configure CORS to allow all origins during development
app.use((req, res, next) => {
  // CORS headers
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Content Security Policy headers
  res.header('Content-Security-Policy', "default-src 'self'; img-src 'self' http://localhost:3001 http://localhost:5001 data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self' http://localhost:3001 http://localhost:5001");
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '../public')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/images', imagesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/blog', blogRoutes);

// We'll let the frontend development server handle React routing

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Test routes with no middleware
app.get('/api/test-cors', (req, res) => {
  res.json({ message: 'CORS is working properly!' });
});

app.get('/api/open-test', (req, res) => {
  res.json({ message: 'This is an open route with no middleware' });
});

app.post('/api/open-test', (req, res) => {
  console.log('Open test POST body:', req.body);
  res.json({ 
    message: 'POST successful', 
    receivedData: req.body 
  });
});

// Test file upload route with no middleware
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/api/test-upload', upload.single('image'), (req, res) => {
  console.log('Test upload received:', req.file);
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  res.json({
    message: 'File uploaded successfully',
    file: req.file
  });
});

// No longer redirecting client-side routes to avoid interfering with React Router

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});