// models/Purchase.js
const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  loginuserid: { type: String, required: true },
  mcqTypeId: { type: String, required: true },
  mcqTypeName: { type: String, required: true },
  product: { type: String },
  paymentId: { type: String, required: true },
  orderId: { type: String, required: true },
  amount: { type: Number, required: true },
  remainingBalance: { type: Number },
  status: { type: String, default: 'Success' }
}, { timestamps: true });

module.exports = mongoose.model('Purchase', purchaseSchema);
