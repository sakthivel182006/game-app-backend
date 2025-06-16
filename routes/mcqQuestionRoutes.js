const express = require('express');
const router = express.Router();
const mcqController = require('../controllers/mcqQuestionController');

// POST - create new mcq
router.post('/mcq-questions', mcqController.createMcqQuestion);

// GET - fetch all mcqs
router.get('/mcq-questions', mcqController.getAllMcqQuestions);


router.get('/mcqquestion/:mcqTypeId', mcqController.getMcqQuestionsByTypeId);

// PUT - update mcq by ID
router.put('/mcq-questions/:id', mcqController.updateMcqQuestion);

// DELETE - delete mcq by ID
router.delete('/mcq-questions/:id', mcqController.deleteMcqQuestion);

module.exports = router;
