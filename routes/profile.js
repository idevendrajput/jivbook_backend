const express = require('express');
const router = express.Router();
const User = require('../models/User');
const BaseResponse = require('../models/BaseResponse');
const auth = require('../middleware/auth');

// Update profile
router.put('/', auth, async (req, res) => {
  try {
    const { id, ...updateFields } = req.body;

    // Ensure user can only update their own profile
    if (req.user._id.toString() !== id) {
      const response = BaseResponse.error('Unauthorized to update this profile');
      return res.status(403).json(response);
    }

    // Clean update data - remove null, undefined, and empty string values
    const cleanedData = {};
    Object.keys(updateFields).forEach(key => {
      const value = updateFields[key];
      if (value !== null && value !== undefined && value !== '') {
        // Special handling for specific fields
        if (key === 'email' && value) {
          cleanedData[key] = value.trim().toLowerCase();
        } else if (key === 'phone' && value) {
          cleanedData[key] = value.trim();
        } else if (key === 'name' && value) {
          cleanedData[key] = value.trim();
        } else if (typeof value === 'string') {
          cleanedData[key] = value.trim();
        } else {
          cleanedData[key] = value;
        }
      }
    });

    // Don't allow updating certain fields
    delete cleanedData.username;
    delete cleanedData.createdOn;
    delete cleanedData._id;

    const user = await User.findByIdAndUpdate(id, cleanedData, { 
      new: true,
      runValidators: true 
    });

    if (!user) {
      const response = BaseResponse.error('User not found');
      return res.status(404).json(response);
    }

    const response = BaseResponse.success('Profile updated successfully', user);
    res.json(response);
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      const response = BaseResponse.error(`${field} already exists`);
      return res.status(400).json(response);
    }
    const response = BaseResponse.error('Server error', error.message);
    res.status(500).json(response);
  }
});

// Get user profile by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      const response = BaseResponse.error('User not found');
      return res.status(404).json(response);
    }

    const response = BaseResponse.success('Profile retrieved successfully', user);
    res.json(response);
  } catch (error) {
    const response = BaseResponse.error('Server error', error.message);
    res.status(500).json(response);
  }
});

// Get current user profile (from token)
router.get('/', auth, async (req, res) => {
  try {
    const response = BaseResponse.success('Profile retrieved successfully', req.user);
    res.json(response);
  } catch (error) {
    const response = BaseResponse.error('Server error', error.message);
    res.status(500).json(response);
  }
});

module.exports = router;
