require('dotenv').config();
const connectDB = require('../backend/config/db');
const Product = require('../models/Product');
const User = require('../models/User');
const sampleProducts = require('./sampleProducts');

const seedDatabase = async () => {
  try {
    await connectDB();

    await Product.deleteMany({});
    await Product.insertMany(sampleProducts);

    const existingUser = await User.findOne({ email: 'demo@store.com' });
    if (!existingUser) {
      await User.create({
        name: 'Demo User',
        email: 'demo@store.com',
        password: 'demo123'
      });
    }

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
