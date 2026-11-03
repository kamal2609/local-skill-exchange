const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    dayOfWeek: {
      type: Number,
      required: [true, 'Day of week is required (0-6)'],
      min: 0,
      max: 6,
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required (HH:mm)'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required (HH:mm)'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'],
    },
    preferredDuration: {
      type: Number,
      default: 60,
      min: 15,
      max: 240,
    },
    learningMode: {
      type: String,
      enum: ['ONLINE', 'IN_PERSON', 'HYBRID'],
      default: 'ONLINE',
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

availabilitySchema.index({ userId: 1, dayOfWeek: 1, startTime: 1 });

const Availability = mongoose.model('Availability', availabilitySchema);

module.exports = Availability;
