const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { auth, admin } = require('../middlewares/auth');

// Public routes
router.get('/', blogController.getPosts);
router.get('/:id', blogController.getPostById);

// Admin-only routes - uses both auth and admin middleware
router.post('/', auth, admin, blogController.createPost);
router.put('/:id', auth, admin, blogController.updatePost);
router.delete('/:id', auth, admin, blogController.deletePost);

module.exports = router;