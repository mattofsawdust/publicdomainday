const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  blogPost: {
    type: Schema.Types.ObjectId,
    ref: 'BlogPost',
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  guestName: {
    type: String,
    trim: true
  },
  guestEmail: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'spam'],
    default: 'pending'
  },
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  likes: {
    type: Number,
    default: 0
  },
  approved: {
    type: Boolean,
    default: false
  },
  ipAddress: String,
  userAgent: String
}, { timestamps: true });

// Ensure either an authenticated user or guest information
CommentSchema.pre('save', function(next) {
  if (!this.author && (!this.guestName || !this.guestEmail)) {
    return next(new Error('Comment must have either an authenticated author or guest information'));
  }
  next();
});

module.exports = mongoose.model('Comment', CommentSchema);