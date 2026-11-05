const mongoose = require('mongoose');
const Session = require('../models/Session');
const User = require('../models/User');
const Skill = require('../models/Skill');

/**
 * @desc    Create a new skill exchange session request
 * @route   POST /api/sessions
 * @access  Private
 */
const createSession = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    const learnerId = req.user._id;
    const {
      providerId,
      skillId,
      skillOfferId,
      learningRequestId,
      bookingDate,
      startTime,
      endTime,
      duration = 60,
      notes = '',
      meetingLink = '',
      isReciprocal = false,
    } = req.body;

    // Guard: Prevent self-booking
    if (learnerId.toString() === providerId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book a learning session with yourself',
      });
    }

    // Calculate credit value (1 hour = 1.0 credit, 30 min = 0.5)
    const creditValue = parseFloat((duration / 60).toFixed(2));

    if (!isConnected) {
      return res.status(201).json({
        success: true,
        message: 'Session requested successfully (demo mode)',
        data: {
          _id: 'demo_session_created_001',
          learnerId,
          providerId,
          skillId,
          bookingDate,
          startTime,
          endTime,
          duration,
          creditValue,
          status: 'REQUESTED',
          notes,
          meetingLink,
          createdAt: new Date(),
        },
      });
    }

    // 1. Solvency Check: Ensure learner has enough balance unless mutual reciprocal swap
    if (!isReciprocal) {
      const learner = await User.findById(learnerId);
      if (learner && learner.creditsBalance < creditValue) {
        return res.status(400).json({
          success: false,
          message: `Insufficient time credits. You have ${learner.creditsBalance.toFixed(1)} credits, but this session requires ${creditValue.toFixed(1)} credits.`,
        });
      }
    }

    // 2. Conflict Check: Prevent double-booking for both participants
    const bookingDay = new Date(bookingDate);
    const startOfDay = new Date(bookingDay.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(bookingDay.setUTCHours(23, 59, 59, 999));

    const conflict = await Session.findOne({
      status: { $in: ['REQUESTED', 'ACCEPTED', 'SCHEDULED', 'IN_PROGRESS'] },
      bookingDate: { $gte: startOfDay, $lte: endOfDay },
      $or: [
        { providerId: providerId },
        { learnerId: learnerId },
        { providerId: learnerId },
        { learnerId: providerId },
      ],
      $and: [
        { startTime: { $lt: endTime } },
        { endTime: { $gt: startTime } },
      ],
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'Double-booking conflict: Either you or the provider already has an active session overlapping this time window.',
      });
    }

    // 3. Create Session Record
    const session = await Session.create({
      learnerId,
      providerId,
      skillId,
      skillOfferId: skillOfferId || null,
      learningRequestId: learningRequestId || null,
      bookingDate: new Date(bookingDate),
      startTime,
      endTime,
      duration,
      creditValue,
      status: 'REQUESTED',
      notes,
      meetingLink: meetingLink || (notes.includes('http') ? notes : ''),
    });

    const populatedSession = await Session.findById(session._id)
      .populate('providerId', 'name username profilePicture city averageRating')
      .populate('learnerId', 'name username profilePicture city')
      .populate('skillId', 'name category');

    res.status(201).json({
      success: true,
      message: 'Session booking requested successfully',
      data: populatedSession,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all sessions for current user with filters
 * @route   GET /api/sessions
 * @access  Private
 */
const getSessions = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    const userId = req.user._id;
    const { status, role } = req.query;

    if (!isConnected) {
      return res.json({
        success: true,
        count: 2,
        data: [
          {
            _id: 'demo_session_001',
            learnerId: { _id: userId, name: req.user.name || 'You', username: req.user.username },
            providerId: { _id: 'candidate_elena_001', name: 'Elena Rostova', username: 'elena_dev', city: 'San Francisco', averageRating: 4.95 },
            skillId: { _id: 'skill_python_01', name: 'Python Programming', category: 'Technology' },
            bookingDate: new Date(Date.now() + 86400000 * 2),
            startTime: '10:00',
            endTime: '11:00',
            duration: 60,
            creditValue: 1.0,
            status: 'SCHEDULED',
            notes: 'Intro to Pandas and Data Analysis',
            meetingLink: 'https://meet.jit.si/skill-exchange-python-101',
            learnerConfirmed: false,
            providerConfirmed: false,
          },
          {
            _id: 'demo_session_002',
            learnerId: { _id: 'candidate_marcus_002', name: 'Marcus Chen', username: 'marcus_guitar' },
            providerId: { _id: userId, name: req.user.name || 'You', username: req.user.username },
            skillId: { _id: 'skill_spanish_01', name: 'Spanish Conversation', category: 'Language' },
            bookingDate: new Date(Date.now() + 86400000 * 4),
            startTime: '15:00',
            endTime: '16:00',
            duration: 60,
            creditValue: 1.0,
            status: 'REQUESTED',
            notes: 'Practice conversational greetings & vocabulary',
            learnerConfirmed: false,
            providerConfirmed: false,
          },
        ],
      });
    }

    const filter = {};

    // Role filter
    if (role === 'asLearner') {
      filter.learnerId = userId;
    } else if (role === 'asProvider') {
      filter.providerId = userId;
    } else {
      filter.$or = [{ learnerId: userId }, { providerId: userId }];
    }

    // Status filter
    if (status) {
      if (status === 'UPCOMING') {
        filter.status = { $in: ['REQUESTED', 'ACCEPTED', 'SCHEDULED', 'IN_PROGRESS'] };
      } else {
        filter.status = status;
      }
    }

    const sessions = await Session.find(filter)
      .populate('providerId', 'name username profilePicture city averageRating')
      .populate('learnerId', 'name username profilePicture city')
      .populate('skillId', 'name category')
      .sort({ bookingDate: 1, startTime: 1 })
      .lean();

    res.json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get session details by ID
 * @route   GET /api/sessions/:id
 * @access  Private
 */
const getSessionById = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    if (!isConnected) {
      return res.json({
        success: true,
        data: {
          _id: req.params.id,
          learnerId: { _id: req.user._id, name: 'You' },
          providerId: { _id: 'candidate_elena_001', name: 'Elena Rostova' },
          skillId: { name: 'Python Programming', category: 'Technology' },
          bookingDate: new Date(),
          startTime: '10:00',
          endTime: '11:00',
          duration: 60,
          creditValue: 1.0,
          status: 'SCHEDULED',
        },
      });
    }

    const session = await Session.findById(req.params.id)
      .populate('providerId', 'name username profilePicture city averageRating')
      .populate('learnerId', 'name username profilePicture city')
      .populate('skillId', 'name category description');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Participant verification
    const uId = req.user._id.toString();
    if (
      session.learnerId._id.toString() !== uId &&
      session.providerId._id.toString() !== uId &&
      req.user.role !== 'ADMIN'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this session',
      });
    }

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update session status (Accept, Reject, Cancel)
 * @route   PUT /api/sessions/:id/status
 * @access  Private
 */
