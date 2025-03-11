const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  storageLocation: {
    type: String,
    enum: ['local', 's3'],
    default: 'local'
  },
  publicDomain: {
    type: Boolean,
    default: true
  },
  year: {
    type: Number
  },
  author: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Analytics fields
  views: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // New AI-related fields
  aiGenerated: {
    type: Boolean,
    default: false
  },
  aiDescription: {
    type: String,
    trim: true
  },
  aiTags: [{
    type: String,
    trim: true
  }],
  aiMetadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  exifData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

// Add text index for search
imageSchema.index({ 
  title: 'text', 
  description: 'text', 
  aiDescription: 'text', 
  tags: 'text',
  aiTags: 'text',
  author: 'text'
});

module.exports = mongoose.model('Image', imageSchema);