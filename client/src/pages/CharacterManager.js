import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSeries } from '../contexts/SeriesContext';
import { 
  Users, 
  PlusCircle, 
  Edit, 
  Trash2, 
  ArrowLeft,
  User,
  Heart,
  MessageCircle,
  Star,
  Video
} from 'lucide-react';

const CharacterManager = () => {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const { characters, fetchCharacters, deleteCharacter, loading } = useSeries();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const loadCharacters = async () => {
      console.log('Loading characters for series:', seriesId);
      try {
        await fetchCharacters(seriesId);
        console.log('Characters loaded successfully');
      } catch (error) {
        console.error('Error loading characters:', error);
      }
    };
    
    if (seriesId) {
      loadCharacters();
    }
  }, [seriesId, fetchCharacters]);

  const filteredCharacters = useMemo(() => {
    if (!characters || !Array.isArray(characters)) return [];
    
    if (!debouncedSearchTerm) return characters;
    
    return characters.filter(char =>
      char.name && char.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [characters, debouncedSearchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this character? This action cannot be undone.')) {
      await deleteCharacter(id);
    }
  };

  // Skeleton component for loading state
  const CharacterSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>
        </div>
        <div className="flex space-x-1">
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="flex space-x-2">
          <div className="h-8 bg-gray-200 rounded flex-1 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded flex-1 animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  const getPersonalityColor = (trait) => {
    const colors = {
      brave: 'bg-red-100 text-red-800',
      kind: 'bg-green-100 text-green-800',
      funny: 'bg-yellow-100 text-yellow-800',
      serious: 'bg-blue-100 text-blue-800',
      intelligent: 'bg-purple-100 text-purple-800',
      loyal: 'bg-indigo-100 text-indigo-800'
    };
    return colors[trait] || 'bg-gray-100 text-gray-800';
  };

  const getRelationshipIcon = (type) => {
    const icons = {
      friend: <Heart className="w-4 h-4" />,
      rival: <Star className="w-4 h-4" />,
      mentor: <MessageCircle className="w-4 h-4" />
    };
    return icons[type] || <User className="w-4 h-4" />;
  };

  if (loading?.characters) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="space-y-1">
              <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>
          </div>
          <div className="w-40 h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Search Skeleton */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="max-w-md">
            <div className="h-5 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Characters Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <CharacterSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to={`/series/${seriesId}`}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back to Series
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Characters</h1>
            <p className="text-gray-600 mt-1">Manage your series characters</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/series/${seriesId}/characters/new`}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add Character
          </Link>
          <Link
            to={`/series/${seriesId}/generate-video`}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Video className="w-5 h-5 mr-2" />
            Generate Video
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Characters
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by character name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Characters Grid */}
      {filteredCharacters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCharacters.map((character) => (
            <div key={character._id} className="bg-white rounded-lg shadow-md card-hover">
              <div className="p-6">
                {/* Character Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {character.referenceImages?.length > 0 ? (
                      <img
                        src={character.referenceImages[0].url}
                        alt={character.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {character.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {character.appearance?.age && `${character.appearance.age} years old`}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => window.location.href = `/series/${seriesId}/characters/${character._id}/edit`}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(character._id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Personality Traits */}
                {character.personality?.traits && character.personality.traits.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Personality</h4>
                    <div className="flex flex-wrap gap-1">
                      {character.personality.traits.slice(0, 3).map((trait, index) => (
                        <span
                          key={index}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPersonalityColor(trait)}`}
                        >
                          {trait}
                        </span>
                      ))}
                      {character.personality.traits.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{character.personality.traits.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Speaking Style */}
                {character.personality?.speakingStyle && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Speaking Style</h4>
                    <div className="text-sm text-gray-600">
                      {character.personality.speakingStyle.vocabulary && (
                        <span className="mr-3">
                          {character.personality.speakingStyle.vocabulary} vocabulary
                        </span>
                      )}
                      {character.personality.speakingStyle.tone && (
                        <span className="mr-3">
                          {character.personality.speakingStyle.tone} tone
                        </span>
                      )}
                      {character.personality.speakingStyle.speed && (
                        <span>
                          {character.personality.speakingStyle.speed} pace
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Relationships */}
                {character.relationships && character.relationships.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Relationships</h4>
                    <div className="space-y-1">
                      {character.relationships.slice(0, 2).map((rel, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          {getRelationshipIcon(rel.type)}
                          <span className="ml-1 mr-2">{rel.type}</span>
                          <span className="truncate">
                            {rel.character?.name || 'Unknown Character'}
                          </span>
                        </div>
                      ))}
                      {character.relationships.length > 2 && (
                        <p className="text-xs text-gray-500">
                          +{character.relationships.length - 2} more relationships
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/series/${seriesId}/characters/${character._id}`)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors"
                  >
                    <User className="w-4 h-4 mr-1" />
                    View Details
                  </button>
                  <button
                    onClick={() => navigate(`/series/${seriesId}/characters/${character._id}/relationships`)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-secondary-600 text-white text-sm rounded-md hover:bg-secondary-700 transition-colors"
                  >
                    <Heart className="w-4 h-4 mr-1" />
                    Relationships
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No characters found' : 'No characters yet'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Start building your series by adding characters with unique personalities and relationships.'
            }
          </p>
          {!searchTerm && (
            <div className="flex space-x-3">
              <Link
                to={`/series/${seriesId}/characters/new`}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Your First Character
              </Link>
              <Link
                to={`/series/${seriesId}/generate-video`}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Video className="w-4 h-4 mr-2" />
                Generate Video
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Character Creation Tips */}
      {characters.length === 0 && !searchTerm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Character Creation Tips</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="font-bold mr-2">•</span>
              <span>Create characters with distinct personalities that will drive interesting stories</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">•</span>
              <span>Define relationships between characters to create natural conflicts and alliances</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">•</span>
              <span>Upload reference images to maintain visual consistency across episodes</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">•</span>
              <span>Set speaking styles and voice characteristics for audio generation</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default CharacterManager;
