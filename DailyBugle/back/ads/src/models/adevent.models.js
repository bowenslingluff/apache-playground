const mongoose = require('mongoose');

const AdEventSchema = new mongoose.Schema({
  adId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ad',
    required: true
  },
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  },
  eventType: {
    type: String,
    enum: ['impression', 'interaction'],
    required: true
  },
  userIp: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null 
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

module.exports = mongoose.model('AdEvent', AdEventSchema);