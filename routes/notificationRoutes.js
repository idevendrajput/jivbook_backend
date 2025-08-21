const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// Middleware to check admin access
const adminAuth = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return next();
  }
  res.status(403).json({
    success: false,
    message: 'Access denied',
    error: 'Admin access required'
  });
};

// User Routes (Require Authentication)

// Device Management
router.post('/register-device', auth, notificationController.registerDevice);
router.post('/unregister-device', auth, notificationController.unregisterDevice);

// Notification Management
router.get('/my-notifications', auth, notificationController.getNotifications);
router.get('/unread-count', auth, notificationController.getUnreadCount);
router.put('/:notificationId/read', auth, notificationController.markAsRead);
router.put('/mark-all-read', auth, notificationController.markAllAsRead);
router.delete('/:notificationId', auth, notificationController.deleteNotification);

// Notification Settings
router.get('/settings', auth, notificationController.getSettings);
router.put('/settings', auth, notificationController.updateSettings);

// Admin Routes (Require Admin Authentication)

// Send Notifications
router.post('/admin/send-to-user', auth, adminAuth, notificationController.sendToUser);
router.post('/admin/send-broadcast', auth, adminAuth, notificationController.sendBroadcast);
router.post('/admin/schedule', auth, adminAuth, notificationController.scheduleNotification);
router.post('/admin/test', auth, adminAuth, notificationController.testNotification);

// Notification Management (Admin)
router.get('/admin/all-notifications', auth, adminAuth, notificationController.getAllNotifications);
router.put('/admin/:notificationId/cancel', auth, adminAuth, notificationController.cancelScheduledNotification);

// Analytics
router.get('/admin/analytics', auth, adminAuth, notificationController.getAnalytics);

module.exports = router;
