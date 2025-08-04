const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Slider = require('../models/Slider');
const connectDB = require('../config/database');

// Load environment variables
dotenv.config();

// Sample slider data
const sliderData = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80',
    redirectionUrl: 'https://example.com/pets-for-adoption',
    order: 1,
    isActive: true
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
    redirectionUrl: 'https://example.com/veterinary-services',
    order: 2,
    isActive: true
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80',
    redirectionUrl: 'https://example.com/pet-supplies',
    order: 3,
    isActive: true
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80',
    redirectionUrl: 'https://example.com/pet-training',
    order: 4,
    isActive: true
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800&q=80',
    redirectionUrl: 'https://example.com/pet-grooming',
    order: 5,
    isActive: true
  }
];

// Seed function
const seedSliders = async () => {
  try {
    // Clear existing sliders
    await Slider.deleteMany({});
    console.log('Existing sliders cleared');

    // Insert new slider data
    const sliders = await Slider.insertMany(sliderData);
    console.log(`${sliders.length} sliders seeded successfully`);

    // Print seeded data
    console.log('Seeded sliders:');
    sliders.forEach((slider, index) => {
      console.log(`${index + 1}. ID: ${slider._id}, Order: ${slider.order}, URL: ${slider.imageUrl}`);
    });

    return sliders;
  } catch (error) {
    console.error('Error seeding sliders:', error);
    throw error;
  }
};

// Function for direct script execution
const seedSlidersScript = async () => {
  try {
    await connectDB();
    await seedSliders();
    process.exit();
  } catch (error) {
    console.error('Error seeding sliders:', error);
    process.exit(1);
  }
};

// Run if this file is executed directly
if (require.main === module) {
  seedSlidersScript();
}

module.exports = { seedSliders, sliderData };
