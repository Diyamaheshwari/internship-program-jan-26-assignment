import React, { createContext, useContext, useReducer, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Set default axios config
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Add connectivity test
console.log('API Base URL:', axios.defaults.baseURL);

// Test server connectivity
axios.get('/test')
  .then(response => {
    console.log('✅ Server connectivity test passed:', response.data);
  })
  .catch(error => {
    console.error('❌ Server connectivity test failed:', error.message);
  });

const SeriesContext = createContext();

const seriesReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_SERIES':
      return { ...state, series: action.payload, loading: false };
    case 'ADD_SERIES':
      return { ...state, series: [action.payload, ...state.series] };
    case 'UPDATE_SERIES':
      return {
        ...state,
        series: state.series.map(s =>
          s._id === action.payload._id ? action.payload : s
        )
      };
    case 'DELETE_SERIES':
      return {
        ...state,
        series: state.series.filter(s => s._id !== action.payload)
      };
    case 'SET_CURRENT_SERIES':
      return { ...state, currentSeries: action.payload };
    case 'SET_CHARACTERS':
      return { 
        ...state, 
        characters: action.payload,
        loading: { ...state.loading, characters: false }
      };
    case 'ADD_CHARACTER':
      return { ...state, characters: [...state.characters, action.payload] };
    case 'UPDATE_CHARACTER':
      return {
        ...state,
        characters: state.characters.map(c =>
          c._id === action.payload._id ? action.payload : c
        )
      };
    case 'DELETE_CHARACTER':
      return {
        ...state,
        characters: state.characters.filter(c => c._id !== action.payload)
      };
    case 'SET_EPISODES':
      return { 
        ...state, 
        episodes: action.payload,
        loading: { ...state.loading, episodes: false }
      };
    case 'ADD_EPISODE':
      return { ...state, episodes: [action.payload, ...state.episodes] };
    case 'UPDATE_EPISODE':
      return {
        ...state,
        episodes: state.episodes.map(e =>
          e._id === action.payload._id ? action.payload : e
        )
      };
    case 'DELETE_EPISODE':
      return {
        ...state,
        episodes: state.episodes.filter(e => e._id !== action.payload)
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: { ...state.loading, series: false, characters: false, episodes: false } };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState = {
  series: [],
  currentSeries: null,
  characters: [],
  episodes: [],
  loading: {
    series: false,
    characters: false,
    episodes: false
  },
  error: null
};

export const SeriesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(seriesReducer, initialState);

  // Fetch all series for the user
  const fetchSeries = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.get('/series');
      dispatch({ type: 'SET_SERIES', payload: response.data.series });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch series';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
    }
  }, []);

  // Create a new series
  const createSeries = async (seriesData) => {
    try {
      const response = await axios.post('/series', seriesData);
      dispatch({ type: 'ADD_SERIES', payload: response.data });
      toast.success('Series created successfully!');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create series';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Update a series
  const updateSeries = async (id, seriesData) => {
    try {
      const response = await axios.put(`/series/${id}`, seriesData);
      dispatch({ type: 'UPDATE_SERIES', payload: response.data });
      toast.success('Series updated successfully!');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update series';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Delete a series
  const deleteSeries = async (id) => {
    try {
      await axios.delete(`/series/${id}`);
      dispatch({ type: 'DELETE_SERIES', payload: id });
      toast.success('Series deleted successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete series';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Fetch a single series
  const fetchSeriesById = useCallback(async (id) => {
    try {
      const response = await axios.get(`/series/${id}`);
      dispatch({ type: 'SET_CURRENT_SERIES', payload: response.data });
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch series';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);

  // Fetch characters for a series (fixed caching)
  const fetchCharacters = useCallback(async (seriesId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { characters: true } });
      
      const response = await axios.get(`/characters/series/${seriesId}`);
      dispatch({ type: 'SET_CHARACTERS', payload: response.data });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Fetch characters error:', error);
      const message = error.response?.data?.message || 'Failed to fetch characters';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);

  // Create a new character (with optimistic update)
  const createCharacter = async (characterData) => {
    try {
      // Optimistic update - add character immediately
      const tempCharacter = {
        ...characterData,
        _id: 'temp-' + Date.now(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      dispatch({ type: 'ADD_CHARACTER', payload: tempCharacter });
      
      const response = await axios.post('/characters', characterData);
      
      // Replace temp character with real one
      dispatch({ type: 'UPDATE_CHARACTER', payload: response.data });
      toast.success('Character created successfully!');
      return { success: true, data: response.data };
    } catch (error) {
      // Remove temp character on error
      const tempCharacter = state.characters.find(c => c._id.startsWith('temp-'));
      if (tempCharacter) {
        dispatch({ type: 'DELETE_CHARACTER', payload: tempCharacter._id });
      }
      
      const message = error.response?.data?.message || 'Failed to create character';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Update a character
  const updateCharacter = async (id, characterData) => {
    try {
      const response = await axios.put(`/characters/${id}`, characterData);
      dispatch({ type: 'UPDATE_CHARACTER', payload: response.data });
      toast.success('Character updated successfully!');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update character';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Delete a character
  const deleteCharacter = async (id) => {
    try {
      await axios.delete(`/characters/${id}`);
      dispatch({ type: 'DELETE_CHARACTER', payload: id });
      toast.success('Character deleted successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete character';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Add character relationship
  const addRelationship = async (characterId, relationshipData) => {
    try {
      const response = await axios.post(`/characters/${characterId}/relationships`, relationshipData);
      dispatch({ type: 'UPDATE_CHARACTER', payload: response.data });
      toast.success('Relationship added successfully!');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add relationship';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Fetch episodes for a series
  const fetchEpisodes = useCallback(async (seriesId) => {
    try {
      console.log('Fetching episodes for series:', seriesId);
      const response = await axios.get(`/episodes/series/${seriesId}`);
      console.log('Fetched episodes:', response.data);
      dispatch({ type: 'SET_EPISODES', payload: response.data.episodes });
      return { success: true, data: response.data.episodes };
    } catch (error) {
      console.error('Error fetching episodes:', error);
      const message = error.response?.data?.message || 'Failed to fetch episodes';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);

  // Create a new episode
  const createEpisode = async (episodeData) => {
    try {
      console.log('Creating episode with data:', episodeData);
      const response = await axios.post('/episodes', episodeData);
      console.log('Episode creation response:', response.data);
      dispatch({ type: 'ADD_EPISODE', payload: response.data });
      toast.success('Episode created successfully!');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Episode creation error:', error);
      console.error('Error response:', error.response?.data);
      const message = error.response?.data?.message || 'Failed to create episode';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Generate script for episode
  const generateScript = async (episodeId) => {
    try {
      const response = await axios.post(`/scripts/generate/${episodeId}`);
      toast.success('Script generated successfully!');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to generate script';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Generate visual assets for episode
  const generateAssets = async (episodeId) => {
    try {
      const response = await axios.post(`/assets/episodes/${episodeId}/generate`);
      toast.success('Visual assets generated successfully!');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to generate assets';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Generate storyboard for episode
  const generateStoryboard = async (episodeId) => {
    try {
      const response = await axios.post(`/assets/episodes/${episodeId}/storyboard`);
      toast.success('Storyboard generated successfully!');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to generate storyboard';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    fetchSeries,
    createSeries,
    updateSeries,
    deleteSeries,
    fetchSeriesById,
    fetchCharacters,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    addRelationship,
    fetchEpisodes,
    createEpisode,
    generateScript,
    generateAssets,
    generateStoryboard,
    clearError
  };

  return (
    <SeriesContext.Provider value={value}>
      {children}
    </SeriesContext.Provider>
  );
};

export const useSeries = () => {
  const context = useContext(SeriesContext);
  if (!context) {
    throw new Error('useSeries must be used within a SeriesProvider');
  }
  return context;
};
