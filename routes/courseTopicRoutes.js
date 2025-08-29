const express = require('express');
const router = express.Router();
const courseTopicController = require('../controllers/courseTopicController');

router.post('/', courseTopicController.createCourseTopic);
router.get('/', courseTopicController.getAllCourseTopics);
router.get('/course/:courseId', courseTopicController.getTopicsByCourseId);
router.get('/:id', courseTopicController.getCourseTopicById);
router.put('/:id', courseTopicController.updateCourseTopic);
router.delete('/:id', courseTopicController.deleteCourseTopic);

module.exports = router;
