const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  petListing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: false
  },
  chatType: {
    type: String,
    enum: ['pet_inquiry', 'general', 'direct'],
    default: 'direct'
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageTime: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // For blocking functionality
  blockedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Metadata
  unreadCount: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    count: {
      type: Number,
      default: 0
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
chatSchema.index({ participants: 1 });
chatSchema.index({ petListing: 1 });
chatSchema.index({ lastMessageTime: -1 });

// Virtual to check if chat is blocked for a user
chatSchema.virtual('isBlockedForUser').get(function() {
  return (userId) => this.blockedBy.includes(userId);
});

// Method to add participant
chatSchema.methods.addParticipant = function(userId) {
  if (!this.participants.includes(userId)) {
    this.participants.push(userId);
  }
  return this.save();
};

// Method to increment unread count
chatSchema.methods.incrementUnreadCount = function(userId) {
  const userUnread = this.unreadCount.find(u => u.userId.toString() === userId.toString());
  if (userUnread) {
    userUnread.count += 1;
  } else {
    this.unreadCount.push({ userId, count: 1 });
  }
  return this.save();
};

// Method to reset unread count
chatSchema.methods.resetUnreadCount = function(userId) {
  const userUnread = this.unreadCount.find(u => u.userId.toString() === userId.toString());
  if (userUnread) {
    userUnread.count = 0;
  }
  return this.save();
};

module.exports = mongoose.model('Chat', chatSchema);
