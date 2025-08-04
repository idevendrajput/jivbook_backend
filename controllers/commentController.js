const Comment = require('../models/Comment');
const Post = require('../models/Post');

// Create a new comment
exports.createComment = async (req, res) => {
  try {
    const { post, text, parentComment } = req.body;
    
    // Check if post exists
    const postExists = await Post.findById(post);
    if (!postExists) return res.status(404).json({ error: 'Post not found' });
    
    const newComment = new Comment({
      post,
      user: req.user._id,
      text,
      parentComment: parentComment || null
    });
    
    await newComment.save();
    
    // Update post's comment count
    await Post.findByIdAndUpdate(post, { $inc: { commentsCount: 1 } });
    
    // If it's a reply, update parent comment's reply count
    if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment, { $inc: { repliesCount: 1 } });
    }
    
    await newComment.populate('user', 'username profileImage');
    res.status(201).json(newComment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get comments for a post
exports.getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const comments = await Comment.find({ 
      post: postId, 
      parentComment: null, // Only get top-level comments
      isActive: true 
    })
    .populate('user', 'username profileImage')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
    
    res.status(200).json(comments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get replies to a comment
exports.getReplies = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const replies = await Comment.find({ 
      parentComment: commentId,
      isActive: true 
    })
    .populate('user', 'username profileImage')
    .sort({ createdAt: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
    
    res.status(200).json(replies);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update a comment
exports.updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment || comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    comment.text = req.body.text;
    await comment.save();
    
    await comment.populate('user', 'username profileImage');
    res.status(200).json(comment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment || comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    comment.isActive = false;
    await comment.save();
    
    // Update post's comment count
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });
    
    // If it's a reply, update parent comment's reply count
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, { $inc: { repliesCount: -1 } });
    }
    
    res.status(200).json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Like or unlike a comment
exports.likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    
    const isLiked = comment.isLikedBy(req.user._id);
    if (isLiked) {
      comment.removeLike(req.user._id);
    } else {
      comment.addLike(req.user._id);
    }
    
    await comment.save();
    res.status(200).json({ likesCount: comment.likesCount });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
