const express = require('express');
const router = express.Router();
const {
  submitTest,
  getAllSubmissions,
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
  calculateEarningsDistribution
} = require('../controllers/testSubmissionController');

// ✅ POST: Submit a test
// URL: /api/testsubmissions/api/submit/test
router.post('/api/testsubmissions/api/submit/test', submitTest);

// ✅ GET: Fetch all submissions
// URL: /api/testsubmissions/
router.get('/', getAllSubmissions);

router.get('/calculate-earnings', calculateEarningsDistribution);

// ✅ GET: Fetch submission by ID
// URL: /api/testsubmissions/:id
router.get('/loginbyuserid/:userId', getSubmissionById);

// ✅ PUT: Update a submission by ID
// URL: /api/testsubmissions/:id
router.put('/:id', updateSubmission);

// ✅ DELETE: Remove a submission by ID
// URL: /api/testsubmissions/:id
router.delete('/:id', deleteSubmission);



module.exports = router;
