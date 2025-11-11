const mongoose = require('mongoose');
const CommentSchema = require('./comment.model.js');

// User Schema
const ArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  teaser: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  categories: {
    type: [String],
    default: []
  },
  comments: [CommentSchema],
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

ArticleSchema.index({ title: 'text', body: 'text', categories: 'text' });

module.exports = mongoose.model('Article', ArticleSchema);