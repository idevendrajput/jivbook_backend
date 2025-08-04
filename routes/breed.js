const express = require('express');
const router = express.Router();
const Breed = require('../models/Breed');
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

// Add a new breed (admin)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { name, description, image, icon, category, order, size, lifeSpan, temperament, origin, weight, height, exerciseNeeds, groomingNeeds, popularityRank, goodWithKids, goodWithPets, hypoallergenic } = req.body;

    const newBreed = new Breed({
      name,
      description,
      image,
      icon,
      category,
      order,
      size,
      lifeSpan,
      temperament,
      origin,
      weight,
      height,
      exerciseNeeds,
      groomingNeeds,
      popularityRank,
      goodWithKids,
      goodWithPets,
      hypoallergenic
    });

    await newBreed.save();
    const response = BaseResponse.success('Breed added successfully', newBreed);
    res.status(201).json(response);
  } catch (error) {
    if (error.code === 11000) {
      const response = BaseResponse.error('Breed already exists');
      return res.status(400).json(response);
    }
    const response = BaseResponse.error('Server error', error.message);
    res.status(500).json(response);
  }
});

// Update a breed by ID (admin)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const breed = await Breed.findByIdAndUpdate(id, updatedData, { new: true });

    if (!breed) {
      const response = BaseResponse.error('Breed not found');
      return res.status(404).json(response);
    }

    const response = BaseResponse.success('Breed updated successfully', breed);
    res.json(response);
  } catch (error) {
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

    await breed.remove();
    const response = BaseResponse.success('Breed deleted successfully');
    res.json(response);
  } catch (error) {
    const response = BaseResponse.error('Server error', error.message);
    res.status(500).json(response);
  }
});

module.exports = router;

