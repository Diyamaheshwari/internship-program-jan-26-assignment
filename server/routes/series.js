const express = require('express');
const router = express.Router();
const Series = require('../models/Series');
const Character = require('../models/Character');
const Episode = require('../models/Episode');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get all series for a user
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const series = await Series.find({ creator: req.user.id })
      .populate('characters', 'name appearance')
      .populate('episodes', 'title episodeNumber status createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Series.countDocuments({ creator: req.user.id });

    res.json({
      series,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching series:', error);
    res.status(500).json({ message: 'Error fetching series' });
  }
});

// Get a single series by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const series = await Series.findById(req.params.id)
      .populate('characters')
      .populate('episodes', 'title episodeNumber status createdAt');

    if (!series) {
      return res.status(404).json({ message: 'Series not found' });
    }

    // Check if user owns the series
    if (series.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(series);
  } catch (error) {
    console.error('Error fetching series:', error);
    res.status(500).json({ message: 'Error fetching series' });
  }
});

// Create a new series
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('description').trim().isLength({ min: 1, max: 1000 }).withMessage('Description must be 1-1000 characters'),
  body('genre').isIn(['comedy', 'drama', 'motivational', 'slice-of-life', 'educational', 'thriller']).withMessage('Invalid genre'),
  body('tone').isIn(['light-hearted', 'serious', 'dark', 'whimsical', 'inspirational']).withMessage('Invalid tone'),
  body('language').trim().isLength({ min: 1 }).withMessage('Language is required'),
  body('targetDuration').optional().isInt({ min: 60, max: 600 }).withMessage('Duration must be 60-600 seconds'),
  body('aspectRatio').optional().isIn(['16:9', '9:16', '1:1']).withMessage('Invalid aspect ratio')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const seriesData = {
      ...req.body,
      creator: req.user.id
    };

    const series = new Series(seriesData);
    await series.save();

    const populatedSeries = await Series.findById(series._id)
      .populate('characters')
      .populate('episodes');

    res.status(201).json(populatedSeries);
  } catch (error) {
    console.error('Error creating series:', error);
    res.status(500).json({ message: 'Error creating series' });
  }
});

// Update a series
router.put('/:id', [
  auth,
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('description').optional().trim().isLength({ min: 1, max: 1000 }).withMessage('Description must be 1-1000 characters'),
  body('genre').optional().isIn(['comedy', 'drama', 'motivational', 'slice-of-life', 'educational', 'thriller']).withMessage('Invalid genre'),
  body('tone').optional().isIn(['light-hearted', 'serious', 'dark', 'whimsical', 'inspirational']).withMessage('Invalid tone'),
  body('language').optional().trim().isLength({ min: 1 }).withMessage('Language is required'),
  body('targetDuration').optional().isInt({ min: 60, max: 600 }).withMessage('Duration must be 60-600 seconds'),
  body('aspectRatio').optional().isIn(['16:9', '9:16', '1:1']).withMessage('Invalid aspect ratio')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const series = await Series.findById(req.params.id);

    if (!series) {
      return res.status(404).json({ message: 'Series not found' });
    }

    // Check if user owns the series
    if (series.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    Object.assign(series, req.body);
    await series.save();

    const updatedSeries = await Series.findById(series._id)
      .populate('characters')
      .populate('episodes');

    res.json(updatedSeries);
  } catch (error) {
    console.error('Error updating series:', error);
    res.status(500).json({ message: 'Error updating series' });
  }
});

// Delete a series
router.delete('/:id', auth, async (req, res) => {
  try {
    const series = await Series.findById(req.params.id);

    if (!series) {
      return res.status(404).json({ message: 'Series not found' });
    }

    // Check if user owns the series
    if (series.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete associated characters and episodes
    await Character.deleteMany({ series: req.params.id });
    await Episode.deleteMany({ series: req.params.id });
    await Series.findByIdAndDelete(req.params.id);

    res.json({ message: 'Series deleted successfully' });
  } catch (error) {
    console.error('Error deleting series:', error);
    res.status(500).json({ message: 'Error deleting series' });
  }
});

// Get series statistics
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const series = await Series.findById(req.params.id);

    if (!series) {
      return res.status(404).json({ message: 'Series not found' });
    }

    // Check if user owns the series
    if (series.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const characterCount = await Character.countDocuments({ series: req.params.id });
    const episodeCount = await Episode.countDocuments({ series: req.params.id });
    const completedEpisodes = await Episode.countDocuments({ 
      series: req.params.id, 
      status: 'completed' 
    });

    const episodesByStatus = await Episode.aggregate([
      { $match: { series: series._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      totalCharacters: characterCount,
      totalEpisodes: episodeCount,
      completedEpisodes,
      episodesByStatus,
      seriesCreated: series.createdAt,
      lastUpdated: series.updatedAt
    });
  } catch (error) {
    console.error('Error fetching series stats:', error);
    res.status(500).json({ message: 'Error fetching series statistics' });
  }
});

module.exports = router;
