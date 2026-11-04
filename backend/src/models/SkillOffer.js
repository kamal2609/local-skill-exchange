const mongoose = require('mongoose');

const skillOfferSchema = new mongoose.Schema(
  {
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
    description: {
      type: String,
      required: [true, 'Offer description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    experienceLevel: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
      default: 'INTERMEDIATE',
    },
    teachingLanguage: {
      type: String,
      default: 'English',
      trim: true,
    },
    learningMode: {
      type: String,
      enum: ['ONLINE', 'IN_PERSON', 'HYBRID'],
      default: 'ONLINE',
    },
    sessionDuration: {
      type: Number,
      default: 60,
      min: [15, 'Session must be at least 15 minutes'],
      max: [240, 'Session cannot exceed 4 hours'],
    },
    neighborhood: {
      type: String,
      default: '',
      trim: true,
    },
    teachingApproach: {
      type: String,
      default: '',
      maxlength: [500, 'Teaching approach cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PAUSED', 'ARCHIVED'],
      default: 'ACTIVE',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

skillOfferSchema.index({ providerId: 1, skillId: 1 }, { unique: true });

const SkillOffer = mongoose.model('SkillOffer', skillOfferSchema);

module.exports = SkillOffer;

