const express = require('express');
const router = express.Router();
const Character = require('../models/Character');
const Series = require('../models/Series');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Store used image seeds to prevent duplicates
const usedImageSeeds = new Set();

// Get unique character image seeds
router.get('/images/seeds', auth, async (req, res) => {
  try {
    const { count = 6, preferences = {} } = req.query;
    
    // Get existing character image seeds from database
    const existingCharacters = await Character.find({ creator: req.user.id })
      .select('referenceImages.url')
      .lean();
    
    const existingSeeds = new Set();
    existingCharacters.forEach(char => {
      char.referenceImages?.forEach(img => {
        // Extract seed from URL if it's a generated image
        const match = img.url.match(/seed=([^&]+)/);
        if (match) {
          existingSeeds.add(match[1]);
        }
      });
    });
    
    // Generate new unique seeds
    const newSeeds = [];
    const preferenceString = JSON.stringify(preferences);
    
    for (let i = 0; i < parseInt(count); i++) {
      let seed;
      let attempts = 0;
      
      do {
        seed = `${preferenceString}-${Date.now()}-${i}-${Math.random()}`;
        attempts++;
      } while ((existingSeeds.has(seed) || usedImageSeeds.has(seed)) && attempts < 100);
      
      if (attempts < 100) {
        usedImageSeeds.add(seed);
        newSeeds.push(seed);
      }
    }
    
    res.json({ seeds: newSeeds });
  } catch (error) {
    console.error('Error generating image seeds:', error);
    res.status(500).json({ message: 'Error generating image seeds' });
  }
});

// Get all characters for a series (optimized)
router.get('/series/:seriesId', auth, async (req, res) => {
  try {
    const series = await Series.findById(req.params.seriesId);
    
    if (!series) {
      return res.status(404).json({ message: 'Series not found' });
    }

    // Check if user owns the series
    if (series.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Use lean() for better performance and selective population
    const characters = await Character.find({ 
      series: req.params.seriesId,
      isActive: true 
    })
    .select('name appearance personality background referenceImages relationships createdAt updatedAt')
    .populate('relationships.character', 'name appearance.age')
    .sort({ createdAt: 1 })
    .lean(); // Use lean for better performance

    res.json(characters);
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ message: 'Error fetching characters' });
  }
});

// Get a single character by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const character = await Character.findById(req.params.id)
      .populate('series', 'title')
      .populate('relationships.character', 'name appearance personality');

    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    // Check if user owns the character
    if (character.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(character);
  } catch (error) {
    console.error('Error fetching character:', error);
    res.status(500).json({ message: 'Error fetching character' });
  }
});

// Create a new character
router.post('/', [
  auth,
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
  body('series').isMongoId().withMessage('Valid series ID is required'),
  body('appearance.age').optional().isInt({ min: 0, max: 200 }).withMessage('Age must be 0-200'),
  body('appearance.gender').optional().isIn(['male', 'female', 'non-binary', 'other']).withMessage('Invalid gender'),
  body('personality.traits').optional().isArray().withMessage('Traits must be an array'),
  body('personality.speakingStyle.vocabulary').optional().isIn(['simple', 'average', 'complex', 'technical', 'casual', 'formal']).withMessage('Invalid vocabulary level'),
  body('personality.speakingStyle.speed').optional().isIn(['slow', 'normal', 'fast', 'variable']).withMessage('Invalid speaking speed'),
  body('personality.speakingStyle.tone').optional().isIn(['calm', 'energetic', 'monotone', 'emotional', 'sarcastic', 'cheerful']).withMessage('Invalid speaking tone'),
  body('voice.pitch').optional().isIn(['very-low', 'low', 'medium', 'high', 'very-high']).withMessage('Invalid voice pitch'),
  body('voice.age').optional().isIn(['child', 'teen', 'young-adult', 'adult', 'elderly']).withMessage('Invalid voice age')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify user owns the series
    const series = await Series.findById(req.body.series);
    if (!series) {
      return res.status(404).json({ message: 'Series not found' });
    }

    if (series.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const characterData = {
      ...req.body,
      creator: req.user.id
    };

    const character = new Character(characterData);
    await character.save();

    // Add character to series
    series.characters.push(character._id);
    await series.save();

    const populatedCharacter = await Character.findById(character._id)
      .populate('relationships.character', 'name appearance');

    res.status(201).json(populatedCharacter);
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({ message: 'Error creating character' });
  }
});

