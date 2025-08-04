const express = require('express');
const { 
  savePost, 
  unsavePost, 
  getSavedPosts, 
  checkSavedStatus, 
  getSavedPostsCount,
  getSavedPostsByFilter 
} = require('../controllers/savedPostController');
const isAuthenticated = require('../middleware/auth');

const router = express.Router();

// All routes are protected (require authentication)
router.post('/:postId', isAuthenticated, savePost);
router.delete('/:postId', isAuthenticated, unsavePost);
router.get('/', isAuthenticated, getSavedPosts);
router.get('/filter', isAuthenticated, getSavedPostsByFilter);
router.get('/status/:postId', isAuthenticated, checkSavedStatus);
router.get('/count', isAuthenticated, getSavedPostsCount);

module.exports = router;
