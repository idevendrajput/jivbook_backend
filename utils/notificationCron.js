const cron = require('node-cron');
const notificationService = require('../services/notificationService');

class NotificationCron {
  constructor() {
    this.scheduledTasks = new Map();
  }

  /**
   * Start all cron jobs
   */
  startAllJobs() {
    console.log('Starting notification cron jobs...');

    // Process scheduled notifications every minute
    this.startScheduledNotificationProcessor();

    // Clean up expired notifications daily at midnight
    this.startExpiredNotificationCleaner();

    // Clean up inactive device tokens weekly
    this.startInactiveTokenCleaner();

    console.log('Notification cron jobs started successfully');
  }

  /**
   * Process scheduled notifications every minute
   */
  startScheduledNotificationProcessor() {
    const task = cron.schedule('* * * * *', async () => {
      try {
        console.log('Processing scheduled notifications...');
        await notificationService.processScheduledNotifications();
      } catch (error) {
        console.error('Error in scheduled notification processor:', error);
      }
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    task.start();
    this.scheduledTasks.set('scheduledProcessor', task);
    console.log('Scheduled notification processor started (runs every minute)');
  }

  /**
   * Clean up expired notifications daily at midnight
   */
  startExpiredNotificationCleaner() {
    const task = cron.schedule('0 0 * * *', async () => {
      try {
        console.log('Cleaning up expired notifications...');
        const Notification = require('../models/Notification');
        
        const now = new Date();
        const result = await Notification.deleteMany({
          expiresAt: { $lt: now },
          status: { $in: ['sent', 'failed'] }
        });

        console.log(`Cleaned up ${result.deletedCount} expired notifications`);
      } catch (error) {
        console.error('Error in expired notification cleaner:', error);
      }
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    task.start();
    this.scheduledTasks.set('expiredCleaner', task);
    console.log('Expired notification cleaner started (runs daily at midnight)');
  }

  /**
   * Clean up inactive device tokens weekly
   */
  startInactiveTokenCleaner() {
    const task = cron.schedule('0 2 * * 0', async () => {
      try {
        console.log('Cleaning up inactive device tokens...');
        const DeviceToken = require('../models/DeviceToken');
        
        // Remove tokens that haven't been used for 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const result = await DeviceToken.deleteMany({
          $or: [
            { isActive: false },
            { lastUsed: { $lt: thirtyDaysAgo } }
          ]
        });

        console.log(`Cleaned up ${result.deletedCount} inactive device tokens`);
      } catch (error) {
        console.error('Error in inactive token cleaner:', error);
      }
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    task.start();
    this.scheduledTasks.set('tokenCleaner', task);
    console.log('Inactive token cleaner started (runs weekly on Sunday at 2 AM)');
  }

  /**
   * Start notification analytics aggregation daily
   */
  startAnalyticsAggregator() {
    const task = cron.schedule('0 1 * * *', async () => {
      try {
        console.log('Aggregating notification analytics...');
        
        // You can implement daily analytics aggregation here
        // For example, calculate daily delivery rates, popular notification types, etc.
        
        console.log('Analytics aggregation completed');
      } catch (error) {
        console.error('Error in analytics aggregator:', error);
      }
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    task.start();
    this.scheduledTasks.set('analyticsAggregator', task);
    console.log('Analytics aggregator started (runs daily at 1 AM)');
  }

  /**
   * Stop all cron jobs
   */
  stopAllJobs() {
    console.log('Stopping notification cron jobs...');
    
    for (const [name, task] of this.scheduledTasks) {
      task.stop();
      console.log(`Stopped ${name} cron job`);
    }
    
    this.scheduledTasks.clear();
    console.log('All notification cron jobs stopped');
  }

  /**
   * Stop specific cron job
   */
  stopJob(jobName) {
    const task = this.scheduledTasks.get(jobName);
    if (task) {
      task.stop();
      this.scheduledTasks.delete(jobName);
      console.log(`Stopped ${jobName} cron job`);
    } else {
      console.log(`Cron job ${jobName} not found`);
    }
  }

  /**
   * Get status of all cron jobs
   */
  getJobsStatus() {
    const status = {};
    for (const [name, task] of this.scheduledTasks) {
      status[name] = {
        running: task.running,
        scheduled: task.scheduled
      };
    }
    return status;
  }

  /**
   * Manually trigger scheduled notification processing
   */
  async triggerScheduledProcessing() {
    try {
      console.log('Manually triggering scheduled notification processing...');
      await notificationService.processScheduledNotifications();
      console.log('Manual processing completed');
      return true;
    } catch (error) {
      console.error('Error in manual processing:', error);
      return false;
    }
  }
}

// Create singleton instance
const notificationCron = new NotificationCron();

// Graceful shutdown handler
process.on('SIGINT', () => {
  console.log('Received SIGINT, stopping notification cron jobs...');
  notificationCron.stopAllJobs();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, stopping notification cron jobs...');
  notificationCron.stopAllJobs();
  process.exit(0);
});

module.exports = notificationCron;
