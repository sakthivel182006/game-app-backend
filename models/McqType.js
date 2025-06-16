const mongoose = require('mongoose');

const McqTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true, // Prevents duplicate names like "Java"
        trim: true
    },
    description: {
        type: String,
        required: false,
        default: 'A collection of multiple-choice questions for this technical topic.'
    },
    imageUrl: {
        type: String, // Optional image path for displaying MCQ type icon
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now // Automatically records creation timestamp
    }
});

module.exports = mongoose.model('McqType', McqTypeSchema);
