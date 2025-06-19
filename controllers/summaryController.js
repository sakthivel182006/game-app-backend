const UserAmount = require('../models/userAmount');
const SummaryRecord = require('../models/summaryRecord');

exports.calculateSummary = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get all distinct mcqTypeIds for this user
    const userMcqTypes = await UserAmount.distinct('mcqTypeId', { userId });

    if (!userMcqTypes.length) {
      return res.status(404).json({
        success: false,
        message: 'No MCQ attempts found for this user'
      });
    }

    const results = [];

    for (const mcqTypeId of userMcqTypes) {
      // Check if summary already exists
      const existingSummary = await SummaryRecord.findOne({ userId, mcqTypeId });
      if (existingSummary) {
        results.push({
          mcqTypeId,
          status: 'skipped',
          message: 'Summary already exists',
          summaryId: existingSummary._id
        });
        continue;
      }

      // Get all user attempts for this MCQ type
      const attempts = await UserAmount.find({ userId, mcqTypeId });

      if (!attempts.length) {
        results.push({
          mcqTypeId,
          status: 'failed',
          message: 'No attempts found for this MCQ type'
        });
        continue;
      }

      // Calculate summary data
      const summaryData = {
        mcqName: attempts[0].mcqName,
        totalEntryFee: attempts.reduce((sum, a) => sum + (a.entryFee || 0), 0),
        averageUserPercentage: attempts.reduce((sum, a) => sum + (a.userPercentage || 0), 0) / attempts.length,
        averageAdminPercentage: attempts.reduce((sum, a) => sum + (a.adminPercentage || 0), 0) / attempts.length,
        totalUserAmount: attempts.reduce((sum, a) => sum + (a.userAmount || 0), 0),
        totalAdminAmount: attempts.reduce((sum, a) => sum + (a.adminAmount || 0), 0),
        totalNegativeMarkDeduction: attempts.reduce((sum, a) => sum + (a.negativeMarkDeduction || 0), 0),
        highestRank: Math.max(...attempts.map(a => a.rank || 0))
      };

      // Create new summary record
      const summary = await SummaryRecord.create({
        userId,
        mcqTypeId,
        ...summaryData
      });

      results.push({
        mcqTypeId,
        status: 'calculated',
        message: 'Summary created successfully',
        summaryId: summary._id
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Summary calculation completed',
      results
    });

  } catch (error) {
    console.error('Summary calculation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate summaries',
      error: error.message
    });
  }
};

exports.getUserSummaries = async (req, res) => {
  try {
    const { userId } = req.params;
    const summaries = await SummaryRecord.find({ userId })
      .populate('mcqTypeId', 'name description'); // Optional population

    res.status(200).json({
      success: true,
      count: summaries.length,
      data: summaries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch summaries',
      error: error.message
    });
  }
};