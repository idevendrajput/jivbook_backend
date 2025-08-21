const Notification = require('../models/Notification');
const DeviceToken = require('../models/DeviceToken');
const User = require('../models/User');
const firebaseService = require('./firebaseService');

class NotificationService {
  /**
   * Send notification to a specific user
   */
  async sendToUser(userId, notificationData, createdBy) {
    try {
      // Create notification record
      const notification = new Notification({
        ...notificationData,
        recipient: userId,
        createdBy,
        status: 'sending'
      });
      await notification.save();

      // Get user's active device tokens
      const deviceTokens = await DeviceToken.find({
        user: userId,
        isActive: true
      }).select('token platform');

      if (deviceTokens.length === 0) {
        notification.status = 'failed';
        notification.deliveryStats.totalTargeted = 0;
        await notification.save();
        return { success: false, message: 'No active devices found for user' };
      }

      const tokens = deviceTokens.map(dt => dt.token);
      notification.deliveryStats.totalTargeted = tokens.length;

      // Send notification via Firebase
      const result = await firebaseService.sendToMultipleDevices(
        tokens,
        notification,
        { userId: userId.toString() }
      );

      // Update delivery stats
      if (result.success) {
        notification.status = 'sent';
        notification.deliveryStats.successfulDeliveries = result.successCount;
        notification.deliveryStats.failedDeliveries = result.failureCount;
      } else {
        notification.status = 'failed';
      }

      await notification.save();
      return { success: true, notification, deliveryResult: result };
    } catch (error) {
      console.error('Error sending notification to user:', error);
      throw error;
    }
  }

  /**
   * Send broadcast notification to all users or filtered users
   */
  async sendBroadcast(notificationData, createdBy, filters = {}) {
    try {
      // Create notification record
      const notification = new Notification({
        ...notificationData,
        recipient: null, // null indicates broadcast
        createdBy,
        status: 'sending',
        targetFilters: filters
      });
      await notification.save();

      // Build user query based on filters
      let userQuery = {};
      
      // Filter by user type
      if (filters.userTypes && filters.userTypes.length > 0) {
        if (filters.userTypes.includes('admin')) {
          userQuery.isAdmin = true;
        } else if (filters.userTypes.includes('premium')) {
          userQuery.isPremium = true;
        }
      }

      // Filter by pet category preferences
      if (filters.petCategories && filters.petCategories.length > 0) {
        userQuery.preferredPetCategories = { $in: filters.petCategories };
      }

      // Get users matching criteria
      const users = await User.find(userQuery).select('_id');
      const userIds = users.map(u => u._id);

      if (userIds.length === 0) {
        notification.status = 'failed';
        notification.deliveryStats.totalTargeted = 0;
        await notification.save();
        return { success: false, message: 'No users match the filter criteria' };
      }

      // Build device token query
      let deviceQuery = {
        user: { $in: userIds },
        isActive: true
      };

      // Filter by platform
      if (filters.platform && filters.platform.length > 0) {
        deviceQuery.platform = { $in: filters.platform };
      }

      // Get device tokens
      const deviceTokens = await DeviceToken.find(deviceQuery).select('token user platform');

      if (deviceTokens.length === 0) {
        notification.status = 'failed';
        notification.deliveryStats.totalTargeted = 0;
        await notification.save();
        return { success: false, message: 'No active devices found for target users' };
      }

      const tokens = deviceTokens.map(dt => dt.token);
      notification.deliveryStats.totalTargeted = tokens.length;

      // Send notification in batches (FCM limit is 500 tokens per request)
      const batchSize = 500;
      let totalSuccessCount = 0;
      let totalFailureCount = 0;

      for (let i = 0; i < tokens.length; i += batchSize) {
        const batch = tokens.slice(i, i + batchSize);
        const result = await firebaseService.sendToMultipleDevices(batch, notification);
        
        if (result.success) {
          totalSuccessCount += result.successCount;
          totalFailureCount += result.failureCount;
        } else {
          totalFailureCount += batch.length;
        }
      }

      // Update delivery stats
      notification.status = totalSuccessCount > 0 ? 'sent' : 'failed';
      notification.deliveryStats.successfulDeliveries = totalSuccessCount;
      notification.deliveryStats.failedDeliveries = totalFailureCount;
      await notification.save();

      return {
        success: true,
        notification,
        deliveryStats: {
          totalTargeted: tokens.length,
          successfulDeliveries: totalSuccessCount,
          failedDeliveries: totalFailureCount
        }
      };
    } catch (error) {
      console.error('Error sending broadcast notification:', error);
      throw error;
    }
  }

  /**
   * Send notification to a topic
   */
  async sendToTopic(topic, notificationData, createdBy) {
    try {
      const notification = new Notification({
        ...notificationData,
        recipient: null,
        createdBy,
        status: 'sending'
      });
      await notification.save();

      const result = await firebaseService.sendToTopic(topic, notification);

      notification.status = result.success ? 'sent' : 'failed';
      if (result.messageId) {
        notification.messageId = result.messageId;
      }
      await notification.save();

      return { success: result.success, notification, result };
    } catch (error) {
      console.error('Error sending topic notification:', error);
      throw error;
    }
  }

