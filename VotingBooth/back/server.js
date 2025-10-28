const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('../data/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../front')));

// Initialize database connection
async function initializeDatabase() {
  try {
    await db.connect();
  } catch (error) {
    console.error('Failed to connect to database:', error.message);
    process.exit(1);
  }
}

// Voter endpoints
app.get('/voter', async (req, res) => {
  try {
    const voters = await db.getAllVoters();
    res.json(voters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/voter', async (req, res) => {
  try {
    const { voterName } = req.body;
    const voter = await db.createVoter(voterName);
    res.status(201).json(voter);
  } catch (error) {
    const statusCode = error.message.includes('required') ? 400 : 500;
    res.status(statusCode).json({ error: error.message });
  }
});

app.put('/voter/:voterId', async (req, res) => {
  try {
    const { voterId } = req.params;
    const { voterName } = req.body;
    const voter = await db.updateVoter(voterId, voterName);
    res.json(voter);
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 : 
                     error.message.includes('required') ? 400 : 500;
    res.status(statusCode).json({ error: error.message });
  }
});

app.delete('/voter/:voterId', async (req, res) => {
  try {
    const { voterId } = req.params;
    await db.deleteVoter(voterId);
    res.json({ message: 'Voter deleted successfully' });
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ error: error.message });
  }
});

// Ballot endpoints
app.get('/voter/:voterId/ballot', async (req, res) => {
  try {
    const { voterId } = req.params;
    const ballot = await db.getVoterBallot(voterId);
    if (!ballot) {
      return res.status(404).json({ error: 'No ballot found for this voter' });
    }
    res.json(ballot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/voter/:voterId/ballot', async (req, res) => {
  try {
    const { voterId } = req.params;
    const { candidateId } = req.body;
    const ballot = await db.submitVote(voterId, candidateId);
    res.status(201).json(ballot);
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 :
                     error.message.includes('already voted') ? 400 : 500;
    res.status(statusCode).json({ error: error.message });
  }
});

app.put('/voter/:voterId/ballot', async (req, res) => {
  try {
    const { voterId } = req.params;
    const { candidateId } = req.body;
    const ballot = await db.updateVote(voterId, candidateId);
    res.json(ballot);
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ error: error.message });
  }
});

app.delete('/voter/:voterId/ballot', async (req, res) => {
  try {
    const { voterId } = req.params;
    await db.deleteVote(voterId);
    res.json({ message: 'Ballot deleted successfully' });
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ error: error.message });
  }
});

// Candidate endpoints
app.get('/candidates', async (req, res) => {
  try {
    const candidates = await db.getAllCandidates();
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/candidates', async (req, res) => {
  try {
    const { candidateName } = req.body;
    const candidate = await db.createCandidate(candidateName);
    res.status(201).json(candidate);
  } catch (error) {
    const statusCode = error.message.includes('required') ? 400 : 500;
    res.status(statusCode).json({ error: error.message });
  }
});

app.delete('/candidates/:candidateId', async (req, res) => {
  try {
    const { candidateId } = req.params;
    await db.deleteCandidate(candidateId);
    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ error: error.message });
  }
});

// Ballots results endpoint
app.get('/candidates/ballots', async (req, res) => {
  try {
    const results = await db.getVotingResults();
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../front/index.html'));
});

// Start server
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
