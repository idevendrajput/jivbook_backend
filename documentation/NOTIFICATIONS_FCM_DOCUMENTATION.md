# 🔔 Firebase Cloud Messaging & Notifications Documentation

## Overview

Comprehensive Firebase Cloud Messaging (FCM) notification system implemented for Jivbook backend. This system supports push notifications for mobile apps (Android/iOS), web browsers, and admin panel control with advanced targeting, scheduling, and analytics.

---

## 🏗️ System Architecture

### Core Components:
1. **Firebase Admin SDK** - Server-side FCM integration
2. **Device Token Management** - User device registration and management
3. **Notification Service** - Centralized notification sending logic
4. **Admin Dashboard** - Complete notification control panel
5. **Cron Jobs** - Scheduled notifications and cleanup tasks
6. **Real-time Integration** - Socket.IO integration for instant notifications

### Supported Platforms:
- **Android** - Native mobile apps
- **iOS** - Native mobile apps  
- **Web** - Progressive Web Apps (PWA) and websites
- **Admin Panel** - Web-based management interface

---

## 📊 Database Models

### 1. Device Token Schema
```javascript
{
  user: ObjectId,           // Reference to User
  token: String,           // FCM device token (unique)
  platform: String,        // 'android', 'ios', 'web'
  deviceId: String,        // Device identifier
  deviceInfo: {            // Device metadata
    model: String,
    version: String,
    brand: String,
    osVersion: String
  },
  isActive: Boolean,       // Token validity status
  lastUsed: Date,          // Last activity timestamp
  timestamps: true         // createdAt, updatedAt
}
```

### 2. Notification Schema
```javascript
{
  // Content
  title: String,           // Notification title (max 100 chars)
  body: String,            // Notification body (max 500 chars)  
  image: String,           // Rich notification image URL
  
  // Targeting
  recipient: ObjectId,     // Specific user (null = broadcast)
  
  // Classification
  type: String,            // 'system', 'pet_inquiry', 'chat', 'follow', 'post', 'promotion', 'admin', 'custom'
  category: String,        // 'info', 'warning', 'success', 'error', 'promotional'
  priority: String,        // 'low', 'normal', 'high', 'critical'
  
  // Payload & Actions
  data: Mixed,             // Custom data payload
  actionUrl: String,       // Deep link URL
  
  // Advanced Targeting
  targetFilters: {
    platform: [String],        // Platform filtering
    userTypes: [String],       // User type filtering
    locations: [String],       // Geographic targeting
    petCategories: [String],   // Interest-based targeting
    ageRange: { min: Number, max: Number }
  },
  
  // Scheduling
  scheduledFor: Date,      // Scheduled delivery time
  expiresAt: Date,         // Expiration timestamp
  
  // Status & Analytics
  status: String,          // 'draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled'
  deliveryStats: {
    totalTargeted: Number,
    successfulDeliveries: Number,
    failedDeliveries: Number,
    openRate: Number,
    clickRate: Number
  },
  
  // Metadata
  createdBy: ObjectId,     // Admin who created notification
  messageId: String,       // Firebase message ID
  isRead: Boolean,         // Read status (for recipient)
  timestamps: true
}
```

---

## 🔗 REST API Endpoints

### Base URL: `/api/notifications`

## User APIs (Authenticated)

#### 1. Register Device Token
```http
POST /api/notifications/register-device
Authorization: Bearer <jwt-token>
Content-Type: application/json

Body:
{
  "token": "fcm_device_token_here",
  "platform": "android", // 'android', 'ios', 'web'
  "deviceId": "unique_device_id",
  "deviceInfo": {
    "model": "iPhone 14",
    "version": "16.0",
    "brand": "Apple",
    "osVersion": "iOS 16.0"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Device registered successfully",
  "data": {
    "deviceId": "device_mongo_id",
    "token": "fcm_device_token_here",
    "platform": "android"
  }
}
```

#### 2. Unregister Device Token
```http
POST /api/notifications/unregister-device
Authorization: Bearer <jwt-token>
Content-Type: application/json

Body:
{
  "token": "fcm_device_token_here"
}
```

