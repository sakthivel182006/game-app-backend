const TestSubmission = require('../models/testSubmissionModel');

exports.submitTest = async (req, res) => {
  try {
    const {
      userId,
      mcqTypeId,
      percentage,
      durationInSeconds
    } = req.body;

    if (!userId || !mcqTypeId || percentage == null || durationInSeconds == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const existingSubmission = await TestSubmission.findOne({ userId, mcqTypeId });

    if (existingSubmission) {
      return res.status(409).json({
        message: "Test already submitted",
        status: "already_submitted",
        submissionId: existingSubmission._id
      });
    }

    // Save the new submission
    const newSubmission = new TestSubmission({
      userId,
      mcqTypeId,
      percentage,
      durationInSeconds,
      status: 'completed' // default
    });

    await newSubmission.save();

    return res.status(201).json({
      message: "Test submitted successfully",
      status: "submitted",
      submissionId: newSubmission._id
    });

  } catch (error) {
    console.error("Error submitting test:", error);
    return res.status(500).json({ message: "Server error while submitting test" });
  }
};
