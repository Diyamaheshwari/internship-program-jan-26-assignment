import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSeries } from '../contexts/SeriesContext';
import { Film, PlusCircle, Calendar, Users, Eye } from 'lucide-react';

const SeriesList = () => {
  const { series, loading, fetchSeries, deleteSeries } = useSeries();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGenre, setFilterGenre] = useState('');

  useEffect(() => {
    fetchSeries();
  }, []);

  const filteredSeries = series.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = !filterGenre || s.genre === filterGenre;
    return matchesSearch && matchesGenre;
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this series? This will also delete all associated characters and episodes.')) {
      await deleteSeries(id);
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Series</h1>
          <p className="text-gray-600 mt-1">Manage your video series</p>
        </div>
        <Link
          to="/series/new"
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Create Series
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search series..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Genre
            </label>
            <select
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Genres</option>
              <option value="comedy">Comedy</option>
              <option value="drama">Drama</option>
              <option value="motivational">Motivational</option>
              <option value="slice-of-life">Slice of Life</option>
              <option value="educational">Educational</option>
              <option value="thriller">Thriller</option>
            </select>
          </div>
        </div>
      </div>

      {/* Series Grid */}
      {filteredSeries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSeries.map((s) => (
            <div key={s._id} className="bg-white rounded-lg shadow-md card-hover">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      <Link
                        to={`/series/${s._id}`}
                        className="hover:text-primary-600 transition-colors"
                      >
                        {s.title}
                      </Link>
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGenreColor(s.genre)}`}>
                      {s.genre}
                    </span>
                  </div>
                  <Film className="w-8 h-8 text-gray-400" />
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {s.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {s.characters?.length || 0} characters
                  </div>
                  <div className="flex items-center">
                    <Film className="w-4 h-4 mr-1" />
                    {s.episodes?.length || 0} episodes
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(s.createdAt).toLocaleDateString()}
                  </div>
                  <span>{s.targetDuration}s duration</span>
                </div>
                
                <div className="flex space-x-2">
                  <Link
                    to={`/series/${s._id}`}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Link>
                  <Link
                    to={`/series/${s._id}/characters`}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-secondary-600 text-white text-sm rounded-md hover:bg-secondary-700 transition-colors"
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Characters
                  </Link>
                  <button
                    onClick={() => handleDelete(s._id)}
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Film className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterGenre ? 'No series found' : 'No series yet'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filterGenre 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first character-based video series.'
            }
          </p>
          {!searchTerm && !filterGenre && (
            <Link
              to="/series/new"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Your First Series
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default SeriesList;
