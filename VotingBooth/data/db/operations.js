const { Voter, Candidate, Ballot } = require('./models');

class DatabaseOperations {
  // Voter Operations
  async getAllVoters() {
    try {
      return await Voter.find().sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Failed to fetch voters: ${error.message}`);
    }
  }

  async createVoter(voterName) {
    try {
      if (!voterName || !voterName.trim()) {
        throw new Error('Voter name is required');
      }
      
      const voter = new Voter({ voterName: voterName.trim() });
      return await voter.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Voter with this name already exists');
      }
      throw new Error(`Failed to create voter: ${error.message}`);
    }
  }

  async updateVoter(voterId, voterName) {
    try {
      if (!voterName || !voterName.trim()) {
        throw new Error('Voter name is required');
      }
      
      const voter = await Voter.findByIdAndUpdate(
        voterId, 
        { voterName: voterName.trim() }, 
        { new: true, runValidators: true }
      );
      
      if (!voter) {
        throw new Error('Voter not found');
      }
      
      return voter;
    } catch (error) {
      throw new Error(`Failed to update voter: ${error.message}`);
    }
  }

  async deleteVoter(voterId) {
    try {
      const voter = await Voter.findByIdAndDelete(voterId);
      if (!voter) {
        throw new Error('Voter not found');
      }
      
      // Also delete any ballots for this voter
      await Ballot.deleteMany({ voterId });
      return voter;
    } catch (error) {
      throw new Error(`Failed to delete voter: ${error.message}`);
    }
  }

  // Candidate Operations
  async getAllCandidates() {
    try {
      return await Candidate.find().sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Failed to fetch candidates: ${error.message}`);
    }
  }

  async createCandidate(candidateName) {
    try {
      if (!candidateName || !candidateName.trim()) {
        throw new Error('Candidate name is required');
      }
      
      const candidate = new Candidate({ candidateName: candidateName.trim() });
      return await candidate.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Candidate with this name already exists');
      }
      throw new Error(`Failed to create candidate: ${error.message}`);
    }
  }

  async deleteCandidate(candidateId) {
    try {
      const candidate = await Candidate.findByIdAndDelete(candidateId);
      if (!candidate) {
        throw new Error('Candidate not found');
      }
      
      // Also delete any ballots for this candidate
      await Ballot.deleteMany({ candidateId });
      return candidate;
    } catch (error) {
      throw new Error(`Failed to delete candidate: ${error.message}`);
    }
  }

  // Ballot Operations
  async getVoterBallot(voterId) {
    try {
      const ballot = await Ballot.findOne({ voterId }).populate('candidateId');
      return ballot;
    } catch (error) {
      throw new Error(`Failed to fetch ballot: ${error.message}`);
    }
  }

  async submitVote(voterId, candidateId) {
    try {
      // Check if voter exists
      const voter = await Voter.findById(voterId);
      if (!voter) {
        throw new Error('Voter not found');
      }
      
      // Check if candidate exists
      const candidate = await Candidate.findById(candidateId);
      if (!candidate) {
        throw new Error('Candidate not found');
      }
      
      // Check if voter already has a ballot
      const existingBallot = await Ballot.findOne({ voterId });
      if (existingBallot) {
        throw new Error('Voter has already voted');
      }
      
      const ballot = new Ballot({ voterId, candidateId });
      return await ballot.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Voter has already voted');
      }
      throw new Error(`Failed to submit vote: ${error.message}`);
    }
  }

  async updateVote(voterId, candidateId) {
    try {
      // Check if candidate exists
      const candidate = await Candidate.findById(candidateId);
      if (!candidate) {
        throw new Error('Candidate not found');
      }
      
      const ballot = await Ballot.findOneAndUpdate(
        { voterId },
        { candidateId },
        { new: true, runValidators: true }
      );
      
      if (!ballot) {
        throw new Error('No ballot found for this voter');
      }
      
      return ballot;
    } catch (error) {
      throw new Error(`Failed to update vote: ${error.message}`);
    }
  }

  async deleteVote(voterId) {
    try {
      const ballot = await Ballot.findOneAndDelete({ voterId });
      if (!ballot) {
        throw new Error('No ballot found for this voter');
      }
      return ballot;
    } catch (error) {
      throw new Error(`Failed to delete vote: ${error.message}`);
    }
  }

  // Results Operations
  async getVotingResults() {
    try {
      const candidates = await Candidate.find();
      const ballots = await Ballot.find().populate('candidateId');
      
      const results = candidates.map(candidate => {
        const votes = ballots.filter(ballot => 
          ballot.candidateId._id.toString() === candidate._id.toString()
        ).length;
        
        return {
          _id: candidate._id,
          candidateName: candidate.candidateName,
          votes: votes
        };
      });
      
      return results;
    } catch (error) {
      throw new Error(`Failed to fetch voting results: ${error.message}`);
    }
  }

  // Utility Operations
  async getVotersWithStatus() {
    try {
      const voters = await this.getAllVoters();
      const votedVoters = [];
      const notVotedVoters = [];

      for (const voter of voters) {
        const ballot = await this.getVoterBallot(voter._id);
        if (ballot) {
          votedVoters.push(voter);
        } else {
          notVotedVoters.push(voter);
        }
      }
      
      return {
        allVoters: voters,
        notVoted: notVotedVoters,
        voted: votedVoters
      };
    } catch (error) {
      throw new Error(`Failed to get voter status: ${error.message}`);
    }
  }

  async getDatabaseStats() {
    try {
      const voterCount = await Voter.countDocuments();
      const candidateCount = await Candidate.countDocuments();
      const ballotCount = await Ballot.countDocuments();
      
      return {
        voters: voterCount,
        candidates: candidateCount,
        ballots: ballotCount
      };
    } catch (error) {
      throw new Error(`Failed to get database stats: ${error.message}`);
    }
  }
}

module.exports = new DatabaseOperations();
