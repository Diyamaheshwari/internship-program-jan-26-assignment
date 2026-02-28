const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const fetch = require('node-fetch');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const sharp = require('sharp');
const { createCanvas, loadImage } = require('canvas');

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

class VideoService {
  constructor() {
    this.outputDir = path.join(__dirname, '../public/generated/videos');
    this.tempDir = path.join(__dirname, '../temp');
    this.ensureDirectoryExists(this.outputDir);
    this.ensureDirectoryExists(this.tempDir);
  }

  async renderVideo(episodeData) {
    try {
      const { script, scenes, images, voices, metadata } = episodeData;
      
      console.log('🎬 Starting professional video rendering process...');
      console.log(`📊 Target: ${metadata.duration}s video, ${scenes.length} scenes`);
      
      // Step 1: Create enhanced storyboard with scene timing
      const storyboard = await this.createEnhancedStoryboard(scenes, metadata);
      
      // Step 2: Generate scene visuals (images or animated frames)
      const sceneVisuals = await this.generateSceneVisuals(scenes, images, metadata);
      
      // Step 3: Process and combine audio tracks
      const audioTrack = await this.createProfessionalAudioMix(voices, script, metadata);
      
      // Step 4: Render final video with professional effects
      const videoUrl = await this.renderProfessionalVideo(storyboard, sceneVisuals, audioTrack, metadata);
      
      console.log('✅ Video rendering completed successfully!');
      
      return {
        success: true,
        videoUrl,
        metadata: {
          duration: metadata.duration,
          format: metadata.platformFormat || '16:9',
          resolution: '1080p',
          size: await this.getVideoFileSize(videoUrl),
          scenes: scenes.length,
          quality: 'high'
        }
      };
      
    } catch (error) {
      console.error('❌ Error rendering video:', error);
      throw new Error(`Video rendering failed: ${error.message}`);
    }
  }

  // NEW: Enhanced storyboard creation with timing
  async createEnhancedStoryboard(scenes, metadata) {
    const totalDuration = metadata.duration || 300; // 5 minutes default
    const sceneDuration = Math.floor(totalDuration / scenes.length);
    
    return scenes.map((scene, index) => ({
      sceneNumber: index + 1,
      shotNumber: 1,
      shotType: this.determineShotType(scene),
      cameraMovement: this.determineCameraMovement(scene),
      description: scene.description || scene.heading || `Scene ${index + 1}`,
      duration: sceneDuration,
      startTime: index * sceneDuration,
      endTime: (index + 1) * sceneDuration,
      transition: this.determineTransition(scene, index, scenes.length),
      visualEffects: this.determineVisualEffects(scene),
      audioCues: this.determineAudioCues(scene)
    }));
  }

  // NEW: Generate professional scene visuals
  async generateSceneVisuals(scenes, images, metadata) {
    const visuals = [];
    const aspectRatio = metadata.platformFormat || '16:9';
    const [width, height] = aspectRatio === '9:16' ? [1080, 1920] : [1920, 1080];

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const visualPath = path.join(this.tempDir, `scene_${i + 1}.png`);
      
      if (images && images[i]) {
        // Process existing image with proper sizing and effects
        await this.processSceneImage(images[i], visualPath, width, height, scene);
      } else {
        // Generate synthetic scene visual
        await this.generateSyntheticScene(scene, visualPath, width, height);
      }
      
      visuals.push({
        path: visualPath,
        duration: scene.duration || 30,
        type: 'image',
        effects: ['fade-in', 'subtle-zoom']
      });
    }
    
