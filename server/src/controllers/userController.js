const User = require('../models/User');
const Image = require('../models/Image');
const path = require('path');
const fs = require('fs');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's images
    const userImages = await Image.find({ uploadedBy: userId })
      .sort({ createdAt: -1 })
      .select('_id title imageUrl views likes createdAt');
    
    // Calculate total images, views, and likes
    const totalImages = userImages.length;
    const totalViews = userImages.reduce((sum, image) => sum + image.views, 0);
    const totalLikes = userImages.reduce((sum, image) => sum + image.likes.length, 0);
    
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.role === 'admin' ? user.email : undefined,
        bio: user.bio,
        profileImage: user.profileImage,
        socialLinks: user.socialLinks,
        role: user.role,
        createdAt: user.createdAt,
        analytics: {
          totalImages,
          totalViews,
          totalLikes
        }
      },
      images: userImages
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    // Only allow users to update their own profile (or admins can update any)
    if (req.user.role !== 'admin' && req.params.id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }
    
    const {
      username,
      email,
      bio,
      website,
      twitter,
      instagram,
      facebook
    } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields if provided
    if (username && username !== user.username) {
      // Check if username is taken
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id.toString() !== req.params.id) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      user.username = username;
    }
    
    if (email && email !== user.email) {
      // Check if email is taken
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.params.id) {
        return res.status(400).json({ message: 'Email already taken' });
      }
      user.email = email;
    }
    
    // Update bio if provided
    if (bio !== undefined) {
      user.bio = bio;
    }
    
    // Update social links if provided
    user.socialLinks = {
      website: website || user.socialLinks.website,
      twitter: twitter || user.socialLinks.twitter,
      instagram: instagram || user.socialLinks.instagram,
      facebook: facebook || user.socialLinks.facebook
    };
    
    await user.save();
    
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profileImage: user.profileImage,
        socialLinks: user.socialLinks,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload profile image
exports.uploadProfileImage = async (req, res) => {
  try {
    // Only allow users to update their own profile (or admins can update any)
    if (req.user.role !== 'admin' && req.params.id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete old profile image if it's not the default
    if (user.profileImage && user.profileImage !== '/default-avatar.png') {
      const oldImagePath = path.join(__dirname, '../../', user.profileImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    
    // Set new profile image
    user.profileImage = `/uploads/${req.file.filename}`;
    await user.save();
    
    res.json({
      message: 'Profile image updated',
      profileImage: user.profileImage
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};