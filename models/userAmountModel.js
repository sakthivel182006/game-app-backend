const mongoose = require('mongoose');

const userAmountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mcqTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'McqType', required: true },
  submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestSubmission' },
  mcqName: String,
  entryFee: Number,
  userPercentage: Number,
  adminPercentage: Number,
  userAmount: Number,
  adminAmount: Number,
  negativeMarkDeduction: Number,
  status: { type: String, default: 'pending' },
  rank: Number // ⬅️ New field for ranking
}, { timestamps: true });

module.exports = mongoose.model('UserAmount', userAmountSchema);
