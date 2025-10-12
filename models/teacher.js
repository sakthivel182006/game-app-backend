const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password:{type:String,required:true},
  phone: { type: String, required: true },
  department: { type: String, required: true },
   role: { type: String, default: 'teacher' },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true } // Link to college
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);
