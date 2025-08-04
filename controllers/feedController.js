const Post = require('../models/Post');
const Follow = require('../models/Follow');
const User = require('../models/User');

// Get user's personalized feed
exports.getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user._id;
    
    // Get list of users that current user is following
    const following = await Follow.find({ 
      follower: userId, 
      status: 'accepted' 
    }).select('following');
    
    const followingIds = following.map(f => f.following);
    // Include user's own posts in feed
    followingIds.push(userId);
    
    // Get posts from followed users
    const posts = await Post.find({ 
      user: { $in: followingIds }, 
      isActive: true 
    })
    .populate('user', 'username profileImage isVerified')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
    
    // Add additional info for each post
    const postsWithInfo = posts.map(post => ({
      ...post.toObject(),
      isLikedByCurrentUser: post.isLikedBy(userId),
      timeAgo: post.timeAgo
    }));
    
    res.status(200).json(postsWithInfo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get explore feed (posts from users not followed)
exports.getExploreFeed = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user._id;
    
    // Get list of users that current user is following
    const following = await Follow.find({ 
      follower: userId, 
      status: 'accepted' 
    }).select('following');
    
    const followingIds = following.map(f => f.following);
    followingIds.push(userId); // Exclude own posts too
    
    // Get posts from users not followed
    const posts = await Post.find({ 
      user: { $nin: followingIds }, 
      isActive: true 
    })
    .populate('user', 'username profileImage isVerified')
    .sort({ likesCount: -1, createdAt: -1 }) // Sort by popularity
    .limit(limit * 1)
    .skip((page - 1) * limit);
    
    // Add additional info for each post
    const postsWithInfo = posts.map(post => ({
      ...post.toObject(),
      isLikedByCurrentUser: post.isLikedBy(userId),
      timeAgo: post.timeAgo
    }));
    
    res.status(200).json(postsWithInfo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get user's own posts
exports.getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const currentUserId = req.user._id;
    
    // Check if profile is private and current user is not following
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (targetUser.isPrivate && userId !== currentUserId.toString()) {
      const isFollowing = await Follow.findOne({ 
        follower: currentUserId, 
        following: userId, 
        status: 'accepted' 
      });
      
      if (!isFollowing) {
        return res.status(403).json({ error: 'This account is private' });
      }
    }
    
    const posts = await Post.find({ 
      user: userId, 
      isActive: true 
    })
    .populate('user', 'username profileImage isVerified')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
    
    // Add additional info for each post
    const postsWithInfo = posts.map(post => ({
      ...post.toObject(),
      isLikedByCurrentUser: post.isLikedBy(currentUserId),
      timeAgo: post.timeAgo
    }));
    
    res.status(200).json(postsWithInfo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Search posts by hashtags
exports.searchByHashtag = async (req, res) => {
  try {
    const { hashtag } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user._id;
    
    const posts = await Post.find({ 
      tags: { $in: [hashtag] }, 
      isActive: true 
    })
    .populate('user', 'username profileImage isVerified')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
    
    // Add additional info for each post
    const postsWithInfo = posts.map(post => ({
      ...post.toObject(),
      isLikedByCurrentUser: post.isLikedBy(userId),
      timeAgo: post.timeAgo
    }));
    
    res.status(200).json(postsWithInfo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get trending hashtags
exports.getTrendingHashtags = async (req, res) => {
  try {
    const trending = await Post.aggregate([
      { $match: { isActive: true, tags: { $ne: [] } } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.status(200).json(trending);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
