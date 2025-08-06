const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  
  // Relations
  petCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PetCategory',
    required: true
  },
  breed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Breed',
    default: null
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Basic Details
  price: {
    type: Number,
    required: true,
    min: 0
  },
  age: {
    value: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      enum: ['days', 'weeks', 'months', 'years'],
      default: 'months'
    }
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'unknown'],
    default: 'unknown'
  },
  color: {
    type: String,
    default: null,
    trim: true
  },
  
  // Physical Characteristics
  weight: {
    value: {
      type: Number,
      min: 0
    },
    unit: {
      type: String,
      enum: ['grams', 'kg', 'pounds'],
      default: 'kg'
    }
  },
  height: {
    value: {
      type: Number,
      min: 0
    },
    unit: {
      type: String,
      enum: ['cm', 'inches', 'feet'],
      default: 'cm'
    }
  },
  
  // Health & Vaccination
  isVaccinated: {
    type: Boolean,
    default: false
  },
  vaccinationDetails: {
    type: String,
    default: null
  },
  healthStatus: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'needs_attention'],
    default: 'good'
  },
  medicalHistory: {
    type: String,
    default: null
  },
  
  // Dairy-specific fields (for cows, buffalo, goats)
  dairyDetails: {
    milkProduction: {
      value: {
        type: Number,
        min: 0
      },
      unit: {
        type: String,
        enum: ['liters/day', 'liters/week', 'gallons/day'],
        default: 'liters/day'
      }
    },
    lactationPeriod: {
      type: String,
      default: null
    },
    feedingRequirements: {
      type: String,
      default: null
    }
  },
  
  // Companion Pet specific fields
  companionDetails: {
    isTrained: {
      type: Boolean,
      default: false
    },
    trainingDetails: {
      type: String,
      default: null
    },
    temperament: {
      type: String,
      enum: ['friendly', 'aggressive', 'calm', 'playful', 'shy'],
      default: 'friendly'
    },
    goodWithKids: {
      type: Boolean,
      default: true
    },
    goodWithPets: {
      type: Boolean,
      default: true
    }
  },
  
  // Media
  images: [{
    url: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    size: {
      type: Number // in bytes
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    isMain: {
      type: Boolean,
      default: false // one image should be marked as main
    }
  }],
  audio: {
    url: {
      type: String,
      default: null
    },
    filename: {
      type: String
    },
    size: {
      type: Number // in bytes
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  
  // Location
  address: {
    type: String,
    required: true,
    trim: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  
  // Status & Availability
  isAvailable: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false // Admin approval required
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  
  // SEO
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  // Statistics
  viewCount: {
    type: Number,
    default: 0
  },
  contactCount: {
    type: Number,
    default: 0
  },
  
  // GeoJSON location for geospatial queries
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  
  // Virtual field for distance (calculated at runtime)
  distance: {
    type: Number // This will be calculated and not stored
  }
}, {
  timestamps: true // adds createdAt and updatedAt
});

// Generate slug before saving
petSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isNew) {
    const timestamp = Date.now();
    this.slug = `${this.title.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')}-${timestamp}`;
  }
  next();
});

// Update location GeoJSON when latitude/longitude changes
petSchema.pre('save', function(next) {
  if (this.isModified('latitude') || this.isModified('longitude') || this.isNew) {
    this.location = {
      type: 'Point',
      coordinates: [this.longitude, this.latitude] // [longitude, latitude] format for GeoJSON
    };
  }
  next();
});

// Ensure only one main image
petSchema.pre('save', function(next) {
  if (this.images && this.images.length > 0) {
    let hasMain = false;
    this.images.forEach((image, index) => {
      if (image.isMain && !hasMain) {
        hasMain = true;
      } else if (image.isMain && hasMain) {
        this.images[index].isMain = false;
      }
    });
    
    // If no main image is set, make the first one main
    if (!hasMain && this.images.length > 0) {
      this.images[0].isMain = true;
    }
  }
  next();
});

// Add indexes for better query performance
petSchema.index({ petCategory: 1, isAvailable: 1, isApproved: 1 });
petSchema.index({ owner: 1 });
petSchema.index({ latitude: 1, longitude: 1 });
// Add 2dsphere index for geospatial queries
petSchema.index({ 
  location: '2dsphere' 
});
petSchema.index({ price: 1 });
petSchema.index({ createdAt: -1 });
petSchema.index({ slug: 1 });
petSchema.index({ title: 'text', description: 'text' }); // Text search

module.exports = mongoose.model('Pet', petSchema);