#### 3. Get User Notifications
```http
GET /api/notifications/my-notifications?page=1&limit=20
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": {
    "notifications": [
      {
        "_id": "notification_id",
        "title": "New Pet Inquiry",
        "body": "John Doe is interested in your Golden Retriever",
        "image": "/uploads/pets/pet-123.jpg",
        "type": "pet_inquiry",
        "category": "info",
        "priority": "normal",
        "data": {
          "petId": "pet_123",
          "inquirerId": "user_456"
        },
        "actionUrl": "/pets/pet_123",
        "isRead": false,
        "createdAt": "2025-01-06T12:00:00.000Z",
        "createdBy": {
          "name": "System",
          "email": "system@jivbook.com"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 45,
      "itemsPerPage": 20
    },
    "unreadCount": 12
  }
}
```

#### 4. Get Unread Count
```http
GET /api/notifications/unread-count
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Unread count retrieved successfully",
  "data": {
    "count": 12
  }
}
```

#### 5. Mark Notification as Read
```http
PUT /api/notifications/:notificationId/read
Authorization: Bearer <jwt-token>
```

#### 6. Mark All Notifications as Read
```http
PUT /api/notifications/mark-all-read
Authorization: Bearer <jwt-token>
```

#### 7. Delete Notification
```http
DELETE /api/notifications/:notificationId
Authorization: Bearer <jwt-token>
```

#### 8. Get Notification Settings
```http
GET /api/notifications/settings
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Notification settings retrieved successfully",
  "data": {
    "enablePushNotifications": true,
    "enableEmailNotifications": true,
    "enableSMSNotifications": false,
    "notificationTypes": {
      "chat": true,
      "petInquiry": true,
      "follow": true,
      "post": true,
      "system": true,
      "promotion": false
    }
  }
}
```

#### 9. Update Notification Settings
```http
PUT /api/notifications/settings
Authorization: Bearer <jwt-token>
Content-Type: application/json

Body:
{
  "enablePushNotifications": true,
  "enableEmailNotifications": false,
  "enableSMSNotifications": false,
  "notificationTypes": {
    "chat": true,
    "petInquiry": true,
    "follow": false,
    "post": true,
    "system": true,
    "promotion": false
  }
}
```

---

## Admin APIs (Admin Authentication Required)

#### 1. Send Notification to Specific User
```http
POST /api/notifications/admin/send-to-user
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

Body:
{
  "userId": "user_id_to_send_to",
  "title": "Important Notice",
  "body": "Your pet listing has been approved!",
  "image": "/uploads/system/approved.png",
  "type": "system",
  "category": "success",
  "priority": "high",
  "data": {
    "petId": "pet_123",
    "action": "approved"
  },
  "actionUrl": "/pets/pet_123",
  "expiresAt": "2025-01-13T12:00:00.000Z"
}
```

#### 2. Send Broadcast Notification
```http
POST /api/notifications/admin/send-broadcast
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

Body:
{
  "title": "New Feature Available!",
  "body": "Check out our new pet matching algorithm",
  "image": "/uploads/features/matching.png",
  "type": "admin",
  "category": "info",
  "priority": "normal",
  "data": {
    "featureId": "matching_v2"
  },
  "actionUrl": "/features/matching",
  "targetFilters": {
    "platform": ["android", "ios"],
    "userTypes": ["premium", "regular"],
    "petCategories": ["dogs", "cats"]
  }
}
```

#### 3. Schedule Notification
```http
POST /api/notifications/admin/schedule
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

Body:
{
  "title": "Weekly Pet Care Tips",
  "body": "Don't forget to give your pets their weekly checkup!",
  "type": "system",
  "category": "info",
  "priority": "low",
  "scheduledFor": "2025-01-13T09:00:00.000Z",
  "targetFilters": {
    "platform": ["android", "ios", "web"],
    "petCategories": ["dogs", "cats"]
  }
}
```

