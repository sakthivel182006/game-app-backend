const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true, // No duplicate course titles
        trim: true
    },
    description: {
        type: String,
        required: true,
        default: 'This course provides structured learning content.'
    },
    instructor: {
        type: String,
        required: true, // Name of the instructor
        trim: true
    },
    category: {
        type: String,
        required: true, 
        trim: true
    },
    level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Beginner'
    },
    duration: {
        type: Number, // Duration in hours
        required: true
    },
    price: {
        type: Number,
        required: true,
        default: 0, // Free if not specified
        min: 0
    },
    imageUrl: {
        type: String, // Thumbnail or course image
        required: false
    },
    startDate: {
        type: Date,
        required: true // When course starts
    },
    endDate: {
        type: Date,
        required: true // When course ends
    },
    createdAt: {
        type: Date,
        default: Date.now // Auto timestamp
    }
});

module.exports = mongoose.model('Course', CourseSchema);
