const mongoose = require('mongoose');
const User = require('./User');
const Question = require('./Question');

const gameSchema = new mongoose.Schema({
  field: {
    type: String
  },
  players: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User
    },
    answers: [{
      question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Question
      },
      answer: Number,
      score: Number
    }]
  }],
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: Question
  }],
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User
  },
  token: {
    type: String,
    select: false
  },
  status: Boolean
}, {
  timestamps: true
});

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
