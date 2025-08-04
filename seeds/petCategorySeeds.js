const mongoose = require('mongoose');
const PetCategory = require('../models/PetCategory');

// Sample pet category data
const petCategoryData = [
  {
    name: 'Dogs',
    description: 'Loyal and friendly companions, perfect for families and individuals alike',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
    icon: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&q=80',
    order: 1,
    isActive: true,
    isDairyPet: false,
    metaTitle: 'Dogs - Find Your Perfect Canine Companion',
    metaDescription: 'Discover various dog breeds and find your perfect canine companion'
  },
  {
    name: 'Cats',
    description: 'Independent and affectionate feline friends that bring joy to any home',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80',
    icon: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100&q=80',
    order: 2,
    isActive: true,
    isDairyPet: false,
    metaTitle: 'Cats - Feline Friends for Every Home',
    metaDescription: 'Explore different cat breeds and find your perfect feline companion'
  },
  {
    name: 'Birds',
    description: 'Colorful and intelligent avian companions that can learn and interact',
    image: 'https://images.unsplash.com/photo-1520637836862-4d197d17c23a?w=800&q=80',
    icon: 'https://images.unsplash.com/photo-1520637836862-4d197d17c23a?w=100&q=80',
    order: 3,
    isActive: true,
    isDairyPet: false,
    metaTitle: 'Birds - Beautiful Avian Companions',
    metaDescription: 'Find colorful and intelligent bird species for your home'
  },
  {
    name: 'Fish',
    description: 'Peaceful aquatic pets that create a calming environment in your home',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
    icon: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=100&q=80',
    order: 4,
    isActive: true,
    isDairyPet: false,
    metaTitle: 'Fish - Aquatic Pets for Peaceful Homes',
    metaDescription: 'Discover various fish species for your aquarium'
  },
  {
    name: 'Rabbits',
    description: 'Gentle and social small mammals that make wonderful indoor pets',
    image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800&q=80',
    icon: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=100&q=80',
    order: 5,
    isActive: true,
    isDairyPet: false,
    metaTitle: 'Rabbits - Gentle Small Mammal Companions',
    metaDescription: 'Find gentle and social rabbit breeds for your family'
  },
  {
    name: 'Hamsters',
    description: 'Small, low-maintenance pets perfect for beginners and small spaces',
    image: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=800&q=80',
    icon: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=100&q=80',
    order: 6,
    isActive: true,
    isDairyPet: false,
    metaTitle: 'Hamsters - Perfect Small Space Pets',
    metaDescription: 'Discover hamster breeds ideal for small spaces and beginners'
  },
  {
    name: 'Guinea Pigs',
    description: 'Social and vocal small pets that love interaction and companionship',
    image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&q=80',
    icon: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=100&q=80',
    order: 7,
    isActive: true,
    isDairyPet: false,
    metaTitle: 'Guinea Pigs - Social Small Animal Companions',
    metaDescription: 'Find social and interactive guinea pig breeds'
  },
  {
    name: 'Reptiles',
    description: 'Unique and fascinating cold-blooded pets for experienced owners',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
    icon: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=100&q=80',
    order: 8,
    isActive: true,
    isDairyPet: false,
    metaTitle: 'Reptiles - Unique Cold-Blooded Companions',
    metaDescription: 'Explore various reptile species for experienced pet owners'
  },
  {
    name: 'Turtles',
    description: 'Long-lived aquatic or terrestrial pets that require specialized care',
    image: 'https://images.unsplash.com/photo-1437622368342-7a3640cc6090?w=800&q=80',
    icon: 'https://images.unsplash.com/photo-1437622368342-7a3640cc6090?w=100&q=80',
    order: 9,
    isActive: true,
    isDairyPet: false,
    metaTitle: 'Turtles - Long-Lived Reptilian Pets',
    metaDescription: 'Discover turtle species and their specialized care requirements'
  },
  {
    name: 'Ferrets',
    description: 'Playful and curious small mammals that are highly social and active',
    image: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=800&q=80',
    icon: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=100&q=80',
    order: 10,
    isActive: false, // Inactive for testing filter functionality
    isDairyPet: false,
    metaTitle: 'Ferrets - Playful and Active Small Mammals',
    metaDescription: 'Learn about ferrets as active and social pet companions'
  },
  // Dairy Pets
  {
    name: 'Cows',
    description: 'Gentle dairy animals that provide milk and are great for farming',
    image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&q=80',
    icon: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=100&q=80',
    order: 11,
    isActive: true,
    isDairyPet: true,
    metaTitle: 'Cows - Dairy Animals for Farming',
    metaDescription: 'Find different cow breeds for dairy farming and milk production'
  },
  {
    name: 'Buffalo',
    description: 'Strong and productive dairy animals known for rich milk production',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80',
    icon: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=100&q=80',
    order: 12,
    isActive: true,
    isDairyPet: true,
    metaTitle: 'Buffalo - High-Quality Dairy Animals',
    metaDescription: 'Discover buffalo breeds for superior milk production'
  },
  {
    name: 'Goats',
    description: 'Versatile dairy animals that are easy to manage and provide nutritious milk',
    image: 'https://images.unsplash.com/photo-1551196435-3e62cc4c9834?w=800&q=80',
    icon: 'https://images.unsplash.com/photo-1551196435-3e62cc4c9834?w=100&q=80',
    order: 13,
    isActive: true,
    isDairyPet: true,
    metaTitle: 'Goats - Easy-to-Manage Dairy Animals',
    metaDescription: 'Find goat breeds perfect for small-scale dairy farming'
  }
];

// Seed function
const seedPetCategories = async () => {
  try {
    // Clear existing pet categories
    await PetCategory.deleteMany({});
    console.log('Existing pet categories cleared');

    // Insert new pet category data
    const categories = await PetCategory.insertMany(petCategoryData);
    console.log(`${categories.length} pet categories seeded successfully`);

    return categories;
  } catch (error) {
    console.error('Error seeding pet categories:', error);
    throw error;
  }
};

module.exports = { seedPetCategories, petCategoryData };
