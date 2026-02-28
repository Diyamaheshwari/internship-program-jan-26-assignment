import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useSeries } from '../contexts/SeriesContext';
import AICharacterGenerator from '../components/AICharacterGenerator';
import { 
  ArrowLeft, 
  Save, 
  User,
  Heart,
  MessageCircle,
  Star,
  Plus,
  Trash2
} from 'lucide-react';

const CreateCharacter = () => {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const { currentSeries, fetchSeriesById, createCharacter } = useSeries();
  const [loading, setLoading] = useState(false);
  const [relationships, setRelationships] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreferences, setImagePreferences] = useState({});
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  useEffect(() => {
    if (seriesId) {
      fetchSeriesById(seriesId);
    }
  }, [seriesId, fetchSeriesById]);

  const addRelationship = () => {
    setRelationships([...relationships, { type: 'friend', characterName: '', description: '' }]);
  };

  const removeRelationship = (index) => {
    setRelationships(relationships.filter((_, i) => i !== index));
  };

  const updateRelationship = (index, field, value) => {
    const updated = [...relationships];
    updated[index][field] = value;
    setRelationships(updated);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Transform form data to match backend model structure
      const characterData = {
        name: data.name,
        series: seriesId,
        appearance: {
          age: parseInt(data.age),
          clothingStyle: data.appearance,
          gender: imagePreferences.gender || 'other'
        },
        personality: {
          traits: data.personality ? [data.personality] : ['kind'], // Use valid enum value
          speakingStyle: {
            vocabulary: 'average',
            speed: 'normal',
            tone: 'calm',
            accent: data.speakingStyle || 'neutral'
          }
        },
        background: data.background,
        notes: data.notes,
        referenceImages: selectedImage ? [{
          url: selectedImage.url,
          description: `Generated character image with attributes: ${Object.entries(selectedImage.attributes)
            .filter(([key, value]) => value && key !== 'seed')
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ')}`,
          isPrimary: true
        }] : [],
        relationships: relationships.map(rel => ({
          type: rel.type,
          description: rel.description,
          characterName: rel.characterName
        }))
      };

      const result = await createCharacter(characterData);
      
      if (result.success) {
        navigate(`/series/${seriesId}/characters`);
      }
    } catch (error) {
      console.error('Error creating character:', error);
      alert('Failed to create character. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (image) => {
    setSelectedImage(image);
    setImagePreferences(image.attributes);
  };

  if (!currentSeries) {
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
            onClick={() => navigate(`/series/${seriesId}/characters`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Character</h1>
            <p className="text-gray-600">Add a new character to {currentSeries.title}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* AI Character Image Generation */}
        <div className="bg-white rounded-lg shadow p-6">
          <AICharacterGenerator 
            onImageSelect={handleImageSelect}
            initialPreferences={imagePreferences}
          />
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 mr-2 text-primary-600" />
            <h2 className="text-xl font-semibold">Basic Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Character Name *
              </label>
              <input
                {...register('name', { required: 'Character name is required' })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter character name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age *
              </label>
              <input
                {...register('age', { required: 'Age is required' })}
                type="number"
                min="1"
                max="120"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter character age"
              />
              {errors.age && (
                <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Appearance *
            </label>
            <textarea
              {...register('appearance', { required: 'Appearance is required' })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Describe the character's appearance (clothing, physical features, etc.)"
            />
            {errors.appearance && (
              <p className="mt-1 text-sm text-red-600">{errors.appearance.message}</p>
            )}
          </div>
        </div>

        {/* Personality */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Heart className="w-5 h-5 mr-2 text-primary-600" />
            <h2 className="text-xl font-semibold">Personality</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personality Traits *
              </label>
              <select
                {...register('personality', { required: 'Personality is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select personality trait</option>
                <option value="brave">Brave</option>
                <option value="kind">Kind</option>
                <option value="funny">Funny</option>
                <option value="serious">Serious</option>
                <option value="intelligent">Intelligent</option>
                <option value="loyal">Loyal</option>
                <option value="ambitious">Ambitious</option>
                <option value="optimistic">Optimistic</option>
                <option value="curious">Curious</option>
                <option value="adventurous">Adventurous</option>
              </select>
              {errors.personality && (
                <p className="mt-1 text-sm text-red-600">{errors.personality.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Speaking Style *
              </label>
              <textarea
                {...register('speakingStyle', { required: 'Speaking style is required' })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="How does this character talk? (formal, casual, fast, slow, accent, etc.)"
              />
              {errors.speakingStyle && (
                <p className="mt-1 text-sm text-red-600">{errors.speakingStyle.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Story *
              </label>
              <textarea
                {...register('background', { required: 'Background story is required' })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Character's history, motivations, and life experiences"
              />
              {errors.background && (
                <p className="mt-1 text-sm text-red-600">{errors.background.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Relationships */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-primary-600" />
              <h2 className="text-xl font-semibold">Relationships</h2>
            </div>
            <button
              type="button"
              onClick={addRelationship}
              className="flex items-center px-3 py-1 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Relationship
            </button>
          </div>
          
          <div className="space-y-3">
            {relationships.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No relationships added yet. Click "Add Relationship" to get started.
              </p>
            ) : (
              relationships.map((rel, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md">
                  <select
                    value={rel.type}
                    onChange={(e) => updateRelationship(index, 'type', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="friend">Friend</option>
                    <option value="rival">Rival</option>
                    <option value="mentor">Mentor</option>
                    <option value="family">Family</option>
                    <option value="love">Love Interest</option>
                  </select>
                  
                  <input
                    type="text"
                    value={rel.characterName}
                    onChange={(e) => updateRelationship(index, 'characterName', e.target.value)}
                    placeholder="Character name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                  
                  <input
                    type="text"
                    value={rel.description}
                    onChange={(e) => updateRelationship(index, 'description', e.target.value)}
                    placeholder="Relationship description"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                  
                  <button
                    type="button"
                    onClick={() => removeRelationship(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Additional Notes */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Star className="w-5 h-5 mr-2 text-primary-600" />
            <h2 className="text-xl font-semibold">Additional Notes</h2>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Character Notes
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Any additional notes about the character (hobbies, skills, secrets, etc.)"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(`/series/${seriesId}/characters`)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {loading ? (
              <>
                <div className="loading-spinner w-4 h-4 mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Character
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCharacter;
