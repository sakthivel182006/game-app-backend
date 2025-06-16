const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
    set: v => parseFloat(v.toFixed(2)) // Store with 2 decimal places
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    enum: ['INR', 'USD', 'EUR'],
    default: 'INR'
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['pending', 'completed', 'failed', 'refunded', 'authorized'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required'],
    unique: true
  },
  orderId: {
    type: String,
    required: [true, 'Order ID is required'],
    unique: true
  },
  signature: {
    type: String,
    required: function() {
      return this.status === 'completed';
    }
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet', 'bank_transfer', 'other'],
    required: [true, 'Payment method is required']
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  receipt: {
    type: String
  }
}, {
  timestamps: true,
  collection: 'payments',
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });

// Virtual for formatted amount
paymentSchema.virtual('formattedAmount').get(function() {
  return `${this.currency} ${this.amount.toFixed(2)}`;
});

module.exports = mongoose.model('Payment', paymentSchema);