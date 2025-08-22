const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

const TEST_USER_ID = '68974350b11863f82c410d79';

const sampleMessages = [
  "Hello! Is your Golden Retriever still available?",
  "Yes, it's available. When would you like to visit?",
  "How about tomorrow afternoon?",
  "Sure, that works for me. What time?",
  "Around 2 PM would be perfect",
  "Great! I'll send you the address",
  "Thank you! Looking forward to meeting the puppy",
  "Can you share more photos?",
  "What's your best price?",
  "Is it vaccinated?",
  "Yes, all vaccinations are up to date",
  "Perfect! Can we schedule a visit?",
  "How old is the pet?",
  "It's 3 months old",
  "Does it get along with kids?",
  "Yes, very friendly with children",
  "I'm interested in buying",
  "Let's discuss the details",
  "Can you deliver to my location?",
  "What's included in the price?"
];

async function populateTestChats() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the test user
    const testUser = await User.findById(TEST_USER_ID);
    if (!testUser) {
      console.log('Test user not found!');
      return;
    }
    console.log('Found test user:', testUser.name);

    // Get all other users (excluding test user)
    const otherUsers = await User.find({ 
      _id: { $ne: TEST_USER_ID } 
    }).limit(8);

    console.log(`Found ${otherUsers.length} other users to create chats with`);

    // Delete existing chats for test user
    await Chat.deleteMany({ participants: TEST_USER_ID });
    console.log('Deleted existing chats for test user');

    // Create chats with other users
    const createdChats = [];
    
    for (let i = 0; i < otherUsers.length; i++) {
      const otherUser = otherUsers[i];
      
      // Create a new chat
      const chat = new Chat({
        participants: [TEST_USER_ID, otherUser._id],
        chatType: 'direct',
        isActive: true,
        createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)), // Spread over different days
        lastMessageTime: new Date()
      });

      await chat.save();
      createdChats.push({
        chat,
        otherUser
      });

      console.log(`Created chat with user: ${otherUser.name}`);
    }

    // Create messages for each chat
    for (let i = 0; i < createdChats.length; i++) {
      const { chat, otherUser } = createdChats[i];
      const messageCount = Math.floor(Math.random() * 8) + 3; // 3-10 messages per chat
      
      let lastMessage = null;
      let unreadCount = 0;

      for (let j = 0; j < messageCount; j++) {
        // Alternate between test user and other user as senders
        const isTestUserSender = j % 2 === 0;
        const senderId = isTestUserSender ? TEST_USER_ID : otherUser._id;
        
        // Create message
        const message = new Message({
          chat: chat._id,
          sender: senderId,
          content: sampleMessages[Math.floor(Math.random() * sampleMessages.length)],
          messageType: 'text',
          createdAt: new Date(Date.now() - ((messageCount - j) * 2 * 60 * 60 * 1000)), // 2 hours apart
          readBy: isTestUserSender ? [senderId] : [], // Test user messages are read, others are unread
        });

        await message.save();
        lastMessage = message;

        // Count unread messages (sent by other user)
        if (!isTestUserSender) {
          unreadCount++;
        }

        console.log(`Created message in chat with ${otherUser.name}: "${message.content}"`);
      }

      // Update chat with last message and unread count
      if (lastMessage) {
        chat.lastMessage = lastMessage._id;
        chat.lastMessageTime = lastMessage.createdAt;
        
        // Set unread count for test user
        if (!chat.unreadCount) {
          chat.unreadCount = new Map();
        }
        chat.unreadCount.set(TEST_USER_ID, unreadCount);
        
        await chat.save();
        console.log(`Updated chat with ${otherUser.name} - unread count: ${unreadCount}`);
      }
    }

    console.log('\n=== SUMMARY ===');
    console.log(`✅ Created ${createdChats.length} chat rooms for user: ${testUser.name}`);
    console.log(`✅ Added sample messages to all chats`);
    console.log(`✅ Set up unread counts for testing`);
    console.log('\nChat rooms created with:');
    
    createdChats.forEach(({ otherUser }, index) => {
      console.log(`${index + 1}. ${otherUser.name} (${otherUser.phone || otherUser.email})`);
    });

  } catch (error) {
    console.error('Error populating test chats:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
populateTestChats();
