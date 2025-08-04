const SavedPost = require('../models/SavedPost');
const Post = require('../models/Post');

// Save post
exports.savePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if already saved
    const existingSavedPost = await SavedPost.findOne({ 
      user: userId, 
      post: postId 
    });

    if (existingSavedPost) {
      return res.status(400).json({ error: 'Post already saved' });
    }

    // Save the post
    const savedPost = new SavedPost({
      user: userId,
      post: postId
    });

    await savedPost.save();

    res.status(201).json({ 
      message: 'Post saved successfully',
      savedPost: {
        _id: savedPost._id,
        postId: postId,
        savedAt: savedPost.savedAt
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Unsave post
exports.unsavePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const deletedItem = await SavedPost.findOneAndDelete({ 
      user: userId, 
      post: postId 
    });

    if (!deletedItem) {
      return res.status(404).json({ error: 'Post not found in saved posts' });
    }

    res.status(200).json({ message: 'Post unsaved successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get user's saved posts
exports.getSavedPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;

    // Get saved posts with post details
    const savedPostItems = await SavedPost.find({ user: userId })
      .populate({
        path: 'post',
        populate: {
          path: 'user',
          select: 'username profileImage isVerified name'
        }
      })
      .sort({ savedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Filter out any posts that might have been deleted
    const validSavedPosts = savedPostItems.filter(item => item.post);

    // Get total count for pagination
    const totalItems = await SavedPost.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalItems / limit);

    const savedPosts = validSavedPosts.map(item => ({
      _id: item._id,
      post: {
        ...item.post.toObject(),
        isLikedByCurrentUser: item.post.isLikedBy(userId),
        timeAgo: getTimeAgo(item.post.createdAt)
      },
      savedAt: item.savedAt,
      savedTimeAgo: getTimeAgo(item.savedAt)
    }));

    res.status(200).json({
      savedPosts,
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

// Check if post is saved
exports.checkSavedStatus = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const savedPost = await SavedPost.findOne({ 
      user: userId, 
      post: postId 
    });

    res.status(200).json({ 
      isSaved: !!savedPost,
      savedAt: savedPost ? savedPost.savedAt : null
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get saved posts count
exports.getSavedPostsCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await SavedPost.countDocuments({ user: userId });
    
    res.status(200).json({ count });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get saved posts by category/filter
exports.getSavedPostsByFilter = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, filter } = req.query;
    
    const skip = (page - 1) * limit;

    let matchQuery = { user: userId };

    // Build aggregation pipeline
    const pipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: 'posts',
          localField: 'post',
          foreignField: '_id',
          as: 'post'
        }
      },
      { $unwind: '$post' },
      {
        $lookup: {
          from: 'users',
          localField: 'post.user',
          foreignField: '_id',
          as: 'post.user'
        }
      },
      { $unwind: '$post.user' }
    ];

    // Add filter conditions
    if (filter) {
      switch (filter) {
        case 'images':
          pipeline.push({
            $match: {
              'post.media': {
                $elemMatch: { type: 'image' }
              }
            }
          });
          break;
        case 'videos':
          pipeline.push({
            $match: {
              'post.media': {
                $elemMatch: { type: 'video' }
              }
            }
          });
          break;
        case 'recent':
          // Already sorted by savedAt, so no additional filter needed
          break;
        default:
          // If filter contains hashtag, search in tags
          if (filter.startsWith('#')) {
            const tag = filter.substring(1);
            pipeline.push({
              $match: {
                'post.tags': { $in: [tag] }
              }
            });
          }
      }
    }

    // Add sorting and pagination
    pipeline.push(
      { $sort: { savedAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    );

    const savedPostItems = await SavedPost.aggregate(pipeline);

    // Get total count
    const countPipeline = [...pipeline.slice(0, -2)]; // Remove skip and limit
    countPipeline.push({ $count: 'total' });
    const countResult = await SavedPost.aggregate(countPipeline);
    const totalItems = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalItems / limit);

    const savedPosts = savedPostItems.map(item => ({
      _id: item._id,
      post: {
        ...item.post,
        isLikedByCurrentUser: item.post.likes?.some(like => 
          like.user.toString() === userId.toString()
        ) || false,
        timeAgo: getTimeAgo(new Date(item.post.createdAt))
      },
      savedAt: item.savedAt,
      savedTimeAgo: getTimeAgo(item.savedAt)
    }));

    res.status(200).json({
      savedPosts,
      filter: filter || 'all',
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
