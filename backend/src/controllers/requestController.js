const mongoose = require('mongoose');
const LearningRequest = require('../models/LearningRequest');
const Skill = require('../models/Skill');

/**
 * @desc    Get all learning requests with filters, search, and pagination
 * @route   GET /api/requests
 * @access  Public
 */
const getRequests = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    if (!isConnected) {
      return res.json({
        success: true,
        count: 0,
        total: 0,
        totalPages: 1,
        currentPage: page,
        data: [],
      });
    }

    const filter = {
      status: req.query.status || 'OPEN',
    };

    if (req.query.skillId && req.query.skillId.match(/^[0-9a-fA-F]{24}$/)) {
      filter.skillId = req.query.skillId;
    }

    if (req.query.preferredMode && req.query.preferredMode !== 'ALL') {
      filter.preferredMode = req.query.preferredMode;
    }

    // Filter by skill category if specified
    if (req.query.category && req.query.category !== 'All') {
      const skillsInCat = await Skill.find({ category: req.query.category }).select('_id');
      const skillIds = skillsInCat.map((s) => s._id);
      filter.skillId = { $in: skillIds };
    }

    // Search query
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search.trim(), $options: 'i' };
      const matchingSkills = await Skill.find({
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { tags: searchRegex },
        ],
      }).select('_id');
      const matchingSkillIds = matchingSkills.map((s) => s._id);

      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { learningObjectives: searchRegex },
        { neighborhood: searchRegex },
        { skillId: { $in: matchingSkillIds } },
      ];
    }

    const total = await LearningRequest.countDocuments(filter);
    const requests = await LearningRequest.find(filter)
      .populate('skillId', 'name category difficulty icon tags')
      .populate('learnerId', 'name username profilePicture city averageRating completedSessions')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      count: requests.length,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: page,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get requests published by currently authenticated learner
 * @route   GET /api/requests/my
 * @access  Protected
 */
const getMyRequests = async (req, res, next) => {
  try {
    const requests = await LearningRequest.find({ learnerId: req.user._id })
      .populate('skillId', 'name category difficulty icon')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single learning request by ID
 * @route   GET /api/requests/:id
 * @access  Public
 */
const getRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID format',
      });
    }

    const request = await LearningRequest.findById(id)
      .populate('skillId', 'name category difficulty icon description tags')
      .populate('learnerId', 'name username profilePicture bio city languages averageRating completedSessions createdAt');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Learning request not found',
      });
    }

    res.json({
      success: true,
      data: { request },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new learning request
 * @route   POST /api/requests
 * @access  Protected
 */
const createRequest = async (req, res, next) => {
  try {
    const {
      skillId,
      title,
      description,
      learningObjectives,
      preferredDifficulty,
      preferredDuration,
      preferredMode,
      preferredSchedule,
      neighborhood,
    } = req.body;

    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'The referenced skill does not exist in the catalog',
      });
    }

    const learningRequest = await LearningRequest.create({
      learnerId: req.user._id,
      skillId,
      title: title.trim(),
      description: description.trim(),
      learningObjectives: learningObjectives || '',
      preferredDifficulty: preferredDifficulty || 'ALL_LEVELS',
      preferredDuration: preferredDuration || 60,
      preferredMode: preferredMode || 'ONLINE',
      preferredSchedule: preferredSchedule || 'Flexible',
      neighborhood: neighborhood || req.user.city || '',
      status: 'OPEN',
    });

    // Also link skill to user's skillsWanted if not present
    if (req.user.skillsWanted && !req.user.skillsWanted.some((id) => id.toString() === skillId)) {
      req.user.skillsWanted.push(skillId);
      await req.user.save();
    }

    const populatedRequest = await LearningRequest.findById(learningRequest._id)
      .populate('skillId', 'name category difficulty icon')
      .populate('learnerId', 'name username city averageRating');

    res.status(201).json({
      success: true,
      message: 'Learning request successfully published!',
      data: { request: populatedRequest },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing learning request
 * @route   PUT /api/requests/:id
 * @access  Protected (Owner or Admin)
 */
const updateRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID format',
      });
    }

    const request = await LearningRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Learning request not found',
      });
    }

    const isOwner = request.learnerId.equals(req.user._id);
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to edit this request',
      });
    }

    const {
      title,
      description,
      learningObjectives,
      preferredDifficulty,
      preferredDuration,
      preferredMode,
      preferredSchedule,
      neighborhood,
      status,
    } = req.body;

    if (title !== undefined) request.title = title;
    if (description !== undefined) request.description = description;
    if (learningObjectives !== undefined) request.learningObjectives = learningObjectives;
    if (preferredDifficulty !== undefined) request.preferredDifficulty = preferredDifficulty;
    if (preferredDuration !== undefined) request.preferredDuration = preferredDuration;
    if (preferredMode !== undefined) request.preferredMode = preferredMode;
    if (preferredSchedule !== undefined) request.preferredSchedule = preferredSchedule;
    if (neighborhood !== undefined) request.neighborhood = neighborhood;
    if (status !== undefined) request.status = status;

    await request.save();

    const updatedRequest = await LearningRequest.findById(request._id)
      .populate('skillId', 'name category difficulty icon')
      .populate('learnerId', 'name username city averageRating');

    res.json({
      success: true,
      message: 'Learning request updated successfully',
      data: { request: updatedRequest },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an existing learning request
 * @route   DELETE /api/requests/:id
 * @access  Protected (Owner or Admin)
 */
const deleteRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID format',
      });
    }

    const request = await LearningRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Learning request not found',
      });
    }

    const isOwner = request.learnerId.equals(req.user._id);
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to delete this request',
      });
    }

    await LearningRequest.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Learning request deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRequests,
  getMyRequests,
  getRequestById,
  createRequest,
  updateRequest,
  deleteRequest,
};
