const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
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
  episodeNumber: {
    type: Number,
    required: true
  },
  // Story setup
  storyPrompt: {
    situation: {
      type: String,
      required: true,
      maxlength: 500
    },
    conflict: {
      type: String,
      maxlength: 500
    },
    resolution: {
      type: String,
      maxlength: 500
    },
    goal: {
      type: String,
      maxlength: 300
    }
  },
  // Episode configuration
  characters: [{
    character: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Character',
      required: true
    },
    role: {
      type: String,
      enum: ['protagonist', 'antagonist', 'supporting', 'narrator', 'extra'],
      default: 'supporting'
    },
    importance: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    }
  }],
  style: {
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
    pacing: {
      type: String,
      enum: ['slow', 'normal', 'fast', 'variable'],
      default: 'normal'
    }
  },
  // Technical specifications
  duration: {
    target: {
      type: Number,
      default: 300, // 5 minutes in seconds
      min: 60,
      max: 600
    },
    actual: Number
  },
  format: {
    aspectRatio: {
      type: String,
      enum: ['16:9', '9:16', '1:1'],
      default: '16:9'
    },
    resolution: {
      type: String,
      enum: ['720p', '1080p', '4K'],
      default: '1080p'
    }
  },
  language: {
    type: String,
    default: 'English'
  },
  narrationRatio: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.3 // 30% narration, 70% dialogue
  },
  // Enhanced episode configuration for AI generation
  aiConfig: {
    situation: {
      type: String,
      required: true,
      maxlength: 1000
    },
    desiredTone: {
      type: String,
      required: true,
      maxlength: 200
    },
    endingGoal: {
      type: String,
      required: true,
      maxlength: 500
    },
    language: {
      type: String,
      default: 'English',
      maxlength: 50
    },
    narrationDialogueRatio: {
      type: String,
      default: '20/80',
      maxlength: 10
    },
    platformFormat: {
      type: String,
      enum: ['16:9', '9:16', '1:1'],
      default: '16:9'
    },
    targetDuration: {
      type: Number,
      default: 300, // 5 minutes in seconds
      min: 60,
      max: 600
    }
  },
  // Generated content from AI
  script: String, // Raw script text
  scenes: [{
    number: Number,
    heading: String,
    description: String,
    dialogue: [{
      character: String,
      text: String
    }]
  }],
  images: [String], // URLs to generated images
  voices: [String], // URLs to generated voice files
  metadata: {
    episodeNumber: Number,
    duration: Number,
    language: String,
    platformFormat: String
  },
  // Storyboard/Shot list
  storyboard: [{
    sceneNumber: Number,
    shotNumber: Number,
    shotType: {
      type: String,
      enum: ['wide', 'medium', 'close-up', 'extreme-close-up', 'overhead', 'low-angle', 'high-angle']
    },
    cameraMovement: {
      type: String,
      enum: ['static', 'pan', 'tilt', 'dolly', 'zoom', 'handheld']
    },
    description: String,
    duration: Number,
    characters: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Character'
    }],
    background: String,
    visualEffects: [String]
  }],
  // Visual assets
  visualAssets: [{
    sceneNumber: Number,
    shotNumber: Number,
    type: {
      type: String,
      enum: ['background', 'character', 'prop', 'effect', 'overlay']
    },
    description: String,
    prompt: String, // For AI generation
    url: String,
    generated: {
      type: Boolean,
      default: false
    }
  }],
  // Audio plan
  audioPlan: {
    voiceLines: [{
      character: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Character'
      },
      sceneNumber: Number,
      line: String,
      emotion: String,
      duration: Number,
      generated: {
        type: Boolean,
        default: false
      }
    }],
    narration: [{
      sceneNumber: Number,
      text: String,
      voiceStyle: String,
      duration: Number,
      generated: {
        type: Boolean,
        default: false
      }
    }],
    backgroundMusic: [{
      sceneNumber: Number,
      mood: String,
      style: String,
      volume: Number,
      url: String
    }],
    soundEffects: [{
      sceneNumber: Number,
      effect: String,
      timing: Number,
      url: String
    }]
  },
  // Generated video
  finalVideo: {
    url: String,
    format: String,
    size: Number,
    duration: Number,
    generatedAt: Date
  },
  // Status tracking
  status: {
    type: String,
    enum: ['draft', 'script-generated', 'ai-generated', 'storyboard-complete', 'assets-ready', 'audio-ready', 'rendering', 'completed', 'failed'],
    default: 'draft'
  },
  progress: {
    script: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    images: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    voices: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    storyboard: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    assets: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    audio: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    video: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  // Error handling
  errors: [{
    stage: String,
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
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
episodeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
episodeSchema.index({ series: 1, episodeNumber: 1 });
episodeSchema.index({ creator: 1, createdAt: -1 });
episodeSchema.index({ status: 1 });

module.exports = mongoose.model('Episode', episodeSchema);
