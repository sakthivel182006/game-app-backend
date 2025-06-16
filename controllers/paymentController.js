const razorpay = require('../config/razorpay.config');
const Order = require('../models/orderModel'); // Optional (if using DB)

// Create a new Razorpay order
exports.createOrder = async (req, res) => {
    try {
        const { amount, currency = 'INR', receipt = 'order_rcpt' } = req.body;

        const options = {
            amount: amount * 100, // Razorpay uses paise (1 INR = 100 paise)
            currency,
            receipt,
        };

        const order = await razorpay.orders.create(options);

        // Optional: Save to DB
        // const newOrder = new Order({ orderId: order.id, amount, currency, receipt });
        // await newOrder.save();

        res.status(200).json(order);
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: "Failed to create order" });
    }
};

// Verify payment signature (webhook or callback)
exports.verifyPayment = async (req, res) => {
    try {
        const { order_id, payment_id, razorpay_signature } = req.body;

        const crypto = require('crypto');
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${order_id}|${payment_id}`)
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Payment successful (update DB if needed)
            res.status(200).json({ success: true, message: "Payment verified" });
        } else {
            res.status(400).json({ success: false, message: "Invalid signature" });
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ error: "Payment verification failed" });
    }
};