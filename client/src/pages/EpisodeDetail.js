import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSeries } from '../contexts/SeriesContext';
import { 
  ArrowLeft, 
  Play, 
  FileText, 
  Camera, 
  Image,
  Volume2,
  Download,
  RefreshCw,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react';

const EpisodeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { generateScript, generateAssets, generateStoryboard } = useSeries();
  const [episode, setEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState({});

  useEffect(() => {
    // In a real app, this would fetch episode data
    // For now, we'll simulate it
    setTimeout(() => {
      setEpisode({
        _id: id,
        title: 'Sample Episode',
        status: 'draft',
        progress: {
          script: 0,
          storyboard: 0,
          assets: 0,
          audio: 0,
          video: 0
        },
        script: null,
        storyboard: null,
        visualAssets: null,
        audioPlan: null,
        characters: [
          { character: { name: 'John Doe', _id: '1' } },
          { character: { name: 'Jane Smith', _id: '2' } }
        ],
        duration: { target: 300 },
        createdAt: new Date()
      });
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleGenerateScript = async () => {
    setGenerating(prev => ({ ...prev, script: true }));
    await generateScript(id);
    setGenerating(prev => ({ ...prev, script: false }));
    // Update episode state
    setEpisode(prev => ({
      ...prev,
      status: 'script-generated',
      progress: { ...prev.progress, script: 100 }
    }));
  };

  const handleGenerateStoryboard = async () => {
    setGenerating(prev => ({ ...prev, storyboard: true }));
    await generateStoryboard(id);
    setGenerating(prev => ({ ...prev, storyboard: false }));
    setEpisode(prev => ({
      ...prev,
      status: 'storyboard-complete',
      progress: { ...prev.progress, storyboard: 100 }
    }));
  };

  const handleGenerateAssets = async () => {
    setGenerating(prev => ({ ...prev, assets: true }));
    await generateAssets(id);
    setGenerating(prev => ({ ...prev, assets: false }));
    setEpisode(prev => ({
      ...prev,
      status: 'assets-ready',
      progress: { ...prev.progress, assets: 100 }
    }));
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

  const getProgressColor = (progress) => {
    if (progress === 100) return 'bg-green-500';
    if (progress > 0) return 'bg-blue-500';
    return 'bg-gray-300';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Episode not found</h2>
        <button
          onClick={() => navigate('/series')}
          className="text-primary-600 hover:text-primary-500"
        >
          Back to Series
        </button>
      </div>
    );
  }

  const overallProgress = Math.round(
    (episode.progress.script + episode.progress.storyboard + 
     episode.progress.assets + episode.progress.audio + episode.progress.video) / 5
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{episode.title}</h1>
            <div className="flex items-center space-x-3 mt-1">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(episode.status)}`}>
                {episode.status.replace('-', ' ')}
              </span>
              <span className="text-gray-500">
                {episode.duration?.target || 300}s duration
              </span>
              <span className="text-gray-500">
                {episode.characters?.length || 0} characters
              </span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Production Progress</h2>
        
        {/* Overall Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-medium text-gray-900">{overallProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(overallProgress)}`}
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Stage Progress */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Script</p>
            <p className="text-2xl font-bold text-gray-900">{episode.progress.script}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(episode.progress.script)}`}
                style={{ width: `${episode.progress.script}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
              <Camera className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Storyboard</p>
            <p className="text-2xl font-bold text-gray-900">{episode.progress.storyboard}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(episode.progress.storyboard)}`}
                style={{ width: `${episode.progress.storyboard}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-2">
              <Image className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Assets</p>
            <p className="text-2xl font-bold text-gray-900">{episode.progress.assets}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(episode.progress.assets)}`}
                style={{ width: `${episode.progress.assets}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-2">
              <Volume2 className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Audio</p>
            <p className="text-2xl font-bold text-gray-900">{episode.progress.audio}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(episode.progress.audio)}`}
                style={{ width: `${episode.progress.audio}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
              <Play className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Video</p>
            <p className="text-2xl font-bold text-gray-900">{episode.progress.video}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(episode.progress.video)}`}
                style={{ width: `${episode.progress.video}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Generation Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Content Generation</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Script Generation */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="font-medium text-gray-900">Script</h3>
                </div>
                {episode.progress.script === 100 && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Generate dialogue and narration based on your story prompt and character personalities.
              </p>
              <button
                onClick={handleGenerateScript}
                disabled={generating.script || episode.progress.script === 100}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {generating.script ? (
                  <div className="flex items-center">
                    <div className="loading-spinner w-4 h-4 mr-2"></div>
                    Generating...
                  </div>
                ) : episode.progress.script === 100 ? (
                  'Regenerate'
                ) : (
                  'Generate Script'
                )}
              </button>
            </div>

            {/* Storyboard Generation */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Camera className="w-5 h-5 text-purple-600 mr-2" />
                  <h3 className="font-medium text-gray-900">Storyboard</h3>
                </div>
                {episode.progress.storyboard === 100 && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Create shot lists and camera directions for visual storytelling.
              </p>
              <button
                onClick={handleGenerateStoryboard}
                disabled={generating.storyboard || episode.progress.storyboard === 100 || !episode.script}
                className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {generating.storyboard ? (
                  <div className="flex items-center">
                    <div className="loading-spinner w-4 h-4 mr-2"></div>
                    Generating...
                  </div>
                ) : episode.progress.storyboard === 100 ? (
                  'Regenerate'
                ) : (
                  'Generate Storyboard'
                )}
              </button>
            </div>

            {/* Visual Assets Generation */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Image className="w-5 h-5 text-yellow-600 mr-2" />
                  <h3 className="font-medium text-gray-900">Visual Assets</h3>
                </div>
                {episode.progress.assets === 100 && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Generate prompts for character images, backgrounds, and visual elements.
              </p>
              <button
                onClick={handleGenerateAssets}
                disabled={generating.assets || episode.progress.assets === 100 || !episode.script}
                className="w-full flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {generating.assets ? (
                  <div className="flex items-center">
                    <div className="loading-spinner w-4 h-4 mr-2"></div>
                    Generating...
                  </div>
                ) : episode.progress.assets === 100 ? (
                  'Regenerate'
                ) : (
                  'Generate Assets'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Episode Info */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Episode Information</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Characters</h3>
              <div className="space-y-2">
                {episode.characters?.map((charData, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{charData.character.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Details</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">Target: {episode.duration?.target || 300}s</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">Status: {episode.status.replace('-', ' ')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpisodeDetail;
