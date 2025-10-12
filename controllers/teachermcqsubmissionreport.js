const TestSubmission = require('../models/testSubmissionModel');
const McqType = require('../models/McqType');
const mongoose = require('mongoose');

exports.getAllSubmissionsByMcqType = async (req, res) => {
  try {
    const { mcqTypeId } = req.params;

    if (!mcqTypeId) {
      return res.status(400).json({ message: 'MCQ Type ID is required.' });
    }

    // 1️⃣ Check if the MCQ Type exists
    const mcqType = await McqType.findById(mcqTypeId);
    if (!mcqType) {
      return res.status(404).json({ message: 'MCQ Type not found.' });
    }

    // 2️⃣ Get all submissions for this MCQ Type
    const submissions = await TestSubmission.find({ mcqTypeId: mcqTypeId })
      .populate('userId', 'username email')
      .populate('mcqTypeId', 'name entryFee');

    if (!submissions || submissions.length === 0) {
      return res.status(404).json({ message: 'No submissions found for this MCQ Type.' });
    }

    res.status(200).json({
      success: true,
      mcqTypeId,
      mcqName: mcqType.name,
      submissionsCount: submissions.length,
      submissions
    });

  } catch (err) {
    console.error('Error fetching submissions by MCQ Type:', err);
    res.status(500).json({ message: 'Server error fetching submissions', error: err.message });
  }
};
