const mongoose = require('mongoose');
const Notification = require('../models/Notification');

/**
 * Reusable utility to create a system notification
 */
async function createNotification(userId, type, title, message, relatedId = null, relatedModel = null) {
  if (mongoose.connection.readyState !== 1) return null;
  try {
    return await Notification.create({
      userId,
      type,
      title,
      message,
      relatedId,
      relatedModel,
      isRead: false,
    });
  } catch (err) {
    console.warn('Notification creation notice:', err.message);
    return null;
  }
}

/**
 * @desc    Get authenticated user's notifications
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    const userId = req.user._id;

    if (!isConnected) {
      return res.json({
        success: true,
        count: 3,
        unreadCount: 1,
        data: [
          {
            _id: 'demo_notif_001',
            type: 'MATCH_FOUND',
            title: '⭐ New Reciprocal Match!',
            message: 'Elena Rostova offers Python Programming and wants Spanish Conversation.',
            isRead: false,
            createdAt: new Date(Date.now() - 3600000),
          },
          {
            _id: 'demo_notif_002',
            type: 'CREDIT_RECEIVED',
            title: 'Time Bank Welcome Bonus',
            message: 'You received 3.0 Welcome Credits to start your learning journey.',
            isRead: true,
            createdAt: new Date(Date.now() - 86400000 * 2),
          },
          {
            _id: 'demo_notif_003',
            type: 'SESSION_COMPLETED',
            title: 'Session Confirmed',
            message: 'Your 1-on-1 session was completed and 1.0 credit was transferred.',
            isRead: true,
            createdAt: new Date(Date.now() - 86400000 * 4),
          },
        ],
      });
    }

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId }).sort({ createdAt: -1 }).limit(30).lean(),
      Notification.countDocuments({ userId, isRead: false }),
    ]);

    res.json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    if (!isConnected) {
      return res.json({
        success: true,
        message: 'Notification marked as read (demo mode)',
      });
    }

    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this notification',
      });
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all user notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    if (!isConnected) {
      return res.json({
        success: true,
        message: 'All notifications marked as read (demo mode)',
      });
    }

    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
};

