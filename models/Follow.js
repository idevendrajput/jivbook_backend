const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  following: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'blocked'],
    default: 'accepted' // For public profiles, auto-accept
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate follows and for efficient queries
followSchema.index({ follower: 1, following: 1 }, { unique: true });
followSchema.index({ follower: 1, status: 1 });
followSchema.index({ following: 1, status: 1 });

// Prevent self-follow
followSchema.pre('save', function(next) {
  if (this.follower.toString() === this.following.toString()) {
    const error = new Error('Users cannot follow themselves');
    return next(error);
  }
  next();
});

module.exports = mongoose.model('Follow', followSchema);
