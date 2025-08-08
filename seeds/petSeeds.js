const Pet = require('../models/Pet');
const PetCategory = require('../models/PetCategory');
const Breed = require('../models/Breed');
const User = require('../models/User');

// Pet seed data with varied locations for testing
const petSeedData = [
  {
    title: "Buddy",
    description: "Friendly golden retriever puppy, very playful and good with kids",
    gender: "male",
    age: { value: 6, unit: "months" },
    address: "Delhi, India",
    latitude: 28.7041,
    longitude: 77.1025,
    price: 25000,
    images: [
      {
        url: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&q=80",
        filename: "dog1.jpg",
        size: 125000,
        isMain: true
      }
    ],
    companionDetails: {
      isTrained: true,
      goodWithKids: true,
      goodWithPets: true,
      temperament: "friendly"
    },
    isVaccinated: true,
    vaccinationDetails: "All basic vaccinations completed",
    healthStatus: "excellent",
    medicalHistory: "No major health issues"
  },
  {
    name: "Whiskers",
    description: "Beautiful persian cat, very calm and loving",
    gender: "female",
    ageCategory: "adult",
    location: "Mumbai, Maharashtra",
    latitude: 19.0760,
    longitude: 72.8777,
    price: 18000,
    contactNumber: "+919876543211",
    isAvailable: true,
    isApproved: true,
    isDairyPet: false,
    isPremium: false,
    images: [
      {
        url: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&q=80",
        filename: "cat1.jpg",
        size: 110000,
        isMain: true
      }
    ],
    companionDetails: {
      goodWithKids: true,
      goodWithPets: false,
      temperament: "calm",
      energyLevel: "low",
      trainability: "medium"
    },
    healthDetails: {
      vaccinationStatus: "fully_vaccinated",
      healthCertificate: true,
      lastCheckupDate: new Date('2024-02-10'),
      medicalHistory: "Regular health checkups"
    },
    viewCount: 15,
    contactCount: 3
  },
  {
    name: "Moti",
    description: "High milk producing buffalo cow, excellent for dairy farming",
    gender: "female",
    ageCategory: "adult",
    location: "Gurgaon, Haryana",
    latitude: 28.4595,
    longitude: 77.0266,
    price: 45000,
    contactNumber: "+919876543212",
    isAvailable: true,
    isApproved: true,
    isDairyPet: true,
    isPremium: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=500&q=80",
        filename: "cow1.jpg",
        size: 180000,
        isMain: true
      }
    ],
    dairyDetails: {
      milkProduction: {
        value: 15,
        unit: "liters/day"
      },
      breedingHistory: "2 successful pregnancies",
      lactationPeriod: "Currently lactating",
      feedRequirements: "30kg fodder + 2kg concentrate daily"
    },
    healthDetails: {
      vaccinationStatus: "fully_vaccinated",
      healthCertificate: true,
      lastCheckupDate: new Date('2024-01-20'),
      medicalHistory: "Excellent health, regular vet checkups"
    },
    viewCount: 40,
    contactCount: 12
  },
  {
    name: "Charlie",
    description: "Energetic labrador, loves to play fetch and swim",
    gender: "male",
    ageCategory: "young",
    location: "Noida, Uttar Pradesh",
    latitude: 28.5355,
    longitude: 77.3910,
    price: 22000,
    contactNumber: "+919876543213",
    isAvailable: true,
    isApproved: true,
    isDairyPet: false,
    isPremium: false,
    images: [
      {
        url: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=500&q=80",
        filename: "dog2.jpg",
        size: 135000,
        isMain: true
      }
    ],
    companionDetails: {
      goodWithKids: true,
      goodWithPets: true,
      temperament: "playful",
      energyLevel: "very_high",
      trainability: "high"
    },
    healthDetails: {
      vaccinationStatus: "fully_vaccinated",
      healthCertificate: true,
      lastCheckupDate: new Date('2024-02-01'),
      medicalHistory: "Healthy and active"
    },
    viewCount: 18,
    contactCount: 5
  },
  {
    name: "Bella",
    description: "Sweet and gentle German Shepherd, great guard dog",
    gender: "female",
    ageCategory: "adult",
    location: "Faridabad, Haryana",
    latitude: 28.4089,
    longitude: 77.3178,
    price: 35000,
    contactNumber: "+919876543214",
    isAvailable: true,
    isApproved: true,
    isDairyPet: false,
    isPremium: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=500&q=80",
        filename: "dog3.jpg",
        size: 145000,
        isMain: true
      }
    ],
    companionDetails: {
      goodWithKids: true,
      goodWithPets: false,
      temperament: "protective",
      energyLevel: "high",
      trainability: "very_high"
    },
    healthDetails: {
      vaccinationStatus: "fully_vaccinated",
      healthCertificate: true,
      lastCheckupDate: new Date('2024-01-25'),
      medicalHistory: "Excellent health record"
    },
    viewCount: 32,
    contactCount: 9
  },
  {
    name: "Ganga",
    description: "Pure breed Jersey cow, excellent milk quality",
    gender: "female",
    ageCategory: "adult",
    location: "Mathura, Uttar Pradesh",
    latitude: 27.4924,
    longitude: 77.6737,
    price: 55000,
    contactNumber: "+919876543215",
    isAvailable: true,
    isApproved: true,
    isDairyPet: true,
    isPremium: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1560114928-40f1f1eb26a0?w=500&q=80",
        filename: "cow2.jpg",
        size: 175000,
        isMain: true
      }
    ],
    dairyDetails: {
      milkProduction: {
        value: 20,
        unit: "liters/day"
      },
      breedingHistory: "3 successful pregnancies",
      lactationPeriod: "Peak lactation",
      feedRequirements: "35kg fodder + 3kg concentrate daily"
    },
    healthDetails: {
      vaccinationStatus: "fully_vaccinated",
      healthCertificate: true,
      lastCheckupDate: new Date('2024-02-05'),
      medicalHistory: "Premium breed with excellent genetics"
    },
    viewCount: 55,
    contactCount: 15
  },
  {
    name: "Simba",
    description: "Playful orange tabby cat, loves attention and treats",
    gender: "male",
    ageCategory: "young",
    location: "Pune, Maharashtra",
    latitude: 18.5204,
    longitude: 73.8567,
    price: 8000,
    contactNumber: "+919876543216",
    isAvailable: true,
    isApproved: true,
    isDairyPet: false,
    isPremium: false,
    images: [
      {
        url: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=500&q=80",
        filename: "cat2.jpg",
        size: 120000,
        isMain: true
      }
    ],
    companionDetails: {
      goodWithKids: true,
      goodWithPets: true,
      temperament: "playful",
      energyLevel: "medium",
      trainability: "low"
    },
    healthDetails: {
      vaccinationStatus: "partially_vaccinated",
      healthCertificate: true,
      lastCheckupDate: new Date('2024-01-30'),
      medicalHistory: "Young and healthy"
    },
    viewCount: 12,
    contactCount: 2
  },
  {
    name: "Max",
    description: "Strong and loyal Rottweiler, excellent security dog",
    gender: "male",
    ageCategory: "adult",
    location: "Ghaziabad, Uttar Pradesh",
    latitude: 28.6692,
    longitude: 77.4538,
    price: 40000,
    contactNumber: "+919876543217",
    isAvailable: true,
    isApproved: true,
    isDairyPet: false,
    isPremium: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=500&q=80",
        filename: "dog4.jpg",
        size: 155000,
        isMain: true
      }
    ],
    companionDetails: {
      goodWithKids: false,
      goodWithPets: false,
      temperament: "protective",
      energyLevel: "high",
      trainability: "high"
    },
    healthDetails: {
      vaccinationStatus: "fully_vaccinated",
      healthCertificate: true,
      lastCheckupDate: new Date('2024-02-12'),
      medicalHistory: "Strong build, regular exercise needed"
    },
    viewCount: 28,
    contactCount: 6
  }
];

