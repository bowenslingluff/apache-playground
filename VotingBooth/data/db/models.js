const mongoose = require('mongoose');

// Voter Schema
const voterSchema = new mongoose.Schema({
  voterName: { 
    type: String, 
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Candidate Schema
const candidateSchema = new mongoose.Schema({
  candidateName: { 
    type: String, 
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Ballot Schema
const ballotSchema = new mongoose.Schema({
  voterId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Voter', 
    required: true 
  },
  candidateId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Candidate', 
    required: true 
  }
}, {
  timestamps: true
});

// Create indexes for better performance
voterSchema.index({ voterName: 1 });
candidateSchema.index({ candidateName: 1 });
ballotSchema.index({ voterId: 1 });
ballotSchema.index({ candidateId: 1 });

// Ensure unique ballot per voter
ballotSchema.index({ voterId: 1 }, { unique: true });

// Create models
const Voter = mongoose.model('Voter', voterSchema);
const Candidate = mongoose.model('Candidate', candidateSchema);
const Ballot = mongoose.model('Ballot', ballotSchema);

module.exports = {
  Voter,
  Candidate,
  Ballot
};
