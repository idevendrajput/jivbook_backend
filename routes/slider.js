const express = require('express');
const router = express.Router();
const Slider = require('../models/Slider');
const BaseResponse = require('../models/BaseResponse');
const endpoints = require('../endpoints');

// Get all sliders
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

// Add new slider (for admin)
router.post('/add', async (req, res) => {
  try {
    const { imageUrl, redirectionUrl, order } = req.body;

    if (!imageUrl) {
      const response = BaseResponse.error('Image URL is required.');
      return res.status(400).json(response);
    }

    const newSlider = new Slider({
      imageUrl,
      redirectionUrl,
      order: order || 0
    });

    await newSlider.save();
    const response = BaseResponse.success('Slider saved successfully!', newSlider);
    res.status(201).json(response);
  } catch (error) {
    const response = BaseResponse.error('Server error', error.message);
    res.status(500).json(response);
  }
});

// Update slider
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const slider = await Slider.findByIdAndUpdate(id, updateData, { new: true });

    if (!slider) {
      const response = BaseResponse.error('Slider not found');
      return res.status(404).json(response);
    }

    const response = BaseResponse.success('Slider updated successfully!', slider);
    res.json(response);
  } catch (error) {
    const response = BaseResponse.error('Server error', error.message);
    res.status(500).json(response);
  }
});

// Delete slider by ID
router.delete('/delete_by_id', async (req, res) => {
  try {
    const { id } = req.query;

    const slider = await Slider.findById(id);
    if (!slider) {
      const response = BaseResponse.error('Slider not found');
      return res.status(404).json(response);
    }

    await Slider.findByIdAndDelete(id);
    const remainingSliders = await Slider.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    const response = BaseResponse.success('Slider deleted successfully!', remainingSliders);
    res.json(response);
  } catch (error) {
    const response = BaseResponse.error('Server error', error.message);
    res.status(500).json(response);
  }
});

// Toggle slider active status
router.patch('/toggle/:id', async (req, res) => {
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
