import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useSeries } from '../contexts/SeriesContext';
import { ArrowLeft, Film, Save } from 'lucide-react';

const CreateSeries = () => {
  const navigate = useNavigate();
  const { createSeries, loading } = useSeries();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const result = await createSeries(data);
    
    if (result.success) {
      navigate(`/series/${result.data._id}`);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/series')}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back to Series
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-6">
          <Film className="w-8 h-8 text-primary-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">Create New Series</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Series Title *
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
                placeholder="Enter your series title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                {...register('description', {
                  required: 'Description is required',
                  maxLength: {
                    value: 1000,
                    message: 'Description must be less than 1000 characters'
                  }
                })}
                rows={4}
                className={`w-full px-3 py-2 border ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                placeholder="Describe your series concept, themes, and what makes it unique..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Style & Genre */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Style & Genre</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-2">
                  Genre *
                </label>
                <select
                  {...register('genre', { required: 'Genre is required' })}
                  className={`w-full px-3 py-2 border ${
                    errors.genre ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                >
                  <option value="">Select a genre</option>
                  <option value="comedy">Comedy</option>
                  <option value="drama">Drama</option>
                  <option value="motivational">Motivational</option>
                  <option value="slice-of-life">Slice of Life</option>
                  <option value="educational">Educational</option>
                  <option value="thriller">Thriller</option>
                </select>
                {errors.genre && (
                  <p className="mt-1 text-sm text-red-600">{errors.genre.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-2">
                  Tone *
                </label>
                <select
                  {...register('tone', { required: 'Tone is required' })}
                  className={`w-full px-3 py-2 border ${
                    errors.tone ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                >
                  <option value="">Select a tone</option>
                  <option value="light-hearted">Light-hearted</option>
                  <option value="serious">Serious</option>
                  <option value="dark">Dark</option>
                  <option value="whimsical">Whimsical</option>
                  <option value="inspirational">Inspirational</option>
                </select>
                {errors.tone && (
                  <p className="mt-1 text-sm text-red-600">{errors.tone.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Technical Settings */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Technical Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="targetDuration" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Duration (seconds)
                </label>
                <input
                  {...register('targetDuration', {
                    min: {
                      value: 60,
                      message: 'Duration must be at least 60 seconds'
                    },
                    max: {
                      value: 600,
                      message: 'Duration must be less than 600 seconds'
                    }
                  })}
                  type="number"
                  defaultValue="300"
                  className={`w-full px-3 py-2 border ${
                    errors.targetDuration ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                />
                {errors.targetDuration && (
                  <p className="mt-1 text-sm text-red-600">{errors.targetDuration.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Default: 300 seconds (5 minutes)</p>
              </div>

              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                  Language *
                </label>
                <input
                  {...register('language', { required: 'Language is required' })}
                  type="text"
                  defaultValue="English"
                  className={`w-full px-3 py-2 border ${
                    errors.language ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                />
                {errors.language && (
                  <p className="mt-1 text-sm text-red-600">{errors.language.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="aspectRatio" className="block text-sm font-medium text-gray-700 mb-2">
                  Aspect Ratio
                </label>
                <select
                  {...register('aspectRatio')}
                  className={`w-full px-3 py-2 border ${
                    errors.aspectRatio ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                >
                  <option value="16:9">16:9 (Landscape)</option>
                  <option value="9:16">9:16 (Portrait)</option>
                  <option value="1:1">1:1 (Square)</option>
                </select>
                {errors.aspectRatio && (
                  <p className="mt-1 text-sm text-red-600">{errors.aspectRatio.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* World Settings */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">World Settings (Optional)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="setting.location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  {...register('setting.location')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Modern city, Fantasy kingdom, Space station"
                />
              </div>

              <div>
                <label htmlFor="setting.timePeriod" className="block text-sm font-medium text-gray-700 mb-2">
                  Time Period
                </label>
                <input
                  {...register('setting.timePeriod')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Present day, 1920s, Future"
                />
              </div>
            </div>

            <div>
              <label htmlFor="setting.visualStyle" className="block text-sm font-medium text-gray-700 mb-2">
                Visual Style
              </label>
              <input
                {...register('setting.visualStyle')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Anime, Realistic, Cartoon, Watercolor"
              />
            </div>

            <div>
              <label htmlFor="setting.recurringThemes" className="block text-sm font-medium text-gray-700 mb-2">
                Recurring Themes (comma-separated)
              </label>
              <input
                {...register('setting.recurringThemes')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Friendship, Adventure, Mystery"
              />
              <p className="mt-1 text-xs text-gray-500">Separate multiple themes with commas</p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/series')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="loading-spinner w-4 h-4 mr-2"></div>
                  Creating...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Series
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSeries;
