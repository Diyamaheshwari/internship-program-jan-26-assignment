import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Video, 
  Play, 
  Download, 
  Settings, 
  Clock, 
  FileText, 
  Users, 
  BarChart3, 
  Zap, 
  Monitor,
  Headphones,
  Film,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('video-generator');
  const [sampleVideos, setSampleVideos] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentGeneration, setCurrentGeneration] = useState(null);

  // Sample video templates
  const videoTemplates = [
    {
      id: 'corporate-intro',
      title: 'Corporate Introduction',
      description: 'Professional business introduction video',
      duration: 5,
      category: 'Business',
      thumbnail: 'https://picsum.photos/seed/corporate/400/225.jpg',
      scenes: ['Company logo', 'Team introduction', 'Services overview', 'Call to action'],
      style: 'Professional'
    },
    {
      id: 'product-demo',
      title: 'Product Demonstration',
      description: 'Detailed product showcase video',
      duration: 8,
      category: 'Marketing',
      thumbnail: 'https://picsum.photos/seed/product/400/225.jpg',
      scenes: ['Product reveal', 'Features demo', 'Benefits highlight', 'Testimonials'],
      style: 'Modern'
    },
    {
      id: 'educational-content',
      title: 'Educational Content',
      description: 'Educational or training video',
      duration: 10,
      category: 'Education',
      thumbnail: 'https://picsum.photos/seed/education/400/225.jpg',
      scenes: ['Introduction', 'Main content', 'Examples', 'Summary', 'Quiz'],
      style: 'Informative'
    },
    {
      id: 'social-media-ad',
      title: 'Social Media Ad',
      description: 'Engaging social media advertisement',
      duration: 6,
      category: 'Marketing',
      thumbnail: 'https://picsum.photos/seed/social/400/225.jpg',
      scenes: ['Hook', 'Problem', 'Solution', 'Call to action'],
      style: 'Dynamic'
    }
  ];

  useEffect(() => {
    // Load sample videos from localStorage or initialize with templates
    const stored = localStorage.getItem('sampleVideos');
    if (stored) {
      setSampleVideos(JSON.parse(stored));
    } else {
      setSampleVideos(videoTemplates.map(template => ({
        ...template,
        status: 'template',
        createdAt: new Date(),
        generatedAt: null
      })));
    }
  }, []);

  const generateSampleVideo = async (template) => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setCurrentGeneration(template);

    try {
      console.log('Generating sample video with template:', template);
      
      // Call the real API endpoint
      const response = await axios.post('/api/admin/generate-sample', {
        template: template.id,
        duration: template.duration,
        style: template.style,
        scenes: template.scenes.length
      });

      if (response.data.success) {
        const generatedVideo = response.data.video;
        
        setSampleVideos(prev => [generatedVideo, ...prev]);
        
        // Show success message
        alert(`Sample video "${generatedVideo.title}" generated successfully!`);
      } else {
        throw new Error('Failed to generate video');
      }

    } catch (error) {
      console.error('Error generating video:', error);
      alert('Failed to generate sample video. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
      setCurrentGeneration(null);
    }
  };

  const deleteSampleVideo = (videoId) => {
    setSampleVideos(prev => prev.filter(video => video.id !== videoId));
    localStorage.setItem('sampleVideos', JSON.stringify(sampleVideos.filter(video => video.id !== videoId)));
  };

  const renderVideoGenerator = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Sample Video Generator</h3>
        <p className="text-gray-600 mb-6">
          Generate sample videos for testing and demonstration purposes. Videos range from 5-10 minutes.
        </p>

        {/* Video Templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {videoTemplates.map((template) => (
            <div key={template.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <img 
                  src={template.thumbnail} 
                  alt={template.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                  {template.duration} min
                </div>
                <div className="absolute top-2 left-2 bg-primary-600 text-white px-2 py-1 rounded text-sm">
                  {template.category}
                </div>
              </div>
              
              <div className="p-4">
                <h4 className="font-semibold text-lg mb-2">{template.title}</h4>
                <p className="text-gray-600 text-sm mb-3">{template.description}</p>
                
                <div className="mb-3">
                  <span className="text-xs text-gray-500">Style: </span>
                  <span className="text-xs font-medium text-primary-600">{template.style}</span>
                </div>

                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-1">Scenes:</div>
                  <div className="flex flex-wrap gap-1">
                    {template.scenes.map((scene, index) => (
                      <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {scene}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => generateSampleVideo(template)}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {isGenerating && currentGeneration?.id === template.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Generating... {generationProgress}%
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Sample Video
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generation Progress */}
      {isGenerating && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Generation Progress</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Generating: {currentGeneration?.title}</span>
              <span className="text-sm font-medium">{generationProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${generationProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">
              This may take a few moments to complete...
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const renderVideoLibrary = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Generated Videos Library</h3>
          <div className="text-sm text-gray-500">
            {sampleVideos.filter(v => v.status === 'completed').length} videos
          </div>
        </div>

        {sampleVideos.filter(video => video.status === 'completed').length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleVideos
              .filter(video => video.status === 'completed')
              .map((video) => (
              <div key={video.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <button className="bg-white/90 text-gray-900 px-4 py-2 rounded-md flex items-center">
                      <Play className="w-4 h-4 mr-2" />
                      Play
                    </button>
                  </div>
                  <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Ready
                  </div>
                </div>
                
                <div className="p-4">
                  <h4 className="font-semibold mb-2">{video.title}</h4>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">{video.duration} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Resolution:</span>
                      <span className="font-medium">{video.resolution}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>File Size:</span>
                      <span className="font-medium">{video.fileSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Generated:</span>
                      <span className="font-medium">
                        {new Date(video.generatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Play
                    </a>
                    <a
                      href={video.downloadUrl}
                      download
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </a>
                    <button
                      onClick={() => deleteSampleVideo(video.id)}
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
          <div className="text-center py-12">
            <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No videos generated yet</h3>
            <p className="text-gray-500 mb-4">
              Generate your first sample video using the templates above.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Videos</p>
              <p className="text-2xl font-bold text-gray-900">
                {sampleVideos.filter(v => v.status === 'completed').length}
              </p>
            </div>
            <Video className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Duration</p>
              <p className="text-2xl font-bold text-gray-900">
                {sampleVideos
                  .filter(v => v.status === 'completed')
                  .reduce((total, video) => total + video.duration, 0)} min
              </p>
            </div>
            <Clock className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Duration</p>
              <p className="text-2xl font-bold text-gray-900">
                {sampleVideos.filter(v => v.status === 'completed').length > 0
                  ? Math.round(
                      sampleVideos
                        .filter(v => v.status === 'completed')
                        .reduce((total, video) => total + video.duration, 0) / 
                      sampleVideos.filter(v => v.status === 'completed').length
                    )
                  : 0} min
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-amber-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Templates Used</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(sampleVideos.filter(v => v.status === 'completed').map(v => v.category)).size}
              </p>
            </div>
            <Film className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Video Categories</h3>
        <div className="space-y-3">
          {['Business', 'Marketing', 'Education'].map(category => {
            const count = sampleVideos.filter(v => v.status === 'completed' && v.category === category).length;
            const percentage = sampleVideos.filter(v => v.status === 'completed').length > 0 
              ? (count / sampleVideos.filter(v => v.status === 'completed').length) * 100 
              : 0;
            
            return (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{category}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <Link
                to="/dashboard"
                className="flex items-center text-white/80 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Link>
            </div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-white/90">
              Manage video generation, sample content, and analytics
            </p>
          </div>
          <div className="hidden lg:block">
            <Settings className="w-16 h-16 text-white/20" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'video-generator', label: 'Video Generator', icon: Zap },
              { id: 'video-library', label: 'Video Library', icon: Video },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'video-generator' && renderVideoGenerator()}
          {activeTab === 'video-library' && renderVideoLibrary()}
          {activeTab === 'analytics' && renderAnalytics()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
