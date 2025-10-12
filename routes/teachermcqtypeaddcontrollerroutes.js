const express = require('express');
const router = express.Router();
const teacherMcqTypeController = require('../controllers/teachermcqtypeaddcontroller');

// Create a new MCQ type
router.post('/mcqtype/add', teacherMcqTypeController.createMcqType);



// Get all MCQ types by teacher ID
router.get('/mcqtype/teacher/:teacherId', teacherMcqTypeController.getMcqTypesByTeacher);

// Update an existing MCQ type by its ID
router.put('/mcqtype/update/:mcqTypeId', teacherMcqTypeController.updateMcqType);

module.exports = router;
