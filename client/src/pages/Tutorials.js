import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Play, 
  Users, 
  Video, 
  FileText, 
  Image, 
  Settings, 
  ChevronRight,
  CheckCircle,
  Clock,
  Target,
  Zap,
  ArrowLeft
} from 'lucide-react';

const Tutorials = () => {
  const tutorialSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <BookOpen className="w-6 h-6" />,
      description: 'Learn the basics of creating your first video series',
      steps: [
        {
          title: 'Create Your Account',
          description: 'Sign up and set up your profile to start creating amazing video series',
          estimatedTime: '2 min',
          difficulty: 'Beginner',
          link: '/register'
        },
        {
          title: 'Navigate the Dashboard',
          description: 'Understand the main interface and available features',
          estimatedTime: '3 min',
          difficulty: 'Beginner',
          link: '/dashboard'
        },
        {
          title: 'Create Your First Series',
          description: 'Set up a new series with title, description, and basic settings',
          estimatedTime: '5 min',
          difficulty: 'Beginner',
          link: '/series/new'
        }
      ]
    },
    {
      id: 'character-creation',
      title: 'Character Creation',
      icon: <Users className="w-6 h-6" />,
      description: 'Design compelling characters that bring your stories to life',
      steps: [
        {
          title: 'Generate Character Images',
          description: 'Use AI to create unique character portraits with different styles',
          estimatedTime: '5 min',
          difficulty: 'Beginner',
          link: '/series/new'
        },
        {
          title: 'Define Character Personalities',
          description: 'Set traits, speaking styles, and background stories',
          estimatedTime: '8 min',
          difficulty: 'Intermediate',
          link: '/series/:seriesId/characters/new'
        },
        {
          title: 'Create Character Relationships',
          description: 'Build connections between characters for dynamic storytelling',
          estimatedTime: '10 min',
          difficulty: 'Intermediate',
          link: '/series/:seriesId/characters'
        },
        {
          title: 'Manage Character Library',
          description: 'Organize and edit your character collection',
          estimatedTime: '5 min',
          difficulty: 'Beginner',
          link: '/series/:seriesId/characters'
        }
      ]
    },
    {
      id: 'episode-production',
      title: 'Episode Production',
      icon: <Video className="w-6 h-6" />,
      description: 'Produce engaging episodes with scripts and visual assets',
      steps: [
        {
          title: 'Plan Episode Structure',
          description: 'Outline your episode with scenes, dialogue, and action points',
          estimatedTime: '15 min',
          difficulty: 'Intermediate',
          link: '/series/:seriesId/episodes/new'
        },
        {
          title: 'Generate Scripts Automatically',
          description: 'Use AI to create dialogue and scene descriptions',
          estimatedTime: '10 min',
          difficulty: 'Intermediate',
          link: '/series/:seriesId/episodes/:episodeId'
        },
        {
          title: 'Create Visual Assets',
          description: 'Generate backgrounds, props, and scene elements',
          estimatedTime: '12 min',
          difficulty: 'Advanced',
          link: '/series/:seriesId/episodes/:episodeId'
        },
        {
          title: 'Build Storyboards',
          description: 'Plan visual sequences and camera angles',
          estimatedTime: '8 min',
          difficulty: 'Advanced',
          link: '/series/:seriesId/episodes/:episodeId'
        }
      ]
    },
    {
      id: 'video-generation',
      title: 'Video Generation',
      icon: <Zap className="w-6 h-6" />,
      description: 'Transform your scripts and assets into complete videos',
      steps: [
        {
          title: 'Configure Video Settings',
          description: 'Set resolution, frame rate, and output format',
          estimatedTime: '3 min',
          difficulty: 'Beginner',
          link: '/series/:seriesId/generate-video'
        },
        {
          title: 'Generate Voice Audio',
          description: 'Create character voices with AI text-to-speech',
          estimatedTime: '5 min',
          difficulty: 'Intermediate',
          link: '/series/:seriesId/generate-video'
        },
        {
          title: 'Render Final Video',
          description: 'Combine all elements into a polished video file',
          estimatedTime: '10 min',
          difficulty: 'Advanced',
          link: '/series/:seriesId/generate-video'
        },
        {
          title: 'Export and Share',
          description: 'Download your video and share it with your audience',
          estimatedTime: '2 min',
          difficulty: 'Beginner',
          link: '/series/:seriesId'
        }
      ]
    },
    {
      id: 'advanced-features',
      title: 'Advanced Features',
      icon: <Settings className="w-6 h-6" />,
      description: 'Master powerful tools for professional video production',
      steps: [
        {
          title: 'Batch Character Generation',
          description: 'Create multiple characters at once with templates',
          estimatedTime: '8 min',
          difficulty: 'Advanced',
          link: '/series/:seriesId/characters'
        },
        {
          title: 'Custom Voice Profiles',
          description: 'Fine-tune voice characteristics for each character',
          estimatedTime: '15 min',
          difficulty: 'Advanced',
          link: '/series/:seriesId/characters/:characterId'
        },
        {
          title: 'Scene Templates',
          description: 'Reuse scene setups across multiple episodes',
          estimatedTime: '10 min',
          difficulty: 'Intermediate',
          link: '/series/:seriesId/episodes'
        },
        {
          title: 'Collaboration Tools',
          description: 'Work with team members on large projects',
          estimatedTime: '5 min',
          difficulty: 'Intermediate',
          link: '/settings/team'
        }
      ]
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstimatedTimeIcon = (time) => {
    const minutes = parseInt(time);
    if (minutes <= 5) return <Clock className="w-4 h-4" />;
    if (minutes <= 10) return <Clock className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4 mb-4">
              <Link
                to="/dashboard"
                className="flex items-center text-white/80 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Link>
            </div>
            <h1 className="text-4xl font-bold mb-4">Complete Series Generation Tutorials</h1>
            <p className="text-xl text-white/90 max-w-3xl">
              Master the art of creating compelling video series from concept to final production. 
              Follow our step-by-step guides to learn everything you need to know.
            </p>
          </div>
          <div className="hidden lg:block">
            <BookOpen className="w-32 h-32 text-white/20" />
          </div>
        </div>
      </div>

      {/* Quick Start Guide */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <Target className="w-6 h-6 mr-3 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">Quick Start Guide</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: 1, title: 'Create Series', description: 'Start a new video series project' },
            { step: 2, title: 'Add Characters', description: 'Design your cast with AI' },
            { step: 3, title: 'Write Episodes', description: 'Generate scripts automatically' },
            { step: 4, title: 'Produce Video', description: 'Render final video output' }
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                {item.step}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tutorial Sections */}
      <div className="space-y-8">
        {tutorialSections.map((section) => (
          <div key={section.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-lg mr-4">
                  {section.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                  <p className="text-gray-600 mt-1">{section.description}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {section.steps.map((step, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mr-3 text-sm font-bold">
                          {index + 1}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(step.difficulty)}`}>
                          {step.difficulty}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{step.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        {getEstimatedTimeIcon(step.estimatedTime)}
                        <span className="ml-1">{step.estimatedTime}</span>
                      </div>
                      
                      {step.link && (
                        <Link
                          to={step.link}
                          className="flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                          Start Tutorial
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tips and Best Practices */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <CheckCircle className="w-6 h-6 mr-3 text-blue-600" />
          <h2 className="text-xl font-bold text-blue-900">Pro Tips & Best Practices</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            'Start with simple character designs before moving to complex ones',
            'Write clear, concise dialogue that matches character personalities',
            'Use consistent visual styles across all episodes',
            'Test voice generation with short samples before full episodes',
            'Save scene templates to reuse across multiple episodes',
            'Regular backup your series data to prevent loss'
          ].map((tip, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-blue-800 text-sm">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Resources */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <FileText className="w-6 h-6 mr-3 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">Additional Resources</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <Video className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Video Library</h3>
            <p className="text-gray-600 text-sm mb-4">Watch detailed video tutorials for advanced techniques</p>
            <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              Watch Videos
            </button>
          </div>
          
          <div className="text-center p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <FileText className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Documentation</h3>
            <p className="text-gray-600 text-sm mb-4">Comprehensive guides and API documentation</p>
            <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              Read Docs
            </button>
          </div>
          
          <div className="text-center p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <Users className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Community</h3>
            <p className="text-gray-600 text-sm mb-4">Join our community to share tips and get help</p>
            <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              Join Community
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorials;
