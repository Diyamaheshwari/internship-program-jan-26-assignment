import React, { useEffect, useState } from 'react';
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
  Sparkles
} from 'lucide-react';

const EpisodeCreator = () => {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const { characters, currentSeries, fetchCharacters, fetchSeriesById, createEpisode } = useSeries();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm();

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
    console.log('Episode creation data:', data);
    console.log('Selected characters:', selectedCharacters);
    
    if (selectedCharacters.length === 0) {
      alert('Please select at least one character for this episode.');
      return;
    }

    setIsSubmitting(true);
    
    const episodeData = {
      ...data,
      series: seriesId,
      creator: user._id, // Add the creator field
      characters: selectedCharacters.map(charId => ({
        character: charId,
        role: 'supporting',
        importance: 5
      }))
    };

    console.log('📤 Submitting episode data:', JSON.stringify(episodeData, null, 2));
    const result = await createEpisode(episodeData);
    console.log('Create episode result:', result);
    
    if (result.success) {
      navigate(`/episodes/${result.data._id}`);
    }
    setIsSubmitting(false);
  };

  const getGenreColor = (genre) => {
    const colors = {
      comedy: 'bg-yellow-100 text-yellow-800',
      drama: 'bg-blue-100 text-blue-800',
      motivational: 'bg-green-100 text-green-800',
      'slice-of-life': 'bg-purple-100 text-purple-800',
      educational: 'bg-indigo-100 text-indigo-800',
      thriller: 'bg-red-100 text-red-800'
    };
    return colors[genre] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!currentSeries) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Series not found</h2>
        <button
          onClick={() => navigate('/series')}
          className="text-primary-600 hover:text-primary-500"
        >
          Back to Series
        </button>
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
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back to Series
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Episode</h1>
            <p className="text-gray-600 mt-1">
              Series: {currentSeries.title}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getGenreColor(currentSeries.genre)}`}>
            {currentSeries.genre}
          </span>
          <span className="text-gray-500">
            {currentSeries.targetDuration}s duration
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Film className="w-6 h-6 mr-2 text-primary-600" />
              Episode Details
            </h2>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Episode Title *
              </label>
              <input
                {...register('title', {
                  required: 'Title is required',
                  maxLength: {
                    value: 200,
                    message: 'Title must be less than 200 characters'
                  }
                })}
                type="text"
                className={`w-full px-3 py-2 border ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                placeholder="Enter episode title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
          </div>

          {/* Story Prompt */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Sparkles className="w-6 h-6 mr-2 text-primary-600" />
              Story Prompt
            </h2>
            
            <div>
              <label htmlFor="storyPrompt.situation" className="block text-sm font-medium text-gray-700 mb-2">
                Situation *
              </label>
              <textarea
                {...register('storyPrompt.situation', {
                  required: 'Situation is required',
                  maxLength: {
                    value: 500,
                    message: 'Situation must be less than 500 characters'
                  }
                })}
                rows={3}
                className={`w-full px-3 py-2 border ${
                  errors['storyPrompt.situation'] ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                placeholder="Describe the initial situation or setup of the episode..."
              />
              {errors['storyPrompt.situation'] && (
                <p className="mt-1 text-sm text-red-600">{errors['storyPrompt.situation'].message}</p>
              )}
            </div>

            <div>
              <label htmlFor="storyPrompt.conflict" className="block text-sm font-medium text-gray-700 mb-2">
                Conflict
              </label>
              <textarea
                {...register('storyPrompt.conflict', {
                  maxLength: {
                    value: 500,
                    message: 'Conflict must be less than 500 characters'
                  }
                })}
                rows={3}
                className={`w-full px-3 py-2 border ${
                  errors['storyPrompt.conflict'] ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                placeholder="Describe the main conflict or challenge..."
              />
              {errors['storyPrompt.conflict'] && (
                <p className="mt-1 text-sm text-red-600">{errors['storyPrompt.conflict'].message}</p>
              )}
            </div>

            <div>
              <label htmlFor="storyPrompt.resolution" className="block text-sm font-medium text-gray-700 mb-2">
                Resolution
              </label>
              <textarea
                {...register('storyPrompt.resolution', {
                  maxLength: {
                    value: 500,
                    message: 'Resolution must be less than 500 characters'
                  }
                })}
                rows={3}
                className={`w-full px-3 py-2 border ${
                  errors['storyPrompt.resolution'] ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                placeholder="Describe how the situation resolves..."
              />
              {errors['storyPrompt.resolution'] && (
                <p className="mt-1 text-sm text-red-600">{errors['storyPrompt.resolution'].message}</p>
              )}
            </div>

            <div>
              <label htmlFor="storyPrompt.goal" className="block text-sm font-medium text-gray-700 mb-2">
                Episode Goal
              </label>
              <input
                {...register('storyPrompt.goal', {
                  maxLength: {
                    value: 300,
                    message: 'Goal must be less than 300 characters'
                  }
                })}
                type="text"
                className={`w-full px-3 py-2 border ${
                  errors['storyPrompt.goal'] ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                placeholder="What should viewers learn or feel after watching?"
              />
              {errors['storyPrompt.goal'] && (
                <p className="mt-1 text-sm text-red-600">{errors['storyPrompt.goal'].message}</p>
              )}
            </div>
          </div>

          {/* Character Selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Users className="w-6 h-6 mr-2 text-primary-600" />
              Character Selection *
            </h2>
            
            {characters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedCharacters.includes(character._id)}
                        onChange={() => handleCharacterToggle(character._id)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      {character.referenceImages?.length > 0 ? (
                        <img
                          src={character.referenceImages[0].url}
                          alt={character.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{character.name}</h4>
                        {character.personality?.traits && character.personality.traits.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {character.personality.traits.slice(0, 2).map((trait, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                {trait}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">
                  No characters available. Add characters to your series first.
                </p>
                <button
                  onClick={() => navigate(`/series/${seriesId}/characters`)}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Manage Characters
                </button>
              </div>
            )}
            
            {selectedCharacters.length === 0 && (
              <p className="text-sm text-red-600">Please select at least one character for this episode.</p>
            )}
          </div>

          {/* Episode Settings */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Target className="w-6 h-6 mr-2 text-primary-600" />
              Episode Settings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="style.genre" className="block text-sm font-medium text-gray-700 mb-2">
                  Genre
                </label>
                <select
                  {...register('style.genre', { required: 'Genre is required' })}
                  defaultValue={currentSeries.genre}
                  className={`w-full px-3 py-2 border ${
                    errors['style.genre'] ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                >
                  <option value="comedy">Comedy</option>
                  <option value="drama">Drama</option>
                  <option value="motivational">Motivational</option>
                  <option value="slice-of-life">Slice of Life</option>
                  <option value="educational">Educational</option>
                  <option value="thriller">Thriller</option>
                </select>
                {errors['style.genre'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['style.genre'].message}</p>
                )}
              </div>

              <div>
                <label htmlFor="style.tone" className="block text-sm font-medium text-gray-700 mb-2">
                  Tone
                </label>
                <select
                  {...register('style.tone', { required: 'Tone is required' })}
                  defaultValue={currentSeries.tone}
                  className={`w-full px-3 py-2 border ${
                    errors['style.tone'] ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                >
                  <option value="light-hearted">Light-hearted</option>
                  <option value="serious">Serious</option>
                  <option value="dark">Dark</option>
                  <option value="whimsical">Whimsical</option>
                  <option value="inspirational">Inspirational</option>
                </select>
                {errors['style.tone'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['style.tone'].message}</p>
                )}
              </div>

              <div>
                <label htmlFor="duration.target" className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (seconds)
                </label>
                <input
                  {...register('duration.target', {
                    min: { value: 60, message: 'Duration must be at least 60 seconds' },
                    max: { value: 600, message: 'Duration must be less than 600 seconds' }
                  })}
                  type="number"
                  defaultValue={currentSeries.targetDuration}
                  className={`w-full px-3 py-2 border ${
                    errors['duration.target'] ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                />
                {errors['duration.target'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['duration.target'].message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(`/series/${seriesId}`)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="loading-spinner w-4 h-4 mr-2"></div>
                  Creating Episode...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Episode
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EpisodeCreator;
