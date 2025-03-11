const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const { auth, admin } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// @route   GET /api/images
// @desc    Get all images with pagination
// @access  Public
router.get('/', imageController.getAllImages);

// @route   GET /api/images/trending
// @desc    Get trending images sorted by download count
// @access  Public
router.get('/trending', imageController.getTrendingImages);

// @route   GET /api/images/categories
// @desc    Get popular categories/tags used in images
// @access  Public
router.get('/categories', imageController.getPopularCategories);

// @route   GET /api/images/ai-search
// @desc    AI-powered concierge search with natural language understanding
// @access  Public
router.get('/ai-search', imageController.aiConciergeSearch);

// @route   GET /api/images/:id
// @desc    Get image by ID
// @access  Public
router.get('/:id', imageController.getImageById);

// @route   POST /api/images
// @desc    Upload a new image
// @access  Public (simplified for now)
router.post('/', upload, imageController.uploadImage);

// @route   PUT /api/images/:id
// @desc    Update image details
// @access  Public (simplified for now)
router.put('/:id', imageController.updateImage);

// @route   DELETE /api/images/:id
// @desc    Delete an image
// @access  Public (simplified for now)
router.delete('/:id', imageController.deleteImage);

// @route   POST /api/images/:id/like
// @desc    Like or unlike an image
// @access  Public (simplified for now - just increments like count)
router.post('/:id/like', imageController.toggleLike);

// @route   POST /api/images/:id/analyze
// @desc    Reanalyze an image with AI
// @access  Public (simplified for now)
router.post('/:id/analyze', imageController.reanalyzeImage);

// @route   GET /api/images/:id/download
// @desc    Download an image and track download count
// @access  Public
router.get('/:id/download', imageController.downloadImage);

module.exports = router;