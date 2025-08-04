const express = require('express');
const { 
  followUser, 
  unfollowUser, 
  getFollowers, 
  getFollowing, 
  acceptFollowRequest, 
  rejectFollowRequest,
  getPendingRequests 
} = require('../controllers/followController');
const isAuthenticated = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.post('/:userId', isAuthenticated, followUser);
router.delete('/:userId', isAuthenticated, unfollowUser);
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);
router.put('/request/:followId/accept', isAuthenticated, acceptFollowRequest);
router.delete('/request/:followId/reject', isAuthenticated, rejectFollowRequest);
router.get('/requests/pending', isAuthenticated, getPendingRequests);

module.exports = router;
