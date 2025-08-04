const express = require('express');
const { 
  createPost, 
  getAllPosts, 
  getPostById, 
  updatePost, 
  deletePost, 
  likePost 
} = require('../controllers/postController');
const isAuthenticated = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllPosts);
router.get('/:id', getPostById);

// Protected routes
router.post('/', isAuthenticated, createPost);
router.put('/:id', isAuthenticated, updatePost);
router.delete('/:id', isAuthenticated, deletePost);
router.post('/:id/like', isAuthenticated, likePost);

module.exports = router;
