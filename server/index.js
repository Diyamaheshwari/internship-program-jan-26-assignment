const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const seriesRoutes = require('./routes/series');
const characterRoutes = require('./routes/characters');
const episodeRoutes = require('./routes/episodes');
const scriptRoutes = require('./routes/scripts');
const assetRoutes = require('./routes/assets');
const adminRoutes = require('./routes/admin');
const createDefaultAdmin = require('./utils/createDefaultAdmin');

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting - temporarily disabled for debugging
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100 // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined'));

// Static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/series', seriesRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/episodes', episodeRoutes);
app.use('/api/scripts', scriptRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check accessed at:', new Date().toISOString());
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  console.log('Test endpoint accessed');
  res.status(200).json({ message: 'Server is working!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Create default admin user
  await createDefaultAdmin();
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Default admin credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
  });
})
.catch((error) => {
  console.error('Database connection error:', error);
  process.exit(1);
});

module.exports = app;
