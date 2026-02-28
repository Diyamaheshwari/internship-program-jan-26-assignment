import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useSeries } from '../contexts/SeriesContext';
import CharacterImageSelector from '../components/CharacterImageSelector';
import { 
  ArrowLeft, 
  Play, 
  FileText, 
  Users, 
  Globe, 
  Video,
  Sparkles,
  Clock,
  Settings,
  Download,
  Share2,
  X,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import axios from 'axios';

const VideoGenerator = () => {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const { currentSeries, characters, fetchCharacters, createEpisode, generateScript, generateAssets } = useSeries();
  const [loading, setLoading] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [storyDetails, setStoryDetails] = useState('');
  const [language, setLanguage] = useState('english');
  const [videoLength, setVideoLength] = useState(5); // minutes
  const [videoProgress, setVideoProgress] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentEpisodeId, setCurrentEpisodeId] = useState(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm();

  useEffect(() => {
    if (seriesId) {
      fetchCharacters(seriesId);
    }
  }, [seriesId, fetchCharacters]);

  // Poll video progress when generating
  useEffect(() => {
    if (currentEpisodeId && isGenerating) {
      const interval = setInterval(async () => {
        try {
          const response = await axios.get(`/api/episodes/${currentEpisodeId}/video-progress`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          
          setVideoProgress(response.data);
          
          if (response.data.status === 'completed') {
            setIsGenerating(false);
            setGeneratedVideo(response.data.finalVideo);
            setCurrentEpisodeId(null);
            clearInterval(interval);
          } else if (response.data.status === 'failed') {
            setIsGenerating(false);
            setCurrentEpisodeId(null);
            clearInterval(interval);
            alert('Video generation failed. Please try again.');
          }
        } catch (error) {
          console.error('Error checking video progress:', error);
        }
      }, 2000); // Poll every 2 seconds

      return () => clearInterval(interval);
    }
  }, [currentEpisodeId, isGenerating]);

  const languages = [
    { code: 'english', name: 'English', flag: '🇺🇸' },
    { code: 'spanish', name: 'Spanish', flag: '🇪🇸' },
    { code: 'french', name: 'French', flag: '🇫🇷' },
    { code: 'german', name: 'German', flag: '🇩🇪' },
    { code: 'italian', name: 'Italian', flag: '🇮🇹' },
    { code: 'portuguese', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'chinese', name: 'Chinese', flag: '🇨🇳' },
    { code: 'japanese', name: 'Japanese', flag: '🇯🇵' },
    { code: 'korean', name: 'Korean', flag: '🇰🇷' },
    { code: 'hindi', name: 'Hindi', flag: '🇮🇳' }
  ];

  const handleCharacterToggle = (characterId) => {
    setSelectedCharacters(prev => 
      prev.includes(characterId) 
        ? prev.filter(id => id !== characterId)
        : [...prev, characterId]
    );
  };

  const generateVideo = async (data) => {
    setLoading(true);
    try {
      // Step 1: Create episode with proper structure
      const episodeData = {
        title: data.title || 'Generated Episode',
        series: seriesId,
        storyPrompt: {
          situation: storyDetails,
          conflict: '',
          resolution: '',
          goal: ''
        },
        characters: selectedCharacters.map(charId => ({
          character: charId,
          role: 'protagonist',
          importance: 8
        })),
        style: {
          genre: data.style === 'narrative' ? 'drama' : data.style || 'drama',
          tone: data.tone === 'engaging' ? 'light-hearted' : data.tone || 'light-hearted',
          pacing: 'normal'
        },
        duration: {
          target: videoLength * 60 // Convert to seconds
        },
        format: {
          aspectRatio: '16:9',
          resolution: '1080p'
        },
        language: language.charAt(0).toUpperCase() + language.slice(1),
        narrationRatio: 0.3,
        aiConfig: {
          situation: storyDetails,
          desiredTone: data.tone || 'engaging',
          endingGoal: 'Create an engaging episode',
          language: language.charAt(0).toUpperCase() + language.slice(1),
          narrationDialogueRatio: '30/70',
          platformFormat: '16:9',
          targetDuration: videoLength * 60
        }
      };

      const episodeResult = await createEpisode(episodeData);
      if (!episodeResult.success) {
        throw new Error('Failed to create episode');
      }

      const episode = episodeResult.data;

      // Step 2: Start video generation
      const response = await axios.post(`/api/episodes/${episode._id}/generate-video`, {}, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.message) {
        setCurrentEpisodeId(episode._id);
        setIsGenerating(true);
        setVideoProgress({
          episodeId: episode._id,
          status: 'rendering',
          message: response.data.message
        });
      }

    } catch (error) {
      console.error('Error generating video:', error);
      alert('Failed to generate video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cancelVideoGeneration = async () => {
    if (!currentEpisodeId) return;
    
    try {
      await axios.post(`/api/episodes/${currentEpisodeId}/cancel-video`, {}, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      setIsGenerating(false);
      setCurrentEpisodeId(null);
      setVideoProgress(null);
    } catch (error) {
      console.error('Error cancelling video generation:', error);
    }
  };

  const downloadVideo = () => {
    if (generatedVideo?.url) {
      const link = document.createElement('a');
      link.href = generatedVideo.url;
      link.download = `episode-${generatedVideo.url.split('/').pop()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!currentSeries) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
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
            <h1 className="text-3xl font-bold text-gray-900">Video Generator</h1>
            <p className="text-gray-600">Create a 5+ minute video for {currentSeries.title}</p>
          </div>
        </div>
      </div>

      {isGenerating ? (
        /* Video Generation Progress */
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Loader className="w-6 h-6 mr-2 text-blue-600 animate-spin" />
              <h3 className="text-xl font-semibold text-blue-600">Generating Video...</h3>
            </div>
            <button
              onClick={cancelVideoGeneration}
              className="flex items-center px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </button>
          </div>
          
          {videoProgress && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <span className="text-sm text-gray-600">{videoProgress.message}</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${videoProgress.videoProgress?.progress || 0}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-600">
                    {videoProgress.videoProgress?.progress || 0}%
                  </div>
                  <div className="text-xs text-gray-600">Progress</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-600">
                    {videoProgress.progress?.script || 0}%
                  </div>
                  <div className="text-xs text-gray-600">Script</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-yellow-600">
                    {videoProgress.progress?.assets || 0}%
                  </div>
                  <div className="text-xs text-gray-600">Assets</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-purple-600">
                    {videoProgress.progress?.video || 0}%
                  </div>
                  <div className="text-xs text-gray-600">Video</div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
                  <p className="text-sm text-blue-800">
                    Video generation is in progress. This may take several minutes depending on the video length and complexity.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : !generatedVideo ? (
        <form onSubmit={handleSubmit(generateVideo)} className="space-y-8">
          {/* Story Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <FileText className="w-5 h-5 mr-2 text-primary-600" />
              <h3 className="text-lg font-semibold">Story Details</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Episode Title *
                </label>
                <input
                  {...register('title', { required: 'Title is required' })}
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
                  Story Description *
                </label>
                <textarea
                  value={storyDetails}
                  onChange={(e) => setStoryDetails(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Describe the story, plot, characters, and what should happen in this episode..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Story Style
                  </label>
                  <select
                    {...register('style')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="narrative">Narrative</option>
                    <option value="dialogue-heavy">Dialogue Heavy</option>
                    <option value="action-packed">Action Packed</option>
                    <option value="educational">Educational</option>
                    <option value="comedy">Comedy</option>
                    <option value="drama">Drama</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tone
                  </label>
                  <select
                    {...register('tone')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="engaging">Engaging</option>
                    <option value="serious">Serious</option>
                    <option value="lighthearted">Lighthearted</option>
                    <option value="suspenseful">Suspenseful</option>
                    <option value="inspirational">Inspirational</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Character Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Users className="w-5 h-5 mr-2 text-primary-600" />
              <h3 className="text-lg font-semibold">Select Characters</h3>
              <span className="ml-2 text-sm text-gray-500">
                ({selectedCharacters.length} selected)
              </span>
            </div>
            
            {characters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {characters.map((character) => (
                  <div
                    key={character._id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedCharacters.includes(character._id)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleCharacterToggle(character._id)}
                  >
                    <div className="flex items-center space-x-3">
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
                      <div>
                        <h4 className="font-medium text-gray-900">{character.name}</h4>
                        <p className="text-sm text-gray-500">
                          {character.personality?.traits?.[0] || 'No traits'}
                        </p>
                      </div>
                    </div>
                    {selectedCharacters.includes(character._id) && (
                      <div className="mt-2">
                        <span className="text-xs bg-primary-500 text-white px-2 py-1 rounded">
                          Selected
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No characters available. Create characters first.</p>
                <button
                  type="button"
                  onClick={() => navigate(`/series/${seriesId}/characters/new`)}
                  className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  Create Character
                </button>
              </div>
            )}
          </div>

          {/* Language and Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Settings className="w-5 h-5 mr-2 text-primary-600" />
              <h3 className="text-lg font-semibold">Video Settings</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Video Length (minutes)
                </label>
                <select
                  value={videoLength}
                  onChange={(e) => setVideoLength(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={20}>20 minutes</option>
                  <option value={30}>30 minutes</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visual Style
                </label>
                <select
                  {...register('visualStyle')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="realistic">Realistic</option>
                  <option value="cartoon">Cartoon</option>
                  <option value="anime">Anime</option>
                  <option value="3d">3D Animation</option>
                </select>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || selectedCharacters.length === 0 || !storyDetails}
              className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="loading-spinner w-4 h-4 mr-2"></div>
                  Generating Video...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Video
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Generated Video Result */
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <Video className="w-6 h-6 mr-2 text-green-600" />
            <h3 className="text-xl font-semibold text-green-600">Video Generated Successfully!</h3>
          </div>
          
          <div className="aspect-video bg-black rounded-lg mb-6">
            <video
              controls
              className="w-full h-full rounded-lg"
              poster={generatedVideo.thumbnail}
            >
              <source src={generatedVideo.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Video Details</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Title:</strong> {generatedVideo.title}</p>
                <p><strong>Duration:</strong> {generatedVideo.duration} minutes</p>
                <p><strong>Language:</strong> {languages.find(l => l.code === generatedVideo.language)?.name}</p>
                <p><strong>Characters:</strong> {generatedVideo.characters.length} selected</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Actions</h4>
              <div className="space-y-2">
                <button 
                  onClick={downloadVideo}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center justify-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Video
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Video
                </button>
                <button
                  onClick={() => {
                    setGeneratedVideo(null);
                    setVideoProgress(null);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Create New Video
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGenerator;
