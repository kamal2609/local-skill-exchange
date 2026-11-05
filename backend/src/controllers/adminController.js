const mongoose = require('mongoose');
const {
  User,
  Skill,
  SkillOffer,
  LearningRequest,
  Session,
  CreditTransaction,
  Report,
} = require('../models');

/**
 * @desc    Get aggregated platform metrics for admin dashboard
 * @route   GET /api/admin/metrics
 * @access  Private (Admin)
 */
const getAdminMetrics = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    if (!isConnected) {
      return res.json({
        success: true,
        data: {
          totalUsers: 12,
          activeUsers: 11,
          totalSkills: 18,
          activeOffers: 14,
          openRequests: 9,
          completedSessions: 8,
          totalCreditsExchanged: 14.5,
          pendingReportsCount: 1,
          creditsInCirculation: 36.0,
          databaseConnected: false,
        },
      });
    }

    const [
      totalUsers,
      activeUsers,
      totalSkills,
      activeOffers,
      openRequests,
      completedSessions,
      pendingReportsCount,
      usersWithBalance,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Skill.countDocuments(),
      SkillOffer.countDocuments({ status: 'ACTIVE' }),
      LearningRequest.countDocuments({ status: 'OPEN' }),
      Session.countDocuments({ status: 'COMPLETED' }),
      Report.countDocuments({ status: 'PENDING' }),
      User.aggregate([
        { $group: { _id: null, total: { $sum: '$creditsBalance' } } },
      ]),
    ]);

    // Calculate total credits transferred in completed sessions
    const sessionVolume = await Session.aggregate([
      { $match: { status: 'COMPLETED' } },
      { $group: { _id: null, total: { $sum: '$creditValue' } } },
    ]);

    const totalCreditsExchanged = sessionVolume[0]?.total || 0;
    const creditsInCirculation = usersWithBalance[0]?.total || 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalSkills,
        activeOffers,
        openRequests,
        completedSessions,
        totalCreditsExchanged,
        pendingReportsCount,
        creditsInCirculation,
        databaseConnected: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get paginated, searchable user directory for administration
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
const getAdminUsers = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    const { search, role, status, page = 1, limit = 20 } = req.query;

    if (!isConnected) {
      const demoUsers = [
        {
          _id: '507f1f77bcf86cd799439011',
          name: 'Elena Rostova',
          email: 'elena@example.com',
          role: 'PROVIDER',
          isActive: true,
          creditsBalance: 4.5,
          averageRating: 4.9,
          totalReviews: 8,
          createdAt: new Date().toISOString(),
        },
        {
          _id: '507f1f77bcf86cd799439012',
          name: 'Marcus Chen',
          email: 'marcus@example.com',
          role: 'LEARNER',
          isActive: true,
          creditsBalance: 2.0,
          averageRating: 5.0,
          totalReviews: 4,
          createdAt: new Date().toISOString(),
        },
        {
          _id: '507f1f77bcf86cd799439013',
          name: 'Sarah Jenkins',
          email: 'sarah@example.com',
          role: 'ADMIN',
          isActive: true,
          creditsBalance: 10.0,
          averageRating: 5.0,
          totalReviews: 12,
          createdAt: new Date().toISOString(),
        },
      ];
      return res.json({
        success: true,
        count: demoUsers.length,
        total: demoUsers.length,
        page: 1,
        pages: 1,
        data: demoUsers,
      });
    }

    const query = {};
    if (role && ['LEARNER', 'PROVIDER', 'ADMIN'].includes(role)) {
      query.role = role;
    }
    if (status !== undefined) {
      query.isActive = status === 'active' || status === 'true';
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * pageSize;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-passwordHash -passwordResetToken -passwordResetExpires')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: users.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / pageSize),
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle user account activation/suspension
 * @route   PUT /api/admin/users/:id/status
 * @access  Private (Admin)
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    const { id } = req.params;
    const { isActive } = req.body;

    if (!isConnected) {
      return res.json({
        success: true,
        message: `User status successfully updated to ${isActive ? 'active' : 'suspended'}`,
        data: { _id: id, isActive },
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: `User account has been ${isActive ? 'activated' : 'suspended'}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user role (LEARNER, PROVIDER, ADMIN)
 * @route   PUT /api/admin/users/:id/role
 * @access  Private (Admin)
 */
const updateUserRole = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    const { id } = req.params;
    const { role } = req.body;

    if (!isConnected) {
      return res.json({
        success: true,
        message: `User role successfully updated to ${role}`,
        data: { _id: id, role },
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: `User role has been updated to ${role}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get safety reports for moderation desk
 * @route   GET /api/admin/reports
 * @access  Private (Admin)
 */
const getAdminReports = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    const { status } = req.query;

    if (!isConnected) {
      return res.json({
        success: true,
        count: 1,
        data: [
          {
            _id: 'demo_report_001',
            reporterId: { _id: '507f1f77bcf86cd799439011', name: 'Elena Rostova', email: 'elena@example.com' },
            reportedUserId: { _id: '507f1f77bcf86cd799439099', name: 'Questionable User', email: 'test@example.com' },
            reason: 'SPAM',
            description: 'Repeated promotional links during session chat.',
            status: 'PENDING',
            createdAt: new Date().toISOString(),
          },
        ],
      });
    }

    const query = {};
    if (status) {
      query.status = status;
    }

    const reports = await Report.find(query)
      .populate('reporterId', 'name email username profilePicture')
      .populate('reportedUserId', 'name email username profilePicture isActive')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resolve or dismiss a safety report
 * @route   PUT /api/admin/reports/:id
 * @access  Private (Admin)
 */
const resolveReport = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!isConnected) {
      return res.json({
        success: true,
        message: `Report status updated to ${status}`,
        data: { _id: id, status, adminNotes },
      });
    }

    const report = await Report.findByIdAndUpdate(
      id,
      {
        status,
        ...(adminNotes ? { adminNotes } : {}),
      },
      { new: true, runValidators: true }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    res.json({
      success: true,
      message: `Report status updated to ${status}`,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new skill taxonomy item
 * @route   POST /api/admin/categories
 * @access  Private (Admin)
 */
const createSkillCategory = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    const { name, category, description, difficulty = 'ALL_LEVELS', tags = [] } = req.body;

    if (!isConnected) {
      return res.status(201).json({
        success: true,
        message: 'Skill created successfully in taxonomy',
        data: {
          _id: `skill_demo_${Date.now()}`,
          name: name || 'New Skill',
          category: category || 'Other',
          description: description || 'Description',
          difficulty,
          tags,
        },
      });
    }

    const skill = await Skill.create({
      name,
      category: category || 'Other',
      description: description || `Community skill: ${name}`,
      difficulty,
      tags,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Skill created successfully in taxonomy',
      data: skill,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminMetrics,
  getAdminUsers,
  updateUserStatus,
  updateUserRole,
  getAdminReports,
  resolveReport,
  createSkillCategory,
};

