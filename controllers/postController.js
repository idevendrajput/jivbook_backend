const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { upload, handleUploadError } = require('../utils/fileUpload');

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const postData = {
      ...req.body,
      user: req.user._id
    };
    
    // Handle uploaded media files
    if (req.files && req.files.length > 0) {
      postData.media = req.files.map((file, index) => {
        const mediaType = file.mimetype.startsWith('image/') ? 'image' : 'video';
        
        // Determine the correct folder path based on destination
        let folderPath = 'temp'; // Default folder for posts
        if (file.destination) {
          const pathParts = file.destination.split('/');
          folderPath = pathParts[pathParts.length - 1] || 'temp';
        }
        
        return {
          type: mediaType,
          url: `/uploads/${folderPath}/${file.filename}`,
          order: index
        };
      });
    } else {
      // Optional: Allow text-only posts or require media
      // return res.status(400).json({ error: 'At least one media file is required' });
    }
    
    // Handle tags (hashtags)
    if (req.body.tags) {
      if (typeof req.body.tags === 'string') {
        postData.tags = req.body.tags.split(',').map(tag => tag.trim().replace('#', ''));
      } else if (Array.isArray(req.body.tags)) {
        postData.tags = req.body.tags.map(tag => tag.trim().replace('#', ''));
      }
    }
    
    // Handle location
    if (req.body.latitude && req.body.longitude) {
      postData.location = {
        name: req.body.locationName || 'Unknown Location',
        coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)]
      };
    }
    
    const newPost = new Post(postData);
    await newPost.save();
    
    // Populate user data for response
    await newPost.populate('user', 'username name profileImage');
    
    // Update user's post count
    await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: 1 } });
    
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: newPost
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
};

// Get all posts with pagination
exports.getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const posts = await Post.find({ isActive: true })
      .populate('user', 'username name profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Post.countDocuments({ isActive: true });
    
    res.status(200).json({
      success: true,
      message: 'Posts fetched successfully',
      data: {
        posts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalPosts: total,
          hasMore: page < Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
};

// Get a post by ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username name profileImage');
    
    if (!post || !post.isActive) {
      return res.status(404).json({ 
        success: false,
        error: 'Post not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Post fetched successfully',
      data: post
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
};

// Update a post (only caption and tags can be updated, not media)
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        error: 'Post not found' 
      });
    }
    
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        error: 'Unauthorized - Only post owner can update' 
      });
    }
    
    // Only allow updating certain fields
    const allowedUpdates = ['caption', 'tags', 'location'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    
    // Handle tags update
    if (updates.tags) {
      if (typeof updates.tags === 'string') {
        updates.tags = updates.tags.split(',').map(tag => tag.trim().replace('#', ''));
      } else if (Array.isArray(updates.tags)) {
        updates.tags = updates.tags.map(tag => tag.trim().replace('#', ''));
      }
    }
    
    Object.assign(post, updates);
    await post.save();
    
    await post.populate('user', 'username name profileImage');
    
    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: post
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        error: 'Post not found' 
      });
    }
    
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        error: 'Unauthorized - Only post owner can delete' 
      });
    }
    
    // Delete associated media files
    if (post.media && post.media.length > 0) {
      const fs = require('fs');
      const path = require('path');
      
      post.media.forEach(mediaItem => {
        const filename = mediaItem.url.split('/').pop();
        const mediaPath = path.join('./uploads', filename);
        if (fs.existsSync(mediaPath)) {
          fs.unlinkSync(mediaPath);
        }
      });
    }
    
    // Soft delete
    post.isActive = false;
    await post.save();
    
    // Update user's post count
    await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: -1 } });
    
    res.status(200).json({ 
      success: true,
      message: 'Post deleted successfully' 
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
};

// Like or unlike a post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || !post.isActive) {
      return res.status(404).json({ 
        success: false,
        error: 'Post not found' 
      });
    }
    
    const isLiked = post.isLikedBy(req.user._id);
    if (isLiked) {
      post.removeLike(req.user._id);
    } else {
      post.addLike(req.user._id);
    }
    
    await post.save();
    
    res.status(200).json({ 
      success: true,
      message: isLiked ? 'Post unliked' : 'Post liked',
      data: {
        likesCount: post.likesCount,
        isLiked: !isLiked
      }
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
};