#### 4. Get All Notifications (Admin View)
```http
GET /api/notifications/admin/all-notifications?page=1&limit=50&status=sent&type=admin
Authorization: Bearer <admin-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "All notifications retrieved successfully",
  "data": {
    "notifications": [
      {
        "_id": "notification_id",
        "title": "System Maintenance",
        "body": "Scheduled maintenance tonight from 2-4 AM",
        "type": "admin",
        "status": "sent",
        "recipient": null,
        "deliveryStats": {
          "totalTargeted": 1250,
          "successfulDeliveries": 1180,
          "failedDeliveries": 70,
          "openRate": 0.65,
          "clickRate": 0.15
        },
        "createdBy": {
          "name": "Admin User",
          "email": "admin@jivbook.com"
        },
        "createdAt": "2025-01-06T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 25,
      "totalItems": 1240,
      "itemsPerPage": 50
    }
  }
}
```

#### 5. Get Notification Analytics
```http
GET /api/notifications/admin/analytics?dateRange=7
Authorization: Bearer <admin-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Analytics retrieved successfully",
  "data": {
    "analytics": [
      {
        "_id": {
          "type": "chat",
          "status": "sent"
        },
        "count": 245,
        "totalTargeted": 245,
        "successfulDeliveries": 230,
        "failedDeliveries": 15
      }
    ],
    "dailyStats": [
      {
        "_id": "2025-01-06",
        "count": 125,
        "successfulDeliveries": 118
      }
    ],
    "dateRange": 7
  }
}
```

#### 6. Cancel Scheduled Notification
```http
PUT /api/notifications/admin/:notificationId/cancel
Authorization: Bearer <admin-jwt-token>
```

#### 7. Test Notification
```http
POST /api/notifications/admin/test
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

Body:
{
  "userId": "user_id_to_test" // optional, defaults to admin user
}
```

---

## 🔥 Firebase Integration

### Environment Variables Required:
```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com

# Optional
ENABLE_CRON=true
```

### Firebase Project Setup:
1. Create Firebase project at https://console.firebase.google.com
2. Enable Cloud Messaging
3. Generate service account key
4. Add environment variables to your server

---

## 📱 Client-Side Integration

### Android (React Native)
```javascript
import messaging from '@react-native-firebase/messaging';
import { registerForPushNotifications } from './notificationService';

// Request permission
const requestPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                  authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  
  if (enabled) {
    console.log('Authorization status:', authStatus);
    await getDeviceToken();
  }
};

// Get FCM token
const getDeviceToken = async () => {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    
    // Register with backend
    await registerDeviceToken(token, 'android', 'unique_device_id');
  } catch (error) {
    console.error('Error getting FCM token:', error);
  }
};

// Register token with backend
const registerDeviceToken = async (token, platform, deviceId) => {
  try {
    const response = await fetch('/api/notifications/register-device', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        token,
        platform,
        deviceId,
        deviceInfo: {
          model: DeviceInfo.getModel(),
          version: DeviceInfo.getVersion(),
          brand: DeviceInfo.getBrand(),
          osVersion: DeviceInfo.getSystemVersion()
        }
      })
    });
    
    const result = await response.json();
    console.log('Device registered:', result);
  } catch (error) {
    console.error('Error registering device:', error);
  }
};

// Handle foreground messages
messaging().onMessage(async remoteMessage => {
  console.log('Foreground message:', remoteMessage);
  
  // Show local notification or update UI
  showLocalNotification(remoteMessage.notification);
});

// Handle background/quit state messages
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background message:', remoteMessage);
});
```

### iOS (React Native)
```javascript
import messaging from '@react-native-firebase/messaging';

// iOS-specific setup
const requestIOSPermission = async () => {
  const authStatus = await messaging().requestPermission({
    alert: true,
    badge: true,
    sound: true,
    carPlay: false,
    criticalAlert: false,
    provisional: false,
    providesAppNotificationSettings: false
  });
  
  if (authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL) {
    await getDeviceToken();
  }
};

// Handle APNs token
messaging().getAPNSToken().then(apnsToken => {
  if (apnsToken) {
    console.log('APNS Token:', apnsToken);
  }
});
```

