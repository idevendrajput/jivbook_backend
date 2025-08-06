const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Pet = require('../models/Pet');
const User = require('../models/User');
const BaseResponse = require('../models/BaseResponse');

const chatController = {
  // Create or get existing chat
  createOrGetChat: async (req, res) => {
    try {
      const { petId, participantId } = req.body;
      const userId = req.user.id;

      // If no petId provided, create a direct chat
      if (!petId && participantId) {
        // Check if participant exists
        const participant = await User.findById(participantId);
        if (!participant) {
          return res.status(404).json(BaseResponse.error('User not found'));
        }

        // Check if direct chat already exists
        let chat = await Chat.findOne({
          participants: { $all: [userId, participantId] },
          chatType: 'direct'
        }).populate('participants', 'name email profilePicture')
          .populate('lastMessage');

        if (chat) {
          return res.json(BaseResponse.success('Chat retrieved successfully', chat));
        }

        // Create new direct chat
        chat = new Chat({
          participants: [userId, participantId],
          chatType: 'direct'
        });

        await chat.save();
        
        // Populate the created chat
        chat = await Chat.findById(chat._id)
          .populate('participants', 'name email profilePicture')
          .populate('lastMessage');

        return res.status(201).json(BaseResponse.success('Chat created successfully', chat));
      }

      // Pet-based chat logic
      if (petId) {
        // Check if pet exists
        const pet = await Pet.findById(petId);
        if (!pet) {
          return res.status(404).json(BaseResponse.error('Pet not found'));
        }

        // Check if chat already exists
        let chat = await Chat.findOne({
          petListing: petId,
          participants: { $all: [userId, participantId] }
        }).populate('participants', 'name email profilePicture')
          .populate('petListing', 'title images price address')
          .populate('lastMessage');

        if (chat) {
          return res.json(BaseResponse.success('Chat retrieved successfully', chat));
        }

        // Create new chat
        chat = new Chat({
          participants: [userId, participantId],
          petListing: petId,
          chatType: 'pet_inquiry'
        });

        await chat.save();
        
        // Populate the created chat
        chat = await Chat.findById(chat._id)
          .populate('participants', 'name email profilePicture')
          .populate('petListing', 'title images price address')
          .populate('lastMessage');

        return res.status(201).json(BaseResponse.success('Chat created successfully', chat));
      }

      return res.status(400).json(BaseResponse.error('Either petId or participantId is required'));
    } catch (error) {
      console.error('Create chat error:', error);
      res.status(500).json(BaseResponse.error('Server error', error.message));
    }
  },

  // Get user's chats
  getUserChats: async (req, res) => {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const chats = await Chat.find({
        participants: userId,
        isActive: true
      })
      .populate('participants', 'name email profilePicture isOnline lastSeen')
      .populate('petListing', 'name images price location category breed')
      .populate('lastMessage')
      .sort({ lastMessageTime: -1 })
      .skip(skip)
      .limit(limit);

      const totalChats = await Chat.countDocuments({
        participants: userId,
        isActive: true
      });

      const response = {
        chats,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalChats / limit),
          totalChats,
          hasMore: page < Math.ceil(totalChats / limit)
        }
      };

      res.json(BaseResponse.success('Chats retrieved successfully', response));
    } catch (error) {
      console.error('Get user chats error:', error);
      res.status(500).json(BaseResponse.error('Server error', error.message));
    }
  },

  // Get chat messages
  getChatMessages: async (req, res) => {
    try {
      const { chatId } = req.params;
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;

      // Check if user is participant of the chat
      const chat = await Chat.findById(chatId);
      if (!chat || !chat.participants.includes(userId)) {
        return res.status(403).json(BaseResponse.error('Access denied'));
      }

      const messages = await Message.find({
        chat: chatId,
        isDeleted: false
      })
      .populate('sender', 'name profilePicture')
      .populate('parentMessage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

      const totalMessages = await Message.countDocuments({
        chat: chatId,
        isDeleted: false
      });

      // Mark messages as read by current user
      await Message.updateMany(
        {
          chat: chatId,
          sender: { $ne: userId },
          readBy: { $ne: userId }
        },
        { $addToSet: { readBy: userId } }
      );

      // Reset unread count for current user
      await chat.resetUnreadCount(userId);

      const response = {
        messages: messages.reverse(), // Return in chronological order
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalMessages / limit),
          totalMessages,
          hasMore: page < Math.ceil(totalMessages / limit)
        }
      };

      res.json(BaseResponse.success('Messages retrieved successfully', response));
    } catch (error) {
      console.error('Get chat messages error:', error);
      res.status(500).json(BaseResponse.error('Server error', error.message));
    }
  },

  // Send message
  sendMessage: async (req, res) => {
    try {
      const { chatId } = req.params;
      const { content, messageType = 'text', mediaUrl, parentMessageId } = req.body;
      const userId = req.user.id;

      // Check if user is participant of the chat
      const chat = await Chat.findById(chatId);
      if (!chat || !chat.participants.includes(userId)) {
        return res.status(403).json(BaseResponse.error('Access denied'));
      }

      // Check if chat is blocked
      if (chat.blockedBy.length > 0) {
        return res.status(403).json(BaseResponse.error('This chat is blocked'));
      }

      const message = new Message({
        chat: chatId,
        sender: userId,
        content,
        messageType,
        mediaUrl,
        parentMessage: parentMessageId || null
      });

      await message.save();

      // Update chat's last message
      chat.lastMessage = message._id;
      chat.lastMessageTime = new Date();
      
      // Increment unread count for other participants
      for (const participantId of chat.participants) {
        if (participantId.toString() !== userId.toString()) {
          await chat.incrementUnreadCount(participantId);
        }
      }

      await chat.save();

      // Populate the message
      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name profilePicture')
        .populate('parentMessage');

      res.status(201).json(BaseResponse.success('Message sent successfully', populatedMessage));
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json(BaseResponse.error('Server error', error.message));
    }
  },

  // Delete message
  deleteMessage: async (req, res) => {
    try {
      const { messageId } = req.params;
      const userId = req.user.id;

      const message = await Message.findById(messageId);
      if (!message) {
        return res.status(404).json(BaseResponse.error('Message not found'));
      }

      // Check if user is the sender
      if (message.sender.toString() !== userId.toString()) {
        return res.status(403).json(BaseResponse.error('Access denied'));
      }

      message.isDeleted = true;
      message.content = 'This message was deleted';
      await message.save();

      res.json(BaseResponse.success('Message deleted successfully'));
    } catch (error) {
      console.error('Delete message error:', error);
      res.status(500).json(BaseResponse.error('Server error', error.message));
    }
  },

  // Block/Unblock chat
  toggleBlockChat: async (req, res) => {
    try {
      const { chatId } = req.params;
      const userId = req.user.id;

      const chat = await Chat.findById(chatId);
      if (!chat || !chat.participants.includes(userId)) {
        return res.status(403).json(BaseResponse.error('Access denied'));
      }

      const isBlocked = chat.blockedBy.includes(userId);
      
      if (isBlocked) {
        // Unblock
        chat.blockedBy = chat.blockedBy.filter(id => id.toString() !== userId.toString());
      } else {
        // Block
        chat.blockedBy.push(userId);
      }

      await chat.save();

      const action = isBlocked ? 'unblocked' : 'blocked';
      res.json(BaseResponse.success(`Chat ${action} successfully`));
    } catch (error) {
      console.error('Toggle block chat error:', error);
      res.status(500).json(BaseResponse.error('Server error', error.message));
    }
  },

  // Mark messages as read
  markAsRead: async (req, res) => {
    try {
      const { chatId } = req.params;
      const userId = req.user.id;

      // Check if user is participant of the chat
      const chat = await Chat.findById(chatId);
      if (!chat || !chat.participants.includes(userId)) {
        return res.status(403).json(BaseResponse.error('Access denied'));
      }

      // Mark all messages as read by current user
      await Message.updateMany(
        {
          chat: chatId,
          sender: { $ne: userId },
          readBy: { $ne: userId }
        },
        { $addToSet: { readBy: userId } }
      );

      // Reset unread count
      await chat.resetUnreadCount(userId);

      res.json(BaseResponse.success('Messages marked as read'));
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json(BaseResponse.error('Server error', error.message));
    }
  }
};

module.exports = chatController;
