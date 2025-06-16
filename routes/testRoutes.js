const express = require('express');
const router = express.Router();
const testSubmissionController = require('../controllers/testSubmissionController');

// POST - Submit test
router.post('/submit-test', testSubmissionController.submitTest);

module.exports = router;
