const express = require('express');
const mongoose = require('mongoose');
const articlesRoutes = require('./routes/articles.routes');
const cors = require('cors');

const app = express();

const PORT = process.env.PORT || 8082;
const MONGO_URI = process.env.MONGO_URI;

// Use cors() middleware to allow requests from your frontend
// Use express.json() middleware to parse incoming JSON request bodies
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('Articles Service connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define routes
app.use('/articles', articlesRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Articles Service listening on port ${PORT}`);
});