// Function to seed pets with proper category and owner references
const seedPets = async () => {
  try {
    // Get pet categories and users
    const dogCategory = await PetCategory.findOne({ name: 'Dogs' });
    const catCategory = await PetCategory.findOne({ name: 'Cats' });
    const cowCategory = await PetCategory.findOne({ name: 'Cows' });
    
    const users = await User.find({ isAdmin: false });
    
    if (!dogCategory || !catCategory || !cowCategory || users.length === 0) {
      throw new Error('Required categories or users not found. Please seed categories and users first.');
    }
    
    // Assign categories and owners to pets
    const petsWithReferences = petSeedData.map((pet, index) => {
      let category;
      if (pet.name === 'Buddy' || pet.name === 'Charlie' || pet.name === 'Bella' || pet.name === 'Max') {
        category = dogCategory._id;
      } else if (pet.name === 'Whiskers' || pet.name === 'Simba') {
        category = catCategory._id;
      } else {
        category = cowCategory._id;
      }
      
      return {
        ...pet,
        petCategory: category,
        owner: users[index % users.length]._id,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
      };
    });
    
    // Clear existing pets
    await Pet.deleteMany({});
    console.log('Existing pets cleared');
    
    // Insert new pets
    const result = await Pet.insertMany(petsWithReferences);
    console.log(`${result.length} pets seeded successfully`);
    
    return result;
  } catch (error) {
    console.error('Error seeding pets:', error.message);
    throw error;
  }
};

module.exports = { seedPets, petSeedData };
