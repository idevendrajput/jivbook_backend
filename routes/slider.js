const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const Slider = require('../models/Slider');
const BaseResponse = require('../models/BaseResponse');
const endpoints = require('../endpoints');
const adminAuth = require('../middleware/adminAuth');

// Multer configuration for slider image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = process.env.NODE_ENV === 'production' 
      ? '/var/www/jivbook_files/sliders' 
      : 'uploads/sliders';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'slider-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get all active sliders (public)
router.get('/get_all', async (req, res) => {
  try {
    const sliders = await Slider.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    const response = BaseResponse.success('Sliders list fetched successfully!', sliders);
    res.json(response);
  } catch (error) {
    const response = BaseResponse.error('Server error', error.message);
    res.status(500).json(response);
  }
});

// Get all sliders for admin (including inactive)
router.get('/admin/get_all', adminAuth, async (req, res) => {
  try {
    const sliders = await Slider.find().sort({ order: 1, createdAt: -1 });
    const response = BaseResponse.success('All sliders fetched successfully!', sliders);
    res.json(response);
  } catch (error) {
    console.error('Get all sliders error:', error);
    const response = BaseResponse.error('Server error', error.message);
    res.status(500).json(response);
  }
});

// Add new slider with image upload (for admin)
router.post('/add', adminAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      const response = BaseResponse.error('Image file is required.');
      return res.status(400).json(response);
    }

    const { redirectionUrl, order } = req.body;
    const imageUrl = req.file.filename; // Store only filename, not full path

    const newSlider = new Slider({
      imageUrl,
      redirectionUrl,
      order: order || 0
    });

    await newSlider.save();
    const response = BaseResponse.success('Slider saved successfully!', newSlider);
    res.status(201).json(response);
  } catch (error) {
    console.error('Add slider error:', error);
    const response = BaseResponse.error('Server error', error.message);
    res.status(500).json(response);
  }
});

// Update slider with optional image upload
router.put('/update/:id', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { redirectionUrl, order } = req.body;
    
    const slider = await Slider.findById(id);
    if (!slider) {
      const response = BaseResponse.error('Slider not found');
      return res.status(404).json(response);
    }

    const updateData = {};
    
    // If new image is uploaded, update imageUrl
    if (req.file) {
      updateData.imageUrl = req.file.filename;
      
      // Optionally delete old image file
      if (slider.imageUrl) {
        const oldImagePath = process.env.NODE_ENV === 'production' 
          ? `/var/www/jivbook_files/sliders/${slider.imageUrl}`
          : `uploads/sliders/${slider.imageUrl}`;
        
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }
    
    // Update other fields if provided
    if (redirectionUrl !== undefined) updateData.redirectionUrl = redirectionUrl;
    if (order !== undefined) updateData.order = order;

    const updatedSlider = await Slider.findByIdAndUpdate(id, updateData, { new: true });

    const response = BaseResponse.success('Slider updated successfully!', updatedSlider);
    res.json(response);
  } catch (error) {
    console.error('Update slider error:', error);
    const response = BaseResponse.error('Server error', error.message);
    res.status(500).json(response);
  }
});

// Delete slider by ID
router.delete('/delete_by_id', adminAuth, async (req, res) => {
  try {
    const { id } = req.query;

    const slider = await Slider.findById(id);
    if (!slider) {
      const response = BaseResponse.error('Slider not found');
      return res.status(404).json(response);
    }

    // Delete image file
    if (slider.imageUrl) {
      const imagePath = process.env.NODE_ENV === 'production' 
        ? `/var/www/jivbook_files/sliders/${slider.imageUrl}`
        : `uploads/sliders/${slider.imageUrl}`;
        
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Slider.findByIdAndDelete(id);
    const remainingSliders = await Slider.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    const response = BaseResponse.success('Slider deleted successfully!', remainingSliders);
    res.json(response);
  } catch (error) {
    console.error('Delete slider error:', error);
    const response = BaseResponse.error('Server error', error.message);
    res.status(500).json(response);
  }
});

// Toggle slider active status
router.patch('/toggle/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const slider = await Slider.findById(id);
    if (!slider) {
      const response = BaseResponse.error('Slider not found');
      return res.status(404).json(response);
    }

    slider.isActive = !slider.isActive;
    await slider.save();

    const response = BaseResponse.success('Slider status updated successfully!', slider);
    res.json(response);
  } catch (error) {
    const response = BaseResponse.error('Server error', error.message);
    res.status(500).json(response);
  }
});

module.exports = router;
