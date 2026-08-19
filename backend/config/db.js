const mongoose = require('mongoose');

async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce-store';

    await mongoose.connect(mongoUri, {
      dbName: process.env.DB_NAME || 'ecommerce-store',
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000,
      socketTimeoutMS: 4000
    });

    console.log(`MongoDB connected successfully to ${mongoUri}`);
    global.__demoMode = false;
    return mongoose.connection;
  } catch (error) {
    console.warn('MongoDB unavailable. Continuing in demo mode:', error.message);
    global.__demoMode = true;
    return null;
  }
}

module.exports = connectDB;
