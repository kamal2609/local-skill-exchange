const mongoose = require('mongoose');
const Report = require('../models/Report');
const User = require('../models/User');

/**
 * @desc    Submit a confidential report for moderation
 * @route   POST /api/reports
 * @access  Private
 */
const createReport = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    const reporterId = req.user._id;
    const { reportedUserId, reason, description } = req.body;

    if (reporterId.toString() === reportedUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot submit a report against yourself',
      });
    }

    if (!isConnected) {
      return res.status(201).json({
        success: true,
        message: 'Report submitted for administrator review (demo mode)',
        data: {
          _id: 'demo_report_001',
          reporterId,
          reportedUserId,
          reason,
          description,
          status: 'PENDING',
          createdAt: new Date(),
        },
      });
    }

    const report = await Report.create({
      reporterId,
      reportedUserId,
      reason,
      description,
      status: 'PENDING',
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted for review. Thank you for keeping our community safe.',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reports (Admin only)
 * @route   GET /api/reports
 * @access  Private (Admin only)
 */
const getReports = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    const { status } = req.query;

    if (!isConnected) {
      return res.json({
        success: true,
        count: 1,
        data: [
          {
            _id: 'demo_report_admin_001',
            reporterId: { name: 'Alice Smith', email: 'alice@example.com' },
            reportedUserId: { name: 'Bob Jones', email: 'bob@example.com' },
            reason: 'Session No-Show',
            description: 'Did not attend scheduled session and gave no prior notice.',
            status: 'PENDING',
            createdAt: new Date(),
          },
        ],
      });
    }

    const filter = {};
    if (status) filter.status = status;

    const reports = await Report.find(filter)
      .populate('reporterId', 'name email username')
      .populate('reportedUserId', 'name email username')
      .sort({ createdAt: -1 })
      .lean();

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
 * @desc    Update report status / resolution notes (Admin only)
 * @route   PUT /api/reports/:id
 * @access  Private (Admin only)
 */
const updateReportStatus = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    const { status, adminNotes } = req.body;

    if (!isConnected) {
      return res.json({
        success: true,
        message: 'Report resolved (demo mode)',
      });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    if (status) report.status = status;
    if (adminNotes !== undefined) report.adminNotes = adminNotes;

    await report.save();

    res.json({
      success: true,
      message: `Report status updated to ${report.status}`,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
  getReports,
  updateReportStatus,
};

