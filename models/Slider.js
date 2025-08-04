const mongoose = require('mongoose');

const sliderSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },
  redirectionUrl: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // This will add createdAt and updatedAt fields
});

module.exports = mongoose.model('Slider', sliderSchema);
