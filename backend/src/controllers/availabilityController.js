const mongoose = require('mongoose');
const Availability = require('../models/Availability');

/**
 * @desc    Get authenticated user's weekly availability slots
 * @route   GET /api/availability/my
 * @access  Private
 */
const getMyAvailability = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    if (!isConnected) {
      return res.json({
        success: true,
        count: 3,
        data: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '12:00', learningMode: 'ONLINE', preferredDuration: 60, isActive: true },
          { dayOfWeek: 3, startTime: '14:00', endTime: '18:00', learningMode: 'ONLINE', preferredDuration: 60, isActive: true },
          { dayOfWeek: 5, startTime: '10:00', endTime: '15:00', learningMode: 'HYBRID', preferredDuration: 60, isActive: true },
        ],
      });
    }

    const slots = await Availability.find({ userId: req.user._id })
      .sort({ dayOfWeek: 1, startTime: 1 })
      .lean();

    res.json({
      success: true,
      count: slots.length,
      data: slots,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Bulk replace authenticated user's weekly availability
 * @route   PUT /api/availability/my
 * @access  Private
 */
const updateMyAvailability = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    const rawSlots = Array.isArray(req.body) ? req.body : (req.body.slots || []);

    if (!isConnected) {
      return res.json({
        success: true,
        count: rawSlots.length,
        message: 'Availability updated successfully (demo mode)',
        data: rawSlots,
      });
    }

    // Prepare slots with current user ID
    const newSlots = rawSlots.map((slot) => ({
      userId: req.user._id,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      preferredDuration: slot.preferredDuration || 60,
      learningMode: slot.learningMode || 'ONLINE',
      timezone: slot.timezone || 'UTC',
      isActive: slot.isActive !== undefined ? slot.isActive : true,
    }));

    // Replace all existing slots for this user
    await Availability.deleteMany({ userId: req.user._id });

    let createdSlots = [];
    if (newSlots.length > 0) {
      createdSlots = await Availability.insertMany(newSlots);
    }

    res.json({
      success: true,
      count: createdSlots.length,
      message: 'Weekly schedule updated successfully',
      data: createdSlots,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get public availability schedule for a user (for booking calendar)
 * @route   GET /api/availability/user/:userId
 * @access  Public
 */
const getUserAvailability = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    const { userId } = req.params;

    if (!isConnected) {
      return res.json({
        success: true,
        count: 2,
        data: [
          { dayOfWeek: 2, startTime: '10:00', endTime: '14:00', learningMode: 'ONLINE', preferredDuration: 60, isActive: true },
          { dayOfWeek: 4, startTime: '16:00', endTime: '20:00', learningMode: 'ONLINE', preferredDuration: 60, isActive: true },
        ],
      });
    }

    const slots = await Availability.find({ userId, isActive: true })
      .sort({ dayOfWeek: 1, startTime: 1 })
      .lean();

    res.json({
      success: true,
      count: slots.length,
      data: slots,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a single availability slot
 * @route   POST /api/availability
 * @access  Private
 */
const createSlot = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    if (!isConnected) {
      return res.status(201).json({
        success: true,
        message: 'Slot created successfully (demo mode)',
        data: { _id: 'demo_slot_id', userId: req.user._id, ...req.body },
      });
    }

    const slot = await Availability.create({
      userId: req.user._id,
      dayOfWeek: req.body.dayOfWeek,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      preferredDuration: req.body.preferredDuration || 60,
      learningMode: req.body.learningMode || 'ONLINE',
      timezone: req.body.timezone || 'UTC',
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
    });

    res.status(201).json({
      success: true,
      message: 'Availability slot added',
      data: slot,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a single availability slot
 * @route   DELETE /api/availability/:id
 * @access  Private
 */
const deleteSlot = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    if (!isConnected) {
      return res.json({
        success: true,
        message: 'Slot deleted successfully (demo mode)',
      });
    }

    const slot = await Availability.findById(req.params.id);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Availability slot not found',
      });
    }

    if (slot.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this availability slot',
      });
    }

    await slot.deleteOne();

    res.json({
      success: true,
      message: 'Availability slot removed',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyAvailability,
  updateMyAvailability,
  getUserAvailability,
  createSlot,
  deleteSlot,
};

