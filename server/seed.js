require('dotenv').config();
const connectDB = require('./config/db');
const { seedDatabase } = require('./utils/seedData');
const mongoose = require('mongoose');

const run = async () => {
  try {
    await connectDB();
    console.log('[Seed CLI] Running force re-seed on MongoDB...');
    await seedDatabase(true);
    console.log('[Seed CLI] Completed successfully.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('[Seed CLI] Failed:', err);
    process.exit(1);
  }
};

run();
