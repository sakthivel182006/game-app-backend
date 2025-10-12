const College = require('../models/college');


exports.addCollege = async (req, res) => {
  try {
    const { name, officialEmail, password, tneaCode, address, phone, establishedYear } = req.body;

    // ✅ 1. Basic input validation
    if (!name || !officialEmail || !password || !tneaCode || !address || !phone || !establishedYear) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // ✅ 2. Validate TNEA code (exactly 4 digits)
    if (!/^\d{4}$/.test(tneaCode)) {
      return res.status(400).json({ success: false, message: 'TNEA Code must be exactly 4 digits.' });
    }

    // ✅ 3. Validate established year (exactly 4 digits, reasonable year)
    if (!/^\d{4}$/.test(establishedYear) || establishedYear < 1900 || establishedYear > new Date().getFullYear()) {
      return res.status(400).json({ success: false, message: 'Established year must be a valid 4-digit year.' });
    }

    // ✅ 4. Validate phone number (exactly 10 digits)
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits.' });
    }

    // ✅ 5. Check for duplicates (name, email, or TNEA code)
    const existingCollege = await College.findOne({
      $or: [{ name }, { officialEmail }, { tneaCode }]
    });

    if (existingCollege) {
      return res.status(400).json({
        success: false,
        message: 'College name, official email, or TNEA code already exists.'
      });
    }

    // ✅ 6. Create and save new college
    const college = new College({
      name,
      officialEmail,
      password,
      tneaCode,
      address,
      phone,
      establishedYear
    });

    await college.save();

    res.status(201).json({
      success: true,
      message: 'College registered successfully.',
      data: college
    });
  } catch (error) {
    console.error('Error adding college:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.loginCollege = async (req, res) => {
  try {
    const { officialEmail, password } = req.body;

    const college = await College.findOne({ officialEmail });
    if (!college || college.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const { password: _, ...collegeData } = college.toObject();
    res.status(200).json({ success: true, data: collegeData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getColleges = async (req, res) => {
  try {
    const colleges = await College.find().select('-password');
    res.status(200).json({ success: true, data: colleges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
