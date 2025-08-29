const CourseTopic = require('../models/CourseTopics');
const Course = require('../models/Courses');

exports.createCourseTopic = async (req, res) => {
    try {
        const { courseId, topicName, videoUrl, order } = req.body;
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const courseTopic = new CourseTopic({
            courseId,
            courseName: course.title,
            topicName,
            videoUrl,
            order
        });

        await courseTopic.save();
        res.status(201).json(courseTopic);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getAllCourseTopics = async (req, res) => {
    try {
        const topics = await CourseTopic.find().populate('courseId', 'title');
        res.json(topics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTopicsByCourseId = async (req, res) => {
    try {
        const topics = await CourseTopic.find({ courseId: req.params.courseId }).sort({ order: 1 });
        if (!topics || topics.length === 0) return res.status(404).json({ message: 'No topics found for this course' });
        res.json(topics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCourseTopicById = async (req, res) => {
    try {
        const topic = await CourseTopic.findById(req.params.id);
        if (!topic) return res.status(404).json({ message: 'Course topic not found' });
        res.json(topic);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateCourseTopic = async (req, res) => {
    try {
        const topic = await CourseTopic.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!topic) return res.status(404).json({ message: 'Course topic not found' });
        res.json(topic);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteCourseTopic = async (req, res) => {
    try {
        const topic = await CourseTopic.findByIdAndDelete(req.params.id);
        if (!topic) return res.status(404).json({ message: 'Course topic not found' });
        res.json({ message: 'Course topic deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
