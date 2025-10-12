const express = require('express');
const router = express.Router();
const teacherMcqController = require('../controllers/teachermcqtypequestionaddcontroller');

// ---------------- MCQ Type Routes ---------------- //

// ✅ Create a new MCQ Type
router.post('/mcqtype/add', teacherMcqController.createMcqType);

// ✅ Get all MCQ Types by teacher ID
router.get('/mcqtype/teacher/:teacherId', teacherMcqController.getMcqTypesByTeacher);

// ✅ Update an existing MCQ Type by its ID
router.put('/mcqtype/update/:mcqId', teacherMcqController.updateMcqType);

// ---------------- MCQ Question Routes ---------------- //

// ✅ Create a new MCQ Question
router.post('/mcqquestion/add', teacherMcqController.createMcqQuestion);

// Get all MCQ Questions for a teacher
router.get('/mcqquestions/teacher/:teacherId', teacherMcqController.getAllMcqQuestionsByTeacher);


module.exports = router;
