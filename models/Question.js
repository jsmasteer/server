const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  field: String,
  title: String,
  answers: [{
    title: String,
    is_true: {
      type: Boolean,
      select: false
    }
  }],
  status: Boolean
}, {
  timestamps: true
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
