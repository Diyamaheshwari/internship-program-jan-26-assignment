const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const videoService = require('../services/videoService');

// Admin-only middleware
const adminOnly = (req, res, next) => {
  if (!req.user || (req.user.email !== 'admin@example.com' && req.user.username !== 'admin')) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Generate sample video (admin only)
router.post('/generate-sample', auth, adminOnly, async (req, res) => {
  try {
    const { template, duration, style, scenes } = req.body;
    
    console.log('Admin generating sample video:', { template, duration, style });
    
    // Create enhanced episode data for longer videos
    const episodeData = {
      script: generateSampleScript(template, duration),
      scenes: generateSampleScenes(scenes || 4, duration),
      images: generateSampleImages(scenes || 4),
      voices: generateSampleVoices(template),
      metadata: {
        duration: duration,
        episodeNumber: Math.floor(Math.random() * 100),
        platformFormat: 'mp4',
        resolution: '1080p',
        style: style,
        template: template
      }
    };
    
    // Render the video
    const result = await videoService.renderVideo(episodeData);
    
    res.json({
      success: true,
      video: {
        id: `sample-${Date.now()}`,
        title: `${template} - Sample Video`,
        duration: duration,
        template: template,
        style: style,
        videoUrl: result.videoUrl,
        thumbnail: `https://picsum.photos/seed/${template}-${Date.now()}/800/450.jpg`,
        downloadUrl: result.videoUrl,
        fileSize: `${duration * 2}MB`,
        resolution: '1080p',
        format: 'MP4',
        createdAt: new Date(),
        metadata: result.metadata
      }
    });
    
  } catch (error) {
    console.error('Error generating sample video:', error);
    res.status(500).json({ message: 'Failed to generate sample video' });
  }
});

// Get video generation progress
router.get('/progress/:videoId', auth, adminOnly, async (req, res) => {
  try {
    const { videoId } = req.params;
    const progress = await videoService.getVideoProgress(videoId);
    res.json({ success: true, progress });
  } catch (error) {
    console.error('Error getting video progress:', error);
    res.status(500).json({ message: 'Failed to get video progress' });
  }
});

// Get all generated videos (admin only)
router.get('/videos', auth, adminOnly, async (req, res) => {
  try {
    // In a real implementation, this would query the database
    // For now, return a list of sample videos
    const sampleVideos = [
      {
        id: 'sample-1',
        title: 'Corporate Introduction',
        duration: 5,
        template: 'corporate-intro',
        status: 'completed',
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        downloadUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4'
      },
      {
        id: 'sample-2',
        title: 'Product Demonstration',
        duration: 8,
        template: 'product-demo',
        status: 'completed',
        createdAt: new Date(Date.now() - 172800000), // 2 days ago
        downloadUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_8mb.mp4'
      }
    ];
    
    res.json({ success: true, videos: sampleVideos });
  } catch (error) {
    console.error('Error getting videos:', error);
    res.status(500).json({ message: 'Failed to get videos' });
  }
});

// Delete a video (admin only)
router.delete('/videos/:videoId', auth, adminOnly, async (req, res) => {
  try {
    const { videoId } = req.params;
    
    // In a real implementation, this would delete from database and file system
    console.log(`Admin deleting video: ${videoId}`);
    
    res.json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ message: 'Failed to delete video' });
  }
});

// Helper functions for generating sample content
function generateSampleScript(template, duration) {
  const scripts = {
    'corporate-intro': `Welcome to our company. We are a leading provider of innovative solutions. Our team is dedicated to excellence. We serve clients worldwide with cutting-edge technology. Thank you for choosing us.`,
    'product-demo': `Introducing our revolutionary product. This amazing solution transforms how you work. Key features include advanced functionality and user-friendly design. Experience the difference today.`,
    'educational-content': `Today we'll explore important concepts. Learning is a journey of discovery. Let's break down complex ideas into simple steps. Practice makes perfect. Keep exploring and growing.`,
    'social-media-ad': `Hey everyone! Check this out! This is absolutely amazing. You won't believe what we have for you. Don't miss this opportunity. Like and share with friends!`
  };
  
  // Extend script based on duration
  let baseScript = scripts[template] || scripts['corporate-intro'];
  const targetWords = duration * 150; // 150 words per minute
  const currentWords = baseScript.split(' ').length;
  
  if (currentWords < targetWords) {
    // Repeat and extend content to reach target duration
    const repeatTimes = Math.ceil(targetWords / currentWords);
    baseScript = baseScript.repeat(repeatTimes);
  }
  
  return baseScript;
}

function generateSampleScenes(sceneCount, duration) {
  const scenes = [];
  const sceneDuration = (duration * 60) / sceneCount; // Duration in seconds per scene
  
  for (let i = 0; i < sceneCount; i++) {
    scenes.push({
      heading: `Scene ${i + 1}`,
      description: `Sample scene description for scene ${i + 1}`,
      dialogue: [
        { character: 'Narrator', text: `This is scene ${i + 1} of the video.` },
        { character: 'Speaker', text: `Important content for scene ${i + 1}.` }
      ],
      duration: sceneDuration,
      type: 'dialogue'
    });
  }
  
  return scenes;
}

function generateSampleImages(sceneCount) {
  const images = [];
  for (let i = 0; i < sceneCount; i++) {
    images.push(`https://picsum.photos/seed/scene-${i + 1}-${Date.now()}/1920/1080.jpg`);
  }
  return images;
}

function generateSampleVoices(template) {
  const voices = {
    'corporate-intro': [
      { character: 'Narrator', voice: 'professional-male', url: '/generated/voices/narrator.mp3' }
    ],
    'product-demo': [
      { character: 'Presenter', voice: 'energetic-female', url: '/generated/voices/presenter.mp3' }
    ],
    'educational-content': [
      { character: 'Teacher', voice: 'calm-male', url: '/generated/voices/teacher.mp3' }
    ],
    'social-media-ad': [
      { character: 'Influencer', voice: 'enthusiastic-female', url: '/generated/voices/influencer.mp3' }
    ]
  };
  
  return voices[template] || voices['corporate-intro'];
}

module.exports = router;
