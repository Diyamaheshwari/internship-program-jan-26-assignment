const OpenAI = require('openai');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  generateScript(episodeData) {
    const {
      episodeNumber,
      characters,
      worldRules,
      situation,
      selectedCharacters,
      desiredTone,
      endingGoal,
      language = 'English',
      narrationDialogueRatio = '20/80',
      platformFormat = '16:9',
      targetDuration = 300 // 5 minutes in seconds
    } = episodeData;

    // Calculate approximate word count based on duration
    const wordCount = Math.floor(targetDuration * 2.3); // ~2.3 words per second for dialogue
    const sceneCount = Math.max(6, Math.floor(wordCount / 100)); // 6-8 scenes

    // Build character descriptions
    const characterDescriptions = characters
      .filter(char => selectedCharacters.includes(char._id))
      .map(char => {
        let desc = `${char.name}:\n`;
        desc += `- Age ${char.age || 'Unknown'}\n`;
        if (char.appearance) desc += `- ${char.appearance}\n`;
        if (char.personality) desc += `- ${char.personality}\n`;
        if (char.relationships && char.relationships.length > 0) {
          desc += `- Relationships: ${char.relationships.map(rel => `${rel.type} of ${rel.characterName}`).join(', ')}\n`;
        }
        return desc;
      })
      .join('\n');

    const prompt = `You are writing Episode ${episodeNumber} of a consistent series.

CHARACTERS:
${characterDescriptions}

WORLD RULES:
${worldRules}

TASK:
Generate a ${Math.floor(targetDuration / 60)}-minute episode (~${wordCount} words).
${sceneCount}–${sceneCount + 2} scenes.
${narrationDialogueRatio} narration/dialogue ratio.
Language: ${language}.
Platform format: ${platformFormat}.
Ending: ${endingGoal}.

SITUATION:
${situation}

DESIRED TONE:
${desiredTone}

Please generate a complete script with:
1. Scene headings (INT./EXT. LOCATION - TIME)
2. Action descriptions
3. Character dialogue
4. Clear emotional arc that leads to the specified ending
5. Consistent character voices based on their personalities

Format the output as a clean, readable script.`;

    return this.openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a professional scriptwriter specializing in character-driven episodic content. Write engaging, emotionally resonant scripts that maintain character consistency across episodes."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2500,
      temperature: 0.7,
    });
  }

  generateImage(character, sceneDescription, stylePrompt = "") {
    const imagePrompt = `Create an image for a character-based video series.

CHARACTER: ${character.name}
Appearance: ${character.appearance || 'Modern casual wear'}
Personality: ${character.personality || 'Friendly and approachable'}

SCENE: ${sceneDescription}

STYLE: ${stylePrompt || 'Modern digital illustration, clean lines, vibrant colors, anime-inspired but realistic proportions, suitable for social media content'}

Requirements:
- Character should be clearly recognizable
- Emotion should match the scene context
- Clean background with subtle environmental details
- High quality, professional illustration style
- Consistent character design across images`;

    return this.openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024",
      style: "vivid",
    });
  }

  generateVoice(text, voiceCharacter = "alloy") {
    // Map character personalities to appropriate voice types
    const voiceMap = {
      'confident': 'onyx',
      'calm': 'alloy',
      'energetic': 'echo',
      'friendly': 'fable',
      'serious': 'onyx',
      'gentle': 'alloy',
      'analytical': 'shimmer'
    };

    let selectedVoice = voiceCharacter;
    if (character.personality) {
      const personality = character.personality.toLowerCase();
      for (const [trait, voice] of Object.entries(voiceMap)) {
        if (personality.includes(trait)) {
          selectedVoice = voice;
          break;
        }
      }
    }

    return this.openai.audio.speech.create({
      model: "tts-1",
      voice: selectedVoice,
      input: text,
      response_format: "mp3",
    });
  }

  async generateEpisodeAssets(episodeData) {
    try {
      // Generate script
      const scriptResponse = await this.generateScript(episodeData);
      const script = scriptResponse.choices[0].message.content;

      // Parse script into scenes for image generation
      const scenes = this.parseScriptIntoScenes(script);
      
      // Generate images for key scenes
      const imagePromises = [];
      episodeData.selectedCharacters.forEach(characterId => {
        const character = episodeData.characters.find(c => c._id === characterId);
        if (character && scenes.length > 0) {
          // Generate image for first scene featuring this character
          const firstScene = scenes.find(scene => 
            scene.dialogue.some(dialogue => dialogue.character === character.name)
          );
          if (firstScene) {
            imagePromises.push(
              this.generateImage(character, firstScene.description, episodeData.worldRules)
            );
          }
        }
      });

      const imageResponses = await Promise.all(imagePromises);
      const images = imageResponses.map(response => response.data[0].url);

      // Generate voice samples for character lines
      const voicePromises = [];
      scenes.forEach(scene => {
        scene.dialogue.forEach(dialogue => {
          const character = episodeData.characters.find(c => c.name === dialogue.character);
          if (character) {
            voicePromises.push(
              this.generateVoice(dialogue.text, character)
            );
          }
        });
      });

      const voiceResponses = await Promise.all(voicePromises);
      const voices = voiceResponses.map(response => response.url);

      return {
        script,
        scenes,
        images,
        voices,
        metadata: {
          episodeNumber: episodeData.episodeNumber,
          duration: episodeData.targetDuration,
          language: episodeData.language,
          platformFormat: episodeData.platformFormat
        }
      };

    } catch (error) {
      console.error('Error generating episode assets:', error);
      throw new Error('Failed to generate episode assets');
    }
  }

  parseScriptIntoScenes(script) {
    const scenes = [];
    const lines = script.split('\n');
    let currentScene = null;
    let sceneNumber = 1;

    lines.forEach(line => {
      line = line.trim();
      
      // Scene heading detection
      if (line.match(/^(INT\.|EXT\.)/i)) {
        if (currentScene) {
          scenes.push(currentScene);
        }
        currentScene = {
          number: sceneNumber++,
          heading: line,
          description: '',
          dialogue: []
        };
      }
      // Action/description lines
      else if (currentScene && !line.match(/^[A-Z]+:$|^\(/) && line) {
        currentScene.description += line + ' ';
      }
      // Character dialogue
      else if (currentScene && line.match(/^[A-Z]+:$/)) {
        const character = line.replace(':', '');
        currentScene.dialogue.push({
          character,
          text: ''
        });
      }
      // Dialogue text
      else if (currentScene && currentScene.dialogue.length > 0 && line) {
        currentScene.dialogue[currentScene.dialogue.length - 1].text += line + ' ';
      }
    });

    if (currentScene) {
      scenes.push(currentScene);
    }

    return scenes;
  }
}

module.exports = new AIService();
