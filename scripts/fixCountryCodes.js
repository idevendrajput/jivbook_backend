const mongoose = require('mongoose');
const User = require('../models/User');

// Load environment variables
require('dotenv').config();

// Map of incorrect country codes to correct ones
const countryCodeFixes = {
  '+1111': '+1',      // US/Canada code should be +1
  '+1234': '+1',      // US/Canada code should be +1
  '+9170': '+91',     // India code should be +91
  '+9189': '+91',     // India code should be +91
  '+9190': '+91',     // India code should be +91
  '+9199': '+91',     // India code should be +91
};

async function fixCountryCodes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find all users with incorrect country codes
    const usersToFix = await User.find({
      countryCode: { $in: Object.keys(countryCodeFixes) }
    });
    
    console.log(`📱 Found ${usersToFix.length} users with incorrect country codes`);
    
    if (usersToFix.length === 0) {
      console.log('✅ No users need fixing');
      return;
    }
    
    let fixed = 0;
    let failed = 0;
    
    for (const user of usersToFix) {
      try {
        const oldCountryCode = user.countryCode;
        const newCountryCode = countryCodeFixes[oldCountryCode];
        
        console.log(`🔄 Fixing user ${user._id}: ${oldCountryCode} -> ${newCountryCode}`);
        
        // For incorrect country codes, we need to adjust the phone number too
        let newPhoneNumber = user.phone;
        
        if (oldCountryCode === '+1111' && newCountryCode === '+1') {
          // +1111 2223333 should become +1 1112223333
          newPhoneNumber = '111' + user.phone;
        } else if (oldCountryCode === '+1234' && newCountryCode === '+1') {
          // +1234 567890 should become +1 1234567890
          newPhoneNumber = '123' + user.phone;
        } else if (oldCountryCode.startsWith('+91') && newCountryCode === '+91') {
          // +9170 62023870 should become +91 7062023870
          // +9189 55772016 should become +91 8955772016
          // +9190 24653150 should become +91 9024653150
          // +9199 99999999 should become +91 9999999999
          const extraDigits = oldCountryCode.substring(3); // Extract digits after +91
          newPhoneNumber = extraDigits + user.phone;
        }
        
        // Update user with correct fields
        await User.updateOne(
          { _id: user._id },
          {
            $set: {
              countryCode: newCountryCode,
              phone: newPhoneNumber
            }
          }
        );
        
        console.log(`✅ Fixed user ${user._id}: ${oldCountryCode} ${user.phone} -> ${newCountryCode} ${newPhoneNumber}`);
        fixed++;
      } catch (error) {
        console.error(`❌ Failed to fix user ${user._id}:`, error.message);
        failed++;
      }
    }
    
    console.log(`\n📊 Fix Summary:`);
    console.log(`✅ Successfully fixed: ${fixed} users`);
    console.log(`❌ Failed fixes: ${failed} users`);
    console.log(`📱 Total processed: ${usersToFix.length} users`);
    
  } catch (error) {
    console.error('❌ Fix operation failed:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the fix if this script is executed directly
if (require.main === module) {
  fixCountryCodes();
}

module.exports = fixCountryCodes;
