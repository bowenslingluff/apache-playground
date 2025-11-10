const mongoose = require('mongoose');

const AdSchema = new mongoose.Schema({
  advertisement: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Ad', AdSchema);