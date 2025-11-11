const mongoose = require('mongoose');

const AdSchema = new mongoose.Schema({
  advertisement: {
    type: String,
    required: true
  },
  imageUrl: { 
    type: String,
    default: ''
  },
});

module.exports = mongoose.model('Ad', AdSchema);