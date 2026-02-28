const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const Episode = require('../models/Episode');
const Character = require('../models/Character');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'assets');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Upload character reference image
router.post('/characters/:characterId/reference', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const character = await Character.findById(req.params.characterId);

    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    // Check if user owns the character
    if (character.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Process image with sharp
    const processedImagePath = req.file.path.replace(path.extname(req.file.path), '_processed.jpg');
    await sharp(req.file.path)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(processedImagePath);

    // Create reference image object
    const referenceImage = {
      url: `/uploads/assets/${path.basename(processedImagePath)}`,
      description: req.body.description || 'Character reference image',
      isPrimary: character.referenceImages.length === 0 // First image is primary
    };

    character.referenceImages.push(referenceImage);
    await character.save();

    // Clean up original file
    await fs.unlink(req.file.path);

    res.status(201).json({
      message: 'Reference image uploaded successfully',
      referenceImage
    });
  } catch (error) {
    console.error('Error uploading reference image:', error);
    res.status(500).json({ message: 'Error uploading reference image' });
  }
});

// Generate visual assets for episode
router.post('/episodes/:episodeId/generate', auth, async (req, res) => {
  try {
    const episode = await Episode.findById(req.params.episodeId)
      .populate('characters.character');

    if (!episode) {
      return res.status(404).json({ message: 'Episode not found' });
    }

    // Check if user owns the episode
    if (episode.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!episode.script || !episode.script.scenes) {
      return res.status(400).json({ message: 'Episode script must be generated first' });
    }

    const visualAssets = [];

    // Generate assets for each scene
    for (const scene of episode.script.scenes) {
      // Background asset
      const backgroundAsset = {
        sceneNumber: scene.sceneNumber,
        shotNumber: 0,
        type: 'background',
        description: `Background for scene ${scene.sceneNumber}: ${scene.setting}`,
        prompt: generateBackgroundPrompt(scene, episode.series),
        generated: false
      };
      visualAssets.push(backgroundAsset);

      // Character assets for each character in the scene
      for (const charData of episode.characters) {
        const character = charData.character;
        
        // Check if character appears in this scene's dialogue
        const appearsInScene = scene.dialogue && 
          scene.dialogue.some(dialogue => 
            dialogue.character.toString() === character._id.toString()
          );

        if (appearsInScene) {
          const characterAsset = {
            sceneNumber: scene.sceneNumber,
            shotNumber: 0,
            type: 'character',
            description: `${character.name} in scene ${scene.sceneNumber}`,
            prompt: generateCharacterPrompt(character, scene),
            generated: false
          };
          visualAssets.push(characterAsset);
        }
      }
    }

    episode.visualAssets = visualAssets;
    episode.progress.assets = 50; // Mark as 50% complete (prompts generated)
    await episode.save();

    res.json({
      message: 'Visual asset prompts generated successfully',
      assets: visualAssets
    });
  } catch (error) {
    console.error('Error generating visual assets:', error);
    res.status(500).json({ message: 'Error generating visual assets' });
  }
});

// Generate storyboard for episode
router.post('/episodes/:episodeId/storyboard', auth, async (req, res) => {
  try {
    const episode = await Episode.findById(req.params.episodeId)
      .populate('characters.character');

    if (!episode) {
      return res.status(404).json({ message: 'Episode not found' });
    }

    // Check if user owns the episode
    if (episode.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!episode.script || !episode.script.scenes) {
      return res.status(400).json({ message: 'Episode script must be generated first' });
    }

    const storyboard = [];

    // Generate shots for each scene
    for (const scene of episode.script.scenes) {
      const shotsPerScene = Math.max(2, Math.floor(scene.duration / 30)); // 1 shot per 30 seconds minimum
      
      for (let i = 1; i <= shotsPerScene; i++) {
        const shot = {
          sceneNumber: scene.sceneNumber,
          shotNumber: i,
          shotType: determineShotType(i, shotsPerScene, scene),
          cameraMovement: determineCameraMovement(i, scene),
          description: generateShotDescription(scene, i, shotsPerScene),
          duration: Math.floor(scene.duration / shotsPerScene),
          characters: getCharactersInScene(scene, episode.characters),
          background: scene.setting,
          visualEffects: []
        };
        storyboard.push(shot);
      }
    }

    episode.storyboard = storyboard;
    episode.progress.storyboard = 100;
    await episode.save();

    res.json({
      message: 'Storyboard generated successfully',
      storyboard
    });
  } catch (error) {
    console.error('Error generating storyboard:', error);
    res.status(500).json({ message: 'Error generating storyboard' });
  }
});

