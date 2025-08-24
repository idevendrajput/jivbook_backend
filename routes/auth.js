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
    let { name, email, phone, countryCode, phoneNumber } = req.body;
    console.log('🔐 Auth request received:', { name, email, phone, countryCode, phoneNumber });
    
    // Trim inputs
    name = name ? name.trim() : null;
    email = email ? email.trim().toLowerCase() : undefined;
    
    // Handle phone number formats - support both legacy combined and new separate format
    let finalCountryCode = null;
    let finalPhoneNumber = null;
    
    if (countryCode && phoneNumber) {
      // New format: separate countryCode and phoneNumber
      finalCountryCode = countryCode.trim();
      finalPhoneNumber = phoneNumber.trim();
    } else if (phone) {
      // Legacy format: combined phone number like "+919024653150"
      phone = phone.trim();
      // Extract country code and phone number from combined format
      let phoneMatch = phone.match(/^(\+(?:1|7|2[0-79]|3[0-69]|4[0-69]|5[1-8]|6[0-6]|8[1-246]|9[0-58]))(\d+)$/);
      
      if (!phoneMatch) {
        // Fallback: Try to extract common country code patterns
        phoneMatch = phone.match(/^(\+(?:91|1|44|33|49|81|86|61|55|52|39|34|7|971|966|965|963|962|960|886|852|853|976|977|992|993|994|995|996|998|380|375|374|373|372|371|370|48|41|43|420|421|385|386|387|389|382|381))(\d+)$/);
      }
      
      if (phoneMatch) {
        finalCountryCode = phoneMatch[1]; // e.g., "+91"
        finalPhoneNumber = phoneMatch[2]; // e.g., "9024653150"
      } else {
        const response = BaseResponse.error('Invalid phone number format');
        return res.status(400).json(response);
      }
    }

    // Validate inputs
    if (!name || (!email && !finalPhoneNumber)) {
      console.log('Validation failed:', { name, email, finalPhoneNumber, countryCode, phoneNumber, phone });
      const response = BaseResponse.error('Name and either email or phone number are required');
      return res.status(400).json(response);
    }

    // Check if user exists
    let user = null;
    if (email) {
      user = await User.findOne({ email });
    }
    
    // Check for user by phone number (try both formats for compatibility)
    if (!user && finalPhoneNumber) {
      // First try new separate format
      user = await User.findOne({ 
        countryCode: finalCountryCode, 
        phone: finalPhoneNumber 
      });
      
      // If not found, try legacy combined format
      if (!user) {
        const combinedPhone = `${finalCountryCode}${finalPhoneNumber}`;
        user = await User.findOne({ phone: combinedPhone });
        
        // If found in legacy format, migrate to new format
        if (user && !user.countryCode) {
          user.countryCode = finalCountryCode;
          user.phone = finalPhoneNumber;
          await user.save();
        }
      }
    }

    let isNewUser = false;

    if (!user) {
      // Register user if not exist
      const username = await generateUniqueUsername(name);

      user = new User({
        name,
        email: email || undefined,
        countryCode: finalCountryCode || undefined,
        phone: finalPhoneNumber || undefined,
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
