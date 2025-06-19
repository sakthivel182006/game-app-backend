const TestSubmission = require('../models/testSubmissionModel');
const UserAmount = require('../models/userAmountModel');
const mongoose = require('mongoose');

exports.submitTest = async (req, res) => {
  try {
    const { userId, mcqTypeId } = req.body;

    // Check if this user has already submitted this test
    const existingSubmission = await TestSubmission.findOne({ 
      userId: userId,
      mcqTypeId: mcqTypeId
    });

    if (existingSubmission) {
      return res.status(400).json({ 
        message: 'This user has already submitted this test.',
        submissionId: existingSubmission._id,
        submittedAt: existingSubmission.createdAt
      });
    }

    // If no existing submission, create new one
    const submission = new TestSubmission(req.body);
    await submission.save();
    
    res.status(201).json({ 
      message: 'Test submission saved successfully.',
      submissionId: submission._id
    });

  } catch (err) {
    console.error('Submission Error:', err);
    res.status(500).json({ 
      message: 'Failed to save submission', 
      error: err.message 
    });
  }
};

exports.getAllSubmissions = async (req, res) => {
  try {
    const submissions = await TestSubmission.find().populate('userId').populate('mcqTypeId');
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSubmissionById = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Convert string to ObjectId
    const objectUserId = new mongoose.Types.ObjectId(userId);

    // Changed from findOne to find to get all submissions
    const submissions = await TestSubmission.find({ userId: objectUserId })
      .populate('mcqTypeId'); // Populate the mcqTypeId

    if (!submissions || submissions.length === 0) {
      return res.status(404).json({ error: 'No submissions found for this user' });
    }

    res.status(200).json(submissions);

  } catch (err) {
    console.error('Error fetching submission by userId:', err);
    res.status(500).json({ error: err.message });
  }
};

// PUT update submission
exports.updateSubmission = async (req, res) => {
  try {
    const updatedSubmission = await TestSubmission.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedSubmission) return res.status(404).json({ error: 'Submission not found' });
    res.json(updatedSubmission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE a submission
exports.deleteSubmission = async (req, res) => {
  try {
    const deleted = await TestSubmission.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Submission not found' });
    res.json({ message: 'Submission deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.calculateEarningsDistribution = async (req, res) => {
  try {
    // 1. Fetch completed submissions with necessary data
    const submissions = await TestSubmission.find({ 
      status: 'completed',
      activityStatus: 'normal' // Exclude illegal attempts
    })
    .populate('userId', 'username email')
    .populate('mcqTypeId', 'name entryFee negativeMarkPercentage')
    .lean();

    if (!submissions || submissions.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'No valid completed submissions found' 
      });
    }

    // 2. Check for existing UserAmount records to prevent duplicates
    const existingUserAmounts = await UserAmount.find({
      submissionId: { $in: submissions.map(s => s._id) }
    }).select('submissionId').lean();
    
    const existingSubmissionIds = new Set(
      existingUserAmounts.map(ua => ua.submissionId.toString())
    );

    // 3. Group submissions by mcqTypeId and calculate earnings
    const grouped = {};
    const newUserAmounts = [];
    
    for (const sub of submissions) {
      // Skip if earnings already calculated for this submission
      if (existingSubmissionIds.has(sub._id.toString())) continue;

      const mcqId = sub.mcqTypeId._id.toString();
      const entryFee = sub.mcqTypeId.entryFee;
      const negativeMarkPercent = sub.mcqTypeId.negativeMarkPercentage || 0;

      // Calculate earnings with negative marking
      const negativeMarkDeduction = (entryFee * negativeMarkPercent * sub.noofwrongquestions) / 100;
      let userEarning = (entryFee * sub.percentage) / 100;
      userEarning = Math.max(0, userEarning - negativeMarkDeduction);

      // Initialize group if not exists
      if (!grouped[mcqId]) {
        grouped[mcqId] = [];
      }

      grouped[mcqId].push({
        submission: sub,
        userEarning,
        negativeMarkDeduction,
        adminEarning: entryFee - userEarning
      });
    }

    // 4. Process each MCQ type group to determine ranks
    const distribution = [];
    
    for (const mcqTypeId in grouped) {
      const group = grouped[mcqTypeId];
      
      // Sort by earnings descending
      group.sort((a, b) => b.userEarning - a.userEarning);

      // Assign ranks and prepare records
      for (let i = 0; i < group.length; i++) {
        const item = group[i];
        const sub = item.submission;
        const rank = i + 1; // 1-based ranking
        
        // Prepare UserAmount document
        newUserAmounts.push({
          userId: sub.userId._id,
          mcqTypeId: sub.mcqTypeId._id,
          submissionId: sub._id,
          mcqName: sub.mcqTypeId.name,
          entryFee: sub.mcqTypeId.entryFee,
          userPercentage: sub.percentage,
          adminPercentage: 100 - sub.percentage,
          userAmount: parseFloat(item.userEarning.toFixed(2)),
          adminAmount: parseFloat(item.adminEarning.toFixed(2)),
          negativeMarkDeduction: parseFloat(item.negativeMarkDeduction.toFixed(2)),
          status: 'pending',
          rank,
          calculatedAt: new Date()
        });

        // Prepare response data
        distribution.push({
          userId: sub.userId._id,
          username: sub.userId.username,
          email: sub.userId.email,
          mcqTypeId: sub.mcqTypeId._id,
          mcqName: sub.mcqTypeId.name,
          entryFee: sub.mcqTypeId.entryFee,
          percentage: sub.percentage,
          correctAnswers: sub.noofcorrecctquestions,
          wrongAnswers: sub.noofwrongquestions,
          negativeMarkPercent,
          negativeMarkDeduction: item.negativeMarkDeduction.toFixed(2),
          userEarning: item.userEarning.toFixed(2),
          adminEarning: item.adminEarning.toFixed(2),
          rank,
          durationInSeconds: sub.durationInSeconds,
          submittedAt: sub.submittedAt
        });
      }
    }

    // 5. Bulk insert new UserAmount records for better performance
    if (newUserAmounts.length > 0) {
      await UserAmount.insertMany(newUserAmounts);
    }

    // 6. Return comprehensive response
    res.status(200).json({
      success: true,
      message: 'Earnings distribution calculated successfully',
      stats: {
        totalSubmissions: submissions.length,
        processedSubmissions: newUserAmounts.length,
        skippedSubmissions: existingUserAmounts.length,
        mcqTypesProcessed: Object.keys(grouped).length
      },
      distribution
    });

  } catch (err) {
    console.error('Distribution calculation error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to calculate earnings distribution',
      message: err.message 
    });
  }
};