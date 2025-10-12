const express = require('express');
const router = express.Router();
const testSubmissionController = require('../controllers/teachermcqsubmissionreport');

// ✅ Get all submissions for MCQ Types belonging to a specific teacher
router.get('/mcqtype/:mcqTypeId', testSubmissionController.getAllSubmissionsByMcqType);

module.exports = router;
