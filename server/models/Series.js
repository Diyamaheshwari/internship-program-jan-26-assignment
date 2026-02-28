const mongoose = require('mongoose');

const seriesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  genre: {
    type: String,
    enum: ['comedy', 'drama', 'motivational', 'slice-of-life', 'educational', 'thriller'],
    required: true
  },
  tone: {
    type: String,
    enum: ['light-hearted', 'serious', 'dark', 'whimsical', 'inspirational'],
    required: true
  },
  targetDuration: {
    type: Number,
    default: 300, // 5 minutes in seconds
    min: 60,
    max: 600
  },
  language: {
    type: String,
    default: 'English',
    required: true
  },
  aspectRatio: {
    type: String,
    enum: ['16:9', '9:16', '1:1'],
    default: '16:9'
  },
  setting: {
    location: String,
    timePeriod: String,
    recurringThemes: [String],
    visualStyle: String
  },
  // World rules for AI generation
  worldRules: {
    type: String,
    maxlength: 2000
  },
  characters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character'
  }],
  episodes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Episode'
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
seriesSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
seriesSchema.index({ creator: 1, createdAt: -1 });
seriesSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Series', seriesSchema);
