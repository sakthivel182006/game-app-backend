const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');

// Add a new teacher
router.post('/add', teacherController.addTeacher);

// Get all teachers
router.get('/', teacherController.getTeachers);

// Teacher login
router.post('/login', teacherController.loginTeacher);

// Get all teachers for a specific college with remaining teacher count
router.get('/college/:collegeId', teacherController.getTeachersByCollege);


// ✅ New route: Get only remaining teachers that can be added for a college
router.get('/remaining/:collegeId', teacherController.getRemainingTeachers);


module.exports = router;
