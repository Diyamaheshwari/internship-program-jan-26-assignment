import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Image as ImageIcon, RefreshCw, User, Palette, Sparkles } from 'lucide-react';

const CharacterImageSelector = ({ onImageSelect, initialPreferences = {} }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [preferences, setPreferences] = useState({
    age: '',
    gender: '',
    style: '',
    hairColor: '',
    skinTone: '',
    ...initialPreferences
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Predefined character attributes for generation
  const attributeOptions = {
    age: ['child', 'teen', 'young-adult', 'adult', 'elderly'],
    gender: ['male', 'female', 'non-binary'],
    style: ['realistic', 'cartoon', 'anime', 'fantasy', 'modern', 'vintage'],
    hairColor: ['black', 'brown', 'blonde', 'red', 'gray', 'white', 'blue', 'green', 'purple'],
    skinTone: ['fair', 'light', 'medium', 'tan', 'dark', 'deep']
  };

  // Generate placeholder images based on preferences using server API
  const generateCharacterImages = useCallback(async () => {
    console.log('generateCharacterImages called');
    setIsGenerating(true);
    
    // Always generate fallback images first to ensure something shows immediately
    const fallbackImages = [];
    for (let i = 0; i < 6; i++) {
      const seed = `character-${Date.now()}-${i}-${Math.random()}`;
      console.log(`Creating fallback image ${i} with seed: ${seed}`);
      fallbackImages.push({
        id: seed,
        url: `https://picsum.photos/seed/${seed}/300/400.jpg`,
        thumbnail: `https://picsum.photos/seed/${seed}/150/200.jpg`,
        attributes: {
          ...preferences,
          seed: seed
        }
      });
    }
    console.log('Setting fallback images:', fallbackImages.length);
    setGeneratedImages(fallbackImages);
    
    // Try to enhance with server API
    try {
      console.log('Trying API call...');
      const response = await axios.get('/api/characters/images/seeds', {
        params: {
          count: 6,
          preferences: preferences
        }
      });
      
      const newImages = response.data.seeds.map(seed => ({
        id: seed,
        url: `https://picsum.photos/seed/${seed}/300/400.jpg`,
        thumbnail: `https://picsum.photos/seed/${seed}/150/200.jpg`,
        attributes: {
          ...preferences,
          seed: seed
        }
      }));
      
      console.log('API success, setting new images:', newImages.length);
      setGeneratedImages(newImages);
    } catch (error) {
      console.error('Error generating images with API, using fallback:', error);
      // Fallback images are already set, so we don't need to do anything here
    } finally {
      setIsGenerating(false);
      console.log('Image generation completed');
    }
  }, [preferences]);

  useEffect(() => {
    generateCharacterImages();
  }, [preferences, generateCharacterImages]);

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

  const handleCustomPreferenceSubmit = () => {
    generateCharacterImages();
  };

  return (
    <div className="space-y-6">
      {/* Preference Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Palette className="w-5 h-5 mr-2 text-primary-600" />
          <h3 className="text-lg font-semibold">Character Preferences</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(attributeOptions).map(([key, options]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <select
                value={preferences[key] || ''}
                onChange={(e) => handlePreferenceChange(key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Any {key}</option>
                {options.map(option => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex space-x-3">
          <button
            onClick={handleCustomPreferenceSubmit}
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
            Random Images
          </button>
        </div>
      </div>

      {/* Generated Images Grid */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <ImageIcon className="w-5 h-5 mr-2 text-primary-600" />
            <h3 className="text-lg font-semibold">Choose Character Image</h3>
          </div>
          {isGenerating && (
            <span className="text-sm text-gray-500">Generating images...</span>
          )}
        </div>
        
        {console.log('Rendering, generatedImages length:', generatedImages.length, generatedImages)}
        {generatedImages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
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
                <div className="aspect-[3/4] bg-gray-100">
                  <img
                    src={image.url}
                    alt="Character option"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onLoad={() => console.log('Image loaded successfully:', image.url)}
                    onError={() => console.error('Image failed to load:', image.url)}
                  />
                </div>
                {selectedImage?.id === image.id && (
                  <div className="absolute top-2 right-2 bg-primary-500 text-white rounded-full p-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className="p-2 bg-white">
                  <p className="text-xs text-gray-600 truncate">
                    {Object.entries(image.attributes)
                      .filter(([key, value]) => value && key !== 'seed')
                      .map(([key, value]) => `${value}`)
                      .join(' • ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {isGenerating ? 'Generating character images...' : 'No images generated yet'}
            </p>
          </div>
        )}
      </div>

      {/* Selected Image Preview */}
      {selectedImage && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-center">
            <ImageIcon className="w-5 h-5 mr-2 text-primary-600" />
            <span className="text-sm font-medium text-primary-800">
              Selected: Character image with attributes {Object.entries(selectedImage.attributes)
                .filter(([key, value]) => value && key !== 'seed')
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterImageSelector;