  /**
   * Schedule notification for later delivery
   */
  async scheduleNotification(notificationData, scheduledFor, createdBy) {
    try {
      const notification = new Notification({
        ...notificationData,
        createdBy,
        status: 'scheduled',
        scheduledFor
      });
      await notification.save();

      return { success: true, notification };
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  /**
   * Process scheduled notifications (to be called by cron job)
   */
  async processScheduledNotifications() {
    try {
      const now = new Date();
      const scheduledNotifications = await Notification.find({
        status: 'scheduled',
        scheduledFor: { $lte: now }
      }).populate('createdBy');

      console.log(`Processing ${scheduledNotifications.length} scheduled notifications`);

      for (const notification of scheduledNotifications) {
        try {
          if (notification.recipient) {
            // Send to specific user
            await this.sendToUser(
              notification.recipient,
              {
                title: notification.title,
                body: notification.body,
                image: notification.image,
                type: notification.type,
                category: notification.category,
                priority: notification.priority,
                data: notification.data,
                actionUrl: notification.actionUrl
              },
              notification.createdBy._id
            );
          } else {
            // Send broadcast
            await this.sendBroadcast(
              {
                title: notification.title,
                body: notification.body,
                image: notification.image,
                type: notification.type,
                category: notification.category,
                priority: notification.priority,
                data: notification.data,
                actionUrl: notification.actionUrl
              },
              notification.createdBy._id,
              notification.targetFilters
            );
          }

          // Delete the scheduled notification
          await Notification.findByIdAndDelete(notification._id);
        } catch (error) {
          console.error(`Error processing scheduled notification ${notification._id}:`, error);
          
          // Mark as failed
          notification.status = 'failed';
          await notification.save();
        }
      }
    } catch (error) {
      console.error('Error processing scheduled notifications:', error);
    }
  }

  /**
   * Send automatic notifications based on events
   */
  async sendEventNotification(eventType, eventData) {
    try {
      let notificationData = {};
      let recipientId = null;

      switch (eventType) {
        case 'new_message':
          recipientId = eventData.recipientId;
          notificationData = {
            title: `New message from ${eventData.senderName}`,
            body: eventData.message,
            type: 'chat',
            category: 'info',
            priority: 'normal',
            data: {
              chatId: eventData.chatId,
              senderId: eventData.senderId
            },
            actionUrl: `/chat/${eventData.chatId}`
          };
          break;

        case 'pet_inquiry':
          recipientId = eventData.ownerId;
          notificationData = {
            title: 'New Pet Inquiry',
            body: `${eventData.inquirerName} is interested in your ${eventData.petTitle}`,
            type: 'pet_inquiry',
            category: 'info',
            priority: 'normal',
            data: {
              petId: eventData.petId,
              inquirerId: eventData.inquirerId
            },
            actionUrl: `/pets/${eventData.petId}`
          };
          break;

        case 'new_follower':
          recipientId = eventData.followedUserId;
          notificationData = {
            title: 'New Follower',
            body: `${eventData.followerName} started following you`,
            type: 'follow',
            category: 'success',
            priority: 'low',
            data: {
              followerId: eventData.followerId
            },
            actionUrl: `/profile/${eventData.followerId}`
          };
          break;

        case 'post_liked':
          recipientId = eventData.postOwnerId;
          notificationData = {
            title: 'Post Liked',
            body: `${eventData.likerName} liked your post`,
            type: 'post',
            category: 'info',
            priority: 'low',
            data: {
              postId: eventData.postId,
              likerId: eventData.likerId
            },
            actionUrl: `/posts/${eventData.postId}`
          };
          break;

        default:
          throw new Error(`Unknown event type: ${eventType}`);
      }

      // Send notification to user
      return await this.sendToUser(recipientId, notificationData, eventData.systemUserId || null);
    } catch (error) {
      console.error('Error sending event notification:', error);
      throw error;
    }
  }

  /**
   * Get user's notifications with pagination
   */
  async getUserNotifications(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      
      const notifications = await Notification.find({
        recipient: userId,
        status: 'sent',
        $or: [
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } }
        ]
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email');

      const total = await Notification.countDocuments({
        recipient: userId,
        status: 'sent',
        $or: [
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } }
        ]
      });

      const unreadCount = await Notification.getUnreadCount(userId);

      return {
        notifications,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        },
        unreadCount
      };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        recipient: userId
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      await notification.markAsRead();
      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId) {
    try {
      await Notification.updateMany(
        {
          recipient: userId,
          isRead: false,
          status: 'sent'
        },
        { isRead: true }
      );

      return { success: true };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId, userId) {
    try {
      const result = await Notification.findOneAndDelete({
        _id: notificationId,
        recipient: userId
      });

      if (!result) {
        throw new Error('Notification not found');
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Get notification analytics for admin
   */
  async getAnalytics(dateRange = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      const analytics = await Notification.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              type: '$type',
              status: '$status'
            },
            count: { $sum: 1 },
            totalTargeted: { $sum: '$deliveryStats.totalTargeted' },
            successfulDeliveries: { $sum: '$deliveryStats.successfulDeliveries' },
            failedDeliveries: { $sum: '$deliveryStats.failedDeliveries' }
          }
        }
      ]);

      // Get daily stats
      const dailyStats = await Notification.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 },
            successfulDeliveries: { $sum: '$deliveryStats.successfulDeliveries' }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      return {
        analytics,
        dailyStats,
        dateRange
      };
    } catch (error) {
      console.error('Error getting notification analytics:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
