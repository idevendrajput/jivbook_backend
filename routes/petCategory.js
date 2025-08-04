const express = require('express');
const router = express.Router();
const PetCategory = require('../models/PetCategory');
const auth = require('../middleware/auth');
const BaseResponse = require('../models/BaseResponse');

// Middleware to check admin access
const adminAuth = (req, res, next) => {
  // Example check for admin user
  if (req.user && req.user.isAdmin) {
    return next();
  }
  const response = BaseResponse.error('Access denied', 'Admin access required');
  res.status(403).json(response);
};

// Get all pet categories with filters (public)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, sortBy = 'order', sortOrder = 'asc', isActive } = req.query;
    
    // Build filter object
    const filter = {};
    
    // Active filter (default to true for public, admin can see all)
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    } else {
      filter.isActive = true; // Default for public users
    }
    
    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query with pagination
    const categories = await PetCategory.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await PetCategory.countDocuments(filter);
    
    const response = BaseResponse.success('Pet categories fetched successfully', {
      categories,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
    
    res.json(response);
  } catch (error) {
    const response = BaseResponse.error('Server error', error.message);
    res.status(500).json(response);
  }
});

// Get a specific pet category by slug (public)
router.get('/category/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await PetCategory.findOne({ slug, isActive: true });

    if (!category) {
      const response = BaseResponse.error('Category not found');
      return res.status(404).json(response);
    }

    const response = BaseResponse.success('Pet category fetched successfully', category);
    res.json(response);
  } catch (error) {
    const response = BaseResponse.error('Server error', error.message);
    res.status(500).json(response);
  }
});

// Add a new pet category (admin)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { name, description, image, icon, order } = req.body;

    const newCategory = new PetCategory({
      name,
      description,
      image,
      icon,
      order
    });

    await newCategory.save();
    const response = BaseResponse.success('Pet category added successfully', newCategory);
    res.status(201).json(response);
  } catch (error) {
    if (error.code === 11000) {
      const response = BaseResponse.error('Category already exists');
      return res.status(400).json(response);
    }
    const response = BaseResponse.error('Server error', error.message);
    res.status(500).json(response);
  }
});

// Update a pet category by ID (admin)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const category = await PetCategory.findByIdAndUpdate(id, updatedData, { new: true });

    if (!category) {
      const response = BaseResponse.error('Category not found');
      return res.status(404).json(response);
    }

    const response = BaseResponse.success('Pet category updated successfully', category);
    res.json(response);
  } catch (error) {
    const response = BaseResponse.error('Server error', error.message);
    res.status(500).json(response);
  }
});

// Delete a pet category by ID (admin)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const category = await PetCategory.findById(id);

    if (!category) {
      const response = BaseResponse.error('Category not found');
      return res.status(404).json(response);
    }

    await category.remove();
    const response = BaseResponse.success('Pet category deleted successfully');
    res.json(response);
  } catch (error) {
    const response = BaseResponse.error('Server error', error.message);
    res.status(500).json(response);
  }
});

module.exports = router;

