const mongoose = require('mongoose');

const userGameProgressSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completionTime: {
    type: Number,
    default: null,
  },
  completedAt: {
    type: Date,
    default: null,
  },
});

// Compound index to ensure one progress record per user per game
userGameProgressSchema.index({ userId: 1, gameId: 1 }, { unique: true });

module.exports = mongoose.model('UserGameProgress', userGameProgressSchema);
