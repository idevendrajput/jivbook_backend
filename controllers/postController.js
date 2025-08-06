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
    
    // Handle media files if any
    if (req.files && req.files.length > 0) {
      postData.media = req.files.map((file, index) => ({
        type: file.mimetype.startsWith('image/') ? 'image' : 'video',
        url: file.path,
        order: index
      }));
    }
    
    // Handle tags
    if (req.body.tags && typeof req.body.tags === 'string') {
      postData.tags = req.body.tags.split(',').map(tag => tag.trim());
    }
    
    // Handle location
    if (req.body.latitude && req.body.longitude) {
      postData.location = {
        name: req.body.location || 'Unknown Location',
        coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)]
      };
    }
    
    const newPost = new Post(postData);
    await newPost.save();
    
    // Update user's post count
    await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: 1 } });
    
    res.status(201).json(newPost);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({ isActive: true }).populate('user', 'username profileImage');
    res.status(200).json(posts);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get a post by ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('user', 'username profileImage');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.status(200).json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.user.toString() !== req.user._id.toString())
      return res.status(403).json({ error: 'Unauthorized' });
    Object.assign(post, req.body);
    await post.save();
    res.status(200).json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.user.toString() !== req.user._id.toString())
      return res.status(403).json({ error: 'Unauthorized' });
    post.isActive = false;
    await post.save();
    // Update user's post count
    await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: -1 } });
    res.status(200).json({ message: 'Post deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Like or unlike a post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const isLiked = post.isLikedBy(req.user._id);
    if (isLiked) {
      post.removeLike(req.user._id);
    } else {
      post.addLike(req.user._id);
    }
    await post.save();
    res.status(200).json({ likesCount: post.likesCount });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
