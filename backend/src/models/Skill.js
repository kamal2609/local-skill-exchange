const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a skill name'],
      unique: true,
      trim: true,
      maxlength: [100, 'Skill name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a skill category'],
      enum: ['Technology', 'Design', 'Academic', 'Creative', 'Lifestyle', 'Other'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a skill description'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    difficulty: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS'],
      default: 'ALL_LEVELS',
    },
    tags: {
      type: [String],
      default: [],
    },
    icon: {
      type: String,
      default: 'BookOpen',
    },
    popularity: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search
skillSchema.index({ name: 'text', description: 'text', tags: 'text' });

const Skill = mongoose.model('Skill', skillSchema);

module.exports = Skill;

