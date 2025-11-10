const mongoose = require('mongoose');

// Comment Schema
const ArticleSchema = new mongoose.Schema({
  commentBody: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  username: {
    type: String,
    required: true
  }
}, { createdAt: true, updatedAt: false });



module.exports = CommentSchema;