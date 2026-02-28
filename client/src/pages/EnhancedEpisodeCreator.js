import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useSeries } from '../contexts/SeriesContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  Save, 
  Users, 
  Film, 
  Clock,
  Target,
  Sparkles,
  Settings,
  Globe,
  Mic,
  Image,
  Video
} from 'lucide-react';

// Helper function to map tone values to enum
const mapToneToEnum = (tone) => {
  const toneMap = {
    'emotional': 'serious',
    'humorous': 'light-hearted',
    'tense': 'dark',
    'inspirational': 'inspirational',
    'whimsical': 'whimsical',
    'serious': 'serious',
    'light-hearted': 'light-hearted',
    'dark': 'dark',
    'whimsical': 'whimsical',
    'inspirational': 'inspirational'
  };
  return toneMap[tone?.toLowerCase()] || 'serious';
};

const EnhancedEpisodeCreator = () => {
  const params = useParams();
  const seriesId = params.seriesId;
  const navigate = useNavigate();
  const { characters, currentSeries, fetchCharacters, fetchSeriesById, createEpisode } = useSeries();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm();

  const watchedValues = watch();

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchCharacters(seriesId),
        fetchSeriesById(seriesId)
      ]);
      setLoading(false);
    };
    loadData();
  }, [seriesId]);

  const handleCharacterToggle = (characterId) => {
    setSelectedCharacters(prev => {
      if (prev.includes(characterId)) {
        return prev.filter(id => id !== characterId);
      } else {
        return [...prev, characterId];
      }
    });
  };

  const onSubmit = async (data) => {
    if (selectedCharacters.length === 0) {
      alert('Please select at least one character for this episode.');
      return;
    }

    setIsSubmitting(true);
    try {
      // First create the episode
      const episodeData = {
        title: data.title,
        series: seriesId,
        creator: user._id, // Add the creator field
        episodeNumber: parseInt(data.episodeNumber) || 1,
        storyPrompt: {
          situation: data.situation,
          conflict: '', // Not in form, using empty string
          resolution: data.endingGoal || '', // Using endingGoal as resolution
          goal: data.endingGoal || '' // Required field
        },
        style: {
          genre: 'drama', // Default genre since not in form (must be from enum)
          tone: mapToneToEnum(data.desiredTone) // Map to valid enum values
        },
        duration: {
          target: parseInt(data.targetDuration) || 300
        },
        format: {
          aspectRatio: data.platformFormat || '16:9'
        },
        narrationRatio: 0.3, // Default since form uses ratio string
        language: data.language || 'English',
        characters: selectedCharacters.map(id => ({ character: id, role: 'supporting', importance: 5 }))
      };

      console.log('🚀 Enhanced Episode Creator - Submitting episode data:', JSON.stringify(episodeData, null, 2));
      console.log('👥 Selected characters:', selectedCharacters);
      console.log('👤 User:', user);

      const episodeResponse = await createEpisode(episodeData);
      
      if (episodeResponse.success) {
        // Then generate AI content
        await generateAIContent(episodeResponse.data._id, data);
      }
    } catch (error) {
      console.error('Error creating episode:', error);
      alert('Failed to create episode. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateAIContent = async (episodeId, formData) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/scripts/generate-enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          seriesId,
          situation: formData.situation,
          selectedCharacters,
          desiredTone: formData.desiredTone,
          endingGoal: formData.endingGoal,
          language: formData.language,
          narrationDialogueRatio: formData.narrationDialogueRatio,
          platformFormat: formData.platformFormat,
          targetDuration: parseInt(formData.targetDuration),
          episodeNumber: formData.episodeNumber || 1
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        setGeneratedContent(result);
        alert('Episode content generated successfully!');
        navigate(`/episodes/${episodeId}`);
      } else {
        throw new Error(result.message || 'Failed to generate content');
      }
    } catch (error) {
      console.error('Error generating AI content:', error);
      alert('Failed to generate AI content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/series/${seriesId}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Episode</h1>
            <p className="text-gray-600">AI-Powered Episode Generation</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Film className="w-5 h-5 mr-2 text-primary-600" />
            <h2 className="text-xl font-semibold">Basic Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Episode Title *
              </label>
              <input
                {...register('title', { required: 'Episode title is required' })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter episode title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Episode Number *
              </label>
              <input
                {...register('episodeNumber', { required: 'Episode number is required' })}
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="1"
              />
              {errors.episodeNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.episodeNumber.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Character Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Users className="w-5 h-5 mr-2 text-primary-600" />
            <h2 className="text-xl font-semibold">Character Selection</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map((character) => (
              <div
                key={character._id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedCharacters.includes(character._id)
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleCharacterToggle(character._id)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{character.name}</h3>
                  <input
                    type="checkbox"
                    checked={selectedCharacters.includes(character._id)}
                    onChange={() => handleCharacterToggle(character._id)}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {character.age && `Age ${character.age}`}
                  {character.personality && ` • ${character.personality}`}
                </p>
              </div>
            ))}
          </div>
          
          {selectedCharacters.length === 0 && (
            <p className="mt-2 text-sm text-amber-600">Please select at least one character</p>
          )}
        </div>

        {/* Episode Prompt */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Sparkles className="w-5 h-5 mr-2 text-primary-600" />
            <h2 className="text-xl font-semibold">Episode Prompt</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Situation *
              </label>
              <textarea
                {...register('situation', { required: 'Situation is required' })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Describe the situation or conflict for this episode..."
              />
              {errors.situation && (
                <p className="mt-1 text-sm text-red-600">{errors.situation.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desired Tone *
              </label>
              <input
                {...register('desiredTone', { required: 'Desired tone is required' })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Emotional, Humorous, Tense, Inspirational"
              />
              {errors.desiredTone && (
                <p className="mt-1 text-sm text-red-600">{errors.desiredTone.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ending Goal *
              </label>
              <input
                {...register('endingGoal', { required: 'Ending goal is required' })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., They reconcile emotionally, The mystery is solved, They achieve their goal"
              />
              {errors.endingGoal && (
                <p className="mt-1 text-sm text-red-600">{errors.endingGoal.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Output Preferences */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Settings className="w-5 h-5 mr-2 text-primary-600" />
            <h2 className="text-xl font-semibold">Output Preferences</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="w-4 h-4 inline mr-1" />
                Language
              </label>
              <select
                {...register('language')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="Hindi">Hindi</option>
                <option value="Mandarin">Mandarin</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mic className="w-4 h-4 inline mr-1" />
                Narration/Dialogue
              </label>
              <select
                {...register('narrationDialogueRatio')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="10/90">10% Narration / 90% Dialogue</option>
                <option value="20/80">20% Narration / 80% Dialogue</option>
                <option value="30/70">30% Narration / 70% Dialogue</option>
                <option value="40/60">40% Narration / 60% Dialogue</option>
                <option value="50/50">50% Narration / 50% Dialogue</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Video className="w-4 h-4 inline mr-1" />
                Platform Format
              </label>
              <select
                {...register('platformFormat')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="16:9">16:9 (YouTube)</option>
                <option value="9:16">9:16 (TikTok/Reels)</option>
                <option value="1:1">1:1 (Instagram)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Duration (seconds)
              </label>
              <input
                {...register('targetDuration')}
                type="number"
                min="60"
                max="600"
                defaultValue="300"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Generation Status */}
        {isGenerating && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="loading-spinner mr-3"></div>
              <div>
                <h3 className="font-medium text-blue-900">Generating Episode Content</h3>
                <p className="text-blue-700 text-sm">AI is creating your script, images, and voice assets...</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(`/series/${seriesId}`)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isGenerating || selectedCharacters.length === 0}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isSubmitting || isGenerating ? (
              <>
                <div className="loading-spinner w-4 h-4 mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Create & Generate Episode
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnhancedEpisodeCreator;
