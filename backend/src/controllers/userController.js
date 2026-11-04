const User = require('../models/User');

/**
 * @desc    Get current user profile with populated skills
 * @route   GET /api/users/profile
 * @access  Protected
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('skillsOffered', 'name category difficulty tags icon')
      .populate('skillsWanted', 'name category difficulty tags icon');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current user profile
 * @route   PUT /api/users/profile
 * @access  Protected
 */
const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      bio,
      city,
      preferredLearningMode,
      languages,
      skillsOffered,
      skillsWanted,
      profilePicture,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    // Update allowable fields
    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (city !== undefined) user.city = city;
    if (preferredLearningMode !== undefined) user.preferredLearningMode = preferredLearningMode;
    if (languages !== undefined) user.languages = languages;
    if (skillsOffered !== undefined) user.skillsOffered = skillsOffered;
    if (skillsWanted !== undefined) user.skillsWanted = skillsWanted;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    const updatedUser = await User.findById(user._id)
      .populate('skillsOffered', 'name category difficulty tags icon')
      .populate('skillsWanted', 'name category difficulty tags icon');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get community member directory with pagination & search
 * @route   GET /api/users
 * @access  Public
 */
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };

    if (req.query.role) {
      filter.role = req.query.role.toUpperCase();
    }

    if (req.query.city) {
      filter.city = { $regex: req.query.city, $options: 'i' };
    }

    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      filter.$or = [
        { name: searchRegex },
        { username: searchRegex },
        { bio: searchRegex },
        { city: searchRegex },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('name username profilePicture bio city role preferredLearningMode languages completedSessions averageRating skillsOffered skillsWanted createdAt')
      .populate('skillsOffered', 'name category difficulty icon')
      .populate('skillsWanted', 'name category difficulty icon')
      .sort({ averageRating: -1, completedSessions: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: page,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get public profile for a single user by ID or username
 * @route   GET /api/users/:id
 * @access  Public
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let query;

    // Check if valid ObjectId or treat as username
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      query = { _id: id };
    } else {
      query = { username: id.toLowerCase() };
    }

    const user = await User.findOne(query)
      .select('name username profilePicture bio city role preferredLearningMode languages completedSessions averageRating skillsOffered skillsWanted createdAt')
      .populate('skillsOffered', 'name category difficulty tags icon')
      .populate('skillsWanted', 'name category difficulty tags icon');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getUsers,
  getUserById,
};

