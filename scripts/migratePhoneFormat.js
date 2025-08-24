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
        // Common country codes: +1, +7, +20, +27, +30, +31, +32, +33, +34, +36, +39, +40, +41, +43, +44, +45, +46, +47, +48, +49, +51, +52, +53, +54, +55, +56, +57, +58, +60, +61, +62, +63, +64, +65, +66, +81, +82, +84, +86, +90, +91, +92, +93, +94, +95, +98, etc.
        let phoneMatch = phone.match(/^(\+(?:1|7|2[0-79]|3[0-69]|4[0-69]|5[1-8]|6[0-6]|8[1-246]|9[0-58]))(\d+)$/);
        
        if (!phoneMatch) {
          // Fallback: Try to extract common patterns
          phoneMatch = phone.match(/^(\+(?:91|1|44|33|49|81|86|61|55|52|39|34|7|971|966|965|963|962|960|886|852|853|976|977|992|993|994|995|996|998|380|375|374|373|372|371|370|48|41|43|420|421|385|386|387|389|382|381))(\d+)$/);
        }
        
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
