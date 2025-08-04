const mongoose = require('mongoose');
const Breed = require('../models/Breed');

// Sample breed data
const breedData = [
  {
    name: 'Labrador Retriever',
    description: 'Gentle, intelligent, and family-friendly',
    image: 'https://images.unsplash.com/photo-1574169208507-843761648c42?w=800q=80',
    icon: 'https://images.unsplash.com/photo-1574169208507-843761648c42?w=100q=80',
    category: null, // Will be filled in during seeding after retrieving category ID
    size: 'Large',
    isActive: true,
    temperament: ['Gentle', 'Intelligent', 'Friendly'],
    lifeSpan: '10-12 years',
    origin: 'Canada',
    weight: { min: 25, max: 36, unit: 'kg' },
    height: { min: 55, max: 62, unit: 'cm' },
    exerciseNeeds: 'High',
    groomingNeeds: 'Moderate',
    goodWithKids: true,
    goodWithPets: true,
    hypoallergenic: false
  },
  {
    name: 'Persian Cat',
    description: 'Calm, gentle, and affectionate',
    image: 'https://images.unsplash.com/photo-1603570428361-5f007c11e359?w=800q=80',
    icon: 'https://images.unsplash.com/photo-1603570428361-5f007c11e359?w=100q=80',
    category: null, // Will be filled in during seeding after retrieving category ID
    size: 'Medium',
    isActive: true,
    temperament: ['Calm', 'Gentle', 'Affectionate'],
    lifeSpan: '12-17 years',
    origin: 'Iran',
    weight: { min: 3, max: 6, unit: 'kg' },
    height: { min: 25, max: 30, unit: 'cm' },
    exerciseNeeds: 'Low',
    groomingNeeds: 'High',
    goodWithKids: true,
    goodWithPets: true,
    hypoallergenic: false
  },
  {
    name: 'Parakeet',
    description: 'Social, active, and great talkers',
    image: 'https://images.unsplash.com/photo-1529343294700-533cba34f379?w=800q=80',
    icon: 'https://images.unsplash.com/photo-1529343294700-533cba34f379?w=100q=80',
    category: null, // Will be filled in during seeding after retrieving category ID
    size: 'Small',
    isActive: true,
    temperament: ['Social', 'Active', 'Talkative'],
    lifeSpan: '5-10 years',
    origin: 'Australia',
    weight: { min: 0.03, max: 0.04, unit: 'kg' },
    height: { min: 18, max: 22, unit: 'cm' },
    exerciseNeeds: 'Moderate',
    groomingNeeds: 'Low',
    goodWithKids: true,
    goodWithPets: true,
    hypoallergenic: false
  }
];

// Seed function
const seedBreeds = async (categories) => {
  try {
    // Clear existing breeds
    await Breed.deleteMany({});
    console.log('Existing breeds cleared');

    // Fill category references
    const catMap = {
      Dogs: categories.find(cat => cat.name === 'Dogs')._id,
      Cats: categories.find(cat => cat.name === 'Cats')._id,
      Birds: categories.find(cat => cat.name === 'Birds')._id,
    };
    breedData.forEach(breed => {
      breed.category = catMap[breed.name.includes('Cat') ? 'Cats' : (breed.name.includes('Parakeet') ? 'Birds' : 'Dogs')];
    });

    // Insert new breed data
    const breeds = await Breed.insertMany(breedData);
    console.log(`${breeds.length} breeds seeded successfully`);

    return breeds;
  } catch (error) {
    console.error('Error seeding breeds:', error);
    throw error;
  }
};

module.exports = { seedBreeds, breedData };
