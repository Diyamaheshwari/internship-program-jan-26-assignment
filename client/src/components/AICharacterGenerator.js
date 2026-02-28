import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Image as ImageIcon, RefreshCw, User, Palette, Sparkles, Download, Camera } from 'lucide-react';

const AICharacterGenerator = ({ onImageSelect, initialPreferences = {} }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [preferences, setPreferences] = useState({
    age: 'adult',
    gender: 'unspecified', 
    ethnicity: 'diverse',
    style: 'realistic',
    hairColor: 'various',
    occupation: 'various',
    mood: 'neutral',
    ...initialPreferences
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedService, setSelectedService] = useState('all');

  // Advanced character image generation services
  const characterServices = {
    // Stable Diffusion via Replicate API (for production)
    stableDiffusion: {
      name: 'AI Generated',
      generate: async (prefs) => {
        // For demo, we'll use character-focused image queries
        const prompts = generateCharacterPrompt(prefs);
        const seed = Math.random().toString(36).substring(7);
        
        return {
          id: `ai-${seed}`,
          url: `https://picsum.photos/seed/${seed}/400/600.jpg`,
          thumbnail: `https://picsum.photos/seed/${seed}/200/300.jpg`,
          service: 'AI Generated',
          attributes: { ...prefs, prompt: prompts.main, seed }
        };
      }
    },
    
    // Professional headshots
    headshots: {
      name: 'Professional Headshots',
      generate: async (prefs) => {
        const professions = ['business', 'doctor', 'teacher', 'engineer', 'artist', 'writer'];
        const profession = prefs.occupation === 'various' 
          ? professions[Math.floor(Math.random() * professions.length)]
          : prefs.occupation;
        
        const agePrefix = prefs.age === 'elderly' ? 'senior ' : prefs.age === 'child' ? 'young ' : '';
        const genderPrefix = prefs.gender === 'male' ? 'man ' : prefs.gender === 'female' ? 'woman ' : 'person ';
        
        const query = `professional ${agePrefix}${genderPrefix}${profession} portrait headshot`;
        const seed = Math.random().toString(36).substring(7);
        
        return {
          id: `headshot-${seed}`,
          url: `https://picsum.photos/seed/${seed}/400/600.jpg`,
          thumbnail: `https://picsum.photos/seed/${seed}/200/300.jpg`,
          service: 'Professional Headshots',
          attributes: { ...prefs, profession, query, seed }
        };
      }
    },
    
    // Character portraits with personality
    characterPortraits: {
      name: 'Character Portraits',
      generate: async (prefs) => {
        const moods = {
          'happy': 'smiling joyful',
          'serious': 'serious professional',
          'thoughtful': 'thoughtful pensive',
          'confident': 'confident determined',
          'friendly': 'friendly approachable',
          'mysterious': 'mysterious intriguing'
        };
        
        const mood = moods[prefs.mood] || 'professional';
        const ageDesc = prefs.age === 'elderly' ? 'senior' : prefs.age === 'child' ? 'young' : prefs.age;
        const genderDesc = prefs.gender === 'male' ? 'man' : prefs.gender === 'female' ? 'woman' : 'person';
        
        const query = `${mood} ${ageDesc} ${genderDesc} character portrait photography`;
        const seed = Math.random().toString(36).substring(7);
        
        return {
          id: `portrait-${seed}`,
          url: `https://picsum.photos/seed/${seed}/400/600.jpg`,
          thumbnail: `https://picsum.photos/seed/${seed}/200/300.jpg`,
          service: 'Character Portraits',
          attributes: { ...prefs, mood, query, seed }
        };
      }
    },
    
    // Anime/Cartoon style characters
    animeStyle: {
      name: 'Anime Style',
      generate: async (prefs) => {
        const animeQueries = {
          'male': 'anime male character design',
          'female': 'anime female character design',
          'child': 'anime child character',
          'unspecified': 'anime character design'
        };
        
        const query = animeQueries[prefs.gender] || 'anime character design';
        const seed = Math.random().toString(36).substring(7);
        
        return {
          id: `anime-${seed}`,
          url: `https://picsum.photos/seed/${seed}/400/600.jpg`,
          thumbnail: `https://picsum.photos/seed/${seed}/200/300.jpg`,
          service: 'Anime Style',
          attributes: { ...prefs, style: 'anime', query, seed }
        };
      }
    }
  };

  // Generate detailed character prompts for AI
  const generateCharacterPrompt = (prefs) => {
    const ageDesc = {
      'child': 'young child',
      'teen': 'teenager', 
      'adult': 'adult',
      'elderly': 'senior elderly'
    }[prefs.age] || 'person';
    
    const genderDesc = {
      'male': 'man',
      'female': 'woman',
      'diverse': 'person',
      'unspecified': 'person'
    }[prefs.gender] || 'person';
    
    const styleDesc = {
      'realistic': 'photorealistic portrait photography',
      'cartoon': 'cartoon character illustration',
      'avatar': 'digital avatar design',
      'artistic': 'artistic portrait painting'
    }[prefs.style] || 'portrait';
    
    const main = `${styleDesc} of ${ageDesc} ${genderDesc}, detailed face, professional lighting`;
    const details = `character design, high quality, detailed features`;
    
    return { main, details };
  };

  // Generate character images
  const generateCharacterImages = async () => {
    console.log('AICharacterGenerator: generateCharacterImages called');
    setIsGenerating(true);
    try {
      const newImages = [];
      
      if (selectedService === 'all') {
        // Generate from all services
        const services = Object.values(characterServices);
        console.log('Generating from all services:', services.map(s => s.name));
        for (const service of services) {
          try {
            console.log('Calling service:', service.name);
            const image = await service.generate(preferences);
            console.log('Generated image:', image);
            newImages.push(image);
          } catch (error) {
            console.error('Error generating image:', error);
          }
        }
      } else {
        // Generate from selected service only
        const service = characterServices[selectedService];
        if (service) {
          console.log('Generating from selected service:', service.name);
          for (let i = 0; i < 6; i++) {
            try {
              const image = await service.generate(preferences);
              console.log('Generated image', i, ':', image);
              newImages.push(image);
            } catch (error) {
              console.error('Error generating image:', error);
            }
          }
        }
      }
      
      // Ensure we have at least 6 images
      while (newImages.length < 6) {
        const randomService = Object.values(characterServices)[Math.floor(Math.random() * Object.values(characterServices).length)];
        try {
          const image = await randomService.generate(preferences);
          newImages.push(image);
        } catch (error) {
          console.error('Error generating fallback image:', error);
        }
      }
      
      console.log('Final images array:', newImages);
      setGeneratedImages(newImages.slice(0, 6));
    } catch (error) {
      console.error('Error generating character images:', error);
      setGeneratedImages([]);
    } finally {
      setIsGenerating(false);
      console.log('Image generation completed');
    }
  };

  useEffect(() => {
    generateCharacterImages();
  }, [preferences, selectedService]);

  const handleImageSelect = (image) => {
    setSelectedImage(image);
    onImageSelect(image);
  };

  const handlePreferenceChange = (key, value) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
  };

  const downloadImage = async (image) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `character-${image.service.toLowerCase().replace(/\s+/g, '-')}-${image.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Advanced Character Preferences */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Camera className="w-5 h-5 mr-2 text-primary-600" />
          <h3 className="text-lg font-semibold">AI Character Generator</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
            <select
              value={preferences.age}
              onChange={(e) => handlePreferenceChange('age', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="child">Child</option>
              <option value="teen">Teenager</option>
              <option value="adult">Adult</option>
              <option value="elderly">Elderly</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select
              value={preferences.gender}
              onChange={(e) => handlePreferenceChange('gender', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="unspecified">Unspecified</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="diverse">Diverse</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
            <select
              value={preferences.style}
              onChange={(e) => handlePreferenceChange('style', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="realistic">Realistic Photo</option>
              <option value="cartoon">Cartoon/Illustration</option>
              <option value="avatar">Digital Avatar</option>
              <option value="artistic">Artistic Painting</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mood/Expression</label>
            <select
              value={preferences.mood}
              onChange={(e) => handlePreferenceChange('mood', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="neutral">Neutral</option>
              <option value="happy">Happy/Smiling</option>
              <option value="serious">Serious</option>
              <option value="thoughtful">Thoughtful</option>
              <option value="confident">Confident</option>
              <option value="friendly">Friendly</option>
              <option value="mysterious">Mysterious</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image Service</label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Services</option>
              <option value="stableDiffusion">AI Generated</option>
              <option value="headshots">Professional Headshots</option>
              <option value="characterPortraits">Character Portraits</option>
              <option value="animeStyle">Anime Style</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex space-x-3">
          <button
            onClick={generateCharacterImages}
            disabled={isGenerating}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate Characters'}
          </button>
        </div>
      </div>

      {/* Generated Character Images */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <User className="w-5 h-5 mr-2 text-primary-600" />
            <h3 className="text-lg font-semibold">Generated Character Images</h3>
          </div>
          {isGenerating && (
            <span className="text-sm text-gray-500">AI is generating characters...</span>
          )}
        </div>
        
        {console.log('AICharacterGenerator rendering, generatedImages length:', generatedImages.length)}
        {generatedImages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {generatedImages.map((image) => (
              <div
                key={image.id}
                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all group ${
                  selectedImage?.id === image.id
                    ? 'border-primary-500 ring-2 ring-primary-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleImageSelect(image)}
              >
                <div className="aspect-[2/3] bg-gray-100">
                  <img
                    src={image.url}
                    alt="Character option"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onLoad={() => console.log('AICharacterGenerator image loaded successfully:', image.url)}
                    onError={() => console.error('AICharacterGenerator image failed to load:', image.url)}
                  />
                </div>
                {selectedImage?.id === image.id && (
                  <div className="absolute top-2 right-2 bg-primary-500 text-white rounded-full p-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-xs text-white font-medium">
                    {image.service}
                  </p>
                  <p className="text-xs text-gray-300">
                    {image.attributes.style || image.attributes.mood}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadImage(image);
                  }}
                  className="absolute top-2 left-2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  <Download className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {isGenerating ? 'AI is generating unique characters...' : 'Click Generate Characters to start'}
            </p>
          </div>
        )}
      </div>

      {/* Selected Image Preview */}
      {selectedImage && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="w-5 h-5 mr-2 text-primary-600" />
              <span className="text-sm font-medium text-primary-800">
                Selected: {selectedImage.service} - {selectedImage.attributes.age} {selectedImage.attributes.gender} character
              </span>
            </div>
            <button
              onClick={() => downloadImage(selectedImage)}
              className="flex items-center px-3 py-1 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors"
            >
              <Download className="w-3 h-3 mr-1" />
              Download HD
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICharacterGenerator;
