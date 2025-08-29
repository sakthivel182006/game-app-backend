const mongoose = require('mongoose');

const CourseTopicSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',  // Reference Course
        required: true
    },
    courseName: { 
        type: String,  // Duplicate from Course.title for quick access
        required: true
    },
    topicName: {
        type: String,
        required: true,
        trim: true
    },
    videoUrl: {
        type: String,  
        required: false
    },
    order: {
        type: Number,  // Topic order inside course
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CourseTopic', CourseTopicSchema);
