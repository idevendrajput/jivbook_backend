const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const chatController = require('../controllers/chatController');

const router = express.Router();

// Multer configuration for chat media uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = process.env.NODE_ENV === 'production' 
      ? '/var/www/jivbook_files/chat_media' 
      : 'uploads/chat_media';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'chat-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow images and videos
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Routes

// Create or get existing chat
router.post('/create', auth, chatController.createOrGetChat);

// Get user's chats (with pagination)
router.get('/my-chats', auth, chatController.getUserChats);

// Get total unread messages count
router.get('/unread-count', auth, chatController.getUnreadCount);

// Get chat messages (with pagination)
router.get('/:chatId/messages', auth, chatController.getChatMessages);

// Send text message
router.post('/:chatId/send', auth, chatController.sendMessage);

// Send media message
router.post('/:chatId/send-media', auth, upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No media file uploaded' });
    }

    // Construct proper media URL for client consumption
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api.jivbook.com/uploads/chat_media/' 
      : `http://localhost:${process.env.PORT || 5000}/uploads/chat_media/`;
    
    const mediaUrl = baseUrl + req.file.filename;
    const messageType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';

    // Add media info to request body
    req.body.mediaUrl = mediaUrl;
    req.body.messageType = messageType;
    req.body.content = req.body.content || `Sent ${messageType}`;

    // Use the existing sendMessage controller
    await chatController.sendMessage(req, res);
  } catch (error) {
    console.error('Send media message error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Mark messages as read
router.put('/:chatId/mark-read', auth, chatController.markAsRead);

// Delete message
router.delete('/message/:messageId', auth, chatController.deleteMessage);

// Block/Unblock chat
router.put('/:chatId/toggle-block', auth, chatController.toggleBlockChat);

module.exports = router;
