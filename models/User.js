const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  countryCode: {
    type: String,
    sparse: true
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  username: {
    type: String,
    unique: true,
    required: true
  },
  profileImage: {
    type: String,
    default: null
  },
  address: {
    type: String,
    default: null
  },
  latitude: {
    type: Number,
    default: 28.7041 // New Delhi latitude
  },
  longitude: {
    type: Number,
    default: 77.1025 // New Delhi longitude
  },
  rememberMe: {
    type: Boolean,
    default: true
  },
  fcm: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 150,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  // Social media counts
  postsCount: {
    type: Number,
    default: 0
  },
  followersCount: {
    type: Number,
    default: 0
  },
  followingCount: {
    type: Number,
    default: 0
  },
  // Pet preferences based on type
  petTypePreferences: {
    dairyPets: {
      type: Boolean,
      default: false // User interested in dairy pets (cow, buffalo, goat etc.)
    },
    companionPets: {
      type: Boolean,
      default: false // User interested in companion pets (dog, cat, rabbit etc.)
    }
  },
  
  // Specific pet category preferences (ObjectIds of PetCategory)
  preferredPetCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PetCategory'
  }],
  createdOn: {
    type: Date,
    default: Date.now
  },
  lastUpdate: {
    type: Date,
    default: Date.now
  }
});

// Update lastUpdate field on save
userSchema.pre('save', function(next) {
  this.lastUpdate = new Date();
  next();
});

module.exports = mongoose.model('User', userSchema);
