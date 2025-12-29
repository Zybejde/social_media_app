const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/messages/conversations
// @desc    Get all conversations for current user
// @access  Private
router.get('/conversations', auth, async (req, res) => {
  try {
    // Get all unique users the current user has chatted with
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: req.userId }, { receiver: req.userId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ['$sender', req.userId] }, '$receiver', '$sender'],
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', req.userId] },
                    { $eq: ['$read', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          user: {
            _id: '$user._id',
            name: '$user.name',
            avatar: '$user.avatar',
            isOnline: '$user.isOnline',
            lastSeen: '$user.lastSeen',
          },
          lastMessage: {
            content: '$lastMessage.content',
            createdAt: '$lastMessage.createdAt',
            sender: '$lastMessage.sender',
          },
          unreadCount: 1,
        },
      },
      {
        $sort: { 'lastMessage.createdAt': -1 },
      },
    ]);

    res.json({ conversations: messages });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// @route   GET /api/messages/:userId
// @desc    Get messages between current user and another user
// @access  Private
router.get('/:userId', auth, async (req, res) => {
  try {
    const { limit = 50, before } = req.query;
    const otherUserId = req.params.userId;

    let query = {
      $or: [
        { sender: req.userId, receiver: otherUserId },
        { sender: otherUserId, receiver: req.userId },
      ],
    };

    // For pagination (load older messages)
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Mark messages as read
    await Message.updateMany(
      {
        sender: otherUserId,
        receiver: req.userId,
        read: false,
      },
      {
        read: true,
        readAt: new Date(),
      }
    );

    // Get the other user's info
    const otherUser = await User.findById(otherUserId).select('name avatar isOnline lastSeen');

    res.json({
      messages: messages.reverse(), // Return in chronological order
      user: otherUser,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// @route   POST /api/messages/:userId
// @desc    Send a message to a user
// @access  Private
router.post('/:userId', auth, async (req, res) => {
  try {
    const { content, messageType = 'text' } = req.body;
    const receiverId = req.params.userId;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: 'User not found' });
    }

    const message = new Message({
      sender: req.userId,
      receiver: receiverId,
      content: content.trim(),
      messageType,
    });

    await message.save();
    await message.populate('sender', 'name avatar');
    await message.populate('receiver', 'name avatar');

    // Emit socket event for real-time messaging
    const io = req.app.get('io');
    io.to(receiverId).emit('new_message', {
      message,
      from: req.user.toPublicProfile(),
    });

    res.status(201).json({
      message: 'Message sent successfully',
      data: message,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// @route   PUT /api/messages/:messageId/read
// @desc    Mark a message as read
// @access  Private
router.put('/:messageId/read', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.receiver.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    message.read = true;
    message.readAt = new Date();
    await message.save();

    // Emit socket event
    const io = req.app.get('io');
    io.to(message.sender.toString()).emit('message_read', {
      messageId: message._id,
    });

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

module.exports = router;

