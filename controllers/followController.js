const Follow = require('../models/Follow');
const User = require('../models/User');

// Follow a user
exports.followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user._id;
    
    if (userId === followerId.toString()) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }
    
    // Check if user exists
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if already following
    const existingFollow = await Follow.findOne({ 
      follower: followerId, 
      following: userId 
    });
    
    if (existingFollow) {
      return res.status(400).json({ error: 'Already following this user' });
    }
    
    // Create follow relationship
    const follow = new Follow({
      follower: followerId,
      following: userId,
      status: userToFollow.isPrivate ? 'pending' : 'accepted'
    });
    
    await follow.save();
    
    // Update counts only if accepted
    if (follow.status === 'accepted') {
      await User.findByIdAndUpdate(followerId, { $inc: { followingCount: 1 } });
      await User.findByIdAndUpdate(userId, { $inc: { followersCount: 1 } });
    }
    
    res.status(201).json({ 
      message: follow.status === 'pending' ? 'Follow request sent' : 'User followed successfully',
      status: follow.status
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user._id;
    
    const follow = await Follow.findOneAndDelete({ 
      follower: followerId, 
      following: userId 
    });
    
    if (!follow) {
      return res.status(404).json({ error: 'Follow relationship not found' });
    }
    
    // Update counts only if it was accepted
    if (follow.status === 'accepted') {
      await User.findByIdAndUpdate(followerId, { $inc: { followingCount: -1 } });
      await User.findByIdAndUpdate(userId, { $inc: { followersCount: -1 } });
    }
    
    res.status(200).json({ message: 'User unfollowed successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get followers of a user
exports.getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const followers = await Follow.find({ 
      following: userId, 
      status: 'accepted' 
    })
    .populate('follower', 'username profileImage name')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
    
    const followersList = followers.map(follow => follow.follower);
    res.status(200).json(followersList);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get following of a user
exports.getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const following = await Follow.find({ 
      follower: userId, 
      status: 'accepted' 
    })
    .populate('following', 'username profileImage name')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
    
    const followingList = following.map(follow => follow.following);
    res.status(200).json(followingList);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Accept follow request (for private accounts)
exports.acceptFollowRequest = async (req, res) => {
  try {
    const { followId } = req.params;
    
    const follow = await Follow.findById(followId);
    if (!follow) {
      return res.status(404).json({ error: 'Follow request not found' });
    }
    
    // Check if the current user is the one being followed
    if (follow.following.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    if (follow.status !== 'pending') {
      return res.status(400).json({ error: 'Follow request is not pending' });
    }
    
    follow.status = 'accepted';
    await follow.save();
    
    // Update counts
    await User.findByIdAndUpdate(follow.follower, { $inc: { followingCount: 1 } });
    await User.findByIdAndUpdate(follow.following, { $inc: { followersCount: 1 } });
    
    res.status(200).json({ message: 'Follow request accepted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Reject follow request
exports.rejectFollowRequest = async (req, res) => {
  try {
    const { followId } = req.params;
    
    const follow = await Follow.findById(followId);
    if (!follow) {
      return res.status(404).json({ error: 'Follow request not found' });
    }
    
    // Check if the current user is the one being followed
    if (follow.following.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    if (follow.status !== 'pending') {
      return res.status(400).json({ error: 'Follow request is not pending' });
    }
    
    await Follow.findByIdAndDelete(followId);
    
    res.status(200).json({ message: 'Follow request rejected' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get pending follow requests
exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await Follow.find({ 
      following: req.user._id, 
      status: 'pending' 
    })
    .populate('follower', 'username profileImage name')
    .sort({ createdAt: -1 });
    
    res.status(200).json(requests);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
