const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

wishlistSchema.index({ user: 1, pet: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