### Web (Progressive Web App)
```javascript
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  // Your web app's Firebase configuration
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service Worker registered:', registration);
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
}

// Get FCM token
const getWebToken = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey: 'your-vapid-key'
    });
    
    if (token) {
      console.log('Web FCM token:', token);
      await registerDeviceToken(token, 'web', generateDeviceId());
    }
  } catch (error) {
    console.error('Error getting web token:', error);
  }
};

// Handle foreground messages
onMessage(messaging, (payload) => {
  console.log('Foreground web message:', payload);
  
  // Show notification
  if (Notification.permission === 'granted') {
    new Notification(payload.notification.title, {
      body: payload.notification.body,
      icon: payload.notification.image || '/icon-192x192.png',
      data: payload.data
    });
  }
});

// Request notification permission
const requestWebPermission = async () => {
  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await getWebToken();
    }
  } else if (Notification.permission === 'granted') {
    await getWebToken();
  }
};
```

### Service Worker (firebase-messaging-sw.js)
```javascript
import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  console.log('Background message received:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image || '/icon-192x192.png',
    data: payload.data
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const actionUrl = event.notification.data?.actionUrl;
  if (actionUrl) {
    clients.openWindow(actionUrl);
  }
});
```

---

## 🔄 Automatic Event Notifications

The system automatically sends notifications for various events:

### Chat Messages
```javascript
// Triggered when a message is sent in chat
eventType: 'new_message'
eventData: {
  recipientId: 'user_123',
  senderName: 'John Doe',
  message: 'Hello! Is your pet still available?',
  chatId: 'chat_456',
  senderId: 'user_789'
}
```

### Pet Inquiries
```javascript
// Triggered when someone creates a chat for pet inquiry
eventType: 'pet_inquiry'
eventData: {
  ownerId: 'pet_owner_123',
  inquirerName: 'Jane Smith',
  petTitle: 'Golden Retriever Puppy',
  petId: 'pet_456',
  inquirerId: 'user_789'
}
```

### Social Features
```javascript
// New follower
eventType: 'new_follower'
eventData: {
  followedUserId: 'user_123',
  followerName: 'Mike Johnson',
  followerId: 'user_456'
}

// Post liked
eventType: 'post_liked'
eventData: {
  postOwnerId: 'user_123',
  likerName: 'Sarah Wilson',
  likerId: 'user_789',
  postId: 'post_456'
}
```

---

## ⏰ Scheduled Notifications & Cron Jobs

### Cron Job Schedule:
1. **Scheduled Notifications**: Every minute - processes due scheduled notifications
2. **Expired Cleanup**: Daily at midnight - removes expired notifications
3. **Token Cleanup**: Weekly on Sunday at 2 AM - removes inactive device tokens
4. **Analytics Aggregation**: Daily at 1 AM - processes notification analytics

### Manual Cron Control:
```javascript
const notificationCron = require('./utils/notificationCron');

// Start all jobs
notificationCron.startAllJobs();

// Stop all jobs
notificationCron.stopAllJobs();

// Stop specific job
notificationCron.stopJob('scheduledProcessor');

// Get jobs status
const status = notificationCron.getJobsStatus();

// Manual trigger
await notificationCron.triggerScheduledProcessing();
```

---

## 📊 Advanced Features

### 1. Rich Notifications
- **Images**: Support for notification images
- **Actions**: Custom action buttons (web)
- **Deep Links**: Direct navigation to specific app screens
- **Custom Data**: Additional payload for advanced handling

### 2. Smart Targeting
- **Platform Filtering**: Target specific platforms
- **User Segmentation**: Premium vs regular users
- **Geographic Targeting**: Location-based notifications
- **Interest-based**: Pet category preferences
- **Behavioral**: Activity-based targeting

### 3. Analytics & Reporting
- **Delivery Statistics**: Success/failure rates
- **Engagement Metrics**: Open and click rates
- **Daily Reports**: Time-based analytics
- **Performance Tracking**: Platform-wise statistics

