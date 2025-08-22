const admin = require('firebase-admin');
const DeviceToken = require('../models/DeviceToken');
const Notification = require('../models/Notification');

class FirebaseService {
  constructor() {
    this.initialized = false;
    this.init();
  }

  init() {
    try {
      console.log('Firebase initialization temporarily disabled for development');
      this.initialized = false;
      // TODO: Re-enable Firebase when proper configuration is available
      /*
      if (!this.initialized) {
        // Initialize Firebase Admin SDK
        const serviceAccount = {
          type: "service_account",
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
          client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
        };

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID
        });

        this.messaging = admin.messaging();
        this.initialized = true;
        console.log('Firebase Admin SDK initialized successfully');
      }
      */
    } catch (error) {
      console.error('Firebase initialization error:', error);
      throw new Error('Failed to initialize Firebase');
    }
  }

  /**
   * Send notification to a single device
   */
  async sendToDevice(deviceToken, notification, data = {}) {
    try {
      const message = {
        token: deviceToken,
        notification: {
          title: notification.title,
          body: notification.body,
          ...(notification.image && { image: notification.image })
        },
        data: {
          ...data,
          notificationId: notification._id.toString(),
          type: notification.type,
          ...(notification.actionUrl && { actionUrl: notification.actionUrl })
        },
        android: {
          priority: this.getAndroidPriority(notification.priority),
          notification: {
            channelId: this.getChannelId(notification.type),
            priority: this.getAndroidNotificationPriority(notification.priority),
            defaultSound: true,
            defaultVibrateTimings: true,
            ...(notification.image && { image: notification.image })
          }
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.body
              },
              sound: 'default',
              badge: await this.getUserUnreadCount(data.userId)
            }
          }
        },
        webpush: {
          notification: {
            title: notification.title,
            body: notification.body,
            icon: '/icon-192x192.png',
            ...(notification.image && { image: notification.image }),
            requireInteraction: notification.priority === 'high' || notification.priority === 'critical',
            actions: notification.actionUrl ? [
              {
                action: 'open',
                title: 'Open',
                icon: '/icon-192x192.png'
              }
            ] : []
          }
        }
      };

      const response = await this.messaging.send(message);
      console.log('Successfully sent message to device:', response);
      return { success: true, messageId: response };
    } catch (error) {
      console.error('Error sending message to device:', error);
      
      // Handle invalid token
      if (error.code === 'messaging/registration-token-not-registered' || 
          error.code === 'messaging/invalid-registration-token') {
        await this.handleInvalidToken(deviceToken);
      }
      
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification to multiple devices
   */
  async sendToMultipleDevices(deviceTokens, notification, data = {}) {
    try {
      if (!deviceTokens || deviceTokens.length === 0) {
        return { success: false, error: 'No device tokens provided' };
      }

      const message = {
        tokens: deviceTokens,
        notification: {
          title: notification.title,
          body: notification.body,
          ...(notification.image && { image: notification.image })
        },
        data: {
          ...data,
          notificationId: notification._id.toString(),
          type: notification.type,
          ...(notification.actionUrl && { actionUrl: notification.actionUrl })
        },
        android: {
          priority: this.getAndroidPriority(notification.priority),
          notification: {
            channelId: this.getChannelId(notification.type),
            priority: this.getAndroidNotificationPriority(notification.priority),
            defaultSound: true,
            defaultVibrateTimings: true
          }
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.body
              },
              sound: 'default'
            }
          }
        },
        webpush: {
          notification: {
            title: notification.title,
            body: notification.body,
            icon: '/icon-192x192.png',
            ...(notification.image && { image: notification.image })
          }
        }
      };

      const response = await this.messaging.sendEachForMulticast(message);
      console.log('Multicast message sent:', response);

      // Handle failed tokens
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(deviceTokens[idx]);
            console.error(`Failed to send to token ${deviceTokens[idx]}:`, resp.error);
          }
        });

        // Remove invalid tokens
        await this.handleInvalidTokens(failedTokens);
      }

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses
      };
    } catch (error) {
      console.error('Error sending multicast message:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification to a topic
   */
  async sendToTopic(topic, notification, data = {}) {
    try {
      const message = {
        topic: topic,
        notification: {
          title: notification.title,
          body: notification.body,
          ...(notification.image && { image: notification.image })
        },
        data: {
          ...data,
          notificationId: notification._id.toString(),
          type: notification.type,
          ...(notification.actionUrl && { actionUrl: notification.actionUrl })
        }
      };

      const response = await this.messaging.send(message);
      console.log('Successfully sent message to topic:', response);
      return { success: true, messageId: response };
    } catch (error) {
      console.error('Error sending message to topic:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Subscribe user devices to a topic
   */
  async subscribeToTopic(deviceTokens, topic) {
    try {
      const response = await this.messaging.subscribeToTopic(deviceTokens, topic);
      console.log('Successfully subscribed to topic:', response);
      return response;
    } catch (error) {
      console.error('Error subscribing to topic:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe user devices from a topic
   */
  async unsubscribeFromTopic(deviceTokens, topic) {
    try {
      const response = await this.messaging.unsubscribeFromTopic(deviceTokens, topic);
      console.log('Successfully unsubscribed from topic:', response);
      return response;
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
      throw error;
    }
  }

  /**
   * Helper methods
   */
  getAndroidPriority(priority) {
    switch (priority) {
      case 'critical':
      case 'high':
        return 'high';
      default:
        return 'normal';
    }
  }

  getAndroidNotificationPriority(priority) {
    switch (priority) {
      case 'critical':
        return 'max';
      case 'high':
        return 'high';
      case 'low':
        return 'low';
      default:
        return 'default';
    }
  }

  getChannelId(type) {
    switch (type) {
      case 'chat':
        return 'chat_channel';
      case 'pet_inquiry':
        return 'pet_channel';
      case 'follow':
        return 'social_channel';
      case 'post':
        return 'social_channel';
      case 'promotion':
        return 'marketing_channel';
      case 'admin':
      case 'system':
        return 'system_channel';
      default:
        return 'default_channel';
    }
  }

  async getUserUnreadCount(userId) {
    try {
      if (!userId) return 0;
      return await Notification.getUnreadCount(userId);
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  async handleInvalidToken(token) {
    try {
      await DeviceToken.updateOne({ token }, { isActive: false });
      console.log('Marked token as inactive:', token);
    } catch (error) {
      console.error('Error handling invalid token:', error);
    }
  }

  async handleInvalidTokens(tokens) {
    try {
      await DeviceToken.updateMany(
        { token: { $in: tokens } },
        { isActive: false }
      );
      console.log('Marked tokens as inactive:', tokens.length);
    } catch (error) {
      console.error('Error handling invalid tokens:', error);
    }
  }

  /**
   * Validate Firebase configuration
   */
  validateConfig() {
    const requiredEnvVars = [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_PRIVATE_KEY_ID',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_CLIENT_ID',
      'FIREBASE_CLIENT_CERT_URL'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing Firebase environment variables: ${missingVars.join(', ')}`);
    }
  }
}

module.exports = new FirebaseService();
