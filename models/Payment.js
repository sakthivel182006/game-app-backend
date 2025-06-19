const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  loginuserid: String,
  mcqTypeId: String,
  mcqTypeName: String,
  product: String,
  paymentId: String,
  orderId: String,
  amount: Number,
  remainingBalance: Number,
  status: String
});

module.exports = mongoose.model('Payment', paymentSchema);
