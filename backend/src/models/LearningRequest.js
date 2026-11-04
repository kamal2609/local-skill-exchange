const mongoose = require('mongoose');

const learningRequestSchema = new mongoose.Schema(
  {
    learnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Learner ID is required'],
      index: true,
    },
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'Skill ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Request title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    learningObjectives: {
      type: String,
      default: '',
      maxlength: [500, 'Objectives cannot exceed 500 characters'],
    },
    preferredDifficulty: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS'],
      default: 'ALL_LEVELS',
    },
    preferredDuration: {
      type: Number,
      default: 60,
      min: [15, 'Session must be at least 15 minutes'],
      max: [240, 'Session cannot exceed 4 hours'],
    },
    preferredMode: {
      type: String,
      enum: ['ONLINE', 'IN_PERSON', 'HYBRID'],
      default: 'ONLINE',
    },
    preferredSchedule: {
      type: String,
      default: 'Flexible',
      trim: true,
    },
    neighborhood: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'MATCHED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED'],
      default: 'OPEN',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const LearningRequest = mongoose.model('LearningRequest', learningRequestSchema);

module.exports = LearningRequest;