### 4. Notification Channels (Android)
```javascript
// Automatic channel assignment based on notification type
const channels = {
  'chat': 'chat_channel',
  'pet_inquiry': 'pet_channel', 
  'follow': 'social_channel',
  'post': 'social_channel',
  'promotion': 'marketing_channel',
  'admin': 'system_channel',
  'system': 'system_channel'
}
```

---

## 🛠️ Installation & Setup

### 1. Install Dependencies
```bash
npm install firebase-admin node-cron
```

### 2. Environment Setup
Create `.env` file with Firebase configuration variables

### 3. Database Setup
The models will be automatically created when the server starts

### 4. Server Integration
The notification system is automatically initialized when the server starts if Firebase credentials are properly configured

### 5. Client Integration
Implement client-side FCM integration using the examples above

---

## 🧪 Testing

### Test Notification API
```bash
# Test notification to specific user
curl -X POST http://localhost:3010/api/notifications/admin/test \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_123"}'

# Register device token
curl -X POST http://localhost:3010/api/notifications/register-device \
  -H "Authorization: Bearer <user-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "fcm_token_here",
    "platform": "web",
    "deviceId": "browser_123"
  }'
```

---

## 🔐 Security Features

### 1. Authentication
- JWT token required for all user endpoints
- Admin authentication for management endpoints
- Device token validation

### 2. Rate Limiting
- FCM batch limits (500 tokens per request)
- API rate limiting to prevent abuse
- Token cleanup to maintain performance

### 3. Data Privacy
- User notification preferences
- Opt-out mechanisms
- Secure token storage

### 4. Error Handling
- Invalid token cleanup
- Failed delivery tracking  
- Graceful fallbacks

---

## 📈 Performance Optimization

### 1. Batch Processing
- Multiple tokens sent in single FCM request
- Efficient database queries with proper indexing
- Cron job optimization

### 2. Caching
- Device token caching
- Notification template caching
- User preference caching

### 3. Cleanup
- Automatic cleanup of expired notifications
- Inactive token removal
- Database optimization

---

## 🚀 Production Deployment

### Environment Variables
```env
NODE_ENV=production
ENABLE_CRON=true
FIREBASE_PROJECT_ID=your-production-project
# ... other Firebase credentials
```

### PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'jivbook-backend',
    script: './index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      ENABLE_CRON: 'true'
    }
  }]
};
```

---

## ✅ Features Summary

### ✅ Implemented:
- [x] Firebase Admin SDK integration
- [x] Multi-platform support (Android, iOS, Web)
- [x] Device token management
- [x] Individual and broadcast notifications
- [x] Scheduled notifications with cron jobs
- [x] Rich notifications with images and actions
- [x] Advanced targeting and filtering
- [x] Real-time chat integration
- [x] Automatic event notifications
- [x] Comprehensive analytics
- [x] Admin dashboard APIs
- [x] User notification preferences
- [x] Notification history and management
- [x] Error handling and token cleanup

### 🔄 Future Enhancements:
- [ ] Email notification integration
- [ ] SMS notification support
- [ ] A/B testing for notifications
- [ ] Notification templates
- [ ] Advanced user segmentation
- [ ] Geofencing notifications
- [ ] Voice notifications
- [ ] Integration with other messaging platforms

---

## 📞 Support & Integration

यह notification system पूरी तरह से production-ready है और सभी modern platforms को support करता है। Firebase FCM के latest APIs का उपयोग करके बनाया गया है।

### आपको क्या चाहिए होगा:

1. **Firebase Project Setup**:
   - Firebase Console में project बनाएं
   - Cloud Messaging enable करें  
   - Service account key generate करें

2. **Environment Variables**:
   - Firebase credentials को .env file में add करें

3. **Client-side Integration**:
   - Mobile apps में Firebase SDK setup करें
   - Web app में service worker setup करें

4. **Testing**:
   - Device tokens register करें
   - Test notifications send करें

**Status**: ✅ **Complete & Production Ready**  
**Integration**: Ready for Android, iOS, Web, and Admin Panel  
**Documentation**: Comprehensive with examples

सभी APIs documented हैं और testing के लिए ready हैं। किसी भी additional feature या customization के लिए इस documentation को reference के रूप में use करें।
