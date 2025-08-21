const mongoose = require('mongoose');

const deviceTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  platform: {
    type: String,
    enum: ['android', 'ios', 'web'],
    required: true
  },
  deviceId: {
    type: String,
    required: true
  },
  deviceInfo: {
    model: String,
    version: String,
    brand: String,
    osVersion: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
deviceTokenSchema.index({ user: 1 });
deviceTokenSchema.index({ token: 1 });
deviceTokenSchema.index({ platform: 1 });
deviceTokenSchema.index({ isActive: 1 });

// Method to update last used timestamp
deviceTokenSchema.methods.updateLastUsed = function() {
  this.lastUsed = new Date();
  return this.save();
};

module.exports = mongoose.model('DeviceToken', deviceTokenSchema);
