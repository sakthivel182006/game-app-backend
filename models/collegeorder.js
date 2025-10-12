const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  collegeid: String,
  orderId: String,
  amount: Number,
  currency: String,
  receipt: String,
  status: String
});

module.exports = mongoose.model('CollegeOrder', orderSchema);
