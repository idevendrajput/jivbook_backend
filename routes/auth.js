const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const BaseResponse = require('../models/BaseResponse');
const TokenResponse = require('../models/TokenResponse');
const { generateUniqueUsername } = require('../utils/userUtils');
const endpoints = require('../endpoints');

// Authentication route - handles both login and registration
router.post('/', async (req, res) => {
  try {
    let { name, email, phone } = req.body;
    
    // Trim inputs
    name = name ? name.trim() : null;
    email = email ? email.trim().toLowerCase() : undefined;
    phone = phone ? phone.trim() : undefined;

    // Validate inputs
    if (!name || (!email && !phone)) {
      const response = BaseResponse.error('Name and either email or phone are required');
      return res.status(400).json(response);
    }

    // Check if user exists
    let user = null;
    if (email) {
      user = await User.findOne({ email });
    }
    if (!user && phone) {
      user = await User.findOne({ phone });
    }

    let isNewUser = false;

    if (!user) {
      // Register user if not exist
      const username = await generateUniqueUsername(name);

      user = new User({
        name,
        email: email || undefined,
        phone: phone || undefined,
        username
      });

      await user.save();
      isNewUser = true;
    }

    // Generate tokens for both login and register
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    const tokenResponse = new TokenResponse(token, refreshToken, user);
    const message = isNewUser ? 'User registered successfully' : 'User logged in successfully';
    const response = BaseResponse.success(message, tokenResponse);
    
    res.status(isNewUser ? 201 : 200).json(response);
  } catch (error) {
    const response = BaseResponse.error('Server error', error.message);
    res.status(500).json(response);
  }
});

// Refresh token endpoint
router.post(endpoints.AUTH_ROUTES.REFRESH_TOKEN, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      const response = BaseResponse.error('Refresh token is required');
      return res.status(400).json(response);
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      const response = BaseResponse.error('User not found');
      return res.status(404).json(response);
    }

    const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });
    const newRefreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    const tokenResponse = new TokenResponse(newToken, newRefreshToken, user);
    const response = BaseResponse.success('Token refreshed successfully', tokenResponse);
    res.json(response);
  } catch (error) {
    const response = BaseResponse.error('Invalid refresh token', error.message);
    res.status(401).json(response);
  }
});

module.exports = router;
