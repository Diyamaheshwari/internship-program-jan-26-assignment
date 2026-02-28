const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createDefaultAdmin = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create default admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123', // Will be hashed by pre-save middleware
      profile: {
        firstName: 'Admin',
        lastName: 'User'
      },
      isVerified: true,
      subscription: {
        plan: 'enterprise',
        features: ['unlimited-series', 'unlimited-characters', 'unlimited-episodes', 'advanced-ai-features']
      }
    });

    await adminUser.save();
    console.log('Default admin user created successfully');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error creating default admin user:', error);
  }
};

module.exports = createDefaultAdmin;
