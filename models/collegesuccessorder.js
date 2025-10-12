const mongoose = require('mongoose');

const collegeSuccessOrderSchema = new mongoose.Schema({
  collegeid: { type: String, required: true },
  orderId: { type: String, required: true },
  planId: { type: String, required: true }, // renamed from paymentPlanId
  signature: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  receipt: { type: String, required: true },
  status: { type: String, default: 'paid' }
}, { timestamps: true });

module.exports = mongoose.model('collegesuccessorder', collegeSuccessOrderSchema);
