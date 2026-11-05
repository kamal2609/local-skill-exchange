const mongoose = require('mongoose');
const Skill = require('../models/Skill');
const SkillOffer = require('../models/SkillOffer');
const LearningRequest = require('../models/LearningRequest');

/**
 * @desc    Get all skills with filtering, search, and pagination
 * @route   GET /api/skills
 * @access  Public
 */
const getSkills = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
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

    const filter = {};

    // Filter by category
    if (req.query.category && req.query.category !== 'All') {
      filter.category = req.query.category;
    }

    // Filter by difficulty
    if (req.query.difficulty && req.query.difficulty !== 'ALL_LEVELS') {
      filter.difficulty = req.query.difficulty;
    }

    // Search filter (name, description, tags)
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search.trim(), $options: 'i' };
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
      ];
    }

    // Sort order
    let sortOptions = { popularity: -1, createdAt: -1 };
    if (req.query.sort === 'name') {
      sortOptions = { name: 1 };
    } else if (req.query.sort === 'newest') {
      sortOptions = { createdAt: -1 };
    }

    const total = await Skill.countDocuments(filter);
    const skills = await Skill.find(filter)
      .populate('createdBy', 'name username')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      count: skills.length,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: page,
      data: skills,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single skill by ID with offer and request statistics
 * @route   GET /api/skills/:id
 * @access  Public
 */
const getSkillById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid skill ID format',
      });
    }

    const isConnected = mongoose.connection.readyState === 1;
    if (!isConnected) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found (database offline)',
      });
    }

    const skill = await Skill.findById(id).populate('createdBy', 'name username');
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found',
      });
    }

    let activeOffersCount = 0;
    let openRequestsCount = 0;
    try {
      [activeOffersCount, openRequestsCount] = await Promise.all([
        SkillOffer.countDocuments({ skillId: skill._id, status: 'ACTIVE' }),
        LearningRequest.countDocuments({ skillId: skill._id, status: 'OPEN' }),
      ]);
    } catch (e) {
      // Ignored if offline
    }

    res.json({
      success: true,
      data: {
        skill,
        activeOffersCount,
        openRequestsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new skill in the catalog
 * @route   POST /api/skills
 * @access  Protected
 */
const createSkill = async (req, res, next) => {
  try {
    const { name, category, description, difficulty, tags, icon } = req.body;

    const existingSkill = await Skill.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });

    if (existingSkill) {
      return res.status(409).json({
        success: false,
        message: `A skill named '${existingSkill.name}' already exists in the catalog.`,
      });
    }

    const skill = await Skill.create({
      name: name.trim(),
      category,
      description: description.trim(),
      difficulty: difficulty || 'ALL_LEVELS',
      tags: Array.isArray(tags) ? tags : [],
      icon: icon || 'BookOpen',
      createdBy: req.user ? req.user._id : null,
    });

    res.status(201).json({
      success: true,
      message: 'Skill successfully created and added to the catalog',
      data: { skill },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSkills,
  getSkillById,
  createSkill,
};
