const Wishlist = require('../models/Wishlist');
const Pet = require('../models/Pet');

// Add pet to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.user._id;

    // Check if pet exists
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    // Check if already in wishlist
    const existingWishlist = await Wishlist.findOne({ 
      user: userId, 
      pet: petId 
    });

    if (existingWishlist) {
      return res.status(400).json({ error: 'Pet already in wishlist' });
    }

    // Add to wishlist
    const wishlistItem = new Wishlist({
      user: userId,
      pet: petId
    });

    await wishlistItem.save();

    res.status(201).json({ 
      message: 'Pet added to wishlist successfully',
      wishlistItem: {
        _id: wishlistItem._id,
        petId: petId,
        addedAt: wishlistItem.createdAt
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Remove pet from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.user._id;

    const deletedItem = await Wishlist.findOneAndDelete({ 
      user: userId, 
      pet: petId 
    });

    if (!deletedItem) {
      return res.status(404).json({ error: 'Pet not found in wishlist' });
    }

    res.status(200).json({ message: 'Pet removed from wishlist successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;

    // Get wishlist items with pet details
    const wishlistItems = await Wishlist.find({ user: userId })
      .populate({
        path: 'pet',
        populate: [
          { 
            path: 'owner', 
            select: 'name username profileImage phone email address' 
          },
          { 
            path: 'petCategory', 
            select: 'name slug icon' 
          },
          { 
            path: 'breed', 
            select: 'name characteristics' 
          }
        ]
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalItems = await Wishlist.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalItems / limit);

    const wishlist = wishlistItems.map(item => ({
      _id: item._id,
      pet: item.pet,
      addedAt: item.createdAt,
      // Add computed fields
      timeAgo: getTimeAgo(item.createdAt)
    }));

    res.status(200).json({
      wishlist,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems,
        itemsPerPage: parseInt(limit),
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Check if pet is in wishlist
exports.checkWishlistStatus = async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.user._id;

    const wishlistItem = await Wishlist.findOne({ 
      user: userId, 
      pet: petId 
    });

    res.status(200).json({ 
      isInWishlist: !!wishlistItem,
      addedAt: wishlistItem ? wishlistItem.createdAt : null
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get wishlist count
exports.getWishlistCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Wishlist.countDocuments({ user: userId });
    
    res.status(200).json({ count });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Helper function for time formatting
function getTimeAgo(date) {
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  
  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  if (months < 12) return `${months}mo ago`;
  return date.toLocaleDateString();
}
