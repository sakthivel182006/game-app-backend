const Razorpay = require('razorpay');
const crypto = require('crypto');
const CollegeOrder = require('../models/collegeorder');
const CollegeSuccessOrder = require('../models/collegesuccessorder');
const College = require('../models/college'); // College collection

const PaymentPlan = require('../models/paymentPlanModel');


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ✅ Create new order
exports.createOrder = async (req, res) => {
  try {
    const { amount, collegeid } = req.body;

    // Check if college exists
    const collegeExists = await College.findById(collegeid);
    if (!collegeExists) return res.status(404).json({ success: false, message: 'College not found' });

    // Create Razorpay order
    const options = { amount: amount * 100, currency: 'INR', receipt: `receipt_${Date.now()}` };
    const order = await razorpay.orders.create(options);

    // Save order in CollegeOrder table
    const newOrder = new CollegeOrder({
      collegeid,
      orderId: order.id,
      amount,
      currency: 'INR',
      receipt: order.receipt,
      status: 'created'
    });
    await newOrder.save();

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, message: 'Order creation failed' });
  }
};



exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, collegeid, planId, amount, currency, receipt } = req.body;

    // 1️⃣ Check if college exists
    const collegeExists = await College.findById(collegeid);
    if (!collegeExists) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }

    // 2️⃣ Check if payment plan exists
    const planExists = await PaymentPlan.findById(planId);
    if (!planExists) {
      return res.status(404).json({ success: false, message: 'Payment plan not found' });
    }

    // 3️⃣ Verify Razorpay signature
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                                    .update(body)
                                    .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    // 4️⃣ Save successful payment with planId
    const successOrder = new CollegeSuccessOrder({
      collegeid,
      orderId,
      planId,
      signature,
      amount,
      currency,
      receipt,
      status: 'paid'
    });
    await successOrder.save();

    // 5️⃣ Update original order status
    await CollegeOrder.findOneAndUpdate({ orderId }, { status: 'paid' });

    res.status(200).json({ success: true, message: 'Payment verified successfully' });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
};


// ✅ Get all successful payments for a college
exports.getSuccessfulPayments = async (req, res) => {
  try {
    const { collegeid } = req.params;

    const successOrders = await CollegeSuccessOrder.find({ collegeid, status: 'paid' })
      .populate('planId', 'planname noOfTeachers amount offer');

    res.status(200).json({ success: true, data: successOrders });
  } catch (error) {
    console.error('Error fetching successful payments:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ✅ Get all failed orders for a college
exports.getFailedOrders = async (req, res) => {
  try {
    const { collegeid } = req.params;

    const failedOrders = await CollegeOrder.find({ collegeid, status: { $ne: 'paid' } });

    res.status(200).json({ success: true, data: failedOrders });
  } catch (error) {
    console.error('Error fetching failed orders:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ✅ Get all payment plans that this college has purchased
exports.getPlansByCollege = async (req, res) => {
  try {
    const { collegeid } = req.params;

    const successOrders = await CollegeSuccessOrder.find({ collegeid, status: 'paid' });
    const planIds = successOrders.map(order => order.planId).filter(Boolean);

    const plans = await PaymentPlan.find({ _id: { $in: planIds } });

    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ✅ Get all orders (paid + unpaid) for a college
exports.getAllOrders = async (req, res) => {
  try {
    const { collegeid } = req.params;

    const orders = await CollegeOrder.find({ collegeid });

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};  