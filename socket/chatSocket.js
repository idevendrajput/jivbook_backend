const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

module.exports = function(io) {
  // Middleware for authenticating socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error.message);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} - User: ${socket.user.name}`);

    // Join user-specific room
    socket.join(socket.user.id.toString());

    // Handle user online status
    socket.on('online', async () => {
      await User.findByIdAndUpdate(socket.user.id, { isOnline: true });
      console.log(`${socket.user.name} is online`);
      // Broadcast to user's contacts that they are online
    });

    // Handle user typing status
    socket.on('typing', ({ chatId, isTyping }) => {
      socket.to(chatId).emit('typing', { userId: socket.user.id, isTyping });
    });

    // Handle sending a message
    socket.on('sendMessage', async (data) => {
      try {
        const { chatId, content, messageType, mediaUrl, parentMessageId } = data;

        const chat = await Chat.findById(chatId);
        if (!chat || !chat.participants.includes(socket.user.id)) {
          return socket.emit('error', { message: 'Access denied to this chat' });
        }

        const message = new Message({
          chat: chatId,
          sender: socket.user.id,
          content,
          messageType: messageType || 'text',
          mediaUrl,
          parentMessage: parentMessageId || null,
        });

        await message.save();

        chat.lastMessage = message._id;
        chat.lastMessageTime = new Date();
        await chat.save();

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name profilePicture');

        // Emit message to all participants in the chat
        for (const participantId of chat.participants) {
          io.to(participantId.toString()).emit('newMessage', populatedMessage);
        }

      } catch (error) {
        console.error('Send message socket error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle marking a message as read
    socket.on('markAsRead', async ({ chatId, messageId }) => {
        try {
            const message = await Message.findById(messageId);
            if (message) {
                await message.markAsReadBy(socket.user.id);
                io.to(chatId).emit('messageRead', { messageId, userId: socket.user.id });
            }
        } catch(error) {
            console.error(error);
        }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.id}`);
      await User.findByIdAndUpdate(socket.user.id, { isOnline: false, lastSeen: new Date() });
      // Broadcast to user's contacts that they are offline
    });

  });
};
