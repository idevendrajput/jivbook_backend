const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const Breed = require('../models/Breed');
const PetCategory = require('../models/PetCategory');
const auth = require('../middleware/auth');
const BaseResponse = require('../models/BaseResponse');

// Multer configuration for breed image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = process.env.NODE_ENV === 'production' 
      ? '/var/www/jivbook_files/breeds' 
      : 'uploads/breeds';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fieldName = file.fieldname === 'image' ? 'breed-img' : 'breed-icon';
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

// Get all breeds with filters (public)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      category, 
      size, 
      exerciseNeeds, 
      groomingNeeds,
      goodWithKids,
      goodWithPets,
      hypoallergenic,
      sortBy = 'order', 
      sortOrder = 'asc'
    } = req.query;
    
    // Build filter object
    const filter = { isActive: true };
    
    // Category filter
    if (category) {
      filter.category = category;
    }
    
    // Size filter
    if (size) {
      filter.size = size;
    }
    
    // Exercise needs filter
    if (exerciseNeeds) {
      filter.exerciseNeeds = exerciseNeeds;
    }
    
    // Grooming needs filter
    if (groomingNeeds) {
      filter.groomingNeeds = groomingNeeds;
    }
    
    // Boolean filters
    if (goodWithKids !== undefined) {
      filter.goodWithKids = goodWithKids === 'true';
    }
    
    if (goodWithPets !== undefined) {
      filter.goodWithPets = goodWithPets === 'true';
    }
    
    if (hypoallergenic !== undefined) {
      filter.hypoallergenic = hypoallergenic === 'true';
    }
    
    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { origin: { $regex: search, $options: 'i' } },
        { temperament: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query with pagination and populate category
    const breeds = await Breed.find(filter)
      .populate('category', 'name slug image')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await Breed.countDocuments(filter);
    
    const response = BaseResponse.success('Breeds fetched successfully', {
      breeds,
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

// Get all breeds for a category (public)
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      search, 
      size, 
      exerciseNeeds, 
      groomingNeeds,
      goodWithKids,
      goodWithPets,
      hypoallergenic,
      sortBy = 'order', 
      sortOrder = 'asc'
    } = req.query;
    
    // Build filter object
    const filter = { category: categoryId, isActive: true };
    
    // Apply additional filters (same as above)
    if (size) filter.size = size;
    if (exerciseNeeds) filter.exerciseNeeds = exerciseNeeds;
    if (groomingNeeds) filter.groomingNeeds = groomingNeeds;
    if (goodWithKids !== undefined) filter.goodWithKids = goodWithKids === 'true';
    if (goodWithPets !== undefined) filter.goodWithPets = goodWithPets === 'true';
    if (hypoallergenic !== undefined) filter.hypoallergenic = hypoallergenic === 'true';
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { origin: { $regex: search, $options: 'i' } },
        { temperament: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const breeds = await Breed.find(filter)
      .populate('category', 'name slug image')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Breed.countDocuments(filter);
    
    const response = BaseResponse.success('Breeds fetched successfully', {
      breeds,
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

// Get a specific breed by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const breed = await Breed.findOne({ slug, isActive: true });

    if (!breed) {
      const response = BaseResponse.error('Breed not found');
      return res.status(404).json(response);
    }

    const response = BaseResponse.success('Breed fetched successfully', breed);
    res.json(response);
  } catch (error) {
    const response = BaseResponse.error('Server error', error.message);
    res.status(500).json(response);
  }
});

// Add a new breed with file upload (admin)
router.post('/', auth, adminAuth, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'icon', maxCount: 1 }]), async (req, res) => {
  try {
    const { 
      name, description, category, order, size, lifeSpan, temperament, origin, 
      weight, height, exerciseNeeds, groomingNeeds, popularityRank, 
      goodWithKids, goodWithPets, hypoallergenic, metaTitle, metaDescription 
    } = req.body;

    if (!req.files || !req.files.image) {
      const response = BaseResponse.error('Image file is required');
      return res.status(400).json(response);
    }

    // Parse temperament if it's a string
    let parsedTemperament = temperament;
    if (typeof temperament === 'string') {
      try {
        parsedTemperament = JSON.parse(temperament);
      } catch (e) {
        parsedTemperament = temperament.split(',').map(t => t.trim());
      }
    }

    const newBreed = new Breed({
      name,
      description,
      image: req.files.image[0].filename, // Store only filename
      icon: req.files.icon ? req.files.icon[0].filename : null,
      category,
      order: order || 0,
      size,
      lifeSpan,
      temperament: parsedTemperament,
      origin,
      weight: weight ? JSON.parse(weight) : undefined,
      height: height ? JSON.parse(height) : undefined,
      exerciseNeeds,
      groomingNeeds,
      popularityRank,
      goodWithKids: goodWithKids === 'true',
      goodWithPets: goodWithPets === 'true',
      hypoallergenic: hypoallergenic === 'true',
      metaTitle,
      metaDescription
    });

    await newBreed.save();
    const response = BaseResponse.success('Breed added successfully', newBreed);
    res.status(201).json(response);
  } catch (error) {
    console.error('Add breed error:', error);
    if (error.code === 11000) {
      const response = BaseResponse.error('Breed already exists');
      return res.status(400).json(response);
    }
    const response = BaseResponse.error('Server error', error.message);
    res.status(500).json(response);
  }
});