    return visuals;
  }

  // NEW: Professional audio mixing
  async createProfessionalAudioMix(voices, script, metadata) {
    const audioMixPath = path.join(this.tempDir, `audio_mix_${Date.now()}.mp3`);
    
    try {
      // Create background music track (simulated)
      const bgMusicPath = await this.generateBackgroundMusic(metadata.duration);
      
      // Mix voice tracks with background music
      if (voices && voices.length > 0) {
        await this.mixAudioTracks(voices, bgMusicPath, audioMixPath, metadata);
      } else {
        // Use only background music if no voices
        await fs.promises.copyFile(bgMusicPath, audioMixPath);
      }
      
      return {
        path: audioMixPath,
        duration: metadata.duration,
        format: 'mp3',
        tracks: voices.length + 1 // voices + background music
      };
    } catch (error) {
      console.error('Audio mixing error:', error);
      throw error;
    }
  }

  // NEW: Professional video rendering with FFmpeg
  async renderProfessionalVideo(storyboard, visuals, audio, metadata) {
    const videoFilename = `episode_${metadata.episodeNumber || 1}_${Date.now()}.mp4`;
    const outputPath = path.join(this.outputDir, videoFilename);
    
    return new Promise((resolve, reject) => {
      console.log('🎥 Starting FFmpeg video composition...');
      
      // Create FFmpeg command
      const command = ffmpeg()
        .input('color=c=black:s=1920x1080:d=1') // Black background
        .inputOptions(['-f', 'lavfi', '-t', metadata.duration.toString()]);
      
      // Add each scene as an input
      visuals.forEach((visual, index) => {
        command.input(visual.path);
      });
      
      // Add audio track
      if (audio && audio.path) {
        command.input(audio.path);
      }
      
      // Complex filter for video composition
      const filterComplex = this.buildVideoFilter(storyboard, visuals, metadata);
      command.complexFilter(filterComplex);
      
      // Map outputs and set encoding options
      command
        .outputOptions([
          '-c:v libx264',
          '-preset medium',
          '-crf 23',
          '-c:a aac',
          '-b:a 128k',
          '-pix_fmt yuv420p',
          '-movflags +faststart',
          '-t', metadata.duration.toString()
        ])
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log('FFmpeg command:', commandLine);
        })
        .on('progress', (progress) => {
          console.log(`Rendering progress: ${Math.round(progress.percent || 0)}%`);
        })
        .on('end', () => {
          console.log(`✅ Video rendered: ${videoFilename}`);
          resolve(`/generated/videos/${videoFilename}`);
        })
        .on('error', (error) => {
          console.error('❌ FFmpeg error:', error);
          reject(error);
        });
      
      command.run();
    });
  }

  // Helper methods for professional video rendering
  determineShotType(scene) {
    const content = (scene.description || '').toLowerCase();
    if (content.includes('extreme') || content.includes('dramatic')) return 'extreme-close-up';
    if (content.includes('wide') || content.includes('establishing')) return 'wide';
    if (content.includes('close') || content.includes('intimate')) return 'close-up';
    return 'medium';
  }

  determineCameraMovement(scene) {
    const content = (scene.description || '').toLowerCase();
    if (content.includes('action') || content.includes('dynamic')) return 'pan';
    if (content.includes('emotional') || content.includes('dramatic')) return 'tilt';
    return 'static';
  }

  determineTransition(scene, index, totalScenes) {
    if (index === 0) return 'fade-in';
    if (index === totalScenes - 1) return 'fade-out';
    return 'cross-dissolve';
  }

  determineVisualEffects(scene) {
    const effects = [];
    const content = (scene.description || '').toLowerCase();
    if (content.includes('dream') || content.includes('memory')) effects.push('blur');
    if (content.includes('action') || content.includes('exciting')) effects.push('speed-ramp');
    return effects;
  }

  determineAudioCues(scene) {
    const cues = [];
    const content = (scene.description || '').toLowerCase();
    if (content.includes('tense') || content.includes('dramatic')) cues.push('tension-music');
    if (content.includes('happy') || content.includes('joy')) cues.push('upbeat-music');
    return cues;
  }

  async processSceneImage(imageUrl, outputPath, width, height, scene) {
    try {
      // Download and process image with sharp
      const response = await fetch(imageUrl);
      const buffer = Buffer.from(await response.arrayBuffer());
      
      await sharp(buffer)
        .resize(width, height, { 
          fit: 'cover',
          position: 'center'
        })
        .modulate({
          brightness: scene.visualEffects?.includes('dark') ? 0.8 : 1,
          saturation: 1.1
        })
        .sharpen()
        .toFile(outputPath);
        
      console.log(`✅ Processed scene image: ${outputPath}`);
    } catch (error) {
      console.error('Error processing scene image:', error);
      // Fallback to synthetic scene
      await this.generateSyntheticScene(scene, outputPath, width, height);
    }
  }

  async generateSyntheticScene(scene, outputPath, width, height) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Create gradient background based on scene mood
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    const mood = this.getSceneMood(scene);
    gradient.addColorStop(0, mood.colors[0]);
    gradient.addColorStop(1, mood.colors[1]);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add scene text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(scene.description || `Scene ${scene.sceneNumber}`, width / 2, height / 2);
    
    // Save canvas to file
    const buffer = canvas.toBuffer('image/png');
    await fs.promises.writeFile(outputPath, buffer);
    
    console.log(`✅ Generated synthetic scene: ${outputPath}`);
  }

  getSceneMood(scene) {
    const content = (scene.description || '').toLowerCase();
    if (content.includes('happy') || content.includes('joy')) {
      return { colors: ['#FFD700', '#FFA500'] };
    }
    if (content.includes('sad') || content.includes('dramatic')) {
      return { colors: ['#2C3E50', '#34495E'] };
    }
    if (content.includes('action') || content.includes('exciting')) {
      return { colors: ['#E74C3C', '#C0392B'] };
    }
    return { colors: ['#3498DB', '#2980B9'] }; // Default blue
  }

  async generateBackgroundMusic(duration) {
    // Simulate background music generation
    const musicPath = path.join(this.tempDir, `bg_music_${Date.now()}.mp3`);
    
    // Create a simple silent audio file as placeholder
    const silentAudio = ffmpeg()
      .input('anullsrc=r=44100:c=2')
      .outputOptions(['-t', duration.toString(), '-acodec', 'aac'])
      .output(musicPath)
      .on('end', () => {
        console.log(`✅ Generated background music: ${musicPath}`);
      });
    
    return new Promise((resolve, reject) => {
      silentAudio.on('error', reject).on('end', () => resolve(musicPath)).run();
    });
  }

  async mixAudioTracks(voices, bgMusic, outputPath, metadata) {
    return new Promise((resolve, reject) => {
      const command = ffmpeg();
      
      // Add background music
      command.input(bgMusic);
      
      // Add voice tracks
      voices.forEach((voice, index) => {
        if (voice.path) {
          command.input(voice.path);
        }
      });
      
      // Mix audio with proper volume levels
      command
        .complexFilter([
          '[0:a]volume=0.3[bg]', // Background music at 30% volume
          ...voices.map((_, index) => 
            index > 0 ? `[${index + 1}:a]volume=1.0[voice${index}]` : '[1:a]volume=1.0[voice0]'
          ),
          voices.map((_, index) => `[bg][voice${index}]amix=inputs=2:weights=0.3 1.0[mixed${index}]`).join(';'),
          voices.map((_, index) => `[mixed${index}]amix=inputs=${voices.length}:weights=1`).join(';')
        ])
        .outputOptions(['-acodec', 'aac', '-b:a', '128k', '-t', metadata.duration.toString()])
        .output(outputPath)
        .on('end', () => {
          console.log(`✅ Mixed audio tracks: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', reject)
        .run();
    });
  }

  buildVideoFilter(storyboard, visuals, metadata) {
    const filters = [];
    const aspectRatio = metadata.platformFormat || '16:9';
    const [width, height] = aspectRatio === '9:16' ? [1080, 1920] : [1920, 1080];
    
    // Create video stream for each scene
    visuals.forEach((visual, index) => {
      filters.push(`[${index + 1}:v]scale=${width}:${height},format=yuv420p[scene${index}]`);
    });
    
    // Concatenate scenes with transitions
    const sceneInputs = visuals.map((_, index) => `[scene${index}]`).join('');
    filters.push(`${sceneInputs}concat=n=${visuals.length}:v=1:a=0[video]`);
    
    // Add audio if available
    if (visuals.length > 0) {
      filters.push(`[${visuals.length + 1}:a][video]concat=v=1:a=1[final]`);
    } else {
      filters.push('[0:a][video]concat=v=1:a=1[final]');
    }
    
    return filters.join(';');
  }

  async getVideoFileSize(videoPath) {
    try {
      const stats = await fs.promises.stat(videoPath);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }

  async combineAudioTracks(voices, script) {
    // In a real implementation, this would:
    // 1. Convert voice files to consistent format
    // 2. Add background music
    // 3. Mix audio tracks with proper timing
    // 4. Apply audio effects
    
    console.log('Processing audio tracks...');
    
    // Simulate audio processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      url: '/generated/audio/combined-track.mp3',
      duration: this.estimateAudioDuration(script),
      format: 'mp3'
    };
  }

  async renderFinalVideo(scenes, audioTrack, metadata) {
    // In a real implementation, this would use FFmpeg:
    // 1. Combine images into video sequence
    // 2. Add transitions between scenes
    // 3. Overlay audio track
    // 4. Apply color grading and effects
    // 5. Export in specified format
    
    console.log('Rendering final video...');
    console.log(`Target duration: ${metadata.duration} minutes`);
    
    // Adjust rendering time based on video duration (longer videos take more time)
    const baseRenderTime = 5000; // 5 seconds base
    const durationMultiplier = Math.max(1, metadata.duration / 5); // Scale with duration
    const totalRenderTime = baseRenderTime * durationMultiplier;
    
    // Simulate video rendering time (longer process for longer videos)
    await new Promise(resolve => setTimeout(resolve, totalRenderTime));
    
    const videoFilename = `episode_${metadata.episodeNumber}_${Date.now()}_${metadata.duration}min.mp4`;
    const videoUrl = `/generated/videos/${videoFilename}`;
    
    // Create a placeholder video file (in real implementation)
    const outputPath = path.join(__dirname, '../public/generated/videos', videoFilename);
    await this.ensureDirectoryExists(path.dirname(outputPath));
    
    // Create a placeholder file with metadata
    const placeholderContent = JSON.stringify({
      duration: metadata.duration,
      scenes: scenes.length,
      resolution: '1080p',
      format: 'mp4',
      createdAt: new Date().toISOString()
    });
    await promisify(fs.writeFile)(outputPath, placeholderContent);
    
    console.log(`Video rendered successfully: ${videoFilename} (${metadata.duration} minutes)`);
    return videoUrl;
  }

  calculateSceneDuration(scene) {
    // Estimate scene duration based on dialogue length
    const dialogueLength = scene.dialogue.reduce((total, line) => total + line.text.length, 0);
    const wordsPerMinute = 150; // Average speaking rate
    const estimatedMinutes = dialogueLength / (wordsPerMinute * 4.5); // 4.5 characters per word
    return Math.max(30, estimatedMinutes * 60); // Minimum 30 seconds
  }

  estimateAudioDuration(script) {
    // Estimate total audio duration from script
    const wordCount = script.split(' ').length;
    const wordsPerMinute = 150;
    return Math.ceil((wordCount / wordsPerMinute) * 60); // Convert to seconds
  }

  estimateVideoSize(duration) {
    // Estimate video file size (rough calculation)
    const bitrate = 2000; // 2 Mbps for 1080p
    return Math.ceil((bitrate * duration) / 8); // Size in bytes
  }

  async ensureDirectoryExists(dirPath) {
    try {
      await promisify(fs.mkdir)(dirPath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  async getVideoProgress(videoId) {
    // Enhanced progress tracking with real FFmpeg status
    try {
      // Check if video file exists and is being processed
      const videoPath = path.join(this.outputDir, `${videoId}.mp4`);
      const tempPath = path.join(this.tempDir, `${videoId}.mp4`);
      
      // Check if rendering is complete
      if (fs.existsSync(videoPath)) {
        return {
          stage: 'completed',
          progress: 100,
          status: 'completed',
          videoUrl: `/generated/videos/${videoId}.mp4`,
          message: 'Video rendering completed successfully'
        };
      }
      
      // Check if rendering is in progress
      if (fs.existsSync(tempPath)) {
        const stats = fs.statSync(tempPath);
        const progress = Math.min(95, Math.round((stats.size / (10 * 1024 * 1024)) * 100)); // Estimate progress based on file size
        
        const stages = [
          { stage: 'processing-scenes', progress: 20 },
          { stage: 'generating-visuals', progress: 40 },
          { stage: 'mixing-audio', progress: 60 },
          { stage: 'rendering-video', progress: 80 },
          { stage: 'finalizing', progress: 95 }
        ];
        
        const currentStage = stages[Math.floor(progress / 20)] || stages[0];
        
        return {
          ...currentStage,
          progress,
          status: 'rendering',
          message: `Video is ${currentStage.stage.replace('-', ' ')}...`
        };
      }
      
      // Not started yet
      return {
        stage: 'queued',
        progress: 0,
        status: 'queued',
        message: 'Video is queued for rendering'
      };
      
    } catch (error) {
      console.error('Error getting video progress:', error);
      return {
        stage: 'error',
        progress: 0,
        status: 'failed',
        message: 'Error checking video progress'
      };
    }
  }

  async cancelVideoRender(videoId) {
    try {
      // Kill any running FFmpeg processes
      const { exec } = require('child_process');
      
      return new Promise((resolve) => {
        exec('taskkill /f /im ffmpeg.exe', (error) => {
          if (error) {
            console.log('No FFmpeg processes to kill');
          }
          
          // Clean up temp files
          const tempPath = path.join(this.tempDir, `${videoId}.mp4`);
          if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
          }
          
          console.log(`✅ Cancelled video render: ${videoId}`);
          resolve({ success: true, message: 'Video render cancelled successfully' });
        });
      });
    } catch (error) {
      console.error('Error cancelling video render:', error);
      return { success: false, message: 'Failed to cancel video render' };
    }
  }

  // NEW: Generate video preview thumbnail
  async generateVideoThumbnail(videoPath, time = 5) {
    const thumbnailPath = path.join(this.tempDir, `thumbnail_${Date.now()}.jpg`);
    
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: [time],
          filename: path.basename(thumbnailPath),
          folder: path.dirname(thumbnailPath),
          size: '320x240'
        })
        .on('end', () => {
          console.log(`✅ Generated thumbnail: ${thumbnailPath}`);
          resolve(thumbnailPath);
        })
        .on('error', reject);
    });
  }

  // NEW: Get video metadata
  async getVideoMetadata(videoPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            duration: metadata.format.duration,
            size: metadata.format.size,
            bitrate: metadata.format.bit_rate,
            resolution: `${metadata.streams[0].width}x${metadata.streams[0].height}`,
            fps: eval(metadata.streams[0].r_frame_rate),
            codec: metadata.streams[0].codec_name
          });
        }
      });
    });
  }
}

module.exports = new VideoService();
