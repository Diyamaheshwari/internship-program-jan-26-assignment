import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSeries } from '../contexts/SeriesContext';
import { 
  Film, 
  Users, 
  PlusCircle, 
  Edit, 
  ArrowLeft,
  Calendar,
  Clock,
  Globe,
  Play,
  Sparkles
} from 'lucide-react';

const SeriesDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentSeries, fetchSeriesById, fetchEpisodes, episodes, createEpisode } = useSeries();
  const [loading, setLoading] = useState(true);
  const [showCreateEpisode, setShowCreateEpisode] = useState(false);

  useEffect(() => {
    const loadSeries = async () => {
      setLoading(true);
      await fetchSeriesById(id);
      await fetchEpisodes(id);
      setLoading(false);
    };
    loadSeries();
  }, [id]);

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

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      'script-generated': 'bg-blue-100 text-blue-800',
      'storyboard-complete': 'bg-purple-100 text-purple-800',
      'assets-ready': 'bg-yellow-100 text-yellow-800',
      'audio-ready': 'bg-orange-100 text-orange-800',
      rendering: 'bg-indigo-100 text-indigo-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
        <Link
          to="/series"
          className="text-primary-600 hover:text-primary-500"
        >
          Back to Series
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/series"
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back to Series
        </Link>
      </div>

      {/* Series Info */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {currentSeries.title}
            </h1>
            <div className="flex items-center space-x-4 mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getGenreColor(currentSeries.genre)}`}>
                {currentSeries.genre}
              </span>
              <span className="text-gray-500">
                {currentSeries.tone}
              </span>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed">
              {currentSeries.description}
            </p>
          </div>
          <div className="flex space-x-2 ml-6">
            <Link
              to={`/series/${id}/characters`}
              className="flex items-center px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors"
            >
              <Users className="w-4 h-4 mr-2" />
              Manage Characters
            </Link>
            <Link
              to={`/series/${id}/edit`}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Series
            </Link>
          </div>
        </div>

        {/* Series Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mx-auto mb-2">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {currentSeries.characters?.length || 0}
            </p>
            <p className="text-sm text-gray-500">Characters</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
              <Film className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {currentSeries.episodes?.length || 0}
            </p>
            <p className="text-sm text-gray-500">Episodes</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {currentSeries.targetDuration}s
            </p>
            <p className="text-sm text-gray-500">Duration</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
              <Globe className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {currentSeries.aspectRatio}
            </p>
            <p className="text-sm text-gray-500">Aspect Ratio</p>
          </div>
        </div>

        {/* World Settings */}
        {currentSeries.setting && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">World Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentSeries.setting.location && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Location:</span>
                  <p className="text-gray-900">{currentSeries.setting.location}</p>
                </div>
              )}
              {currentSeries.setting.timePeriod && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Time Period:</span>
                  <p className="text-gray-900">{currentSeries.setting.timePeriod}</p>
                </div>
              )}
              {currentSeries.setting.visualStyle && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Visual Style:</span>
                  <p className="text-gray-900">{currentSeries.setting.visualStyle}</p>
                </div>
              )}
              {currentSeries.setting.recurringThemes && currentSeries.setting.recurringThemes.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Recurring Themes:</span>
                  <p className="text-gray-900">{currentSeries.setting.recurringThemes.join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Episodes Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Episodes</h2>
          <div className="flex space-x-2">
            <Link
              to={`/series/${id}/episodes/enhanced`}
              onClick={() => console.log('AI Episode Creator link clicked, navigating to:', `/series/${id}/episodes/enhanced`)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Episode Creator
            </Link>
            <button
              onClick={() => {
                console.log('Create Episode button clicked');
                setShowCreateEpisode(true);
              }}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Episode
            </button>
          </div>
        </div>

        {episodes && episodes.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {episodes.map((episode) => (
              <div key={episode._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm font-medium text-gray-500">
                        Episode {episode.episodeNumber}
                      </span>
                      <h3 className="text-lg font-medium text-gray-900">
                        <Link
                          to={`/episodes/${episode._id}`}
                          className="hover:text-primary-600 transition-colors"
                        >
                          {episode.title}
                        </Link>
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(episode.status)}`}>
                        {episode.status.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">
                      {episode.storyPrompt?.situation}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(episode.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {episode.duration?.target || 300}s
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {episode.characters?.length || 0} characters
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/episodes/${episode._id}`}
                      className="flex items-center px-3 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Film className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No episodes yet</h3>
            <p className="text-gray-500 mb-4">
              Start creating episodes for your series.
            </p>
            <button
              onClick={() => {
                console.log('Create First Episode button clicked');
                setShowCreateEpisode(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create First Episode
            </button>
          </div>
        )}
      </div>

      {/* Quick Create Episode Modal */}
      {showCreateEpisode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Create Episode</h3>
            <p className="text-gray-600 mb-4">
              This will take you to the episode creation page where you can set up the story, characters, and generate content.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  console.log('Continue to Creation button clicked');
                  console.log('Navigating to:', `/series/${id}/episodes/new`);
                  setShowCreateEpisode(false);
                  navigate(`/series/${id}/episodes/new`);
                }}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Continue to Creation
              </button>
              <button
                onClick={() => setShowCreateEpisode(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeriesDetail;
