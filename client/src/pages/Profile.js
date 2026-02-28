import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Mail, 
  Lock, 
  Save, 
  Eye, 
  EyeOff,
  Globe,
  Bell,
  Calendar
} from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile
  } = useForm({
    defaultValues: {
      firstName: user?.profile?.firstName || '',
      lastName: user?.profile?.lastName || '',
      bio: user?.profile?.bio || '',
      website: user?.profile?.website || '',
      location: user?.profile?.location || ''
    }
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    watch,
    reset: resetPassword
  } = useForm();

  const newPassword = watch('newPassword');

  const onProfileSubmit = async (data) => {
    setIsSubmitting(true);
    setMessage('');
    
    try {
      updateUser(data);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update profile');
    }
    
    setIsSubmitting(false);
  };

  const onPasswordSubmit = async (data) => {
    setIsSubmitting(true);
    setMessage('');
    
    try {
      // In a real app, this would call an API endpoint
      setMessage('Password changed successfully!');
      resetPassword();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to change password');
    }
    
    setIsSubmitting(false);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'preferences', label: 'Preferences', icon: Globe }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-md ${
          message.includes('success') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    {...registerProfile('firstName', {
                      maxLength: {
                        value: 50,
                        message: 'First name must be less than 50 characters'
                      }
                    })}
                    type="text"
                    className={`w-full px-3 py-2 border ${
                      profileErrors.firstName ? 'border-red-300' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                  />
                  {profileErrors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{profileErrors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    {...registerProfile('lastName', {
                      maxLength: {
                        value: 50,
                        message: 'Last name must be less than 50 characters'
                      }
                    })}
                    type="text"
                    className={`w-full px-3 py-2 border ${
                      profileErrors.lastName ? 'border-red-300' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                  />
                  {profileErrors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{profileErrors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  {...registerProfile('bio', {
                    maxLength: {
                      value: 500,
                      message: 'Bio must be less than 500 characters'
                    }
                  })}
                  rows={4}
                  className={`w-full px-3 py-2 border ${
                    profileErrors.bio ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                  placeholder="Tell us about yourself..."
                />
                {profileErrors.bio && (
                  <p className="mt-1 text-sm text-red-600">{profileErrors.bio.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    {...registerProfile('website', {
                      pattern: {
                        value: /^https?:\/\/.+/,
                        message: 'Please enter a valid URL starting with http:// or https://'
                      }
                    })}
                    type="url"
                    className={`w-full px-3 py-2 border ${
                      profileErrors.website ? 'border-red-300' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                    placeholder="https://yourwebsite.com"
                  />
                  {profileErrors.website && (
                    <p className="mt-1 text-sm text-red-600">{profileErrors.website.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    {...registerProfile('location', {
                      maxLength: {
                        value: 100,
                        message: 'Location must be less than 100 characters'
                      }
                    })}
                    type="text"
                    className={`w-full px-3 py-2 border ${
                      profileErrors.location ? 'border-red-300' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                    placeholder="City, Country"
                  />
                  {profileErrors.location && (
                    <p className="mt-1 text-sm text-red-600">{profileErrors.location.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="loading-spinner w-4 h-4 mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        {...registerPassword('currentPassword', {
                          required: 'Current password is required'
                        })}
                        type={showCurrentPassword ? 'text' : 'password'}
                        className={`w-full px-3 py-2 pr-10 border ${
                          passwordErrors.currentPassword ? 'border-red-300' : 'border-gray-300'
                        } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-5 h-5 text-gray-400" />
                        ) : (
                          <Eye className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        {...registerPassword('newPassword', {
                          required: 'New password is required',
                          minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters'
                          },
                          pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                            message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                          }
                        })}
                        type={showNewPassword ? 'text' : 'password'}
                        className={`w-full px-3 py-2 pr-10 border ${
                          passwordErrors.newPassword ? 'border-red-300' : 'border-gray-300'
                        } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-5 h-5 text-gray-400" />
                        ) : (
                          <Eye className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        {...registerPassword('confirmPassword', {
                          required: 'Please confirm your password',
                          validate: value => value === newPassword || 'Passwords do not match'
                        })}
                        type={showConfirmPassword ? 'text' : 'password'}
                        className={`w-full px-3 py-2 pr-10 border ${
                          passwordErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                        } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5 text-gray-400" />
                        ) : (
                          <Eye className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="loading-spinner w-4 h-4 mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-700">
                      Email Notifications
                    </label>
                    <p className="text-sm text-gray-500">Receive email updates about your series and episodes</p>
                  </div>
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    defaultChecked={user?.preferences?.notifications?.email}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="pushNotifications" className="text-sm font-medium text-gray-700">
                      Push Notifications
                    </label>
                    <p className="text-sm text-gray-500">Receive browser notifications for important updates</p>
                  </div>
                  <input
                    type="checkbox"
                    id="pushNotifications"
                    defaultChecked={user?.preferences?.notifications?.push}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium text-gray-900">{user?.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Username:</span>
                    <span className="text-sm font-medium text-gray-900">{user?.username}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Member since:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
