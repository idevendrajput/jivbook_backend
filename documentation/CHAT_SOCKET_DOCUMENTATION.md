# 💬 Chat System & Socket.IO Documentation - Jivbook Backend

## Overview

Jivbook backend में एक comprehensive real-time chat system implement किया गया है जो OLX की तरह pet inquiries और general messaging के लिए optimized है। यह system Socket.IO के साथ integrated है और complete chat functionality प्रदान करता है।

---

## 🏗️ System Architecture

### Core Components:
1. **Chat Model** - Chat rooms और conversations manage करता है
2. **Message Model** - Individual messages और metadata store करता है  
3. **Socket.IO Integration** - Real-time communication
4. **REST API Endpoints** - Chat management और history
5. **File Upload Support** - Images और videos के लिए

### Chat Types:
- **Pet Inquiry** (`pet_inquiry`) - Pet listings के लिए buyer-seller communication
- **Direct Chat** (`direct`) - Users के बीच general messaging
- **General** (`general`) - Other purposes

---

## 📊 Database Models

### 1. Chat Schema
```javascript
{
  participants: [ObjectId], // Chat में participate करने वाले users
  petListing: ObjectId,     // Pet inquiry के लिए related pet
  chatType: String,         // 'pet_inquiry', 'direct', 'general'  
  lastMessage: ObjectId,    // Last message reference
  lastMessageTime: Date,    // Last activity timestamp
  isActive: Boolean,        // Chat status
  blockedBy: [ObjectId],    // Users जिन्होंने chat को block किया है
  unreadCount: [{           // Unread message count per user
    userId: ObjectId,
    count: Number
  }],
  timestamps: true          // createdAt, updatedAt
}
```

### 2. Message Schema
```javascript
{
  chat: ObjectId,           // Parent chat reference
  sender: ObjectId,         // Message sender
  messageType: String,      // 'text', 'image', 'video'
  content: String,          // Message content
  mediaUrl: String,         // Media file path (if applicable)
  readBy: [ObjectId],       // Users who have read the message
  status: String,           // 'sent', 'delivered', 'read'
  parentMessage: ObjectId,  // For reply functionality
  reactions: [{             // Message reactions (future use)
    reactor: ObjectId,
    emoji: String
  }],
  isEdited: Boolean,        // Edit status
  isDeleted: Boolean,       // Soft delete status
  timestamps: true
}
```

---

## 🔗 REST API Endpoints

### Base URL: `/api/chat`

#### 1. Create or Get Chat
```http
POST /api/chat/create
Authorization: Bearer <jwt-token>
Content-Type: application/json

Body:
{
  "participantId": "user_id_to_chat_with",
  "petId": "pet_id_for_inquiry" // optional for pet-related chats
}
```

**Response:**
```json
{
  "success": true,
  "message": "Chat created successfully",
  "data": {
    "_id": "chat_id",
    "participants": [
      {
        "_id": "user_id",
        "name": "User Name",
        "email": "user@example.com",
        "profilePicture": "/uploads/profiles/user.jpg"
      }
    ],
    "petListing": {
      "_id": "pet_id",
      "title": "Golden Retriever Puppy",
      "images": [...],
      "price": 15000,
      "address": "Delhi"
    },
    "chatType": "pet_inquiry",
    "isActive": true,
    "createdAt": "2025-01-06T00:00:00.000Z"
  }
}
```

#### 2. Get User's Chats
```http
GET /api/chat/my-chats?page=1&limit=20
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Chats retrieved successfully",
  "data": {
    "chats": [
      {
        "_id": "chat_id",
        "participants": [...],
        "petListing": {...},
        "lastMessage": {
          "_id": "message_id",
          "content": "Hello! Is this pet still available?",
          "createdAt": "2025-01-06T12:00:00.000Z"
        },
        "lastMessageTime": "2025-01-06T12:00:00.000Z",
        "unreadCount": [
          {
            "userId": "user_id",
            "count": 3
          }
        ]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalChats": 25,
      "hasMore": true
    }
  }
}
```

#### 3. Get Chat Messages
```http
GET /api/chat/:chatId/messages?page=1&limit=50
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Messages retrieved successfully",
  "data": {
    "messages": [
      {
        "_id": "message_id",
        "chat": "chat_id",
        "sender": {
          "_id": "sender_id",
          "name": "John Doe",
          "profilePicture": "/uploads/profiles/john.jpg"
        },
        "messageType": "text",
        "content": "Hello! Is this pet still available?",
        "readBy": ["user_id_1"],
        "status": "read",
        "createdAt": "2025-01-06T12:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalMessages": 145,
      "hasMore": true
    }
  }
}
```

