const mongoose = require('mongoose');

const petCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true,
    default: null
  },
  image: {
    type: String,
    required: true // Image URL for the category
  },
  icon: {
    type: String,
    default: null // Icon URL for the category (optional)
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0 // For sorting categories
  },
  // Pet type classification
  isDairyPet: {
    type: Boolean,
    default: false, // true for dairy pets (cow, buffalo, goat etc.), false for companion pets (dog, cat, rabbit etc.)
    required: true
  },
  // SEO and metadata
  slug: {
    type: String,
    unique: true,
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
  // Statistics
  breedCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // This will add createdAt and updatedAt fields
});

// Generate slug before saving
petCategorySchema.pre('save', function(next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Add indexes for better query performance
petCategorySchema.index({ name: 1 });
petCategorySchema.index({ slug: 1 });
petCategorySchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('PetCategory', petCategorySchema);
