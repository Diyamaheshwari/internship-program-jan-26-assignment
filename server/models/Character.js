const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  series: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Series',
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Visual characteristics
  appearance: {
    age: {
      type: Number,
      min: 0,
      max: 200
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'non-binary', 'other']
    },
    height: String,
    build: String,
    hairColor: String,
    eyeColor: String,
    skinTone: String,
    distinctiveFeatures: [String],
    clothingStyle: String,
    colorPalette: [String]
  },
  // Reference images
  referenceImages: [{
    url: String,
    description: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  // Personality and behavior
  personality: {
    traits: [{
      type: String,
      enum: [
        'brave', 'cowardly', 'intelligent', 'naive', 'funny', 'serious',
        'kind', 'cruel', 'ambitious', 'lazy', 'loyal', 'deceptive',
        'optimistic', 'pessimistic', 'patient', 'impatient', 'curious',
        'cautious', 'adventurous', 'traditional', 'rebellious'
      ]
    }],
    speakingStyle: {
      vocabulary: {
        type: String,
        enum: ['simple', 'average', 'complex', 'technical', 'casual', 'formal']
      },
      speed: {
        type: String,
        enum: ['slow', 'normal', 'fast', 'variable']
      },
      tone: {
        type: String,
        enum: ['calm', 'energetic', 'monotone', 'emotional', 'sarcastic', 'cheerful']
      },
      accent: String,
      catchphrases: [String]
    },
    mannerisms: [String],
    habits: [String],
    fears: [String],
    goals: [String],
    motivations: [String]
  },
  // Relationships with other characters
  relationships: [{
    character: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Character'
    },
    type: {
      type: String,
      enum: [
        'friend', 'best-friend', 'rival', 'enemy', 'mentor', 'student',
        'parent', 'child', 'sibling', 'spouse', 'partner', 'colleague',
        'boss', 'employee', 'neighbor', 'acquaintance', 'stranger'
      ]
    },
    description: String,
    strength: {
      type: Number,
      min: 1,
      max: 10
    }
  }],
  // Character background and notes
  background: String,
  notes: String,
  // Voice characteristics for audio generation
  voice: {
    pitch: {
      type: String,
      enum: ['very-low', 'low', 'medium', 'high', 'very-high']
    },
    age: {
      type: String,
      enum: ['child', 'teen', 'young-adult', 'adult', 'elderly']
    },
    accent: String,
    emotion: String
  },
  // Character consistency rules
  consistencyRules: [{
    rule: String,
    importance: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
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
characterSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
characterSchema.index({ series: 1, name: 1 });
characterSchema.index({ creator: 1, createdAt: -1 });

module.exports = mongoose.model('Character', characterSchema);
