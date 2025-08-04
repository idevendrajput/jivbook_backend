const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String, // For video thumbnails
  },
  order: {
    type: Number,
    default: 0
  }
}, { _id: false });

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  caption: {
    type: String,
    maxlength: 2000
  },
  media: [mediaSchema],
  location: {
    name: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String], // hashtags
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Index for efficient queries
postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ 'likes.user': 1 });
postSchema.index({ tags: 1 });

// Virtual for formatted creation date
postSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return this.createdAt.toLocaleDateString();
});

// Check if user has liked the post
postSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
};

// Add like
postSchema.methods.addLike = function(userId) {
  if (!this.isLikedBy(userId)) {
    this.likes.push({ user: userId });
    this.likesCount = this.likes.length;
  }
};

// Remove like
postSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
  this.likesCount = this.likes.length;
};

module.exports = mongoose.model('Post', postSchema);
