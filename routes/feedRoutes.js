const express = require('express');
const { 
  getFeed, 
  getExploreFeed, 
  getUserPosts, 
  searchByHashtag, 
  getTrendingHashtags 
} = require('../controllers/feedController');
const isAuthenticated = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.get('/', isAuthenticated, getFeed);
router.get('/explore', isAuthenticated, getExploreFeed);
router.get('/user/:userId', isAuthenticated, getUserPosts);
router.get('/hashtag/:hashtag', isAuthenticated, searchByHashtag);
router.get('/trending/hashtags', isAuthenticated, getTrendingHashtags);

module.exports = router;
