const express = require('express');
const router = express.Router();
const Episode = require('../models/Episode');
const Series = require('../models/Series');
const Character = require('../models/Character');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const videoService = require('../services/videoService');

// Get all episodes for a series
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const episodes = await Episode.find({ series: req.params.seriesId })
      .populate('characters.character', 'name appearance')
      .sort({ episodeNumber: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Episode.countDocuments({ series: req.params.seriesId });

    res.json({
      episodes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching episodes:', error);
    res.status(500).json({ message: 'Error fetching episodes' });
  }
});

// Get a single episode by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const episode = await Episode.findById(req.params.id)
      .populate('series', 'title')
      .populate('characters.character', 'name appearance personality voice')
      .populate('script.scenes.dialogue.character', 'name personality voice');

    if (!episode) {
      return res.status(404).json({ message: 'Episode not found' });
    }

    // Check if user owns the episode
    if (episode.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(episode);
  } catch (error) {
    console.error('Error fetching episode:', error);
    res.status(500).json({ message: 'Error fetching episode' });
  }
});

// Create a new episode
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('series').isMongoId().withMessage('Valid series ID is required'),
  body('storyPrompt.situation').trim().isLength({ min: 1, max: 500 }).withMessage('Situation must be 1-500 characters'),
  body('storyPrompt.conflict').optional().trim().isLength({ max: 500 }).withMessage('Conflict must be less than 500 characters'),
  body('storyPrompt.resolution').optional().trim().isLength({ max: 500 }).withMessage('Resolution must be less than 500 characters'),
  body('characters').isArray({ min: 1 }).withMessage('At least one character is required'),
  body('style.genre').isIn(['comedy', 'drama', 'motivational', 'slice-of-life', 'educational', 'thriller']).withMessage('Invalid genre'),
  body('style.tone').isIn(['light-hearted', 'serious', 'dark', 'whimsical', 'inspirational']).withMessage('Invalid tone'),
  body('duration.target').optional().isInt({ min: 60, max: 600 }).withMessage('Duration must be 60-600 seconds'),
  body('format.aspectRatio').optional().isIn(['16:9', '9:16', '1:1']).withMessage('Invalid aspect ratio'),
  body('narrationRatio').optional().isFloat({ min: 0, max: 1 }).withMessage('Narration ratio must be 0-1')
], async (req, res) => {
  try {
    console.log('🔍 Episode creation request received');
    console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
    console.log('👤 Authenticated user:', req.user.id);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify user owns the series
    console.log('🔍 Checking series ownership...');
    const series = await Series.findById(req.body.series);
    if (!series) {
      console.log('❌ Series not found:', req.body.series);
      return res.status(404).json({ message: 'Series not found' });
    }

    if (series.creator.toString() !== req.user.id) {
      console.log('❌ Access denied - user does not own series');
      return res.status(403).json({ message: 'Access denied' });
    }

    console.log('✅ Series ownership verified');

    // Get next episode number
    console.log('🔍 Calculating episode number...');
    const lastEpisode = await Episode.findOne({ series: req.body.series })
      .sort({ episodeNumber: -1 });
    
    const episodeNumber = lastEpisode ? lastEpisode.episodeNumber + 1 : 1;
    console.log('📊 Episode number:', episodeNumber);

    // Validate characters exist and belong to the series
    console.log('🔍 Validating characters...');
    const characterIds = req.body.characters.map(c => c.character);
    console.log('👥 Character IDs:', characterIds);
    
    const characters = await Character.find({
      _id: { $in: characterIds },
      series: req.body.series
    });

    console.log('👥 Found characters:', characters.length);

    if (characters.length !== characterIds.length) {
      console.log('❌ Some characters are invalid or do not belong to this series');
      return res.status(400).json({ message: 'Some characters are invalid or do not belong to this series' });
    }

    console.log('✅ Characters validated');

    // Create episode with creator from authenticated user
    console.log('🔍 Creating episode...');
    const episodeData = {
      ...req.body,
      creator: req.user.id, // Set creator from authenticated user
      episodeNumber
    };

    console.log('📝 Final episode data:', JSON.stringify(episodeData, null, 2));

    const episode = new Episode(episodeData);
    await episode.save();

    // Populate episode data for response
    const populatedEpisode = await Episode.findById(episode._id)
      .populate('characters.character', 'name appearance')
      .populate('creator', 'username email');

    console.log('Episode created successfully:', populatedEpisode._id);
    res.status(201).json(populatedEpisode);
  } catch (error) {
    console.error('Error creating episode:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check if it's a validation error
    if (error.name === 'ValidationError') {
      console.error('Mongoose validation errors:', error.errors);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }
    
    res.status(500).json({ message: 'Error creating episode', error: error.message });
  }
});