#### 4. Send Text Message
```http
POST /api/chat/:chatId/send
Authorization: Bearer <jwt-token>
Content-Type: application/json

Body:
{
  "content": "Hello! Is this pet still available?",
  "messageType": "text",
  "parentMessageId": "message_id_for_reply" // optional
}
```

#### 5. Send Media Message
```http
POST /api/chat/:chatId/send-media
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data

Form-data:
media: file (image/video, max 50MB)
content: "Optional caption for media"
```

**Response:**
```json
{
  "success": true,
  "message": "Media message sent successfully",
  "data": {
    "_id": "message_id",
    "chat": "chat_id",
    "sender": {
      "_id": "sender_id",
      "name": "John Doe",
      "profilePicture": "/uploads/profiles/john.jpg"
    },
    "messageType": "image",
    "content": "Sent image",
    "mediaUrl": "chat-1640995200-123456789.jpg",
    "status": "sent",
    "createdAt": "2025-01-06T12:00:00.000Z"
  }
}
```

#### 6. Mark Messages as Read
```http
PUT /api/chat/:chatId/mark-read
Authorization: Bearer <jwt-token>
```

#### 7. Delete Message
```http
DELETE /api/chat/message/:messageId
Authorization: Bearer <jwt-token>
```

#### 8. Block/Unblock Chat
```http
PUT /api/chat/:chatId/toggle-block
Authorization: Bearer <jwt-token>
```

---

## 🔌 Socket.IO Integration

### Connection Setup

#### Client Side (JavaScript)
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3010', {
  auth: {
    token: 'your-jwt-token'
  }
});

