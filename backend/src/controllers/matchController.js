const mongoose = require('mongoose');
const matchingService = require('../services/matchingService');

/**
 * @desc    Get ranked smart matches for authenticated user
 * @route   GET /api/matches
 * @access  Private
 */
const getSmartMatches = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { minScore = 20, reciprocalOnly = false, limit = 20, page = 1 } = req.query;

    const result = await matchingService.findMatchesForUser(userId, {
      minScore,
      reciprocalOnly,
      limit,
      page,
    });

    res.json({
      success: true,
      count: result.matches.length,
      total: result.pagination.total,
      reciprocalCount: result.pagination.reciprocalCount,
      pages: result.pagination.pages,
      currentPage: result.pagination.page,
      data: result.matches,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get only reciprocal matches (mutual swaps) for authenticated user
 * @route   GET /api/matches/reciprocal
 * @access  Private
 */
const getReciprocalMatches = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { minScore = 20, limit = 20, page = 1 } = req.query;

    const result = await matchingService.findReciprocalMatches(userId, {
      minScore,
      limit,
      page,
    });

    res.json({
      success: true,
      count: result.matches.length,
      total: result.pagination.total,
      reciprocalCount: result.pagination.reciprocalCount,
      pages: result.pagination.pages,
      currentPage: result.pagination.page,
      data: result.matches,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed pairwise compatibility breakdown with a specific partner
 * @route   GET /api/matches/:partnerId
 * @access  Private
 */
const getPartnerMatchDetail = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const partnerId = req.params.partnerId;

    if (!partnerId) {
      return res.status(400).json({
        success: false,
        message: 'Partner ID is required',
      });
    }

    if (userId.toString() === partnerId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot calculate matching score with yourself',
      });
    }

    const detail = await matchingService.getPairwiseDetail(userId, partnerId);

    res.json({
      success: true,
      data: detail,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSmartMatches,
  getReciprocalMatches,
  getPartnerMatchDetail,
};

