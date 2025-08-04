const express = require('express');
const { 
  createComment, 
  getCommentsByPost, 
  getReplies, 
  updateComment, 
  deleteComment, 
  likeComment 
} = require('../controllers/commentController');
const isAuthenticated = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/post/:postId', getCommentsByPost);
router.get('/:commentId/replies', getReplies);

// Protected routes
router.post('/', isAuthenticated, createComment);
router.put('/:id', isAuthenticated, updateComment);
router.delete('/:id', isAuthenticated, deleteComment);
router.post('/:id/like', isAuthenticated, likeComment);

module.exports = router;