// Update an episode
router.put('/:id', [
  auth,
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('storyPrompt.situation').optional().trim().isLength({ min: 1, max: 500 }).withMessage('Situation must be 1-500 characters'),
  body('storyPrompt.conflict').optional().trim().isLength({ max: 500 }).withMessage('Conflict must be less than 500 characters'),
  body('storyPrompt.resolution').optional().trim().isLength({ max: 500 }).withMessage('Resolution must be less than 500 characters'),
  body('characters').optional().isArray({ min: 1 }).withMessage('At least one character is required'),
  body('style.genre').optional().isIn(['comedy', 'drama', 'motivational', 'slice-of-life', 'educational', 'thriller']).withMessage('Invalid genre'),
  body('style.tone').optional().isIn(['light-hearted', 'serious', 'dark', 'whimsical', 'inspirational']).withMessage('Invalid tone'),
  body('duration.target').optional().isInt({ min: 60, max: 600 }).withMessage('Duration must be 60-600 seconds'),
  body('format.aspectRatio').optional().isIn(['16:9', '9:16', '1:1']).withMessage('Invalid aspect ratio'),
  body('narrationRatio').optional().isFloat({ min: 0, max: 1 }).withMessage('Narration ratio must be 0-1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const episode = await Episode.findById(req.params.id);

    if (!episode) {
      return res.status(404).json({ message: 'Episode not found' });
    }

    // Check if user owns the episode
    if (episode.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // If characters are being updated, validate them
    if (req.body.characters) {
      const characterIds = req.body.characters.map(c => c.character);
      const characters = await Character.find({
        _id: { $in: characterIds },
        series: episode.series
      });

      if (characters.length !== characterIds.length) {
        return res.status(400).json({ message: 'Some characters are invalid or do not belong to this series' });
      }
    }

    Object.assign(episode, req.body);
    await episode.save();

    const updatedEpisode = await Episode.findById(episode._id)
      .populate('characters.character', 'name appearance personality voice')
      .populate('series', 'title');

    res.json(updatedEpisode);
  } catch (error) {
    console.error('Error updating episode:', error);
    res.status(500).json({ message: 'Error updating episode' });
  }
});

// Delete an episode
router.delete('/:id', auth, async (req, res) => {
  try {
    const episode = await Episode.findById(req.params.id);

    if (!episode) {
      return res.status(404).json({ message: 'Episode not found' });
    }

    // Check if user owns the episode
    if (episode.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove episode from series
    await Series.findByIdAndUpdate(
      episode.series,
      { $pull: { episodes: req.params.id } }
    );

    await Episode.findByIdAndDelete(req.params.id);

    res.json({ message: 'Episode deleted successfully' });
  } catch (error) {
    console.error('Error deleting episode:', error);
    res.status(500).json({ message: 'Error deleting episode' });
  }
});

// Get episode progress
router.get('/:id/progress', auth, async (req, res) => {
  try {
    const episode = await Episode.findById(req.params.id, 'progress status');

    if (!episode) {
      return res.status(404).json({ message: 'Episode not found' });
    }

    // Check if user owns the episode
    if (episode.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      status: episode.status,
      progress: episode.progress,
      overallProgress: Math.round(
        (episode.progress.script + episode.progress.storyboard + 
         episode.progress.assets + episode.progress.audio + episode.progress.video) / 5
      )
    });
  } catch (error) {
    console.error('Error fetching episode progress:', error);
    res.status(500).json({ message: 'Error fetching episode progress' });
  }
});

// Update episode progress
router.patch('/:id/progress', [
  auth,
  body('stage').isIn(['script', 'storyboard', 'assets', 'audio', 'video']).withMessage('Invalid stage'),
  body('progress').isInt({ min: 0, max: 100 }).withMessage('Progress must be 0-100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const episode = await Episode.findById(req.params.id);

    if (!episode) {
      return res.status(404).json({ message: 'Episode not found' });
    }

    // Check if user owns the episode
    if (episode.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    episode.progress[req.body.stage] = req.body.progress;
    
    // Update overall status if all stages are complete
    const allStagesComplete = Object.values(episode.progress).every(p => p === 100);
    if (allStagesComplete) {
      episode.status = 'completed';
    }

    await episode.save();

    res.json({
      progress: episode.progress,
      status: episode.status,
      overallProgress: Math.round(
        (episode.progress.script + episode.progress.storyboard + 
         episode.progress.assets + episode.progress.audio + episode.progress.video) / 5
      )
    });
  } catch (error) {
    console.error('Error updating episode progress:', error);
    res.status(500).json({ message: 'Error updating episode progress' });
  }
});

// Generate video for episode
router.post('/:id/generate-video', auth, async (req, res) => {
  try {
    console.log('🎬 Starting video generation for episode:', req.params.id);
    
    const episode = await Episode.findById(req.params.id)
      .populate('series', 'title')
      .populate('characters.character', 'name appearance personality voice');

    if (!episode) {
      return res.status(404).json({ message: 'Episode not found' });
    }

    // Check if user owns the episode
    if (episode.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if episode has required content for video generation
    if (!episode.script || !episode.scenes || episode.scenes.length === 0) {
      return res.status(400).json({ 
        message: 'Episode must have script and scenes before generating video' 
      });
    }

    // Update episode status to rendering
    episode.status = 'rendering';
    episode.progress.video = 0;
    await episode.save();

    // Prepare episode data for video service
    const episodeData = {
      script: episode.script,
      scenes: episode.scenes,
      images: episode.images || [],
      voices: episode.voices || [],
      metadata: {
        episodeNumber: episode.episodeNumber,
        duration: episode.duration.target || 300,
        platformFormat: episode.format.aspectRatio || '16:9',
        language: episode.language || 'English'
      }
    };

    // Start video generation in background
    generateVideoAsync(episode._id, episodeData);

    res.json({
      message: 'Video generation started',
      episodeId: episode._id,
      status: 'rendering',
      estimatedTime: Math.ceil(episodeData.duration / 60) + ' minutes'
    });

  } catch (error) {
    console.error('Error starting video generation:', error);
    res.status(500).json({ message: 'Error starting video generation' });
  }
});

// Get video generation progress
router.get('/:id/video-progress', auth, async (req, res) => {
  try {
    const episode = await Episode.findById(req.params.id, 'status progress finalVideo');

    if (!episode) {
      return res.status(404).json({ message: 'Episode not found' });
    }

    // Check if user owns the episode
    if (episode.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get detailed progress from video service
    const videoProgress = await videoService.getVideoProgress(episode._id);

    res.json({
      episodeId: episode._id,
      status: episode.status,
      progress: episode.progress,
      videoProgress,
      finalVideo: episode.finalVideo
    });

  } catch (error) {
    console.error('Error fetching video progress:', error);
    res.status(500).json({ message: 'Error fetching video progress' });
  }
});

// Cancel video generation
router.post('/:id/cancel-video', auth, async (req, res) => {
  try {
    const episode = await Episode.findById(req.params.id);

    if (!episode) {
      return res.status(404).json({ message: 'Episode not found' });
    }

    // Check if user owns the episode
    if (episode.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Cancel video generation
    const cancelResult = await videoService.cancelVideoRender(episode._id);

    // Update episode status
    if (cancelResult.success) {
      episode.status = 'draft';
      episode.progress.video = 0;
      await episode.save();
    }

    res.json(cancelResult);

  } catch (error) {
    console.error('Error cancelling video generation:', error);
    res.status(500).json({ message: 'Error cancelling video generation' });
  }
});

// Async video generation function
async function generateVideoAsync(episodeId, episodeData) {
  try {
    console.log(`🎥 Starting async video generation for episode ${episodeId}`);
    
    // Update progress
    await Episode.findByIdAndUpdate(episodeId, {
      'progress.video': 10,
      status: 'rendering'
    });

    // Render video using video service
    const result = await videoService.renderVideo(episodeData);
    
    if (result.success) {
      // Update episode with completed video
      await Episode.findByIdAndUpdate(episodeId, {
        status: 'completed',
        'progress.video': 100,
        'finalVideo.url': result.videoUrl,
        'finalVideo.format': result.metadata.format,
        'finalVideo.duration': result.metadata.duration,
        'finalVideo.size': result.metadata.size,
        'finalVideo.generatedAt': new Date()
      });
      
      console.log(`✅ Video generation completed for episode ${episodeId}`);
    } else {
      throw new Error('Video rendering failed');
    }

  } catch (error) {
    console.error(`❌ Video generation failed for episode ${episodeId}:`, error);
    
    // Update episode with error
    await Episode.findByIdAndUpdate(episodeId, {
      status: 'failed',
      'progress.video': 0,
      $push: {
        errors: {
          stage: 'video',
          message: error.message,
          timestamp: new Date()
        }
      }
    });
  }
}

module.exports = router;
