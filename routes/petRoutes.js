const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet');
const auth = require('../middleware/auth');
const BaseResponse = require('../models/BaseResponse');
const { upload, handleUploadError } = require('../utils/fileUpload');

// Middleware to check admin access
const adminAuth = (req, res, next) => {
  // Example check for admin user
  if (req.user && req.user.isAdmin) {
    return next();
  }
  const response = BaseResponse.error('Access denied', 'Admin access required');
  res.status(403).json(response);
};

// Get all pets with filters and pagination (public and admin)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      sortBy = 'createdAt', 
      sortOrder = 'desc', 
      isActive,
      petCategory,
      breed,
      gender,
      ageCategory,
      owner,
      isDairyPet
    } = req.query;
    
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
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Category filter
    if (petCategory) {
      filter.petCategory = petCategory;
    }
    
    // Breed filter
    if (breed) {
      filter.breed = breed;
    }
    
    // Gender filter
    if (gender) {
      filter.gender = gender;
    }
    
    // Age category filter
    if (ageCategory) {
      filter.ageCategory = ageCategory;
    }
    
    // Owner filter
    if (owner) {
      filter.owner = owner;
    }
    
    // Dairy pet filter
    if (isDairyPet !== undefined) {
      filter.isDairyPet = isDairyPet === 'true';
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query with pagination
    const pets = await Pet.find(filter)
      .populate('petCategory')
      .populate('breed')
      .populate('owner', 'name email phone')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await Pet.countDocuments(filter);
    
    const response = BaseResponse.success('Pets fetched successfully', {
      pets,
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

// Route to create a pet with image upload
router.post('/pets', upload.array('images', 10), handleUploadError, async (req, res) => {
  try {
    const petData = req.body;

    // Handle images if any
    if (req.files && req.files.length > 0) {
      petData.images = req.files.map(file => ({
        url: file.path,
        filename: file.filename,
        size: file.size,
        isMain: false
      }));
      petData.images[0].isMain = true; // first image set to main
    }

    const newPet = new Pet(petData);
    const savedPet = await newPet.save();
    res.status(201).json({
      success: true,
      data: savedPet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating pet',
      error: error.message
    });
  }
});

// Route to fetch a specific pet by ID
router.get('/pets/:id', async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id).populate('petCategory').populate('breed').populate('owner');
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }
    res.status(200).json({ success: true, data: pet });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching pet', error: error.message });
  }
});

// Route to update a pet by ID (admin only)
router.put('/pets/:id', async (req, res) => {
  try {
    const updatedPet = await Pet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }
    res.status(200).json({ success: true, data: updatedPet });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating pet', error: error.message });
  }
});

// Route to delete a pet by ID (admin only)
router.delete('/pets/:id', async (req, res) => {
  try {
    const deletedPet = await Pet.findByIdAndDelete(req.params.id);
    if (!deletedPet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }
    res.status(200).json({ success: true, message: 'Pet deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting pet', error: error.message });
  }
});

// Get nearby pets based on user location
router.get('/nearby', async (req, res) => {
  try {
    const { 
      latitude, 
      longitude, 
      radius = 10, // radius in kilometers
      page = 1,
      limit = 10,
      petCategory,
      minPrice,
      maxPrice
    } = req.query;
    
    if (!latitude || !longitude) {
      const response = BaseResponse.error('Latitude and longitude are required');
      return res.status(400).json(response);
    }
    
    // Build filter object
    const filter = {
      isAvailable: true,
      isApproved: true
    };
    
    // Add category filter if provided
    if (petCategory) {
      filter.petCategory = petCategory;
    }
    
    // Add price range filter if provided
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Use MongoDB's aggregation pipeline to calculate distance
    const nearbyPets = await Pet.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          distanceField: "distance",
          maxDistance: radius * 1000, // Convert km to meters
          spherical: true,
          query: filter
        }
      },
      {
        $lookup: {
          from: "petcategories",
          localField: "petCategory",
          foreignField: "_id",
          as: "petCategory"
        }
      },
      {
        $lookup: {
          from: "breeds",
          localField: "breed",
          foreignField: "_id",
          as: "breed"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [{ $project: { name: 1, email: 1, phone: 1 } }]
        }
      },
      {
        $unwind: { path: "$petCategory", preserveNullAndEmptyArrays: true }
      },
      {
        $unwind: { path: "$breed", preserveNullAndEmptyArrays: true }
      },
      {
        $unwind: { path: "$owner", preserveNullAndEmptyArrays: true }
      },
      {
        $addFields: {
          distanceKm: { $divide: ["$distance", 1000] } // Convert meters to km
        }
      },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);
    
    // Get total count for pagination
    const totalPipeline = [
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          distanceField: "distance",
          maxDistance: radius * 1000,
          spherical: true,
          query: filter
        }
      },
      { $count: "total" }
    ];
    
    const totalResult = await Pet.aggregate(totalPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;
    
    const response = BaseResponse.success('Nearby pets fetched successfully', {
      pets: nearbyPets,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      },
      searchRadius: `${radius} km`
    });
    
    res.json(response);
  } catch (error) {
    const response = BaseResponse.error('Error fetching nearby pets', error.message);
    res.status(500).json(response);
  }
});

