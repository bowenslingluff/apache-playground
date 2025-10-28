const dbConnection = require('./connection');
const dbOperations = require('./operations');
const { Voter, Candidate, Ballot } = require('./models');

module.exports = {
  // Connection management
  connect: () => dbConnection.connect(),
  disconnect: () => dbConnection.disconnect(),
  isConnected: () => dbConnection.isDatabaseConnected(),
  testConnection: () => dbConnection.testConnection(),
  
  // Database operations - explicitly export each method
  getAllVoters: dbOperations.getAllVoters.bind(dbOperations),
  createVoter: dbOperations.createVoter.bind(dbOperations),
  updateVoter: dbOperations.updateVoter.bind(dbOperations),
  deleteVoter: dbOperations.deleteVoter.bind(dbOperations),
  
  getAllCandidates: dbOperations.getAllCandidates.bind(dbOperations),
  createCandidate: dbOperations.createCandidate.bind(dbOperations),
  deleteCandidate: dbOperations.deleteCandidate.bind(dbOperations),
  
  getVoterBallot: dbOperations.getVoterBallot.bind(dbOperations),
  submitVote: dbOperations.submitVote.bind(dbOperations),
  updateVote: dbOperations.updateVote.bind(dbOperations),
  deleteVote: dbOperations.deleteVote.bind(dbOperations),
  
  getVotingResults: dbOperations.getVotingResults.bind(dbOperations),
  getVotersWithStatus: dbOperations.getVotersWithStatus.bind(dbOperations),
  getDatabaseStats: dbOperations.getDatabaseStats.bind(dbOperations),
  
  // Models (for advanced usage)
  models: {
    Voter,
    Candidate,
    Ballot
  }
};
