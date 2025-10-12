const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    officialEmail: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    tneaCode: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, default: 'collegemanagement' },
    establishedYear: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('College', collegeSchema);