// Get recommended pets based on user preferences and behavior
router.get('/recommended', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const user = req.user;
    
    // Build recommendation filters based on user preferences
    const recommendationFilters = [];
    
    // Filter by user's preferred pet categories
    if (user.preferredPetCategories && user.preferredPetCategories.length > 0) {
      recommendationFilters.push({
        petCategory: { $in: user.preferredPetCategories }
      });
    }
    
    // Filter by dairy pets preference
    if (user.petTypePreferences && user.petTypePreferences.dairyPets) {
      recommendationFilters.push({
        $or: [
          { 'dairyDetails.milkProduction.value': { $gt: 0 } },
          { petCategory: { $in: await getDairyPetCategoryIds() } }
        ]
      });
    }
    
    // Filter by companion pets preference
    if (user.petTypePreferences && user.petTypePreferences.companionPets) {
      recommendationFilters.push({
        $or: [
          { 'companionDetails.goodWithKids': true },
          { 'companionDetails.temperament': 'friendly' },
          { petCategory: { $in: await getCompanionPetCategoryIds() } }
        ]
      });
    }
    
    // If no specific preferences, show popular/trending pets
    if (recommendationFilters.length === 0) {
      recommendationFilters.push({
        $or: [
          { isPremium: true },
          { viewCount: { $gte: 10 } },
          { contactCount: { $gte: 5 } }
        ]
      });
    }
    
    // Base filter for active and approved pets
    const baseFilter = {
      isAvailable: true,
      isApproved: true,
      $or: recommendationFilters
    };
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // If user has location, prioritize nearby pets in recommendations
    let recommendedPets;
    if (user.latitude && user.longitude) {
      recommendedPets = await Pet.aggregate([
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [user.longitude, user.latitude]
            },
            distanceField: "distance",
            maxDistance: 50000, // 50 km for recommendations
            spherical: true,
            query: baseFilter
          }
        },
        {
          $lookup: {
            from: "petcategories",
            localField: "petCategory",
            foreignField: "_id",
            as: "petCategory"
          }
        },
        {
          $lookup: {
            from: "breeds",
            localField: "breed",
            foreignField: "_id",
            as: "breed"
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
            pipeline: [{ $project: { name: 1, email: 1, phone: 1 } }]
          }
        },
        {
          $unwind: { path: "$petCategory", preserveNullAndEmptyArrays: true }
        },
        {
          $unwind: { path: "$breed", preserveNullAndEmptyArrays: true }
        },
        {
          $unwind: { path: "$owner", preserveNullAndEmptyArrays: true }
        },
        {
          $addFields: {
            distanceKm: { $divide: ["$distance", 1000] },
            recommendationScore: {
              $add: [
                { $cond: [{ $eq: ["$isPremium", true] }, 10, 0] },
                { $divide: ["$viewCount", 10] },
                { $divide: ["$contactCount", 2] },
                { $divide: [{ $subtract: [new Date(), "$createdAt"] }, 86400000] } // Newer pets get higher score
              ]
            }
          }
        },
        { $sort: { recommendationScore: -1, distance: 1 } },
        { $skip: skip },
        { $limit: parseInt(limit) }
      ]);
    } else {
      // If no user location, just use regular query with recommendation scoring
      recommendedPets = await Pet.find(baseFilter)
        .populate('petCategory')
        .populate('breed')
        .populate('owner', 'name email phone')
        .sort({ isPremium: -1, viewCount: -1, contactCount: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    }
    
    // Get total count for pagination
    const total = await Pet.countDocuments(baseFilter);
    
    const response = BaseResponse.success('Recommended pets fetched successfully', {
      pets: recommendedPets,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      },
      recommendationBasis: {
        userPreferences: user.preferredPetCategories?.length > 0,
        locationBased: !!(user.latitude && user.longitude),
        dairyPetsPreference: user.petTypePreferences?.dairyPets || false,
        companionPetsPreference: user.petTypePreferences?.companionPets || false
      }
    });
    
    res.json(response);
  } catch (error) {
    const response = BaseResponse.error('Error fetching recommended pets', error.message);
    res.status(500).json(response);
  }
});

// Helper functions to get pet category IDs
async function getDairyPetCategoryIds() {
  const PetCategory = require('../models/PetCategory');
  const dairyCategories = await PetCategory.find({ isDairyPet: true }).select('_id');
  return dairyCategories.map(cat => cat._id);
}

async function getCompanionPetCategoryIds() {
  const PetCategory = require('../models/PetCategory');
  const companionCategories = await PetCategory.find({ isDairyPet: false }).select('_id');
  return companionCategories.map(cat => cat._id);
}

module.exports = router;
