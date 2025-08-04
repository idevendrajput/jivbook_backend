const User = require('../models/User');

// Generate unique username from name
const generateUniqueUsername = async (name = 'user') => {
  // Clean the name to create base username
  let username = name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters except spaces
    .replace(/\s+/g, '') // Remove all spaces
    .trim();
  
  // If username is empty after cleaning, use 'user'
  if (!username || username.length < 2) {
    username = 'user';
  }
  
  // Limit username length
  if (username.length > 15) {
    username = username.substring(0, 15);
  }
  
  let finalUsername = username;
  let counter = 1;
  
  // Check if username exists and generate unique one
  while (await User.findOne({ username: finalUsername })) {
    finalUsername = `${username}${counter}`;
    counter++;
  }
  
  return finalUsername;
};

// Generate name from email or phone
const generateNameFromContact = (email, phone) => {
  if (email) {
    // Extract name from email (part before @)
    const emailName = email.split('@')[0];
    // Clean and capitalize
    return emailName.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim();
  } else if (phone) {
    // For phone, just use a generic name with phone digits
    return `User ${phone.slice(-4)}`;
  }
  return 'User';
};

module.exports = {
  generateUniqueUsername,
  generateNameFromContact
};
