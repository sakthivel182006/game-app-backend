const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// CREATE
router.post('/', courseController.createCourse);

// READ (all)
router.get('/', courseController.getAllCourses);

// READ (by ID)
router.get('/:id', courseController.getCourseById);

// UPDATE
router.put('/:id', courseController.updateCourse);

// DELETE
router.delete('/:id', courseController.deleteCourse);

module.exports = router;
