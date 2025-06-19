const mongoose = require('mongoose');
const UserAmount = require('../models/userAmountModel');
const User = require('../models/User');
const Payment = require('../models/Payment'); // Assuming you have a Payment model

// GET earnings by userId (public endpoint)
exports.getUserEarningsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Valid userId is required' });
    }

    // Check if user exists
    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get earnings data
    const earnings = await UserAmount.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$mcqTypeId',
          mcqName: { $first: '$mcqName' },
          totalUserAmount: { $sum: '$userAmount' },
          totalAttempts: { $sum: 1 },
          attempts: {
            $push: {
              date: '$createdAt',
              percentage: '$userPercentage',
              amountWon: '$userAmount',
              rank: '$rank',
              status: '$status'
            }
          }
        }
      },
      {
        $project: {
          mcqTypeId: '$_id',
          mcqName: 1,
          totalEarnings: '$totalUserAmount',
          totalAttempts: 1,
          averagePercentage: { $avg: '$attempts.percentage' },
          bestRank: { $min: '$attempts.rank' },
          attempts: 1
        }
      },
      { $sort: { mcqName: 1 } }
    ]);

    if (!earnings.length) {
      return res.status(404).json({ message: 'No earnings found for this user' });
    }

    // Calculate totals
    const totalEarnings = earnings.reduce((sum, item) => sum + item.totalEarnings, 0);
    const totalAttempts = earnings.reduce((sum, item) => sum + item.totalAttempts, 0);

    const response = {
      userId,
      totalEarnings,
      totalAttempts,
      participatedInMcqs: earnings.length,
      mcqBreakdown: earnings.map(item => ({
        mcqTypeId: item.mcqTypeId,
        mcqName: item.mcqName,
        totalEarnings: item.totalEarnings,
        attempts: item.totalAttempts,
        averagePercentage: item.averagePercentage.toFixed(2),
        bestRank: item.bestRank,
        history: item.attempts
      }))
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching user earnings:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Send winning amount to payment module and update records
exports.sendWinningAmount = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, paymentMethod, paymentDetails } = req.body;

    // Validate inputs
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Valid userId is required' });
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Valid positive amount is required' });
    }

    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required' });
    }

    // Check if user exists
    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's total available amount
    const userAmounts = await UserAmount.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId), status: 'won' } },
      { $group: { _id: null, totalAmount: { $sum: '$userAmount' } } }
    ]);

    const availableAmount = userAmounts[0]?.totalAmount || 0;

    if (availableAmount < amount) {
      return res.status(400).json({ 
        message: 'Insufficient funds',
        availableAmount,
        requestedAmount: amount
      });
    }

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Find and update UserAmount records to mark as paid
      const recordsToUpdate = await UserAmount.find({
        userId: mongoose.Types.ObjectId(userId),
        status: 'won'
      }).sort({ createdAt: 1 }).session(session);

      let remainingAmount = amount;
      const updatedRecords = [];

      for (const record of recordsToUpdate) {
        if (remainingAmount <= 0) break;

        const amountToDeduct = Math.min(record.userAmount, remainingAmount);
        
        // Update the record
        const updatedRecord = await UserAmount.findByIdAndUpdate(
          record._id,
          {
            $inc: { userAmount: -amountToDeduct },
            $set: { 
              status: amountToDeduct === record.userAmount ? 'paid' : 'partially_paid',
              paymentDate: new Date()
            }
          },
          { new: true, session }
        );

        updatedRecords.push(updatedRecord);
        remainingAmount -= amountToDeduct;
      }

      // 2. Create payment record
      const paymentRecord = new Payment({
        userId: mongoose.Types.ObjectId(userId),
        amount,
        paymentMethod,
        paymentDetails,
        status: 'completed',
        transactionDate: new Date(),
        relatedUserAmounts: updatedRecords.map(r => r._id)
      });

      await paymentRecord.save({ session });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        message: 'Payment processed successfully',
        paymentId: paymentRecord._id,
        amountSent: amount,
        remainingBalance: availableAmount - amount,
        updatedRecords: updatedRecords.map(r => ({
          id: r._id,
          remainingAmount: r.userAmount,
          status: r.status
        }))
      });

    } catch (error) {
      // If any error occurs, abort transaction
      await session.abortTransaction();
      session.endSession();
      throw error;
    }

  } catch (error) {
    console.error('Error processing payment:', error);
    return res.status(500).json({ 
      message: 'Error processing payment',
      error: error.message 
    });
  }
};

