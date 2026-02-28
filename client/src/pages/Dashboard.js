import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSeries } from '../contexts/SeriesContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Film, 
  Users, 
  Play, 
  PlusCircle, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { series, loading, fetchSeries } = useSeries();
  const [stats, setStats] = useState({
    totalSeries: 0,
    totalCharacters: 0,
    totalEpisodes: 0,
    completedEpisodes: 0
  });

  useEffect(() => {
    fetchSeries();
  }, []);

  useEffect(() => {
    if (series.length > 0) {
      const totalCharacters = series.reduce((sum, s) => sum + (s.characters?.length || 0), 0);
      const totalEpisodes = series.reduce((sum, s) => sum + (s.episodes?.length || 0), 0);
      const completedEpisodes = series.reduce((sum, s) => 
        sum + (s.episodes?.filter(e => e.status === 'completed').length || 0), 0
      );

      setStats({
        totalSeries: series.length,
        totalCharacters,
        totalEpisodes,
        completedEpisodes
      });
    }
  }, [series]);

  const recentSeries = series.slice(0, 3);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
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
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.profile?.firstName || user?.username}! 👋
        </h1>
        <p className="text-primary-100">
          Ready to create amazing character-based video series?
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Series</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSeries}</p>
            </div>
            <Film className="w-8 h-8 text-primary-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Characters</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCharacters}</p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Episodes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEpisodes}</p>
            </div>
            <Play className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedEpisodes}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/series/new"
            className="flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Create New Series
          </Link>
          <Link
            to="/series"
            className="flex items-center justify-center px-4 py-3 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors"
          >
            <Film className="w-5 h-5 mr-2" />
            Browse Series
          </Link>
          <Link
            to="/tutorials"
            className="flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            View Tutorials
          </Link>
        </div>
      </div>

      {/* Recent Series */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Series</h2>
            <Link
              to="/series"
              className="text-sm text-primary-600 hover:text-primary-500 font-medium"
            >
              View all
            </Link>
          </div>
        </div>
        
        {recentSeries.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {recentSeries.map((s) => (
              <div key={s._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Link
                      to={`/series/${s._id}`}
                      className="text-lg font-medium text-gray-900 hover:text-primary-600 transition-colors"
                    >
                      {s.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {s.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-gray-500">
                        {s.characters?.length || 0} characters
                      </span>
                      <span className="text-sm text-gray-500">
                        {s.episodes?.length || 0} episodes
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        s.genre === 'comedy' ? 'bg-yellow-100 text-yellow-800' :
                        s.genre === 'drama' ? 'bg-blue-100 text-blue-800' :
                        s.genre === 'motivational' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {s.genre}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {s.episodes?.slice(0, 3).map((episode) => (
                      <div key={episode._id} className="flex items-center space-x-1">
                        {getStatusIcon(episode.status)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Film className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No series yet</h3>
            <p className="text-gray-500 mb-4">
              Get started by creating your first character-based video series.
            </p>
            <Link
              to="/series/new"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Your First Series
            </Link>
          </div>
        )}
      </div>

      {/* Getting Started Tips */}
      {stats.totalSeries === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Getting Started</h3>
          <ol className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span>Create your first series with a compelling title and description</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span>Add characters with unique personalities and relationships</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span>Create episodes by providing story prompts and selecting characters</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">4.</span>
              <span>Generate scripts, storyboards, and visual assets automatically</span>
            </li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
