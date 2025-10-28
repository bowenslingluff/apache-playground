const mongoose = require('mongoose');

// Try to load dotenv, but don't fail if it's not available
try {
  require('dotenv').config();
} catch (error) {
  // dotenv not available, that's okay - environment variables can be set externally
}

class DatabaseConnection {
  constructor() {
    this.isConnected = false;
    this.connection = null;
  }

  async connect() {
    try {
      const MONGODB_URI = process.env.MONGODB_URI;
      
      if (!MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is required');
      }

      console.log('Connecting to MongoDB...');
      
      this.connection = await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      this.isConnected = true;
      console.log('✅ Connected to MongoDB');
      console.log('Database:', mongoose.connection.db.databaseName);

      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB disconnected');
        this.isConnected = false;
      });

      return this.connection;
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error.message);
      throw error;
    }
  }

  async disconnect() {
    if (this.isConnected) {
      await mongoose.connection.close();
      this.isConnected = false;
      console.log('MongoDB connection closed');
    }
  }

  getConnection() {
    return this.connection;
  }

  isDatabaseConnected() {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  async testConnection() {
    try {
      if (!this.isDatabaseConnected()) {
        await this.connect();
      }
      
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('\n📋 Existing collections:');
      collections.forEach(collection => {
        console.log(`  - ${collection.name}`);
      });
      
      return {
        connected: true,
        database: mongoose.connection.db.databaseName,
        collections: collections.map(c => c.name)
      };
    } catch (error) {
      console.error('❌ Database test failed:', error.message);
      return {
        connected: false,
        error: error.message
      };
    }
  }
}

module.exports = new DatabaseConnection();