const updateSessionStatus = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    const { status } = req.body;
    const userId = req.user._id.toString();

    if (!isConnected) {
      return res.json({
        success: true,
        message: `Session status updated to ${status} (demo mode)`,
        data: { _id: req.params.id, status: status === 'ACCEPTED' ? 'SCHEDULED' : status },
      });
    }

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    const isProvider = session.providerId.toString() === userId;
    const isLearner = session.learnerId.toString() === userId;

    if (!isProvider && !isLearner && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this session',
      });
    }

    // State machine logic
    if (status === 'ACCEPTED') {
      if (!isProvider) {
        return res.status(403).json({
          success: false,
          message: 'Only the skill provider can accept a session request',
        });
      }
      if (session.status !== 'REQUESTED') {
        return res.status(400).json({
          success: false,
          message: `Cannot accept a session in '${session.status}' state`,
        });
      }
      session.status = 'SCHEDULED';
    } else if (status === 'REJECTED') {
      if (!isProvider) {
        return res.status(403).json({
          success: false,
          message: 'Only the skill provider can decline a session request',
        });
      }
      if (session.status !== 'REQUESTED') {
        return res.status(400).json({
          success: false,
          message: `Cannot decline a session in '${session.status}' state`,
        });
      }
      session.status = 'REJECTED';
    } else if (status === 'CANCELLED') {
      if (session.status === 'COMPLETED') {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel a session that is already completed',
        });
      }
      session.status = 'CANCELLED';
    }

    await session.save();

    res.json({
      success: true,
      message: `Session is now ${session.status}`,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Confirm session completion by learner or provider
 * @route   POST /api/sessions/:id/confirm
 * @access  Private
 */
const confirmSession = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    const userId = req.user._id.toString();

    if (!isConnected) {
      return res.json({
        success: true,
        message: 'Session completion confirmed (demo mode)',
        data: {
          _id: req.params.id,
          learnerConfirmed: true,
          status: 'COMPLETED',
        },
      });
    }

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    const isProvider = session.providerId.toString() === userId;
    const isLearner = session.learnerId.toString() === userId;

    if (!isProvider && !isLearner && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to confirm this session',
      });
    }

    if (session.status === 'CANCELLED' || session.status === 'REJECTED') {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm completion for a ${session.status.toLowerCase()} session`,
      });
    }

    if (isLearner) {
      session.learnerConfirmed = true;
    }
    if (isProvider) {
      session.providerConfirmed = true;
    }

    // If learner confirms (or both confirm), transition status to COMPLETED
    if (session.learnerConfirmed || (session.learnerConfirmed && session.providerConfirmed)) {
      session.status = 'COMPLETED';

      // Increment completed sessions counter on users
      await Promise.all([
        User.findByIdAndUpdate(session.providerId, { $inc: { completedSessions: 1 } }),
        User.findByIdAndUpdate(session.learnerId, { $inc: { completedSessions: 1 } }),
      ]);
    }

    await session.save();

    res.json({
      success: true,
      message: session.status === 'COMPLETED' ? 'Session successfully completed!' : 'Confirmation recorded',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSession,
  getSessions,
  getSessionById,
  updateSessionStatus,
  confirmSession,
};

