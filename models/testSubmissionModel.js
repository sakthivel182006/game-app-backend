const mongoose = require('mongoose');

const TestSubmissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mcqTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'McqType',
    required: true
  },
 
  
  percentage: {
    type: Number,
    required: true
  },
  durationInSeconds: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['completed', 'pending'],
    default: 'completed'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TestSubmission', TestSubmissionSchema);
