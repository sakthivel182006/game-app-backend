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
    entryFee: {
        type: Number,
        required: true,
        default: 0, // Default to free if not specified
        min: 0 // Ensure fee isn't negative
    },
    
    
    startTimeBeforeStart: {
    type: Date, // Now storing full datetime
    required: true
},

    
    dueTimeBeforeStart: {
    type: Date, // Now storing full datetime
    required: true
},

    createdAt: {
        type: Date,
        default: Date.now // Automatically records creation timestamp
    },
     teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        default: null // Can be null or filled in request
    }
});

module.exports = mongoose.model('McqType', McqTypeSchema);