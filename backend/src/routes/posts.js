const express = require('express');
const Post = require('../models/Post');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/posts
// @desc    Get all posts (feed)
// @access  Public (optional auth for personalized feed)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { limit = 20, page = 1, userId } = req.query;

    let query = { visibility: 'public' };
    
    // If userId provided, get only that user's posts
    if (userId) {
      query.author = userId;
    }

    const posts = await Post.find(query)
      .populate('author', 'name avatar')
      .populate('comments.user', 'name avatar')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Post.countDocuments(query);

    // Add isLiked and isSaved for authenticated users
    const postsWithStatus = posts.map((post) => {
      const postObj = post.toObject();
      if (req.userId) {
        postObj.isLiked = post.likes.includes(req.userId);
        postObj.isSaved = post.savedBy.includes(req.userId);
      }
      return postObj;
    });

    res.json({
      posts: postsWithStatus,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to get posts' });
  }
});

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { content, image, visibility = 'public' } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Post content is required' });
    }

    const post = new Post({
      author: req.userId,
      content: content.trim(),
      image,
      visibility,
    });

    await post.save();
    await post.populate('author', 'name avatar');

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.emit('new_post', post);

    res.status(201).json({
      message: 'Post created successfully',
      post,
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// @route   GET /api/posts/:id
// @desc    Get a single post
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name avatar')
      .populate('comments.user', 'name avatar');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const postObj = post.toObject();
    if (req.userId) {
      postObj.isLiked = post.likes.includes(req.userId);
      postObj.isSaved = post.savedBy.includes(req.userId);
    }

    res.json({ post: postObj });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Failed to get post' });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private (owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.author.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await post.deleteOne();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Like/unlike a post
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const isLiked = post.likes.includes(req.userId);

    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter((id) => id.toString() !== req.userId.toString());
    } else {
      // Like
      post.likes.push(req.userId);

      // Emit notification to post author
      if (post.author.toString() !== req.userId.toString()) {
        const io = req.app.get('io');
        io.to(post.author.toString()).emit('post_liked', {
          postId: post._id,
          user: req.user.toPublicProfile(),
        });
      }
    }

    await post.save();

    res.json({
      message: isLiked ? 'Post unliked' : 'Post liked',
      isLiked: !isLiked,
      likesCount: post.likes.length,
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// @route   POST /api/posts/:id/save
// @desc    Save/unsave a post
// @access  Private
router.post('/:id/save', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const isSaved = post.savedBy.includes(req.userId);

    if (isSaved) {
      post.savedBy = post.savedBy.filter((id) => id.toString() !== req.userId.toString());
    } else {
      post.savedBy.push(req.userId);
    }

    await post.save();

    res.json({
      message: isSaved ? 'Post unsaved' : 'Post saved',
      isSaved: !isSaved,
    });
  } catch (error) {
    console.error('Save post error:', error);
    res.status(500).json({ error: 'Failed to save post' });
  }
});

// @route   POST /api/posts/:id/comments
// @desc    Add a comment to a post
// @access  Private
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = {
      user: req.userId,
      text: text.trim(),
    };

    post.comments.push(comment);
    await post.save();

    // Populate the new comment's user
    await post.populate('comments.user', 'name avatar');

    const newComment = post.comments[post.comments.length - 1];

    // Emit notification to post author
    if (post.author.toString() !== req.userId.toString()) {
      const io = req.app.get('io');
      io.to(post.author.toString()).emit('new_comment', {
        postId: post._id,
        comment: newComment,
      });
    }

    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment,
      commentsCount: post.comments.length,
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// @route   GET /api/posts/saved/me
// @desc    Get current user's saved posts
// @access  Private
router.get('/saved/me', auth, async (req, res) => {
  try {
    const posts = await Post.find({ savedBy: req.userId })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ posts });
  } catch (error) {
    console.error('Get saved posts error:', error);
    res.status(500).json({ error: 'Failed to get saved posts' });
  }
});

// @route   GET /api/posts/liked/me
// @desc    Get posts liked by current user
// @access  Private
router.get('/liked/me', auth, async (req, res) => {
  try {
    const posts = await Post.find({ likes: req.userId })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ posts });
  } catch (error) {
    console.error('Get liked posts error:', error);
    res.status(500).json({ error: 'Failed to get liked posts' });
  }
});

module.exports = router;

