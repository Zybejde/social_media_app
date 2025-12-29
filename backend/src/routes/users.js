const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (for search/discovery)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { search, limit = 20, page = 1 } = req.query;
    
    let query = { _id: { $ne: req.userId } }; // Exclude current user
    
    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users: users.map((u) => u.toPublicProfile()),
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if current user is following this user
    const isFollowing = user.followers.includes(req.userId);

    res.json({
      user: user.toPublicProfile(),
      isFollowing,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// @route   POST /api/users/:id/follow
// @desc    Follow a user
// @access  Private
router.post('/:id/follow', auth, async (req, res) => {
  try {
    if (req.params.id === req.userId.toString()) {
      return res.status(400).json({ error: 'You cannot follow yourself' });
    }

    const userToFollow = await User.findById(req.params.id);
    
    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already following
    if (userToFollow.followers.includes(req.userId)) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Add to followers and following
    userToFollow.followers.push(req.userId);
    req.user.following.push(userToFollow._id);

    await userToFollow.save();
    await req.user.save();

    // Emit socket event for real-time notification
    const io = req.app.get('io');
    io.to(userToFollow._id.toString()).emit('new_follower', {
      follower: req.user.toPublicProfile(),
    });

    res.json({
      message: 'Successfully followed user',
      user: userToFollow.toPublicProfile(),
    });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// @route   POST /api/users/:id/unfollow
// @desc    Unfollow a user
// @access  Private
router.post('/:id/unfollow', auth, async (req, res) => {
  try {
    if (req.params.id === req.userId.toString()) {
      return res.status(400).json({ error: 'You cannot unfollow yourself' });
    }

    const userToUnfollow = await User.findById(req.params.id);
    
    if (!userToUnfollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove from followers and following
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== req.userId.toString()
    );
    req.user.following = req.user.following.filter(
      (id) => id.toString() !== userToUnfollow._id.toString()
    );

    await userToUnfollow.save();
    await req.user.save();

    res.json({
      message: 'Successfully unfollowed user',
      user: userToUnfollow.toPublicProfile(),
    });
  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

// @route   GET /api/users/:id/followers
// @desc    Get user's followers
// @access  Private
router.get('/:id/followers', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('followers', '-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      followers: user.followers.map((f) => f.toPublicProfile()),
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ error: 'Failed to get followers' });
  }
});

// @route   GET /api/users/:id/following
// @desc    Get users that a user is following
// @access  Private
router.get('/:id/following', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('following', '-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      following: user.following.map((f) => f.toPublicProfile()),
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'Failed to get following' });
  }
});

module.exports = router;