// Get visual assets for episode
router.get('/episodes/:episodeId', auth, async (req, res) => {
  try {
    const episode = await Episode.findById(req.params.episodeId, 'visualAssets storyboard');

    if (!episode) {
      return res.status(404).json({ message: 'Episode not found' });
    }

    // Check if user owns the episode
    if (episode.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      visualAssets: episode.visualAssets || [],
      storyboard: episode.storyboard || []
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ message: 'Error fetching assets' });
  }
});

// Helper functions

function generateBackgroundPrompt(scene, series) {
  const style = series.setting?.visualStyle || 'realistic';
  const timeOfDay = scene.time || 'day';
  
  return `${style} ${scene.setting}, ${timeOfDay}, detailed environment, cinematic lighting, high quality, 8k`;
}

function generateCharacterPrompt(character, scene) {
  const appearance = character.appearance || {};
  const personality = character.personality || {};
  
  let prompt = `Character: ${character.name}`;
  
  if (appearance.age) prompt += `, ${appearance.age} years old`;
  if (appearance.gender) prompt += `, ${appearance.gender}`;
  if (appearance.hairColor) prompt += `, ${appearance.hairColor} hair`;
  if (appearance.eyeColor) prompt += `, ${appearance.eyeColor} eyes`;
  if (appearance.clothingStyle) prompt += `, wearing ${appearance.clothingStyle}`;
  
  // Add emotion based on scene
  const emotions = ['happy', 'serious', 'thoughtful', 'concerned', 'excited'];
  const emotion = emotions[Math.floor(Math.random() * emotions.length)];
  prompt += `, ${emotion} expression`;
  
  prompt += `, in ${scene.setting}, realistic style, detailed character design, high quality`;
  
  return prompt;
}

function determineShotType(shotNumber, totalShots, scene) {
  if (shotNumber === 1) return 'wide'; // Establishing shot
  if (shotNumber === totalShots) return 'medium'; // Closing shot
  
  const shotTypes = ['medium', 'close-up', 'medium', 'close-up'];
  return shotTypes[Math.floor(Math.random() * shotTypes.length)];
}

function determineCameraMovement(shotNumber, scene) {
  if (scene.dialogue && scene.dialogue.length > 0) {
    return 'static'; // Static for dialogue scenes
  }
  
  const movements = ['static', 'pan', 'tilt', 'slow zoom'];
  return movements[Math.floor(Math.random() * movements.length)];
}

function generateShotDescription(scene, shotNumber, totalShots) {
  if (shotNumber === 1) {
    return `Establishing shot of ${scene.setting}`;
  }
  
  if (scene.dialogue && scene.dialogue.length > 0) {
    const dialogue = scene.dialogue[(shotNumber - 1) % scene.dialogue.length];
    return `Focus on character during dialogue: "${dialogue.line.substring(0, 50)}..."`;
  }
  
  return `Detail shot showing ${scene.action}`;
}

function getCharactersInScene(scene, episodeCharacters) {
  if (!scene.dialogue) return [];
  
  const characterIds = scene.dialogue.map(d => d.character.toString());
  return episodeCharacters
    .filter(c => characterIds.includes(c.character._id.toString()))
    .map(c => c.character._id);
}

module.exports = router;
