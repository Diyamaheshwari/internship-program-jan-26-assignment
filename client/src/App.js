import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { SeriesProvider } from './contexts/SeriesContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SeriesList from './pages/SeriesList';
import SeriesDetail from './pages/SeriesDetail';
import CreateSeries from './pages/CreateSeries';
import CharacterManager from './pages/CharacterManager';
import CreateCharacter from './pages/CreateCharacter';
import VideoGenerator from './pages/VideoGenerator';
import EpisodeCreator from './pages/EpisodeCreator';
import EnhancedEpisodeCreator from './pages/EnhancedEpisodeCreator';
import EpisodeDetail from './pages/EpisodeDetail';
import Profile from './pages/Profile';
import Tutorials from './pages/Tutorials';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <SeriesProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/tutorials" element={<PrivateRoute><Tutorials /></PrivateRoute>} />
                <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
                <Route path="/series" element={<PrivateRoute><SeriesList /></PrivateRoute>} />
                <Route path="/series/new" element={<PrivateRoute><CreateSeries /></PrivateRoute>} />
                <Route path="/series/:id" element={<PrivateRoute><SeriesDetail /></PrivateRoute>} />
                <Route path="/series/:seriesId/characters" element={<PrivateRoute><CharacterManager /></PrivateRoute>} />
                <Route path="/series/:seriesId/characters/new" element={<PrivateRoute><CreateCharacter /></PrivateRoute>} />
                <Route path="/series/:seriesId/generate-video" element={<PrivateRoute><VideoGenerator /></PrivateRoute>} />
                <Route path="/series/:seriesId/episodes/new" element={<PrivateRoute><EpisodeCreator /></PrivateRoute>} />
                <Route path="/series/:seriesId/episodes/enhanced" element={<PrivateRoute><EnhancedEpisodeCreator /></PrivateRoute>} />
                <Route path="/episodes/:id" element={<PrivateRoute><EpisodeDetail /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </div>
        </Router>
      </SeriesProvider>
    </AuthProvider>
  );
}

export default App;
