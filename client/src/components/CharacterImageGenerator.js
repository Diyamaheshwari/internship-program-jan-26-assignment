import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Image as ImageIcon, RefreshCw, User, Palette, Sparkles, Download } from 'lucide-react';

const CharacterImageGenerator = ({ onImageSelect, initialPreferences = {} }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [preferences, setPreferences] = useState({
    age: 'adult',
    gender: 'unspecified',
    ethnicity: 'diverse',
    style: 'realistic',
    hairColor: 'various',
    ...initialPreferences
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Character-specific image generation using AI services or character-focused APIs
  const characterImageServices = {
    // ThisPersonDoesNotExist API - generates realistic human faces
    thisPersonDoesNotExist: {
      baseUrl: 'https://thispersondoesnotexist.com/',
      generate: async (prefs) => {
        // Generate random seed for consistent character
        const seed = Math.floor(Math.random() * 100000);
        return {
          id: `tpdne-${seed}`,
          url: `https://thispersondoesnotexist.com/face?seed=${seed}`,
          thumbnail: `https://thispersondoesnotexist.com/face?seed=${seed}`,
          service: 'ThisPersonDoesNotExist',
          attributes: { ...prefs, seed }
        };
      }
    },
    
    // Artbreeder-style generated characters
    artbreeder: {
      baseUrl: 'https://images.unsplash.com/',
      generate: async (prefs) => {
        const characterQueries = {
          'male-adult': 'portrait man professional headshot',
          'female-adult': 'portrait woman professional headshot', 
          'male-teen': 'portrait teenage boy',
          'female-teen': 'portrait teenage girl',
          'child': 'portrait child cute',
          'elderly': 'portrait elderly person'
        };
        
        const query = characterQueries[`${prefs.gender}-${prefs.age}`] || 'portrait person';
        const seed = Math.random().toString(36).substring(7);
        
        return {
          id: `unsplash-${seed}`,
          url: `https://source.unsplash.com/400x600/?${query}&seed=${seed}`,
          thumbnail: `https://source.unsplash.com/200x300/?${query}&seed=${seed}`,
          service: 'Unsplash Portraits',
          attributes: { ...prefs, query, seed }
        };
      }
    },
    
    // DiceBear API - generates avatar-style characters
    diceBear: {
      baseUrl: 'https://api.dicebear.com/',
      generate: async (prefs) => {
        const styles = {
          'male': 'adventurer',
          'female': 'adventurer-neutral', 
          'unspecified': 'bottts',
          'child': 'fun-emoji',
          'elderly': 'lorelei'
        };
        
        const style = styles[prefs.gender] || 'adventurer';
        const seed = Math.random().toString(36).substring(7);
        
        return {
          id: `dicebear-${seed}`,
          url: `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&size=400`,
          thumbnail: `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&size=200`,
          service: 'DiceBear Avatars',
          attributes: { ...prefs, style, seed }
        };
      }
    }
  };

  // Generate character images using multiple services
  const generateCharacterImages = async () => {
    setIsGenerating(true);
    try {
      const newImages = [];
      const services = Object.values(characterImageServices);
      
      // Generate 2 images from each service for variety
      for (const service of services) {
        for (let i = 0; i < 2; i++) {
          try {
            const image = await service.generate(preferences);
            newImages.push(image);
          } catch (error) {
            console.error('Error generating image:', error);
          }
        }
      }
      
      // If we didn't get enough images, add some fallback character images
      if (newImages.length < 6) {
        const fallbackImages = generateFallbackCharacterImages(6 - newImages.length);
        newImages.push(...fallbackImages);
      }
      
      setGeneratedImages(newImages.slice(0, 6)); // Limit to 6 images
    } catch (error) {
      console.error('Error generating character images:', error);
      // Fallback to placeholder character images
      setGeneratedImages(generateFallbackCharacterImages(6));
    } finally {
      setIsGenerating(false);
    }
  };

  // Fallback character image generation
  const generateFallbackCharacterImages = (count) => {
    const characterTypes = [
      { type: 'professional', query: 'business person portrait' },
      { type: 'casual', query: 'casual person portrait' },
      { type: 'artistic', query: 'artistic person portrait' },
      { type: 'formal', query: 'formal portrait person' },
      { type: 'friendly', query: 'friendly smile portrait' },
      { type: 'serious', query: 'serious portrait person' }
    ];
    
    return Array.from({ length: count }, (_, i) => {
      const charType = characterTypes[i % characterTypes.length];
      const seed = `character-${preferences.age}-${preferences.gender}-${Date.now()}-${i}`;
      
      return {
        id: seed,
        url: `https://source.unsplash.com/400x600/?${charType.query}&seed=${seed}`,
        thumbnail: `https://source.unsplash.com/200x300/?${charType.query}&seed=${seed}`,
        service: 'Character Portraits',
        attributes: { ...preferences, type: charType.type, seed }
      };
    });
  };

  useEffect(() => {
    generateCharacterImages();
  }, [preferences]);

  const handleImageSelect = (image) => {
    setSelectedImage(image);
    onImageSelect(image);
  };

  const handlePreferenceChange = (key, value) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
  };

  const regenerateImages = () => {
    generateCharacterImages();
  };

  const downloadImage = async (image) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `character-${image.id}.jpg`;
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
      {/* Character Preferences */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Palette className="w-5 h-5 mr-2 text-primary-600" />
          <h3 className="text-lg font-semibold">Character Preferences</h3>
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
              <option value="realistic">Realistic</option>
              <option value="cartoon">Cartoon/Anime</option>
              <option value="avatar">Avatar Style</option>
              <option value="artistic">Artistic</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex space-x-3">
          <button
            onClick={handlePreferenceChange}
            disabled={isGenerating}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate with Preferences
          </button>
          <button
            onClick={regenerateImages}
            disabled={isGenerating}
            className="flex items-center px-4 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            New Characters
          </button>
        </div>
      </div>

      {/* Generated Character Images */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <User className="w-5 h-5 mr-2 text-primary-600" />
            <h3 className="text-lg font-semibold">Choose Character Image</h3>
          </div>
          {isGenerating && (
            <span className="text-sm text-gray-500">Generating character images...</span>
          )}
        </div>
        
        {generatedImages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {generatedImages.map((image) => (
              <div
                key={image.id}
                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
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
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                {selectedImage?.id === image.id && (
                  <div className="absolute top-2 right-2 bg-primary-500 text-white rounded-full p-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-xs text-white font-medium">
                    {image.service}
                  </p>
                  <p className="text-xs text-gray-300">
                    {image.attributes.style || image.attributes.type}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadImage(image);
                  }}
                  className="absolute top-2 left-2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-1 opacity-0 hover:opacity-100 transition-opacity"
                >
                  <Download className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {isGenerating ? 'Generating character images...' : 'No character images generated yet'}
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
                Selected: {selectedImage.service} character ({selectedImage.attributes.age}, {selectedImage.attributes.gender})
              </span>
            </div>
            <button
              onClick={() => downloadImage(selectedImage)}
              className="flex items-center px-3 py-1 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors"
            >
              <Download className="w-3 h-3 mr-1" />
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterImageGenerator;
