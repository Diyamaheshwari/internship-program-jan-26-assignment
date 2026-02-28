const express = require('express');
const router = express.Router();
const Episode = require('../models/Episode');
const Character = require('../models/Character');
const Series = require('../models/Series');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const aiService = require('../services/aiService');
const videoService = require('../services/videoService');

// Generate script for an episode with enhanced AI
router.post('/generate/:episodeId', auth, async (req, res) => {
  try {
    const episode = await Episode.findById(req.params.episodeId)
      .populate('series')
      .populate('characters.character');

    if (!episode) {
      return res.status(404).json({ message: 'Episode not found' });
    }

    // Check if user owns the episode
    if (episode.series.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all characters for the series
    const characters = await Character.find({ series: episode.series._id });

    // Prepare episode data for AI generation
    const episodeData = {
      episodeNumber: episode.episodeNumber,
      characters: characters,
      worldRules: episode.series.worldRules || episode.series.description,
      situation: episode.description || episode.title,
      selectedCharacters: episode.characters.map(c => c.character._id),
      desiredTone: episode.series.genre || 'drama',
      endingGoal: episode.endingGoal || 'emotional resolution',
      language: episode.language || 'English',
      narrationDialogueRatio: episode.narrationDialogueRatio || '20/80',
      platformFormat: episode.platformFormat || '16:9',
      targetDuration: episode.targetDuration || 300
    };

    // Generate complete episode assets using AI
    const generatedAssets = await aiService.generateEpisodeAssets(episodeData);
    
    // Update episode with generated content
    episode.script = generatedAssets.script;
    episode.scenes = generatedAssets.scenes;
    episode.images = generatedAssets.images;
    episode.voices = generatedAssets.voices;
    episode.progress.script = 100;
    episode.progress.images = generatedAssets.images.length > 0 ? 100 : 0;
    episode.progress.voices = generatedAssets.voices.length > 0 ? 100 : 0;
    episode.status = 'ai-generated';
    episode.metadata = generatedAssets.metadata;
    await episode.save();

    res.json({
      message: 'Episode content generated successfully',
      script: generatedAssets.script,
      scenes: generatedAssets.scenes,
      images: generatedAssets.images,
      voices: generatedAssets.voices,
      metadata: generatedAssets.metadata
    });
  } catch (error) {
    console.error('Error generating episode content:', error);
    res.status(500).json({ message: 'Error generating episode content' });
  }
});

// Enhanced script generation with custom parameters
router.post('/generate-enhanced', auth, [
  body('seriesId').notEmpty().withMessage('Series ID is required'),
  body('situation').notEmpty().withMessage('Situation is required'),
  body('selectedCharacters').isArray().withMessage('Selected characters must be an array'),
  body('desiredTone').notEmpty().withMessage('Desired tone is required'),
  body('endingGoal').notEmpty().withMessage('Ending goal is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      seriesId,
      situation,
      selectedCharacters,
      desiredTone,
      endingGoal,
      language = 'English',
      narrationDialogueRatio = '20/80',
      platformFormat = '16:9',
      targetDuration = 300,
      episodeNumber
    } = req.body;

    // Get series and characters
    const series = await Series.findById(seriesId);
    if (!series) {
      return res.status(404).json({ message: 'Series not found' });
    }

    if (series.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const characters = await Character.find({ 
      _id: { $in: selectedCharacters },
      series: seriesId
    });

    // Prepare episode data for AI generation
    const episodeData = {
      episodeNumber: episodeNumber || 1,
      characters: characters,
      worldRules: series.worldRules || series.description,
      situation: situation,
      selectedCharacters: selectedCharacters,
      desiredTone: desiredTone,
      endingGoal: endingGoal,
      language: language,
      narrationDialogueRatio: narrationDialogueRatio,
      platformFormat: platformFormat,
      targetDuration: targetDuration
    };

    // Generate complete episode assets using AI
    const generatedAssets = await aiService.generateEpisodeAssets(episodeData);

    res.json({
      message: 'Episode content generated successfully',
      script: generatedAssets.script,
      scenes: generatedAssets.scenes,
      images: generatedAssets.images,
      voices: generatedAssets.voices,
      metadata: generatedAssets.metadata
    });
  } catch (error) {
    console.error('Error generating enhanced episode content:', error);
    res.status(500).json({ message: 'Error generating episode content' });
  }
});

// Get script for an episode
router.get('/:episodeId', auth, async (req, res) => {
  try {
    const episode = await Episode.findById(req.params.episodeId, 'script')
      .populate('script.scenes.dialogue.character', 'name personality');

    if (!episode) {
      return res.status(404).json({ message: 'Episode not found' });
    }

    // Check if user owns the episode
    if (episode.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(episode.script);
  } catch (error) {
    console.error('Error fetching script:', error);
    res.status(500).json({ message: 'Error fetching script' });
  }
});

// Update script manually
router.put('/:episodeId', [
  auth,
  body('scenes').isArray().withMessage('Scenes must be an array'),
  body('scenes.*.sceneNumber').isInt({ min: 1 }).withMessage('Scene number must be positive integer'),
  body('scenes.*.setting').trim().isLength({ min: 1 }).withMessage('Setting is required'),
  body('scenes.*.dialogue').optional().isArray().withMessage('Dialogue must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const episode = await Episode.findById(req.params.episodeId);

    if (!episode) {
      return res.status(404).json({ message: 'Episode not found' });
    }

    // Check if user owns the episode
    if (episode.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    episode.script = req.body;
    episode.progress.script = 100;
    await episode.save();

    res.json({
      message: 'Script updated successfully',
      script: episode.script
    });
  } catch (error) {
    console.error('Error updating script:', error);
    res.status(500).json({ message: 'Error updating script' });
  }
});

// AI-powered script generation function
async function generateScript(episode) {
  const { storyPrompt, characters, style, duration, narrationRatio } = episode;
  const targetDuration = duration.target; // in seconds
  
  // Calculate approximate scene count based on duration
  const sceneCount = Math.max(2, Math.floor(targetDuration / 60)); // 1 scene per minute minimum
  
  const scenes = [];
  
  // Scene 1: Setup
  scenes.push({
    sceneNumber: 1,
    setting: generateSetting(storyPrompt.situation, episode.series.setting),
    time: 'Day',
    action: `The scene opens establishing the situation: ${storyPrompt.situation}`,
    narration: generateNarration(storyPrompt.situation, 'setup'),
    duration: Math.floor(targetDuration * 0.2), // 20% of total time
    visualNotes: 'Establishing shot of location, introduce main characters',
    dialogue: generateDialogue(storyPrompt.situation, characters, 'setup', Math.floor(targetDuration * 0.2))
  });
  
  // Scene 2: Conflict/Development
  if (storyPrompt.conflict) {
    scenes.push({
      sceneNumber: 2,
      setting: generateSetting(storyPrompt.conflict, episode.series.setting),
      time: 'Day',
      action: `The conflict emerges: ${storyPrompt.conflict}`,
      narration: generateNarration(storyPrompt.conflict, 'conflict'),
      duration: Math.floor(targetDuration * 0.4), // 40% of total time
      visualNotes: 'Close-ups on character reactions, dynamic camera movement',
      dialogue: generateDialogue(storyPrompt.conflict, characters, 'conflict', Math.floor(targetDuration * 0.4))
    });
  }
  
  // Scene 3: Resolution
  const resolutionScene = {
    sceneNumber: storyPrompt.conflict ? 3 : 2,
    setting: generateSetting(storyPrompt.resolution || storyPrompt.situation, episode.series.setting),
    time: 'Day',
    action: `The resolution unfolds: ${storyPrompt.resolution || 'The situation reaches its conclusion'}`,
    narration: generateNarration(storyPrompt.resolution || storyPrompt.situation, 'resolution'),
    duration: Math.floor(targetDuration * 0.4), // 40% of total time
    visualNotes: 'Wide shot showing resolution, character expressions',
    dialogue: generateDialogue(storyPrompt.resolution || storyPrompt.situation, characters, 'resolution', Math.floor(targetDuration * 0.4))
  };
  
  scenes.push(resolutionScene);
  
  // Calculate total word count
  const totalWordCount = scenes.reduce((count, scene) => {
    let sceneCount = scene.narration ? scene.narration.split(' ').length : 0;
    if (scene.dialogue) {
      sceneCount += scene.dialogue.reduce((dialogCount, line) => 
        dialogCount + line.line.split(' ').length, 0);
    }
    return count + sceneCount;
  }, 0);
  
  return {
    scenes,
    totalDuration: scenes.reduce((total, scene) => total + scene.duration, 0),
    wordCount: totalWordCount
  };
}

// Generate setting description
function generateSetting(situation, seriesSetting) {
  const defaultSettings = [
    'A cozy living room with comfortable furniture',
    'A modern office with desks and computers',
    'A bustling city street with pedestrians',
    'A quiet park with trees and benches',
    'A kitchen with cooking utensils and appliances',
    'A classroom with desks and a whiteboard',
    'A coffee shop with tables and chairs',
    'A bedroom with personal items and decorations'
  ];
  
  if (seriesSetting && seriesSetting.location) {
    return `${seriesSetting.location} - ${defaultSettings[Math.floor(Math.random() * defaultSettings.length)]}`;
  }
  
  return defaultSettings[Math.floor(Math.random() * defaultSettings.length)];
}

// Generate narration text
function generateNarration(situation, stage) {
  const narrationTemplates = {
    setup: [
      `In a world where ${situation.toLowerCase()}, our story begins...`,
      `It all started when ${situation.toLowerCase()}.`,
      `The day began like any other, until ${situation.toLowerCase()}.`,
      `Sometimes, the most ordinary days become extraordinary when ${situation.toLowerCase()}.`
    ],
    conflict: [
      `But things took an unexpected turn when...`,
      `The tension rose as the situation intensified...`,
      `What happened next would change everything...`,
      `The conflict reached its peak when...`
    ],
    resolution: [
      `In the end, everything worked out because...`,
      `The resolution came when both sides realized...`,
      `What they discovered changed their perspective...`,
      `The story concludes with an important lesson...`
    ]
  };
  
  const templates = narrationTemplates[stage] || narrationTemplates.setup;
  return templates[Math.floor(Math.random() * templates.length)];
}

// Generate dialogue based on character personalities
function generateDialogue(situation, characters, stage, duration) {
  const dialogue = [];
  const estimatedWordsPerSecond = 2.5; // Average speaking rate
  const targetWordCount = Math.floor(duration * estimatedWordsPerSecond * (1 - 0.3)); // 70% dialogue, 30% narration
  
  // Get main characters (highest importance)
  const mainCharacters = characters
    .filter(c => c.importance >= 7)
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 3); // Max 3 main characters for dialogue
  
  if (mainCharacters.length === 0) {
    return dialogue; // No dialogue if no main characters
  }
  
  const linesPerCharacter = Math.ceil(targetWordCount / (mainCharacters.length * 10)); // 10 words per line average
  
  mainCharacters.forEach((charData, index) => {
    const character = charData.character;
    const personality = character.personality || {};
    const speakingStyle = personality.speakingStyle || {};
    
    for (let i = 0; i < linesPerCharacter; i++) {
      const line = generateCharacterLine(character, situation, stage, speakingStyle);
      dialogue.push({
        character: character._id,
        line: line,
        emotion: getCharacterEmotion(character, stage),
        action: getCharacterAction(character, personality)
      });
    }
  });
  
  return dialogue;
}

// Generate line based on character personality
function generateCharacterLine(character, situation, stage, speakingStyle) {
  const templates = {
    simple: [
      `I think ${situation.toLowerCase()} is interesting.`,
      `What do you think about this?`,
      `Let's figure this out together.`,
      `This reminds me of something...`,
      `I'm not sure what to do.`
    ],
    complex: [
      `The intricacies of ${situation.toLowerCase()} present a fascinating conundrum that requires careful consideration.`,
      `From an analytical perspective, this situation warrants a methodical approach to problem-solving.`,
      `The underlying dynamics at play here are more complex than they initially appear.`,
      `We must consider the multifaceted implications of our next decision.`
    ],
    casual: [
      `So, like, ${situation.toLowerCase()} is pretty wild, right?`,
      `Hey, what's the deal with this whole situation?`,
      `I'm just saying, maybe we should...`,
      `You know what I mean?`
    ],
    formal: [
      `I believe we should address ${situation.toLowerCase()} with the appropriate level of consideration.`,
      `It would be prudent to carefully examine the circumstances before proceeding.`,
      `Allow me to offer my perspective on this matter.`,
      `I suggest we approach this systematically.`
    ]
  };
  
  const style = speakingStyle.vocabulary || 'average';
  const styleTemplates = templates[style] || templates.simple;
  
  return styleTemplates[Math.floor(Math.random() * styleTemplates.length)];
}

// Get character emotion based on stage
function getCharacterEmotion(character, stage) {
  const emotions = {
    setup: ['neutral', 'curious', 'thoughtful', 'calm'],
    conflict: ['concerned', 'determined', 'frustrated', 'serious'],
    resolution: ['relieved', 'happy', 'thoughtful', 'satisfied']
  };
  
  const stageEmotions = emotions[stage] || emotions.setup;
  return stageEmotions[Math.floor(Math.random() * stageEmotions.length)];
}

// Get character action based on personality
function getCharacterAction(character, personality) {
  const actions = ['nods', 'gestures', 'looks around', 'pauses thoughtfully', 'smiles', 'frowns slightly'];
  return actions[Math.floor(Math.random() * actions.length)];
}

// Enhanced video rendering with professional features
router.post('/render/:episodeId', auth, async (req, res) => {
  try {
    const episode = await Episode.findById(req.params.episodeId)
      .populate('series')
      .populate('characters.character');

    if (!episode) {
      return res.status(404).json({ message: 'Episode not found' });
    }

    // Check if user owns the episode
    if (episode.series.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if episode has generated content
    if (!episode.script || !episode.scenes) {
      return res.status(400).json({ message: 'Episode must have script and scenes before rendering' });
    }

    // Update episode status to rendering
    episode.status = 'rendering';
    episode.progress.video = 0;
    episode.renderingStartedAt = new Date();
    await episode.save();

    console.log(`🎬 Starting professional video rendering for episode: ${episode._id}`);

    // Start video rendering process in background
    const renderVideo = async () => {
      try {
        const episodeData = {
          script: episode.script,
          scenes: episode.scenes,
          images: episode.images || [],
          voices: episode.voices || [],
          metadata: {
            episodeNumber: episode.episodeNumber,
            duration: episode.duration?.target || 300,
            platformFormat: episode.format?.aspectRatio || '16:9',
            seriesTitle: episode.series.title,
            episodeTitle: episode.title
          }
        };

        // Render video with professional service
        const renderResult = await videoService.renderVideo(episodeData);

        // Generate thumbnail
        const thumbnailPath = await videoService.generateVideoThumbnail(
          path.join(__dirname, '../public', renderResult.videoUrl)
        );

        // Get video metadata
        const metadata = await videoService.getVideoMetadata(
          path.join(__dirname, '../public', renderResult.videoUrl)
        );

        // Update episode with rendered video
        episode.finalVideo = {
          url: renderResult.videoUrl,
          thumbnail: `/temp/${path.basename(thumbnailPath)}`,
          format: metadata.resolution,
          size: metadata.size,
          duration: metadata.duration,
          fps: metadata.fps,
          bitrate: metadata.bitrate,
          codec: metadata.codec,
          generatedAt: new Date(),
          metadata: renderResult.metadata
        };
        episode.status = 'completed';
        episode.progress.video = 100;
        episode.completedAt = new Date();
        await episode.save();

        console.log(`✅ Episode video rendered successfully: ${episode._id}`);
        
      } catch (error) {
        console.error('❌ Video rendering failed:', error);
        
        // Update episode status to failed
        episode.status = 'failed';
        episode.errors.push({
          stage: 'video-rendering',
          message: error.message,
          timestamp: new Date()
        });
        episode.failedAt = new Date();
        await episode.save();
      }
    };

    // Start rendering in background
    renderVideo().catch(console.error);

    res.json({
      message: 'Video rendering started',
      episodeId: episode._id,
      status: 'rendering',
      estimatedTime: Math.ceil((episode.duration?.target || 300) / 60) + ' minutes'
    });

  } catch (error) {
    console.error('Error starting video rendering:', error);
    res.status(500).json({ message: 'Error starting video rendering' });
  }
});

// Enhanced video rendering progress with real-time updates
router.get('/progress/:episodeId', auth, async (req, res) => {
  try {
    const episode = await Episode.findById(req.params.episodeId)
      .populate('series');

    if (!episode) {
      return res.status(404).json({ message: 'Episode not found' });
    }

    // Check if user owns the episode
    if (episode.series.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get real progress from video service
    const videoProgress = await videoService.getVideoProgress(episode._id);

    // Combine episode progress with video progress
    const combinedProgress = {
      status: episode.status,
      progress: {
        script: episode.progress.script,
        storyboard: episode.progress.storyboard,
        assets: episode.progress.assets,
        audio: episode.progress.audio,
        video: videoProgress.progress || 0
      },
      overallProgress: Math.round(
        (episode.progress.script + episode.progress.storyboard + 
         episode.progress.assets + episode.progress.audio + (videoProgress.progress || 0)) / 5
      ),
      videoProgress,
      finalVideo: episode.finalVideo,
      renderingStartedAt: episode.renderingStartedAt,
      completedAt: episode.completedAt,
      failedAt: episode.failedAt,
      errors: episode.errors || []
    };

    res.json(combinedProgress);

  } catch (error) {
    console.error('Error getting video progress:', error);
    res.status(500).json({ message: 'Error getting video progress' });
  }
});

// NEW: Generate video preview
router.get('/preview/:episodeId', auth, async (req, res) => {
  try {
    const episode = await Episode.findById(req.params.episodeId)
      .populate('series');

    if (!episode) {
      return res.status(404).json({ message: 'Episode not found' });
    }

    // Check if user owns the episode
    if (episode.series.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if video is completed
    if (!episode.finalVideo || episode.status !== 'completed') {
      return res.status(400).json({ message: 'Video is not ready for preview' });
    }

    // Generate preview if not exists
    if (!episode.finalVideo.thumbnail) {
      const videoPath = path.join(__dirname, '../public', episode.finalVideo.url);
      const thumbnailPath = await videoService.generateVideoThumbnail(videoPath);
      
      episode.finalVideo.thumbnail = `/temp/${path.basename(thumbnailPath)}`;
      await episode.save();
    }

    res.json({
      videoUrl: episode.finalVideo.url,
      thumbnail: episode.finalVideo.thumbnail,
      metadata: episode.finalVideo.metadata,
      duration: episode.finalVideo.duration,
      size: episode.finalVideo.size
    });

  } catch (error) {
    console.error('Error generating video preview:', error);
    res.status(500).json({ message: 'Error generating video preview' });
  }
});

// NEW: Download video
router.get('/download/:episodeId', auth, async (req, res) => {
  try {
    const episode = await Episode.findById(req.params.episodeId)
      .populate('series');

    if (!episode) {
      return res.status(404).json({ message: 'Episode not found' });
    }

    // Check if user owns the episode
    if (episode.series.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if video is completed
    if (!episode.finalVideo || episode.status !== 'completed') {
      return res.status(400).json({ message: 'Video is not ready for download' });
    }

    const videoPath = path.join(__dirname, '../public', episode.finalVideo.url);
    
    // Check if file exists
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ message: 'Video file not found' });
    }

    // Set download headers
    const filename = `${episode.series.title.replace(/[^a-zA-Z0-9]/g, '_')}_Episode_${episode.episodeNumber}.mp4`;
    
    res.download(videoPath, filename);

  } catch (error) {
    console.error('Error downloading video:', error);
    res.status(500).json({ message: 'Error downloading video' });
  }
});

// Cancel video rendering
router.post('/cancel/:episodeId', auth, async (req, res) => {
  try {
    const episode = await Episode.findById(req.params.episodeId)
      .populate('series');

    if (!episode) {
      return res.status(404).json({ message: 'Episode not found' });
    }

    // Check if user owns the episode
    if (episode.series.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (episode.status !== 'rendering') {
      return res.status(400).json({ message: 'Episode is not currently rendering' });
    }

    // Cancel video rendering
    await videoService.cancelVideoRender(episode._id);

    // Update episode status
    episode.status = 'draft';
    episode.progress.video = 0;
    await episode.save();

    res.json({ message: 'Video rendering cancelled successfully' });

  } catch (error) {
    console.error('Error cancelling video render:', error);
    res.status(500).json({ message: 'Error cancelling video render' });
  }
});

module.exports = router;
