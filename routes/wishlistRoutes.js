const express = require('express');
const { 
  addToWishlist, 
  removeFromWishlist, 
  getWishlist, 
  checkWishlistStatus, 
  getWishlistCount 
} = require('../controllers/wishlistController');
const isAuthenticated = require('../middleware/auth');

const router = express.Router();

// All routes are protected (require authentication)
router.post('/:petId', isAuthenticated, addToWishlist);
router.delete('/:petId', isAuthenticated, removeFromWishlist);
router.get('/', isAuthenticated, getWishlist);
router.get('/status/:petId', isAuthenticated, checkWishlistStatus);
router.get('/count', isAuthenticated, getWishlistCount);

module.exports = router;
