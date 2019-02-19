const mongoose = require('mongoose');
const User = require('./User');

const lockyGameSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User
  }
}, {
  timestamps: true
});

const LockyGame = mongoose.model('LockyGame', lockyGameSchema);

module.exports = LockyGame;
