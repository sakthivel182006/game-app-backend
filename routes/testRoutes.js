const express = require('express');
const router = express.Router();
const {
  submitTest,
  getAllSubmissions,
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
  calculateEarningsDistribution,
  getAllSubmissionsbyadminside,
  getSubmissionBymcqtypeid,
  getSubmissiondetailsbothuseridandmcqtypeid,
  getSubmissionByIdadminside
} = require('../controllers/testSubmissionController');

// ✅ POST: Submit a test
// URL: /api/testsubmissions/api/submit/test

router.post('/api/testsubmissions/api/submit/test', submitTest);

// ✅ GET: Fetch all submissions
// URL: /api/testsubmissions/
router.get('/', getAllSubmissions);



router.get('/getall', getAllSubmissionsbyadminside);

router.get('/calculate-earnings', calculateEarningsDistribution);


router.get('/loginbyuserid/:userId', getSubmissionById);

router.get('/loginbyuseridbyadminside/:userId', getSubmissionByIdadminside);

router.get('/mcqtypeid/:mcqTypeId', getSubmissionBymcqtypeid);


router.get('/submissiondetailsbothuseridandmcqtypeidmatched/:userId/:mcqTypeId', getSubmissiondetailsbothuseridandmcqtypeid);

// ✅ PUT: Update a submission by ID
// URL: /api/testsubmissions/:id
router.put('/update/submission:id', updateSubmission);

// ✅ DELETE: Remove a submission by ID
// URL: /api/testsubmissions/:id
router.delete('/:id', deleteSubmission);



module.exports = router;
