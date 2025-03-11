const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, admin } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// @route   GET /api/users/:id
// @desc    Get user profile
// @access  Public
router.get('/:id', userController.getUserProfile);

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', auth, userController.updateUserProfile);

// @route   POST /api/users/:id/profile-image
// @desc    Upload profile image
// @access  Private
router.post('/:id/profile-image', auth, upload, userController.uploadProfileImage);

module.exports = router;