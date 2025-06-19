const express = require('express');
const router = express.Router();
const summaryController = require('../controllers/summaryController');

// Calculate summaries for a user
router.post('/:userId/summaries/calculate', summaryController.calculateSummary);

// Get all summaries for a user
router.get('/:userId/summaries', summaryController.getUserSummaries);

module.exports = router;