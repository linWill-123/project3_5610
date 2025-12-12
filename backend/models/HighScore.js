const mongoose = require('mongoose');

const highScoreSchema = new mongoose.Schema({
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  time: {
    type: Number,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['EASY', 'NORMAL'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index for efficient queries
highScoreSchema.index({ difficulty: 1, time: 1 });
highScoreSchema.index({ gameId: 1 });

module.exports = mongoose.model('HighScore', highScoreSchema);
