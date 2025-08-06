const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const PetCategory = require('../models/PetCategory');
const auth = require('../middleware/auth');
const BaseResponse = require('../models/BaseResponse');

// Multer configuration for pet category image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = process.env.NODE_ENV === 'production' 
      ? '/var/www/jivbook_files/pet_categories' 
      : 'uploads/pet_categories';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fieldName = file.fieldname === 'image' ? 'category-img' : 'category-icon';
    cb(null, fieldName + '-' + uniqueSuffix + path.extname(file.originalname));
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

// Add a new pet category with file upload (admin)
router.post('/', auth, adminAuth, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'icon', maxCount: 1 }]), async (req, res) => {
  try {
    const { name, description, order, isDairyPet, metaTitle, metaDescription } = req.body;

    if (!req.files || !req.files.image) {
      const response = BaseResponse.error('Image file is required');
      return res.status(400).json(response);
    }

    const newCategory = new PetCategory({
      name,
      description,
      image: req.files.image[0].filename, // Store only filename
      icon: req.files.icon ? req.files.icon[0].filename : null,
      order: order || 0,
      isDairyPet: isDairyPet === 'true',
      metaTitle,
      metaDescription
    });

    await newCategory.save();
    const response = BaseResponse.success('Pet category added successfully', newCategory);
    res.status(201).json(response);
  } catch (error) {
    console.error('Add pet category error:', error);
    if (error.code === 11000) {
      const response = BaseResponse.error('Category already exists');
      return res.status(400).json(response);
    }
    const response = BaseResponse.error('Server error', error.message);
    res.status(500).json(response);
  }
});

// Update a pet category by ID with optional file upload (admin)
router.put('/:id', auth, adminAuth, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'icon', maxCount: 1 }]), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, order, isDairyPet, metaTitle, metaDescription } = req.body;
    
    const category = await PetCategory.findById(id);
    if (!category) {
      const response = BaseResponse.error('Category not found');
      return res.status(404).json(response);
    }

    const updateData = {};
    
    // Update text fields if provided
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (order !== undefined) updateData.order = order;
    if (isDairyPet !== undefined) updateData.isDairyPet = isDairyPet === 'true';
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
    
    // Handle image update
    if (req.files && req.files.image) {
      // Delete old image file
      if (category.image) {
        const oldImagePath = process.env.NODE_ENV === 'production' 
          ? `/var/www/jivbook_files/pet_categories/${category.image}`
          : `uploads/pet_categories/${category.image}`;
        
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.image = req.files.image[0].filename;
    }
    
    // Handle icon update
    if (req.files && req.files.icon) {
      // Delete old icon file
      if (category.icon) {
        const oldIconPath = process.env.NODE_ENV === 'production' 
          ? `/var/www/jivbook_files/pet_categories/${category.icon}`
          : `uploads/pet_categories/${category.icon}`;
        
        if (fs.existsSync(oldIconPath)) {
          fs.unlinkSync(oldIconPath);
        }
      }
      updateData.icon = req.files.icon[0].filename;
    }

    const updatedCategory = await PetCategory.findByIdAndUpdate(id, updateData, { new: true });

    const response = BaseResponse.success('Pet category updated successfully', updatedCategory);
    res.json(response);
  } catch (error) {
    console.error('Update pet category error:', error);
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

    // Delete associated image files
    if (category.image) {
      const imagePath = process.env.NODE_ENV === 'production' 
        ? `/var/www/jivbook_files/pet_categories/${category.image}`
        : `uploads/pet_categories/${category.image}`;
        
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    if (category.icon) {
      const iconPath = process.env.NODE_ENV === 'production' 
        ? `/var/www/jivbook_files/pet_categories/${category.icon}`
        : `uploads/pet_categories/${category.icon}`;
        
      if (fs.existsSync(iconPath)) {
        fs.unlinkSync(iconPath);
      }
    }

    await category.remove();
    const response = BaseResponse.success('Pet category deleted successfully');
    res.json(response);
  } catch (error) {
    console.error('Delete pet category error:', error);
    const response = BaseResponse.error('Server error', error.message);
    res.status(500).json(response);
  }
});

module.exports = router;

