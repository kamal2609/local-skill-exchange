const mongoose = require('mongoose');
const Review = require('../models/Review');
const Session = require('../models/Session');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

/**
 * @desc    Submit a review for a completed session
 * @route   POST /api/reviews
 * @access  Private
 */
const createReview = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    const reviewerId = req.user._id;
    const { sessionId, reviewedUserId, rating, comment } = req.body;

    if (reviewerId.toString() === reviewedUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot review yourself',
      });
    }

    if (!isConnected) {
      return res.status(201).json({
        success: true,
        message: 'Review submitted successfully (demo mode)',
        data: {
          _id: 'demo_review_001',
          sessionId,
          reviewerId,
          reviewedUserId,
          rating,
          comment,
          createdAt: new Date(),
        },
      });
    }

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    if (session.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be submitted for completed sessions',
      });
    }

    const isParticipant =
      session.learnerId.toString() === reviewerId.toString() ||
      session.providerId.toString() === reviewerId.toString();

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Only participants of this session can submit a review',
      });
    }

    // Check if review already exists for this session
    const existingReview = await Review.findOne({ sessionId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'A review has already been submitted for this session',
      });
    }

    const review = await Review.create({
      sessionId,
      reviewerId,
      reviewedUserId,
      rating,
      comment,
    });

    // Recalculate averageRating for reviewed user
    const stats = await Review.aggregate([
      { $match: { reviewedUserId: new mongoose.Types.ObjectId(reviewedUserId) } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]);

    if (stats.length > 0) {
      const newAverage = parseFloat(stats[0].avgRating.toFixed(2));
      await User.findByIdAndUpdate(reviewedUserId, { averageRating: newAverage });
    }

    // Send notification to reviewed user
    await createNotification(
      reviewedUserId,
      'REVIEW_RECEIVED',
      'New Review Received ⭐',
      `${req.user.name || 'Your partner'} gave you a ${rating}-star rating!`,
      review._id,
      'Review'
    );

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get public reviews for a user
 * @route   GET /api/reviews/user/:userId
 * @access  Public
 */
const getUserReviews = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    const { userId } = req.params;

    if (!isConnected) {
      return res.json({
        success: true,
        count: 2,
        data: [
          {
            _id: 'demo_review_item_001',
            rating: 5,
            comment: 'Fantastic teacher! Explained everything clearly with practical examples.',
            reviewerId: { name: 'Sophia Rodriguez', username: 'sophia_chef' },
            createdAt: new Date(Date.now() - 86400000 * 3),
          },
          {
            _id: 'demo_review_item_002',
            rating: 5,
            comment: 'Very patient, structured, and friendly. Highly recommended!',
            reviewerId: { name: 'Alex Kim', username: 'alex_yoga' },
            createdAt: new Date(Date.now() - 86400000 * 7),
          },
        ],
      });
    }

    const reviews = await Review.find({ reviewedUserId: userId })
      .populate('reviewerId', 'name username profilePicture city')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getUserReviews,
};

