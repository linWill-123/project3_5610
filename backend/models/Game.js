const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  difficulty: {
    type: String,
    enum: ['EASY', 'NORMAL'],
    required: true,
  },
  board: {
    type: [[Number]],
    required: true,
  },
  solution: {
    type: [[Number]],
    required: true,
  },
  createdBy: {
    type: String,
    default: 'Guest',
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completionTime: {
    type: Number,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Game', gameSchema);
