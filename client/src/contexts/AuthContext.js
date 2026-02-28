import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Set default axios config
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Add connectivity test
console.log('Auth API Base URL:', axios.defaults.baseURL);

// Test server connectivity
axios.get('/test')
  .then(response => {
    console.log('✅ Auth server connectivity test passed:', response.data);
  })
  .catch(error => {
    console.error('❌ Auth server connectivity test failed:', error.message);
  });

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        user: action.payload.user, 
        token: action.payload.token,
        isAuthenticated: true,
        error: null 
      };
    case 'LOGIN_FAILURE':
      return { 
        ...state, 
        loading: false, 
        user: null, 
        token: null,
        isAuthenticated: false,
        error: action.payload 
      };
    case 'LOGOUT':
      return { 
        ...state, 
        user: null, 
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null 
      };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  token: sessionStorage.getItem('token'),
  isAuthenticated: false,
  loading: false,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set axios auth header
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('/auth/me');
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: response.data.user,
              token
            }
          });
        } catch (error) {
          sessionStorage.removeItem('token');
          dispatch({ type: 'LOGOUT' });
        }
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Login attempt with email:', email);
      dispatch({ type: 'LOGIN_START' });
      const response = await axios.post('/auth/login', { email, password });
      
      console.log('Login response:', response.data);
      const { user, token } = response.data;
      sessionStorage.setItem('token', token);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token }
      });
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      console.error('Login error response:', error.response);
      const message = error.response?.data?.message || 'Login failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: message
      });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const response = await axios.post('/auth/register', userData);
      
      const { user, token } = response.data;
      sessionStorage.setItem('token', token);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token }
      });
      
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: message
      });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
