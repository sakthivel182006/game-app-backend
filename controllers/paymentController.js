const mongoose = require('mongoose'); // Add this at the top of your file
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Purchase = require('../models/Purchase');


const razorpay = new Razorpay({
  key_id: 'rzp_live_RB344vHWCMRmVu',
  key_secret: 'By9CZOOnxTQxIi2tDPgTPoc2'
});

exports.createOrder = async (req, res) => {
  const { amount, userId } = req.body;

  try {
    const options = {
      amount,
      currency: 'INR',
      receipt: 'receipt_' + Date.now()
    };

    const order = await razorpay.orders.create(options);

    await Order.create({
      loginuserid: userId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status
    });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.paymentSuccess = async (req, res) => {
  const { userId, razorpay_payment_id, razorpay_order_id } = req.body;

  try {
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const amount = order.amount / 100; // ✅ Convert paise to rupees

    const existingPayment = await Payment.findOne({ loginuserid: userId });

    if (existingPayment) {
      existingPayment.amount += amount;
      existingPayment.paymentId = razorpay_payment_id;
      existingPayment.orderId = razorpay_order_id;
      await existingPayment.save();

      res.json({ message: "Payment updated successfully" });
    } else {
      const newPayment = new Payment({
        loginuserid: userId,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        amount: amount,
        status: "Success"
      });

      await newPayment.save();
      res.json({ message: "Payment recorded successfully" });
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBalanceByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const payment = await Payment.findOne({ loginuserid: userId });

    if (payment) {
      res.json({ balance: payment.amount });
    } else {
      res.status(404).json({ message: "No payment record found for this user." });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTransactionHistory = async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await Order.find({ loginuserid: userId }).sort({ createdAt: -1 });
    res.json({ history: orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.purchaseProduct = async (req, res) => {
  console.log('Received payload:', req.body);

  const { userId, mcqTypeId, mcqTypeName, amount, paymentId, orderId } = req.body;

  try {
    // Step 1: Validate required fields
    if (!userId || !mcqTypeId || !mcqTypeName || !amount || !paymentId || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields.',
        missingFields: {
          userId: !!userId,
          mcqTypeId: !!mcqTypeId,
          mcqTypeName: !!mcqTypeName,
          amount: !!amount,
          paymentId: !!paymentId,
          orderId: !!orderId
        }
      });
    }

    // Step 2: Check if already purchased
    const existingPurchase = await Purchase.findOne({ loginuserid: userId, mcqTypeId });

    if (existingPurchase) {
      return res.status(400).json({
        success: false,
        message: 'You have already paid for this exam. Please wait for it to start.'
      });
    }

    // Step 3: Find user payment record
    const existingPayment = await Payment.findOne({ loginuserid: userId });

    if (!existingPayment) {
      return res.status(404).json({
        success: false,
        message: 'account balance is zero so proceed'
      });
    }

    if (existingPayment.amount < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient'
      });
    }

    // Step 4: Deduct amount and calculate remaining balance
    const remainingBalance = existingPayment.amount - amount;

    // Step 5: Create new purchase
    const newPurchase = new Purchase({
      loginuserid: userId,
      mcqTypeId,
      mcqTypeName,
      product: `MCQ Type: ${mcqTypeName}`,
      paymentId,
      orderId,
      amount,
      remainingBalance,
      status: 'Success'
    });

    try {
      const savedPurchase = await newPurchase.save();
      console.log('Saved Purchase:', savedPurchase);
    } catch (saveError) {
      console.error('Error saving purchase:', saveError);
      return res.status(500).json({
        success: false,
        message: 'Error saving purchase to database.',
        error: saveError.message
      });
    }

    // Step 6: Update payment balance
    existingPayment.amount = remainingBalance;
    await existingPayment.save();

    // Step 7: Respond success
    res.json({
      success: true,
      message: 'Payment successful and recorded.',
      data: newPurchase
    });

  } catch (err) {
    console.error('Payment processing error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during purchase processing.',
      error: err.message
    });
  }
};


exports.checkMcqTypePurchased = async (req, res) => {
  try {
    const { loginuserid, mcqTypeId } = req.body;

    if (!loginuserid || !mcqTypeId) {
      return res.status(400).json({ message: 'loginuserid and mcqTypeId are required' });
    }

    // Check if a matching purchase exists
    const purchase = await Purchase.findOne({ loginuserid, mcqTypeId });

    if (purchase) {
      return res.status(200).json({
        message: 'MCQ type has been purchased',
        mcqTypeName: purchase.mcqTypeName,
        purchaseDetails: purchase
      });
    } else {
      return res.status(404).json({ message: 'No purchase found for the given MCQ type and user' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const { userId, amount } = req.params;
    
    console.log('Received params:', { userId, amount }); // Debug log

   
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const amountToAdd = parseFloat(amount);
    if (isNaN(amountToAdd) || amountToAdd <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    // Start transaction for data consistency
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Find the existing payment record
      const existingPayment = await Payment.findOne({ 
        loginuserid: userId 
      }).session(session);

      let currentAmount = 0;
      if (existingPayment) {
        currentAmount = existingPayment.amount || 0;
      }

      // 2. Calculate new amount
      const newAmount = currentAmount + amountToAdd;

      // 3. Update or create payment record
      const updatedPayment = await Payment.findOneAndUpdate(
        { loginuserid: userId },
        { 
          amount: newAmount,
          updatedAt: new Date()
        },
        { 
          new: true,
          upsert: true,
          session 
        }
      );

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        success: true,
        message: 'Payment updated successfully',
        data: {
          previousAmount: currentAmount,
          amountAdded: amountToAdd,
          newAmount: updatedPayment.amount
        }
      });

    } catch (error) {
      // Rollback transaction if error occurs
      await session.abortTransaction();
      session.endSession();
      throw error;
    }

  } catch (error) {
    console.error('Payment update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update payment',
      error: error.message
    });
  }
};