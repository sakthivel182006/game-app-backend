const Teacher = require('../models/teacher');
const College = require('../models/college');
const CollegeSuccessOrder = require('../models/collegesuccessorder');
const PaymentPlan = require('../models/paymentPlanModel');

// Add a new teacher
exports.addTeacher = async (req, res) => {
  try {
    const { name, email, password, phone, department, college } = req.body;

    // 1️⃣ Check if college exists
    const collegeExists = await College.findById(college);
    if (!collegeExists) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }
    if (collegeExists.role !== 'collegemanagement') {
      return res.status(403).json({ success: false, message: 'Only colleges with role collegemanagement can add teachers' });
    }

    // 2️⃣ Check if teacher email already exists
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ success: false, message: 'Teacher email already exists' });
    }

    // 3️⃣ Get all successful paid orders for this college
    const successOrders = await CollegeSuccessOrder.find({ collegeid: college, status: 'paid' });
    if (!successOrders || successOrders.length === 0) {
      return res.status(403).json({ success: false, message: 'No active payment plans found. Please purchase a plan first.' });
    }

    // 4️⃣ Fetch all planIds from each order
    const planIds = successOrders.map(order => order.planId).filter(id => id);

    if (planIds.length === 0) {
      return res.status(403).json({ success: false, message: 'No valid plans found in the paid orders.' });
    }

    // 5️⃣ Fetch all payment plans (map by id for easy lookup)
    const plans = await PaymentPlan.find({ _id: { $in: planIds } });
    const planMap = {};
    plans.forEach(plan => {
      planMap[plan._id.toString()] = plan.noOfTeachers || 0;
    });

    // 6️⃣ Calculate total allowed teachers: sum per order, not unique plan
    const totalAllowedTeachers = successOrders.reduce((sum, order) => {
      if(order.planId && planMap[order.planId.toString()]) {
        return sum + planMap[order.planId.toString()];
      }
      return sum;
    }, 0);

    // 7️⃣ Count existing teachers for this college
    const existingTeacherCount = await Teacher.countDocuments({ college });

    // 8️⃣ Calculate remaining teachers
    const remainingTeachers = totalAllowedTeachers - existingTeacherCount;

    // 9️⃣ Check if limit reached
    if (remainingTeachers <= 0) {
      return res.status(403).json({
        success: false,
        remainingTeachers: 0,
        message: `Teacher limit reached for purchased plans. Allowed: ${totalAllowedTeachers}, Already added: ${existingTeacherCount}. Please purchase or upgrade your plan.`
      });
    }

    // 🔟 Add the new teacher
    const teacher = new Teacher({
      name,
      email,
      password, // plaintext password, consider hashing in production
      phone,
      department,
      college
    });

    await teacher.save();

    res.status(201).json({
      success: true,
      data: teacher,
      remainingTeachers: remainingTeachers - 1,
      message: `Teacher added successfully. You can add ${remainingTeachers - 1} more teacher(s).`
    });

  } catch (error) {
    console.error('Add Teacher Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get all teachers with their college info
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().populate('college');
    res.status(200).json({ success: true, data: teachers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Teacher login
exports.loginTeacher = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find teacher by email
    const teacher = await Teacher.findOne({ email }).populate('college');
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Compare plain text password
    if (teacher.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    // Exclude password in response
    const { password: _, ...teacherData } = teacher.toObject();
    res.status(200).json({ success: true, data: teacherData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all teachers for a specific college with remaining teacher count
exports.getTeachersByCollege = async (req, res) => {
  try {
    const collegeId = req.params.collegeId;

    // Get all teachers of this college
    const teachers = await Teacher.find({ college: collegeId });

    // Get all successful orders for this college
    const successOrders = await CollegeSuccessOrder.find({ collegeid: collegeId, status: 'paid' });

    // Collect all valid plan IDs
    const planIds = successOrders.map(o => o.planId).filter(Boolean);

    // Fetch the plans
    const plans = await PaymentPlan.find({ _id: { $in: planIds } });

    // Sum total allowed teachers from all plans
    const totalAllowed = plans.reduce((sum, p) => sum + (p.noOfTeachers || 0), 0);

    // Remaining teachers that can be added
    const remainingTeachers = totalAllowed - teachers.length;

    res.json({ success: true, data: { teachers, remainingTeachers } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// Get remaining teachers that can be added for a college
exports.getRemainingTeachers = async (req, res) => {
  try {
    const collegeId = req.params.collegeId;

    // 1️⃣ Count existing teachers for this college
    const existingTeacherCount = await Teacher.countDocuments({ college: collegeId });

    // 2️⃣ Get all successful paid orders for this college
    const successOrders = await CollegeSuccessOrder.find({ collegeid: collegeId, status: 'paid' });

    if (!successOrders || successOrders.length === 0) {
      return res.json({
        success: true,
        remainingTeachers: 0,
        message: 'No active paid plans found. Please purchase a plan first.'
      });
    }

    // 3️⃣ Get all plan IDs from the orders
    const planIds = successOrders.map(order => order.planId).filter(Boolean);

    if (planIds.length === 0) {
      return res.json({
        success: true,
        remainingTeachers: 0,
        message: 'No valid plans found in the paid orders.'
      });
    }

    // 4️⃣ Fetch plan details
    const plans = await PaymentPlan.find({ _id: { $in: planIds } });
    const planMap = {};
    plans.forEach(plan => {
      planMap[plan._id.toString()] = plan.noOfTeachers || 0;
    });

    // 5️⃣ Sum allowed teachers per order (count duplicates)
    const totalAllowedTeachers = successOrders.reduce((sum, order) => {
      if(order.planId && planMap[order.planId.toString()]) {
        return sum + planMap[order.planId.toString()];
      }
      return sum;
    }, 0);

    // 6️⃣ Calculate remaining teachers
    const remainingTeachers = totalAllowedTeachers - existingTeacherCount;

    res.json({
      success: true,
      remainingTeachers: remainingTeachers > 0 ? remainingTeachers : 0,
      message: `You can add ${remainingTeachers > 0 ? remainingTeachers : 0} more teacher(s).`
    });

  } catch (error) {
    console.error('Error calculating remaining teachers:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
