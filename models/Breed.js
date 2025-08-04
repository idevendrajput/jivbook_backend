const mongoose = require('mongoose');

const breedSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: null
  },
  image: {
    type: String,
    required: true // Image URL for the breed
  },
  icon: {
    type: String,
    default: null // Icon URL for the breed (optional)
  },
  // Reference to pet category
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PetCategory',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0 // For sorting breeds within a category
  },
  // Breed characteristics
  size: {
    type: String,
    enum: ['Small', 'Medium', 'Large', 'Extra Large'],
    default: null
  },
  lifeSpan: {
    type: String,
    default: null // e.g., "10-12 years"
  },
  temperament: {
    type: [String],
    default: [] // Array of temperament traits
  },
  // SEO and metadata
  slug: {
    type: String,
    lowercase: true,
    trim: true
  },
  metaTitle: {
    type: String,
    default: null
  },
  metaDescription: {
    type: String,
    default: null
  },
  // Additional breed information
  origin: {
    type: String,
    default: null
  },
  weight: {
    min: { type: Number, default: null },
    max: { type: Number, default: null },
    unit: { type: String, default: 'kg' }
  },
  height: {
    min: { type: Number, default: null },
    max: { type: Number, default: null },
    unit: { type: String, default: 'cm' }
  },
  // Care requirements
  exerciseNeeds: {
    type: String,
    enum: ['Low', 'Moderate', 'High'],
    default: null
  },
  groomingNeeds: {
    type: String,
    enum: ['Low', 'Moderate', 'High'],
    default: null
  },
  // Popularity and statistics
  popularityRank: {
    type: Number,
    default: null
  },
  // Additional traits for filtering
  goodWithKids: {
    type: Boolean,
    default: null
  },
  goodWithPets: {
    type: Boolean,
    default: null
  },
  hypoallergenic: {
    type: Boolean,
    default: null
  }
}, {
  timestamps: true // This will add createdAt and updatedAt fields
});

// Generate slug before saving
breedSchema.pre('save', function(next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Add compound index for category + name uniqueness
breedSchema.index({ category: 1, name: 1 }, { unique: true });
breedSchema.index({ category: 1, isActive: 1, order: 1 });
breedSchema.index({ slug: 1 });
breedSchema.index({ size: 1 });
breedSchema.index({ exerciseNeeds: 1 });
breedSchema.index({ goodWithKids: 1 });

module.exports = mongoose.model('Breed', breedSchema);
