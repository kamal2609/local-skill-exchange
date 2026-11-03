const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    learnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Learner ID is required'],
      index: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Provider ID is required'],
      index: true,
    },
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'Skill ID is required'],
      index: true,
    },
    learningRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningRequest',
      default: null,
    },
    skillOfferId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SkillOffer',
      default: null,
    },
    bookingDate: {
      type: Date,
      required: [true, 'Booking date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
    },
    duration: {
      type: Number,
      default: 60,
      min: 15,
    },
    creditValue: {
      type: Number,
      default: 1.0,
      min: 0.25,
    },
    status: {
      type: String,
      enum: ['REQUESTED', 'ACCEPTED', 'REJECTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'REQUESTED',
      index: true,
    },
    learnerConfirmed: {
      type: Boolean,
      default: false,
    },
    providerConfirmed: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: '',
    },
    meetingLink: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

sessionSchema.index({ providerId: 1, bookingDate: 1, startTime: 1 });
sessionSchema.index({ learnerId: 1, bookingDate: 1, startTime: 1 });

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
