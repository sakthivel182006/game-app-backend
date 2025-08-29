const mongoose = require('mongoose');

const SourceCodeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true // No duplicate project names
    },
    description: {
        type: String,
        required: true,
        default: 'This project contains uploaded source code.'
    },
    srcCode: {
        type: String,
        required: true // Store code as plain text
    },
    language: {
        type: String,
        required: true,
        enum: ['HTML', 'CSS', 'JavaScript', 'Python', 'Java', 'C++', 'C', 'PHP', 'React', 'Other'],
        default: 'Other'
    },
    images: {
        type: [String], // Array of image URLs (screenshots / thumbnails)
        required: false
    },
    price: {
        type: Number,
        required: true,
        default: 0, // Free by default
        min: 0
    },
    createdAt: {
        type: Date,
        default: Date.now // Auto timestamp
    }
});

module.exports = mongoose.model('SourceCode', SourceCodeSchema);
