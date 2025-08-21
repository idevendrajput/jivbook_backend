const notificationService = require('../services/notificationService');
const DeviceToken = require('../models/DeviceToken');
const Notification = require('../models/Notification');
const BaseResponse = require('../models/BaseResponse');
const { upload, handleUploadError } = require('../utils/fileUpload');

const notificationController = {
  /**
   * Register device token for FCM
   */
  registerDevice: async (req, res) => {
    try {
      const { token, platform, deviceId, deviceInfo } = req.body;
      const userId = req.user.id;

      if (!token || !platform || !deviceId) {
        return res.status(400).json(
          BaseResponse.error('Token, platform, and deviceId are required')
        );
      }

      // Check if device token already exists
      let deviceToken = await DeviceToken.findOne({ token });

      if (deviceToken) {
        // Update existing token
        deviceToken.user = userId;
        deviceToken.platform = platform;
        deviceToken.deviceId = deviceId;
        deviceToken.deviceInfo = deviceInfo || {};
        deviceToken.isActive = true;
        deviceToken.lastUsed = new Date();
        await deviceToken.save();
      } else {
        // Create new device token
        deviceToken = new DeviceToken({
          user: userId,
          token,
          platform,
          deviceId,
          deviceInfo: deviceInfo || {},
          isActive: true
        });
        await deviceToken.save();
      }

      // Deactivate other tokens for same device
      await DeviceToken.updateMany(
        {
          user: userId,
          deviceId,
          token: { $ne: token }
        },
        { isActive: false }
      );

      res.json(BaseResponse.success('Device registered successfully', {
        deviceId: deviceToken._id,
        token: deviceToken.token,
        platform: deviceToken.platform
      }));
    } catch (error) {
      console.error('Register device error:', error);
      res.status(500).json(BaseResponse.error('Server error', error.message));
    }
  },

  /**
   * Unregister device token
   */
  unregisterDevice: async (req, res) => {
    try {
      const { token } = req.body;
      const userId = req.user.id;

      if (!token) {
        return res.status(400).json(
          BaseResponse.error('Token is required')
        );
      }

      await DeviceToken.updateOne(
        { token, user: userId },
        { isActive: false }
      );

      res.json(BaseResponse.success('Device unregistered successfully'));
    } catch (error) {
      console.error('Unregister device error:', error);
      res.status(500).json(BaseResponse.error('Server error', error.message));
    }
  },

  /**
   * Get user's notifications
   */
  getNotifications: async (req, res) => {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await notificationService.getUserNotifications(userId, page, limit);

      res.json(BaseResponse.success('Notifications retrieved successfully', result));
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json(BaseResponse.error('Server error', error.message));
    }
  },

  /**
   * Get unread notifications count
   */
  getUnreadCount: async (req, res) => {
    try {
      const userId = req.user.id;
      const count = await Notification.getUnreadCount(userId);

      res.json(BaseResponse.success('Unread count retrieved successfully', { count }));
    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json(BaseResponse.error('Server error', error.message));
    }
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (req, res) => {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;

      await notificationService.markAsRead(notificationId, userId);

      res.json(BaseResponse.success('Notification marked as read'));
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json(BaseResponse.error('Server error', error.message));
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (req, res) => {
    try {
      const userId = req.user.id;

      await notificationService.markAllAsRead(userId);

      res.json(BaseResponse.success('All notifications marked as read'));
    } catch (error) {
      console.error('Mark all as read error:', error);
      res.status(500).json(BaseResponse.error('Server error', error.message));
    }
  },

  /**
   * Delete notification
   */
  deleteNotification: async (req, res) => {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;

      await notificationService.deleteNotification(notificationId, userId);

      res.json(BaseResponse.success('Notification deleted successfully'));
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json(BaseResponse.error('Server error', error.message));
    }
  },

  // Admin Controllers

  /**
   * Send notification to specific user (Admin only)
   */
  sendToUser: async (req, res) => {
    try {
      const {
        userId,
        title,
        body,
        image,
        type = 'custom',
        category = 'info',
        priority = 'normal',
        data = {},
        actionUrl,
        expiresAt
      } = req.body;

      if (!userId || !title || !body) {
        return res.status(400).json(
          BaseResponse.error('UserId, title, and body are required')
        );
      }

      const notificationData = {
        title,
        body,
        image,
        type,
        category,
        priority,
        data,
        actionUrl,
        expiresAt
      };

      const result = await notificationService.sendToUser(
        userId,
        notificationData,
        req.user.id
      );

      res.json(BaseResponse.success('Notification sent successfully', result));
    } catch (error) {
      console.error('Send to user error:', error);
      res.status(500).json(BaseResponse.error('Server error', error.message));
    }
  },

  /**
   * Send broadcast notification (Admin only)
   */
  sendBroadcast: async (req, res) => {
    try {
      const {
        title,
        body,
        image,
        type = 'admin',
        category = 'info',
        priority = 'normal',
        data = {},
        actionUrl,
        expiresAt,
        targetFilters = {}
      } = req.body;

      if (!title || !body) {
        return res.status(400).json(
          BaseResponse.error('Title and body are required')
        );
      }

      const notificationData = {
        title,
        body,
        image,
        type,
        category,
        priority,
        data,
        actionUrl,
        expiresAt
      };

      const result = await notificationService.sendBroadcast(
        notificationData,
        req.user.id,
        targetFilters
      );

      res.json(BaseResponse.success('Broadcast notification sent successfully', result));
    } catch (error) {
      console.error('Send broadcast error:', error);
      res.status(500).json(BaseResponse.error('Server error', error.message));
    }
  },

  /**
   * Schedule notification (Admin only)
   */
  scheduleNotification: async (req, res) => {
    try {
      const {
        title,
        body,
        image,
        type = 'admin',
        category = 'info',
        priority = 'normal',
        data = {},
        actionUrl,
        expiresAt,
        scheduledFor,
        userId = null,
        targetFilters = {}
      } = req.body;

      if (!title || !body || !scheduledFor) {
        return res.status(400).json(
          BaseResponse.error('Title, body, and scheduledFor are required')
        );
      }

      const scheduledDate = new Date(scheduledFor);
      if (scheduledDate <= new Date()) {
        return res.status(400).json(
          BaseResponse.error('Scheduled time must be in the future')
        );
      }

      const notificationData = {
        title,
        body,
        image,
        type,
        category,
        priority,
        data,
        actionUrl,
        expiresAt,
        recipient: userId,
        targetFilters: userId ? {} : targetFilters
      };

      const result = await notificationService.scheduleNotification(
        notificationData,
        scheduledDate,
        req.user.id
      );

      res.json(BaseResponse.success('Notification scheduled successfully', result));
    } catch (error) {
      console.error('Schedule notification error:', error);
      res.status(500).json(BaseResponse.error('Server error', error.message));
    }
  },

  /**
   * Get notification analytics (Admin only)
   */
  getAnalytics: async (req, res) => {
    try {
      const dateRange = parseInt(req.query.dateRange) || 7;
      const result = await notificationService.getAnalytics(dateRange);

      res.json(BaseResponse.success('Analytics retrieved successfully', result));
    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json(BaseResponse.error('Server error', error.message));
    }
  },

  /**
   * Get all notifications (Admin only)
   */
  getAllNotifications: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const status = req.query.status;
      const type = req.query.type;

      const skip = (page - 1) * limit;
      
      let query = {};
      if (status) query.status = status;
      if (type) query.type = type;

      const notifications = await Notification.find(query)
        .populate('recipient', 'name email')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Notification.countDocuments(query);

      const result = {
        notifications,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      };

      res.json(BaseResponse.success('All notifications retrieved successfully', result));
    } catch (error) {
      console.error('Get all notifications error:', error);
      res.status(500).json(BaseResponse.error('Server error', error.message));
    }
  },

  /**
   * Cancel scheduled notification (Admin only)
   */
  cancelScheduledNotification: async (req, res) => {
    try {
      const { notificationId } = req.params;

      const notification = await Notification.findById(notificationId);
      if (!notification) {
        return res.status(404).json(
          BaseResponse.error('Notification not found')
        );
      }

      if (notification.status !== 'scheduled') {
        return res.status(400).json(
          BaseResponse.error('Can only cancel scheduled notifications')
        );
      }

      notification.status = 'cancelled';
      await notification.save();

      res.json(BaseResponse.success('Scheduled notification cancelled successfully'));
    } catch (error) {
      console.error('Cancel scheduled notification error:', error);
      res.status(500).json(BaseResponse.error('Server error', error.message));
    }
  },

  /**
   * Update notification settings (User preferences)
   */
  updateSettings: async (req, res) => {
    try {
      const userId = req.user.id;
      const {
        enablePushNotifications = true,
        enableEmailNotifications = true,
        enableSMSNotifications = false,
        notificationTypes = {
          chat: true,
          petInquiry: true,
          follow: true,
          post: true,
          system: true,
          promotion: false
        }
      } = req.body;

      // Update user notification preferences (add to User model if needed)
      const User = require('../models/User');
      await User.findByIdAndUpdate(userId, {
        notificationSettings: {
          enablePushNotifications,
          enableEmailNotifications,
          enableSMSNotifications,
          notificationTypes
        }
      });

      res.json(BaseResponse.success('Notification settings updated successfully'));
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json(BaseResponse.error('Server error', error.message));
    }
  },

  /**
   * Get notification settings
   */
  getSettings: async (req, res) => {
    try {
      const userId = req.user.id;
      const User = require('../models/User');
      
      const user = await User.findById(userId).select('notificationSettings');
      
      const defaultSettings = {
        enablePushNotifications: true,
        enableEmailNotifications: true,
        enableSMSNotifications: false,
        notificationTypes: {
          chat: true,
          petInquiry: true,
          follow: true,
          post: true,
          system: true,
          promotion: false
        }
      };

      const settings = user?.notificationSettings || defaultSettings;

      res.json(BaseResponse.success('Notification settings retrieved successfully', settings));
    } catch (error) {
      console.error('Get settings error:', error);
      res.status(500).json(BaseResponse.error('Server error', error.message));
    }
  },

  /**
   * Test notification (Admin only)
   */
  testNotification: async (req, res) => {
    try {
      const { userId } = req.body;
      const targetUserId = userId || req.user.id;

      const notificationData = {
        title: 'Test Notification',
        body: 'This is a test notification from Jivbook admin panel',
        type: 'system',
        category: 'info',
        priority: 'normal',
        data: {
          isTest: true
        }
      };

      const result = await notificationService.sendToUser(
        targetUserId,
        notificationData,
        req.user.id
      );

      res.json(BaseResponse.success('Test notification sent successfully', result));
    } catch (error) {
      console.error('Test notification error:', error);
      res.status(500).json(BaseResponse.error('Server error', error.message));
    }
  }
};

module.exports = notificationController;
