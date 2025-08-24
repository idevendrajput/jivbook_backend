const mongoose = require('mongoose');
const User = require('../models/User');

// Load environment variables
require('dotenv').config();

async function migratePhoneFormat() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find all users with phone but no countryCode
    const usersToMigrate = await User.find({
      phone: { $exists: true, $ne: null },
      $or: [
        { countryCode: { $exists: false } },
        { countryCode: null },
        { countryCode: '' }
      ]
    });
    
    console.log(`📱 Found ${usersToMigrate.length} users to migrate`);
    
    if (usersToMigrate.length === 0) {
      console.log('✅ No users need migration');
      return;
    }
    
    let migrated = 0;
    let failed = 0;
    
    for (const user of usersToMigrate) {
      try {
        const phone = user.phone;
        console.log(`🔄 Migrating user ${user._id} with phone: ${phone}`);
        
        // Extract country code and phone number from combined format
        const phoneMatch = phone.match(/^(\+\d{1,4})(\d+)$/);
        
        if (phoneMatch) {
          const countryCode = phoneMatch[1]; // e.g., "+91"
          const phoneNumber = phoneMatch[2]; // e.g., "9024653150"
          
          // Update user with separate fields
          await User.updateOne(
            { _id: user._id },
            {
              $set: {
                countryCode: countryCode,
                phone: phoneNumber
              }
            }
          );
          
          console.log(`✅ Migrated user ${user._id}: ${phone} -> ${countryCode} + ${phoneNumber}`);
          migrated++;
        } else {
          console.log(`❌ Could not parse phone format for user ${user._id}: ${phone}`);
          failed++;
        }
      } catch (error) {
        console.error(`❌ Failed to migrate user ${user._id}:`, error.message);
        failed++;
      }
    }
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`✅ Successfully migrated: ${migrated} users`);
    console.log(`❌ Failed migrations: ${failed} users`);
    console.log(`📱 Total processed: ${usersToMigrate.length} users`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  migratePhoneFormat();
}

module.exports = migratePhoneFormat;
