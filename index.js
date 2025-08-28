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

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, postman, etc.)
    if (!origin) return callback(null, true);
    
    // Define allowed origins
    const allowedOrigins = [
      'https://jivbook.com',
      'https://www.jivbook.com',
      'https://admin.jivbook.com',
      'http://localhost:3000',
      'http://localhost:3005',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3005'
    ];
    
    // Check if origin is allowed
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ]
};

// Middlewares
app.use(cors(corsOptions));
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
app.use('/api/pets', petRoutes);

// Static file serving for uploads - serve from jivbook_files directory
if (process.env.NODE_ENV === 'production') {
  // Production: serve from /var/www/jivbook_files
  app.use('/uploads', express.static('/var/www/jivbook_files'));
} else {
  // Development: serve from local uploads directory  
  app.use('/uploads', express.static('uploads'));
}

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

// Notification routes
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with same CORS policy
const io = socketIo(server, {
  cors: {
    origin: [
      'https://jivbook.com',
      'https://www.jivbook.com',
      'https://admin.jivbook.com',
      'http://localhost:3000',
      'http://localhost:3005',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3005'
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.IO chat functionality
require('./socket/chatSocket')(io);

// Initialize Firebase and Notification services
try {
  const firebaseService = require('./services/firebaseService');
  firebaseService.validateConfig();
  console.log('Firebase service initialized successfully');
} catch (error) {
  console.warn('Firebase initialization warning:', error.message);
  console.warn('Notification features may not work properly without Firebase configuration');
}

// Start notification cron jobs
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_CRON === 'true') {
  const notificationCron = require('./utils/notificationCron');
  notificationCron.startAllJobs();
}

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

