const mongoose = require('mongoose');
const SkillOffer = require('../models/SkillOffer');
const Skill = require('../models/Skill');

/**
 * @desc    Get all skill offers with filters, search, and pagination
 * @route   GET /api/offers
 * @access  Public
 */
const getOffers = async (req, res, next) => {
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
      status: req.query.status || 'ACTIVE',
    };

    if (req.query.skillId && req.query.skillId.match(/^[0-9a-fA-F]{24}$/)) {
      filter.skillId = req.query.skillId;
    }

    if (req.query.learningMode && req.query.learningMode !== 'ALL') {
      filter.learningMode = req.query.learningMode;
    }

    if (req.query.experienceLevel && req.query.experienceLevel !== 'ALL') {
      filter.experienceLevel = req.query.experienceLevel;
    }

    // Filter by skill category if specified
    if (req.query.category && req.query.category !== 'All') {
      const skillsInCat = await Skill.find({ category: req.query.category }).select('_id');
      const skillIds = skillsInCat.map((s) => s._id);
      filter.skillId = { $in: skillIds };
    }

    // Search query on description or neighborhood
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search.trim(), $options: 'i' };
      // Also find skills matching the search text to include their offers
      const matchingSkills = await Skill.find({
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { tags: searchRegex },
        ],
      }).select('_id');
      const matchingSkillIds = matchingSkills.map((s) => s._id);

      filter.$or = [
        { description: searchRegex },
        { neighborhood: searchRegex },
        { teachingApproach: searchRegex },
        { skillId: { $in: matchingSkillIds } },
      ];
    }

    const total = await SkillOffer.countDocuments(filter);
    const offers = await SkillOffer.find(filter)
      .populate('skillId', 'name category difficulty icon tags')
      .populate('providerId', 'name username profilePicture city averageRating completedSessions')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      count: offers.length,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: page,
      data: offers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get offers published by currently authenticated user
 * @route   GET /api/offers/my
 * @access  Protected
 */
const getMyOffers = async (req, res, next) => {
  try {
    const offers = await SkillOffer.find({ providerId: req.user._id })
      .populate('skillId', 'name category difficulty icon')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: offers.length,
      data: offers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single offer by ID
 * @route   GET /api/offers/:id
 * @access  Public
 */
const getOfferById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid offer ID format',
      });
    }

    const offer = await SkillOffer.findById(id)
      .populate('skillId', 'name category difficulty icon description tags')
      .populate('providerId', 'name username profilePicture bio city languages averageRating completedSessions createdAt');

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Skill offer not found',
      });
    }

    res.json({
      success: true,
      data: { offer },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new skill offer
 * @route   POST /api/offers
 * @access  Protected
 */
const createOffer = async (req, res, next) => {
  try {
    const {
      skillId,
      description,
      experienceLevel,
      teachingLanguage,
      learningMode,
      sessionDuration,
      neighborhood,
      teachingApproach,
    } = req.body;

    // Check if skill exists
    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'The referenced skill does not exist in the catalog',
      });
    }

    // Check if provider already has an offer for this skill
    const existingOffer = await SkillOffer.findOne({
      providerId: req.user._id,
      skillId,
    });

    if (existingOffer) {
      return res.status(409).json({
        success: false,
        message: 'You have already published an offer for this skill. Please edit your existing listing.',
      });
    }

    const offer = await SkillOffer.create({
      providerId: req.user._id,
      skillId,
      description,
      experienceLevel: experienceLevel || 'INTERMEDIATE',
      teachingLanguage: teachingLanguage || 'English',
      learningMode: learningMode || 'ONLINE',
      sessionDuration: sessionDuration || 60,
      neighborhood: neighborhood || req.user.city || '',
      teachingApproach: teachingApproach || '',
      status: 'ACTIVE',
    });

    // Increment skill popularity
    await Skill.findByIdAndUpdate(skillId, { $inc: { popularity: 1 } });

    // Also link skill to user's skillsOffered if not present
    if (req.user.skillsOffered && !req.user.skillsOffered.some((id) => id.toString() === skillId)) {
      req.user.skillsOffered.push(skillId);
      await req.user.save();
    }

    const populatedOffer = await SkillOffer.findById(offer._id)
      .populate('skillId', 'name category difficulty icon')
      .populate('providerId', 'name username city averageRating');

    res.status(201).json({
      success: true,
      message: 'Teaching offer successfully published!',
      data: { offer: populatedOffer },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing skill offer
 * @route   PUT /api/offers/:id
 * @access  Protected (Owner or Admin)
 */
const updateOffer = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid offer ID format',
      });
    }

    const offer = await SkillOffer.findById(id);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found',
      });
    }

    // Ownership check
    const isOwner = offer.providerId.equals(req.user._id);
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to edit this offer',
      });
    }

    const {
      description,
      experienceLevel,
      teachingLanguage,
      learningMode,
      sessionDuration,
      neighborhood,
      teachingApproach,
      status,
    } = req.body;

    if (description !== undefined) offer.description = description;
    if (experienceLevel !== undefined) offer.experienceLevel = experienceLevel;
    if (teachingLanguage !== undefined) offer.teachingLanguage = teachingLanguage;
    if (learningMode !== undefined) offer.learningMode = learningMode;
    if (sessionDuration !== undefined) offer.sessionDuration = sessionDuration;
    if (neighborhood !== undefined) offer.neighborhood = neighborhood;
    if (teachingApproach !== undefined) offer.teachingApproach = teachingApproach;
    if (status !== undefined) offer.status = status;

    await offer.save();

    const updatedOffer = await SkillOffer.findById(offer._id)
      .populate('skillId', 'name category difficulty icon')
      .populate('providerId', 'name username city averageRating');

    res.json({
      success: true,
      message: 'Offer updated successfully',
      data: { offer: updatedOffer },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an existing skill offer
 * @route   DELETE /api/offers/:id
 * @access  Protected (Owner or Admin)
 */
const deleteOffer = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid offer ID format',
      });
    }

    const offer = await SkillOffer.findById(id);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found',
      });
    }

    const isOwner = offer.providerId.equals(req.user._id);
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to delete this offer',
      });
    }

    await SkillOffer.findByIdAndDelete(id);

    // Decrement skill popularity
    await Skill.findByIdAndUpdate(offer.skillId, {
      $inc: { popularity: -1 },
    });

    res.json({
      success: true,
      message: 'Offer deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOffers,
  getMyOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
};