// Update a breed by ID with optional file upload (admin)
router.put('/:id', auth, adminAuth, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'icon', maxCount: 1 }]), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const breed = await Breed.findById(id);
    if (!breed) {
      const response = BaseResponse.error('Breed not found');
      return res.status(404).json(response);
    }

    // Handle image update
    if (req.files && req.files.image) {
      if (breed.image) {
        const oldImagePath = process.env.NODE_ENV === 'production' 
          ? `/var/www/jivbook_files/breeds/${breed.image}`
          : `uploads/breeds/${breed.image}`;
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      updateData.image = req.files.image[0].filename;
    }

    // Handle icon update
    if (req.files && req.files.icon) {
      if (breed.icon) {
        const oldIconPath = process.env.NODE_ENV === 'production' 
          ? `/var/www/jivbook_files/breeds/${breed.icon}`
          : `uploads/breeds/${breed.icon}`;
        if (fs.existsSync(oldIconPath)) fs.unlinkSync(oldIconPath);
      }
      updateData.icon = req.files.icon[0].filename;
    }

    // Parse temperament if it's a string
    if (typeof updateData.temperament === 'string') {
      try {
        updateData.temperament = JSON.parse(updateData.temperament);
      } catch (e) {
        updateData.temperament = updateData.temperament.split(',').map(t => t.trim());
      }
    }

    if (typeof updateData.weight === 'string') updateData.weight = JSON.parse(updateData.weight);
    if (typeof updateData.height === 'string') updateData.height = JSON.parse(updateData.height);

    const updatedBreed = await Breed.findByIdAndUpdate(id, updateData, { new: true });

    const response = BaseResponse.success('Breed updated successfully', updatedBreed);
    res.json(response);
  } catch (error) {
    console.error('Update breed error:', error);
    const response = BaseResponse.error('Server error', error.message);
    res.status(500).json(response);
  }
});

// Delete a breed by ID (admin)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const breed = await Breed.findById(id);

    if (!breed) {
      const response = BaseResponse.error('Breed not found');
      return res.status(404).json(response);
    }

    // Delete associated image files
    if (breed.image) {
      const imagePath = process.env.NODE_ENV === 'production' 
        ? `/var/www/jivbook_files/breeds/${breed.image}`
        : `uploads/breeds/${breed.image}`;
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
    
    if (breed.icon) {
      const iconPath = process.env.NODE_ENV === 'production' 
        ? `/var/www/jivbook_files/breeds/${breed.icon}`
        : `uploads/breeds/${breed.icon}`;
      if (fs.existsSync(iconPath)) fs.unlinkSync(iconPath);
    }

    await breed.remove();
    const response = BaseResponse.success('Breed deleted successfully');
    res.json(response);
  } catch (error) {
    console.error('Delete breed error:', error);
    const response = BaseResponse.error('Server error', error.message);
    res.status(500).json(response);
  }
});

module.exports = router;

