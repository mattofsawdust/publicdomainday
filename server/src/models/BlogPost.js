const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Simplified BlogPost schema for HTML updates
const BlogPostSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String, // HTML content
    required: true
  },
  published: {
    type: Boolean,
    default: true
  },
  pinned: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('BlogPost', BlogPostSchema);