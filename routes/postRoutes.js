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
const { upload, handleUploadError } = require('../utils/fileUpload');

const router = express.Router();

// Public routes
router.get('/', getAllPosts);
router.get('/:id', getPostById);

// Protected routes
router.post('/', upload.array('media', 10), handleUploadError, isAuthenticated, createPost);
router.put('/:id', isAuthenticated, updatePost);
router.delete('/:id', isAuthenticated, deletePost);
router.post('/:id/like', isAuthenticated, likePost);

module.exports = router;
