const mongoose = require('mongoose');

const summaryRecordSchema = new mongoose.Schema({
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
  mcqName: {
    type: String,
    required: true
  },
  totalEntryFee: {
    type: Number,
    default: 0
  },
  averageUserPercentage: {
    type: Number,
    default: 0
  },
  averageAdminPercentage: {
    type: Number,
    default: 0
  },
  totalUserAmount: {
    type: Number,
    default: 0
  },
  totalAdminAmount: {
    type: Number,
    default: 0
  },
  totalNegativeMarkDeduction: {
    type: Number,
    default: 0
  },
  highestRank: {
    type: Number,
    default: 0
  },
  calculationDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('SummaryRecord', summaryRecordSchema);