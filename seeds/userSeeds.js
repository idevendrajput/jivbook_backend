const mongoose = require('mongoose');
const User = require('../models/User');

// Sample user data for testing
const userData = [
  {
    name: 'Admin User',
    countryCode: '+1',
    phone: '9999999999',
    email: 'admin@jivbook.com',
    emailVerified: true,
    username: 'admin',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    address: 'Admin Office, Silicon Valley, CA 94000',
    latitude: 37.4419,
    longitude: -122.1430,
    preferencePetType: 'All Pets',
    preferenceCategories: 'All Categories',
    isAdmin: true,
    isVerified: true,
    bio: 'Administrator of Jivbook platform',
    website: 'https://jivbook.com'
  },
  {
    name: 'John Doe',
    countryCode: '+1',
    phone: '1234567890',
    email: 'john.doe@example.com',
    emailVerified: true,
    username: 'johndoe123',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    address: '123 Main St, New York, NY 10001',
    latitude: 40.7128,
    longitude: -74.0060,
    preferencePetType: 'Dogs',
    preferenceCategories: 'Large Dogs,Family Dogs'
  },
  {
    name: 'Jane Smith',
    countryCode: '+1',
    phone: '9876543210',
    email: 'jane.smith@example.com',
    emailVerified: true,
    username: 'janesmith456',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&q=80',
    address: '456 Oak Ave, Los Angeles, CA 90001',
    latitude: 34.0522,
    longitude: -118.2437,
    preferencePetType: 'Cats',
    preferenceCategories: 'Indoor Cats,Low Maintenance'
  },
  {
    name: 'Mike Johnson',
    countryCode: '+1',
    phone: '5555555555',
    email: 'mike.johnson@example.com',
    emailVerified: false,
    username: 'mikejohnson789',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    address: '789 Pine St, Chicago, IL 60601',
    latitude: 41.8781,
    longitude: -87.6298,
    preferencePetType: 'Birds',
    preferenceCategories: 'Talking Birds,Colorful Birds'
  },
  {
    name: 'Sarah Wilson',
    countryCode: '+44',
    phone: '7700900123',
    email: 'sarah.wilson@example.com',
    emailVerified: true,
    username: 'sarahwilson101',
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
    address: '10 Downing Street, London SW1A 2AA',
    latitude: 51.5074,
    longitude: -0.1278,
    preferencePetType: 'Fish',
    preferenceCategories: 'Aquarium Fish,Low Maintenance'
  },
  {
    name: 'Alex Brown',
    countryCode: '+1',
    phone: '3334445555',
    email: 'alex.brown@example.com',
    emailVerified: true,
    username: 'alexbrown202',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    address: '321 Elm St, Miami, FL 33101',
    latitude: 25.7617,
    longitude: -80.1918,
    preferencePetType: 'Rabbits',
    preferenceCategories: 'Small Pets,Indoor Pets'
  },
  {
    name: 'Emma Davis',
    countryCode: '+1',
    phone: '7778889999',
    email: 'emma.davis@example.com',
    emailVerified: true,
    username: 'emmadavis303',
    profileImage: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=400&q=80',
    address: '654 Maple Dr, Seattle, WA 98101',
    latitude: 47.6062,
    longitude: -122.3321,
    preferencePetType: 'Dogs',
    preferenceCategories: 'Medium Dogs,Active Dogs'
  },
  {
    name: 'Chris Lee',
    countryCode: '+1',
    phone: '1112223333',
    email: 'chris.lee@example.com',
    emailVerified: false,
    username: 'chrislee404',
    profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
    address: '987 Cedar Ln, Austin, TX 78701',
    latitude: 30.2672,
    longitude: -97.7431,
    preferencePetType: 'Reptiles',
    preferenceCategories: 'Exotic Pets,Advanced Care'
  },
  {
    name: 'Lisa Garcia',
    countryCode: '+1',
    phone: '6667778888',
    email: 'lisa.garcia@example.com',
    emailVerified: true,
    username: 'lisagarcia505',
    profileImage: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&q=80',
    address: '111 Birch St, Phoenix, AZ 85001',
    latitude: 33.4484,
    longitude: -112.0740,
    preferencePetType: 'Hamsters',
    preferenceCategories: 'Small Pets,Beginner Friendly'
  },
  {
    name: 'Ryan Taylor',
    countryCode: '+1',
    phone: '2223334444',
    email: 'ryan.taylor@example.com',
    emailVerified: true,
    username: 'ryantaylor606',
    profileImage: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=400&q=80',
    address: '222 Spruce Ave, Denver, CO 80201',
    latitude: 39.7392,
    longitude: -104.9903,
    preferencePetType: 'Guinea Pigs',
    preferenceCategories: 'Social Pets,Vocal Pets'
  },
  {
    name: 'Amy Anderson',
    countryCode: '+1',
    phone: '8889990000',
    email: 'amy.anderson@example.com',
    emailVerified: false,
    username: 'amyanderson707',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    address: '444 Willow Rd, Portland, OR 97201',
    latitude: 45.5152,
    longitude: -122.6784,
    preferencePetType: 'Cats',
    preferenceCategories: 'Hypoallergenic,Indoor Cats'
  }
];

// Seed function
const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('Existing users cleared');

    // Insert new user data
    const users = await User.insertMany(userData);
    console.log(`${users.length} users seeded successfully`);

    return users;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

module.exports = { seedUsers, userData };
