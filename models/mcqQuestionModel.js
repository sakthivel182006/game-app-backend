// models/mcqQuestionModel.js
const mongoose = require('mongoose');

const McqSchema = new mongoose.Schema({
  
  mcqTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'McqType',
    required: true
  },
  question: {
    type: String,
    required: true
  },
  options: {
    A: { type: String, required: true },
    B: { type: String, required: true },
    C: { type: String, required: true },
    D: { type: String, required: true }
  },
  answer: {
    type: String,
    enum: ['A', 'B', 'C', 'D'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('McqQuestion', McqSchema);