socket.on('connect', () => {
  console.log('Connected to server:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});
```

#### React Native Example
```javascript
import io from 'socket.io-client';

const connectSocket = (token) => {
  const socket = io('https://api.jivbook.com', {
    auth: {
      token: token
    },
    transports: ['websocket', 'polling']
  });
  
  return socket;
};
```

---

## 📡 Socket Events

### 1. User Status Events

#### Online Status
```javascript
// Client sends when user becomes active
socket.emit('online');

// Server updates user status in database
User.findByIdAndUpdate(userId, { isOnline: true });
```

#### Typing Indicator
```javascript
// Client sends typing status
socket.emit('typing', { 
  chatId: 'chat_id', 
  isTyping: true 
});

// Other participants receive typing status
socket.on('typing', ({ userId, isTyping }) => {
  // Update UI to show typing indicator
  console.log(`User ${userId} is ${isTyping ? 'typing' : 'stopped typing'}`);
});
```

### 2. Message Events

#### Send Message
```javascript
// Client sends message
socket.emit('sendMessage', {
  chatId: 'chat_id',
  content: 'Hello! Is this pet still available?',
  messageType: 'text',
  mediaUrl: null,
  parentMessageId: null // for replies
});

// Server processes and broadcasts
// Message saved to database
// Sent to all chat participants
```

#### Receive Message
```javascript
// All chat participants receive new message
socket.on('newMessage', (message) => {
  console.log('New message received:', message);
  
  // Update chat UI
  // Play notification sound
  // Update unread count
  
  /*
  message structure:
  {
    _id: 'message_id',
    chat: 'chat_id',
    sender: {
      _id: 'sender_id',
      name: 'John Doe',
      profilePicture: '/uploads/profiles/john.jpg'
    },
    content: 'Hello! Is this pet still available?',
    messageType: 'text',
    createdAt: '2025-01-06T12:00:00.000Z'
  }
  */
});
```

#### Mark as Read
```javascript
// Client marks message as read
socket.emit('markAsRead', {
  chatId: 'chat_id',
  messageId: 'message_id'
});

// Participants receive read confirmation
socket.on('messageRead', ({ messageId, userId }) => {
  // Update message read status in UI
  console.log(`Message ${messageId} read by ${userId}`);
});
```

### 3. Error Handling
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
  // Display error message to user
  // Attempt reconnection if needed
});
```

### 4. Connection Events
```javascript
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  // Server automatically updates user to offline
  // Attempts auto-reconnection
});

socket.on('reconnect', (attemptNumber) => {
  console.log('Reconnected after', attemptNumber, 'attempts');
  // Emit online status again
  socket.emit('online');
});
```

---

## 🎯 OLX-Style Features Implementation

### 1. Pet Inquiry Chat
```javascript
// When user clicks "Chat with Seller" on pet listing
const initiatePetInquiry = async (petId, sellerId) => {
  try {
    const response = await fetch('/api/chat/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        participantId: sellerId,
        petId: petId
      })
    });
    
    const chatData = await response.json();
    // Navigate to chat screen with pet context
    navigateToChat(chatData.data);
  } catch (error) {
    console.error('Failed to create pet inquiry chat:', error);
  }
};
```

### 2. Chat List with Pet Context
```javascript
// Display chats with pet information
const ChatListItem = ({ chat }) => {
  const otherParticipant = chat.participants.find(p => p._id !== currentUserId);
  const unreadCount = chat.unreadCount.find(u => u.userId === currentUserId)?.count || 0;
  
  return (
    <div className="chat-item">
      <div className="participant-info">
        <img src={otherParticipant.profilePicture} alt="Profile" />
        <span>{otherParticipant.name}</span>
      </div>
      
      {chat.petListing && (
        <div className="pet-context">
          <img src={chat.petListing.images[0]?.url} alt="Pet" />
          <span>{chat.petListing.title}</span>
          <span>₹{chat.petListing.price}</span>
        </div>
      )}
      
      <div className="last-message">
        <span>{chat.lastMessage?.content}</span>
        <span>{formatTime(chat.lastMessageTime)}</span>
      </div>
      
      {unreadCount > 0 && (
        <div className="unread-badge">{unreadCount}</div>
      )}
    </div>
  );
};
```

### 3. Real-time Chat Interface
```javascript
const ChatScreen = ({ chatId }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  useEffect(() => {
    // Join chat room and listen for messages
    socket.emit('join-chat', { chatId });
    
    socket.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });
    
    socket.on('typing', ({ userId, isTyping }) => {
      setIsTyping(isTyping && userId !== currentUserId);
    });
    
    return () => {
      socket.off('newMessage');
      socket.off('typing');
    };
  }, [chatId]);
  
  const sendMessage = () => {
    if (inputMessage.trim()) {
      socket.emit('sendMessage', {
        chatId,
        content: inputMessage,
        messageType: 'text'
      });
      setInputMessage('');
    }
  };
  
  const handleTyping = (typing) => {
    socket.emit('typing', { chatId, isTyping: typing });
  };
  
  return (
    <div className="chat-screen">
      <div className="messages-container">
        {messages.map(message => (
          <MessageBubble key={message._id} message={message} />
        ))}
        {isTyping && <TypingIndicator />}
      </div>
      
      <div className="message-input">
        <input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onFocus={() => handleTyping(true)}
          onBlur={() => handleTyping(false)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};
```

---

## 📱 Mobile Integration (React Native)

### Socket Connection Hook
```javascript
import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

export const useSocket = (token) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    if (token) {
      socketRef.current = io('https://api.jivbook.com', {
        auth: { token },
        transports: ['websocket', 'polling']
      });
      
      socketRef.current.on('connect', () => {
        setIsConnected(true);
        socketRef.current.emit('online');
      });
      
      socketRef.current.on('disconnect', () => {
        setIsConnected(false);
      });
    }
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token]);
  
  return {
    socket: socketRef.current,
    isConnected
  };
};
```

### Push Notifications Integration
```javascript
// When new message received and app is in background
socket.on('newMessage', async (message) => {
  const appState = await AppState.currentState;
  
  if (appState === 'background') {
    // Send local push notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: message.sender.name,
        body: message.content,
        data: { 
          chatId: message.chat,
          messageId: message._id 
        }
      },
      trigger: null
    });
  } else {
    // Update in-app UI
    updateChatMessages(message);
  }
});
```

---

## 🔒 Security Features

### 1. Authentication
- JWT token required for all socket connections
- Token validation on each request
- User verification before chat access

### 2. Authorization
- Only chat participants can send/receive messages
- Pet inquiry chats automatically include pet owner
- Block/unblock functionality

### 3. Data Validation
```javascript
// Message validation
const validateMessage = (data) => {
  const { content, messageType } = data;
  
  if (!content || content.trim().length === 0) {
    throw new Error('Message content cannot be empty');
  }
  
  if (content.length > 1000) {
    throw new Error('Message too long');
  }
  
  if (!['text', 'image', 'video'].includes(messageType)) {
    throw new Error('Invalid message type');
  }
};
```

### 4. File Upload Security
- File type validation (images and videos only)
- File size limits (50MB max)
- Unique filename generation
- Secure file storage

---

## 📊 Performance Optimizations

### 1. Database Indexes
```javascript
// Chat model indexes
chatSchema.index({ participants: 1 });
chatSchema.index({ petListing: 1 });
chatSchema.index({ lastMessageTime: -1 });

// Message model indexes  
messageSchema.index({ chat: 1, createdAt: -1 });
```

### 2. Pagination
- Messages paginated (50 per page)
- Chats paginated (20 per page)
- Efficient skip/limit queries

### 3. Socket Room Management
```javascript
// Users join their own room for targeted messaging
socket.join(userId.toString());

// Chat-specific rooms for group messaging
socket.join(chatId);
```

---

## 🚀 Deployment & Production

### Environment Variables
```env
# Socket.IO Configuration
SOCKET_IO_CORS_ORIGIN=*
SOCKET_IO_TRANSPORTS=websocket,polling

# File Upload Configuration  
CHAT_MEDIA_PATH=/var/www/jivbook_files/chat_media
MAX_FILE_SIZE=52428800
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
      PORT: 3010
    }
  }]
};
```

### Load Balancing with Redis (Future)
```javascript
// For multi-server scaling
const redis = require('socket.io-redis');
io.adapter(redis({ host: 'localhost', port: 6379 }));
```

---

## 🧪 Testing

### Socket.IO Testing (Jest + Socket.IO Client)
```javascript
const Client = require('socket.io-client');

describe('Chat Socket', () => {
  let clientSocket;
  let serverSocket;
  
  beforeAll((done) => {
    clientSocket = Client('http://localhost:3010', {
      auth: { token: 'valid-jwt-token' }
    });
    
    clientSocket.on('connect', done);
  });
  
  afterAll(() => {
    clientSocket.close();
  });
  
  test('should send and receive message', (done) => {
    const testMessage = {
      chatId: 'test-chat-id',
      content: 'Hello from test',
      messageType: 'text'
    };
    
    clientSocket.on('newMessage', (message) => {
      expect(message.content).toBe(testMessage.content);
      done();
    });
    
    clientSocket.emit('sendMessage', testMessage);
  });
});
```

### API Endpoint Testing
```bash
# Create chat
curl -X POST http://localhost:3010/api/chat/create \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"participantId": "user_id", "petId": "pet_id"}'

# Send message  
curl -X POST http://localhost:3010/api/chat/chat_id/send \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test message", "messageType": "text"}'
```

---

## 📈 Monitoring & Analytics

### Key Metrics to Track:
1. **Active Connections**: Current socket connections
2. **Message Volume**: Messages per minute/hour
3. **Response Times**: Message delivery latency  
4. **Error Rates**: Connection failures, message failures
5. **User Engagement**: Chat creation rate, message frequency

### Logging Implementation
```javascript
// Socket connection logging
socket.on('connect', () => {
  console.log(`[${new Date().toISOString()}] Socket connected: ${socket.id} - User: ${socket.user.name}`);
});

// Message logging
socket.on('sendMessage', (data) => {
  console.log(`[${new Date().toISOString()}] Message sent - Chat: ${data.chatId}, User: ${socket.user.id}`);
});
```

---

## 🔧 Troubleshooting

### Common Issues:

1. **Connection Timeout**
```javascript
// Client-side timeout handling
const socket = io('http://localhost:3010', {
  auth: { token },
  timeout: 20000,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000
});
```

2. **Memory Leaks**
```javascript
// Proper cleanup
useEffect(() => {
  return () => {
    socket.off('newMessage');
    socket.off('typing');
    socket.disconnect();
  };
}, []);
```

3. **Authentication Issues**
```javascript
// Token refresh handling
socket.on('connect_error', (error) => {
  if (error.message === 'Authentication error') {
    // Refresh token and reconnect
    refreshToken().then(newToken => {
      socket.auth.token = newToken;
      socket.connect();
    });
  }
});
```

---

## ✅ Features Summary

### ✅ Implemented Features:
- [x] Real-time messaging with Socket.IO
- [x] Pet inquiry chats (OLX-style)
- [x] Direct messaging between users
- [x] File upload (images/videos) 
- [x] Message read receipts
- [x] Typing indicators
- [x] User online/offline status
- [x] Chat blocking/unblocking
- [x] Message deletion (soft delete)
- [x] Unread message counts
- [x] Pagination for chats and messages
- [x] JWT authentication for sockets
- [x] Chat participant validation
- [x] Media file validation and storage

### 🔄 Future Enhancements:
- [ ] Message reactions (like/love/laugh)
- [ ] Voice message support
- [ ] Message forwarding
- [ ] Chat search functionality
- [ ] Message encryption
- [ ] Push notifications (FCM integration)
- [ ] Chat export functionality
- [ ] Admin chat monitoring
- [ ] Chat analytics dashboard
- [ ] Multi-language support

---

## 📞 Support & Integration

यह chat system पूरी तरह से production-ready है और OLX-style pet marketplace के लिए optimized है। Frontend और mobile apps में integration के लिए:

1. **Socket.IO Client** setup करें
2. **JWT token** authentication implement करें  
3. **Real-time message handling** add करें
4. **File upload** functionality integrate करें
5. **Push notifications** setup करें

सभी APIs documented हैं और testing के लिए ready हैं। किसी भी additional feature या customization के लिए इस documentation को reference के रूप में use करें।

**Status**: ✅ **Complete & Production Ready**  
**Integration**: Ready for Frontend, Mobile Apps, and Admin Panel
