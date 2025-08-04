const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const newPost = new Post({
      ...req.body,
      user: req.user._id
    });
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
