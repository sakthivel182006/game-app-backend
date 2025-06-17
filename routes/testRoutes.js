const express = require('express');
const router = express.Router();
const testSubmissionController = require('../controllers/testSubmissionController');


router.post('/submit-test', testSubmissionController.submitTest);
router.get('/test-submissions/:userId', testSubmissionController.getUserTestSubmissions);
module.exports = router;
