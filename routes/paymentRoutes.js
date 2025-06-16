const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Create a new Razorpay order
router.post('/create-order', paymentController.createOrder);

// Verify payment (callback/webhook)
router.post('/verify-payment', paymentController.verifyPayment);

module.exports = router;