// Update a character
router.put('/:id', [
  auth,
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
  body('appearance.age').optional().isInt({ min: 0, max: 200 }).withMessage('Age must be 0-200'),
  body('appearance.gender').optional().isIn(['male', 'female', 'non-binary', 'other']).withMessage('Invalid gender'),
  body('personality.traits').optional().isArray().withMessage('Traits must be an array'),
  body('personality.speakingStyle.vocabulary').optional().isIn(['simple', 'average', 'complex', 'technical', 'casual', 'formal']).withMessage('Invalid vocabulary level'),
  body('personality.speakingStyle.speed').optional().isIn(['slow', 'normal', 'fast', 'variable']).withMessage('Invalid speaking speed'),
  body('personality.speakingStyle.tone').optional().isIn(['calm', 'energetic', 'monotone', 'emotional', 'sarcastic', 'cheerful']).withMessage('Invalid speaking tone'),
  body('voice.pitch').optional().isIn(['very-low', 'low', 'medium', 'high', 'very-high']).withMessage('Invalid voice pitch'),
  body('voice.age').optional().isIn(['child', 'teen', 'young-adult', 'adult', 'elderly']).withMessage('Invalid voice age')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const character = await Character.findById(req.params.id);

    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    // Check if user owns the character
    if (character.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    Object.assign(character, req.body);
    await character.save();

    const updatedCharacter = await Character.findById(character._id)
      .populate('relationships.character', 'name appearance personality');

    res.json(updatedCharacter);
  } catch (error) {
    console.error('Error updating character:', error);
    res.status(500).json({ message: 'Error updating character' });
  }
});

// Add relationship between characters
router.post('/:id/relationships', [
  auth,
  body('character').isMongoId().withMessage('Valid character ID is required'),
  body('type').isIn([
    'friend', 'best-friend', 'rival', 'enemy', 'mentor', 'student',
    'parent', 'child', 'sibling', 'spouse', 'partner', 'colleague',
    'boss', 'employee', 'neighbor', 'acquaintance', 'stranger'
  ]).withMessage('Invalid relationship type'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('strength').optional().isInt({ min: 1, max: 10 }).withMessage('Strength must be 1-10')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const character = await Character.findById(req.params.id);
    const targetCharacter = await Character.findById(req.body.character);

    if (!character || !targetCharacter) {
      return res.status(404).json({ message: 'Character not found' });
    }

    // Check if user owns both characters
    if (character.creator.toString() !== req.user.id || 
        targetCharacter.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if relationship already exists
    const existingRelationship = character.relationships.find(
      rel => rel.character.toString() === req.body.character
    );

    if (existingRelationship) {
      // Update existing relationship
      Object.assign(existingRelationship, req.body);
    } else {
      // Add new relationship
      character.relationships.push(req.body);
    }

    await character.save();

    // Create reciprocal relationship
    const reciprocalType = getReciprocalRelationship(req.body.type);
    const existingReciprocal = targetCharacter.relationships.find(
      rel => rel.character.toString() === req.params.id
    );

    const reciprocalData = {
      character: req.params.id,
      type: reciprocalType,
      description: req.body.description,
      strength: req.body.strength
    };

    if (existingReciprocal) {
      Object.assign(existingReciprocal, reciprocalData);
    } else {
      targetCharacter.relationships.push(reciprocalData);
    }

    await targetCharacter.save();

    const updatedCharacter = await Character.findById(character._id)
      .populate('relationships.character', 'name appearance');

    res.json(updatedCharacter);
  } catch (error) {
    console.error('Error adding relationship:', error);
    res.status(500).json({ message: 'Error adding relationship' });
  }
});

// Helper function to get reciprocal relationship
function getReciprocalRelationship(type) {
  const reciprocalMap = {
    'parent': 'child',
    'child': 'parent',
    'mentor': 'student',
    'student': 'mentor',
    'boss': 'employee',
    'employee': 'boss',
    'spouse': 'spouse',
    'partner': 'partner',
    'sibling': 'sibling',
    'best-friend': 'best-friend',
    'rival': 'rival',
    'enemy': 'enemy'
  };
  
  return reciprocalMap[type] || 'acquaintance';
}

// Delete a character
router.delete('/:id', auth, async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);

    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    // Check if user owns the character
    if (character.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove character from series
    await Series.findByIdAndUpdate(
      character.series,
      { $pull: { characters: req.params.id } }
    );

    // Soft delete by setting isActive to false
    character.isActive = false;
    await character.save();

    res.json({ message: 'Character deleted successfully' });
  } catch (error) {
    console.error('Error deleting character:', error);
    res.status(500).json({ message: 'Error deleting character' });
  }
});

module.exports = router;