exports.deductUserAmount = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, amount } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const deductionAmount = parseFloat(amount);
    if (isNaN(deductionAmount) || deductionAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be a positive number' });
    }

    // 2. Verify user exists
    const user = await User.findById(userId).session(session);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 3. Find ALL available funds (including different statuses)
    const availableFunds = await UserAmount.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          userAmount: { $gt: 0 },
          $or: [
            { status: 'won' },
            { status: 'pending' },
            { status: 'partially_paid' }
          ]
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$userAmount" },
          records: { $push: "$$ROOT" }
        }
      }
    ]).session(session);

    // 4. Check if any funds available
    if (availableFunds.length === 0 || !availableFunds[0].records.length) {
      return res.status(400).json({
        success: false,
        message: 'No available funds to deduct',
        available: 0,
        attempted: deductionAmount
      });
    }

    const { total: totalAvailable, records } = availableFunds[0];

    // 5. Check sufficient balance
    if (totalAvailable < deductionAmount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient funds',
        available: totalAvailable,
        attempted: deductionAmount
      });
    }

    // 6. Process deduction (oldest first)
    let remainingDeduction = deductionAmount;
    const updatedRecords = [];

    for (const record of records.sort((a, b) => a.createdAt - b.createdAt)) {
      if (remainingDeduction <= 0) break;

      const deductAmount = Math.min(record.userAmount, remainingDeduction);
      const newAmount = record.userAmount - deductAmount;

      // Update the record
      const updated = await UserAmount.findByIdAndUpdate(
        record._id,
        {
          $set: {
            userAmount: newAmount,
            status: newAmount > 0 ? 'partially_paid' : 'paid',
            updatedAt: new Date()
          }
        },
        { new: true, session }
      );

      updatedRecords.push({
        recordId: record._id,
        originalAmount: record.userAmount,
        deducted: deductAmount,
        remaining: newAmount,
        status: updated.status
      });

      remainingDeduction -= deductAmount;
    }

    // 7. Create audit record
    const transaction = new UserAmount({
      userId,
      transactionType: 'deduction',
      userAmount: -deductionAmount,
      status: 'completed',
      details: `Deducted ${deductionAmount}`,
      referenceRecords: updatedRecords.map(r => r.recordId)
    });
    await transaction.save({ session });

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: 'Deduction successful',
      totalDeducted: deductionAmount,
      remainingBalance: totalAvailable - deductionAmount,
      updatedRecords,
      transactionId: transaction._id
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Deduction failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during deduction',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};




exports.compileUserEarnings = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get all MCQ types attempted by user
    const userMcqTypes = await UserAmount.distinct('mcqTypeId', { userId });
    
    if (!userMcqTypes.length) {
      return res.status(404).json({
        success: false,
        message: 'No MCQ attempts found for this user'
      });
    }

    // Object to store all earnings data
    const allEarnings = {
      userId,
      totalEarnings: 0,
      mcqTypeEarnings: {},
      existingSummaries: 0,
      newSummaries: 0
    };

    // Process each MCQ type
    for (const mcqTypeId of userMcqTypes) {
      // Check if summary exists
      const existingSummary = await UserAmount.findOne({
        userId,
        mcqTypeId,
        isSummary: true
      });

      if (existingSummary) {
        // Add existing summary data
        allEarnings.mcqTypeEarnings[mcqTypeId] = {
          mcqName: existingSummary.mcqName,
          userAmount: existingSummary.userAmount,
          status: 'existing'
        };
        allEarnings.totalEarnings += existingSummary.userAmount;
        allEarnings.existingSummaries++;
        continue;
      }

      // Calculate new summary if doesn't exist
      const attempts = await UserAmount.find({ userId, mcqTypeId });
      const calculatedAmount = attempts.reduce((sum, attempt) => sum + (attempt.userAmount || 0), 0);

      // Store calculated data
      allEarnings.mcqTypeEarnings[mcqTypeId] = {
        mcqName: attempts[0]?.mcqName || 'Unknown',
        userAmount: calculatedAmount,
        status: 'calculated'
      };
      allEarnings.totalEarnings += calculatedAmount;
      allEarnings.newSummaries++;
    }

    return res.status(200).json({
      success: true,
      message: 'All earnings compiled successfully',
      data: allEarnings
    });

  } catch (error) {
    console.error('Error compiling earnings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to compile earnings',
      error: error.message
    });
  }
};