const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const User = require('./models/User');
const Slider = require('./models/Slider');
const BaseResponse = require('./models/BaseResponse');
const TokenResponse = require('./models/TokenResponse');
const auth = require('./middleware/auth');
const connectDB = require('./config/database');
const { generateUniqueUsername } = require('./utils/userUtils');
const endpoints = require('./endpoints');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize express
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// API routes
// Auth routes
const authRoutes = require('./routes/auth');
app.use(endpoints.AUTH, authRoutes);
app.use(endpoints.REFRESH_TOKEN, authRoutes);

// Profile routes
const profileRoutes = require('./routes/profile');
app.use(endpoints.PROFILE, profileRoutes);

// Get all users (for testing)
app.get(endpoints.USERS, async (req, res) => {
  try {
    const users = await User.find().select('-__v');
    const response = BaseResponse.success('Users retrieved successfully', users);
    res.json(response);
  } catch (error) {
    const response = BaseResponse.error('Server error', error.message);
    res.status(500).json(response);
  }
});

// Slider routes
const sliderRoutes = require('./routes/slider');
app.use(endpoints.SLIDER_BASE, sliderRoutes);

// Pet Category routes
const petCategoryRoutes = require('./routes/petCategory');
app.use(endpoints.PET_CATEGORY_BASE, petCategoryRoutes);

// Breed routes
const breedRoutes = require('./routes/breed');
app.use(endpoints.BREED_BASE, breedRoutes);

// Map routes
const mapRoutes = require('./routes/map');
app.use(endpoints.MAP_BASE, mapRoutes);

// Pet routes
const petRoutes = require('./routes/petRoutes');
app.use('/api', petRoutes);

// Static file serving for uploads
app.use('/uploads', express.static(process.env.NODE_ENV === 'production' ? '/var/www/jivbook_files' : 'uploads'));

// Seed routes (for database initialization)
const seedRoutes = require('./routes/seed');
app.use('/api', seedRoutes);

// Social Media routes
const postRoutes = require('./routes/postRoutes');
app.use(endpoints.POST_BASE, postRoutes);

const commentRoutes = require('./routes/commentRoutes');
app.use(endpoints.COMMENT_BASE, commentRoutes);

const followRoutes = require('./routes/followRoutes');
app.use(endpoints.FOLLOW_BASE, followRoutes);

const feedRoutes = require('./routes/feedRoutes');
app.use(endpoints.FEED_BASE, feedRoutes);

// Wishlist and Saved Posts routes
const wishlistRoutes = require('./routes/wishlistRoutes');
app.use(endpoints.WISHLIST_BASE, wishlistRoutes);

const savedPostRoutes = require('./routes/savedPostRoutes');
app.use(endpoints.SAVED_POSTS_BASE, savedPostRoutes);

// Chat routes
const chatRoutes = require('./routes/chatRoutes');
app.use('/api/chat', chatRoutes);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Socket.IO chat functionality
require('./socket/chatSocket')(io);

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

