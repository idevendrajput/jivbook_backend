const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Notification Metadata
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  body: {
    type: String,
    required: true,
    maxlength: 500
  },
  image: {
    type: String, // Image URL for rich notifications
    default: null
  },
  
  // Targeting
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null means broadcast to all users
  },
  
  // Categorization
  type: {
    type: String,
    enum: [
      'system',        // System announcements
      'pet_inquiry',   // Pet related notifications
      'chat',          // Chat messages
      'follow',        // Follow requests/activity
      'post',          // Post likes/comments
      'promotion',     // Marketing/promotional
      'admin',         // Admin announcements
      'custom'         // Custom notifications
    ],
    required: true
  },
  
  category: {
    type: String,
    enum: ['info', 'warning', 'success', 'error', 'promotional'],
    default: 'info'
  },
  
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'critical'],
    default: 'normal'
  },
  
  // Payload Data
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Deep linking
  actionUrl: {
    type: String,
    default: null
  },
  
  // Targeting Filters
  targetFilters: {
    platform: [String],      // ['android', 'ios', 'web']
    userTypes: [String],      // ['premium', 'regular', 'admin']
    locations: [String],      // Geographic targeting
    petCategories: [String],  // Pet category interests
    ageRange: {
      min: Number,
      max: Number
    }
  },
  
  // Scheduling
  scheduledFor: {
    type: Date,
    default: null
  },
  
  expiresAt: {
    type: Date,
    default: null
  },
  
  // Delivery Status
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled'],
    default: 'draft'
  },
  
  // Analytics
  deliveryStats: {
    totalTargeted: { type: Number, default: 0 },
    successfulDeliveries: { type: Number, default: 0 },
    failedDeliveries: { type: Number, default: 0 },
    openRate: { type: Number, default: 0 },
    clickRate: { type: Number, default: 0 }
  },
  
  // Admin Info
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Firebase specific
  messageId: {
    type: String,
    default: null
  },
  
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ createdBy: 1 });
notificationSchema.index({ expiresAt: 1 });

// Virtual for checking if notification is expired
notificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

// Method to update delivery stats
notificationSchema.methods.updateDeliveryStats = function(stats) {
  this.deliveryStats = { ...this.deliveryStats, ...stats };
  return this.save();
};

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    recipient: userId,
    isRead: false,
    status: 'sent',
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  });
};

module.exports = mongoose.model('Notification', notificationSchema);
