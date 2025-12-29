const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      maxlength: 1000,
    },
    image: {
      type: String,
      default: null,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [commentSchema],
    savedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    visibility: {
      type: String,
      enum: ['public', 'followers', 'private'],
      default: 'public',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for likes count
postSchema.virtual('likesCount').get(function () {
  return this.likes.length;
});

// Virtual for comments count
postSchema.virtual('commentsCount').get(function () {
  return this.comments.length;
});

// Include virtuals in JSON
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;

