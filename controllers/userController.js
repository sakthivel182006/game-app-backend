const User = require('../models/User.js');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const transporter = require('../config/mail.js');
const generateOTP = require('../utils/generateOTP.js');
const path = require('path');
const fs = require('fs');

exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'User with this username already exists' });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user = new User({
      username,
      email,
      password,
      otp,
      otpExpires,
    });

    await user.save();

   // Prepare email content
    const mailOptions = {
      from: `"Crack Quiz With Sakthi" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Crack Quiz With Sakthi - Verify Your Account',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <!-- Header with Branding -->
          <div style="background: linear-gradient(135deg, #6e48aa 0%, #9d50bb 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Crack Quiz With Sakthi</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0; font-size: 16px;">Expand Your Knowledge Horizons</p>
          </div>
          
          <!-- Email Content -->
          <div style="padding: 30px 25px;">
            <h2 style="color: #333; margin-top: 0;">Welcome ${username}!</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.6;">Thank you for joining our community of knowledge seekers! We're excited to have you on board.</p>
            
            <!-- OTP Section -->
            <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; text-align: center; margin: 25px 0; border: 1px dashed #6e48aa;">
              <p style="margin: 0; font-size: 14px; color: #666;">Your verification code:</p>
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 3px; color: #6e48aa; margin: 10px 0;">${otp}</div>
              <p style="margin: 0; font-size: 12px; color: #ff6b6b;">Valid for 10 minutes only</p>
            </div>
            
            <!-- Website Features -->
            <div style="margin: 25px 0;">
              <h3 style="color: #6e48aa; margin-bottom: 15px;">Start Your Knowledge Journey:</h3>
              <div style="display: flex; margin-bottom: 15px;">
                <div style="flex: 1; padding: 10px; background: #f9f5ff; border-radius: 5px; margin-right: 10px;">
                  <p style="font-weight: bold; color: #6e48aa; margin: 0 0 5px 0;">📚 Diverse Quizzes</p>
                  <p style="margin: 0; font-size: 14px; color: #555;">Test your knowledge across various subjects</p>
                </div>
                <div style="flex: 1; padding: 10px; background: #f9f5ff; border-radius: 5px;">
                  <p style="font-weight: bold; color: #6e48aa; margin: 0 0 5px 0;">🏆 Earn Badges</p>
                  <p style="margin: 0; font-size: 14px; color: #555;">Get recognized for your achievements</p>
                </div>
              </div>
              <div style="display: flex;">
                <div style="flex: 1; padding: 10px; background: #f9f5ff; border-radius: 5px; margin-right: 10px;">
                  <p style="font-weight: bold; color: #6e48aa; margin: 0 0 5px 0;">📊 Track Progress</p>
                  <p style="margin: 0; font-size: 14px; color: #555;">Monitor your learning journey</p>
                </div>
                <div style="flex: 1; padding: 10px; background: #f9f5ff; border-radius: 5px;">
                  <p style="font-weight: bold; color: #6e48aa; margin: 0 0 5px 0;">👥 Community</p>
                  <p style="margin: 0; font-size: 14px; color: #555;">Compete with fellow learners</p>
                </div>
              </div>
            </div>
            
            <!-- Call to Action -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://crackquizwithsakthi.vercel.app" style="display: inline-block; background: #6e48aa; color: white; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-weight: bold; font-size: 16px; margin-bottom: 15px;">Start Quizzing Now</a>
              <p style="color: #888; font-size: 14px;">Verify your account and dive into our quiz collection!</p>
            </div>
            
            <!-- Footer -->
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
              <p style="color: #888; font-size: 14px; line-height: 1.5;">If you didn't request this code, please ignore this email or contact support if you have concerns.</p>
              <p style="color: #888; font-size: 14px; margin-bottom: 0;">Happy Learning!<br><strong>The Crack Quiz With Sakthi Team</strong></p>
            </div>
          </div>
          
          <!-- Bottom Bar -->
          <div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #888;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Crack Quiz With Sakthi. All rights reserved.</p>
            <p style="margin: 5px 0 0;">
              <a href="https://crackquizwithsakthi.vercel.app" style="color: #6e48aa; text-decoration: none;">Home</a> | 
              <a href="https://crackquizwithsakthi.vercel.app/privacy" style="color: #6e48aa; text-decoration: none;">Privacy Policy</a> | 
              <a href="https://crackquizwithsakthi.vercel.app/contact" style="color: #6e48aa; text-decoration: none;">Contact Us</a>
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: 'Registration successful! Please Go To Verify Your Email Address.',
      userId: user._id,
      email: user.email
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

 exports.verifyOTP = async (req, res) => {
  const { userId, otp } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    // Update user verification status
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Send thank you email
    const mailOptions = {
      from: `"Crack Quiz With Sakthi" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🎉 Welcome Aboard! Your Account is Now Verified',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <!-- Header with Branding -->
          <div style="background: linear-gradient(135deg, #6e48aa 0%, #9d50bb 100%); padding: 30px 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to Crack Quiz With Sakthi!</h1>
            <p style="margin: 5px 0 0; font-size: 16px; opacity: 0.9;">Your Knowledge Journey Begins Now</p>
          </div>
          
          <!-- Email Content -->
          <div style="padding: 30px 25px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${user.username},</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Thank you for verifying your account! We're thrilled to have you as part of our learning community.
            </p>
            
            <!-- Celebration Section -->
            <div style="text-align: center; margin: 25px 0;">
              <div style="font-size: 48px;">🎉</div>
              <h3 style="color: #6e48aa;">Your account is now fully activated!</h3>
            </div>
            
            <!-- Getting Started -->
            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h4 style="color: #6e48aa; margin-top: 0;">Get Started:</h4>
              <ol style="padding-left: 20px; margin-bottom: 0;">
                <li style="margin-bottom: 8px;">Explore our quiz categories</li>
                <li style="margin-bottom: 8px;">Take your first quiz</li>
                <li style="margin-bottom: 8px;">Track your progress in your dashboard</li>
                <li>Earn badges and achievements</li>
              </ol>
            </div>
            
            <!-- Website Features -->
            <div style="margin: 30px 0;">
              <h3 style="color: #6e48aa; text-align: center; margin-bottom: 20px;">Why You'll Love Crack Quiz With Sakthi</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="background: #f9f5ff; padding: 15px; border-radius: 8px;">
                  <p style="font-weight: bold; color: #6e48aa; margin: 0 0 5px 0;">📚 1000+ MCQs</p>
                  <p style="margin: 0; font-size: 14px; color: #555;">Comprehensive question bank</p>
                </div>
                <div style="background: #f9f5ff; padding: 15px; border-radius: 8px;">
                  <p style="font-weight: bold; color: #6e48aa; margin: 0 0 5px 0;">📊 Detailed Analytics</p>
                  <p style="margin: 0; font-size: 14px; color: #555;">Track your strengths & weaknesses</p>
                </div>
                <div style="background: #f9f5ff; padding: 15px; border-radius: 8px;">
                  <p style="font-weight: bold; color: #6e48aa; margin: 0 0 5px 0;">🏆 Leaderboards</p>
                  <p style="margin: 0; font-size: 14px; color: #555;">Compete with other learners</p>
                </div>
                <div style="background: #f9f5ff; padding: 15px; border-radius: 8px;">
                  <p style="font-weight: bold; color: #6e48aa; margin: 0 0 5px 0;">📱 Mobile Friendly</p>
                  <p style="margin: 0; font-size: 14px; color: #555;">Learn anywhere, anytime</p>
                </div>
              </div>
            </div>
            
            <!-- Call to Action -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://crackquizwithsakthi.vercel.app/login" style="display: inline-block; background: #6e48aa; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold; font-size: 16px;">Start Learning Now</a>
            </div>
            
            <!-- Footer -->
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px; text-align: center;">
              <p style="color: #888; font-size: 14px; margin-bottom: 5px;">Need help or have questions?</p>
              <p style="color: #888; font-size: 14px; margin: 0;">
                Contact us at <a href="mailto:support@crackquizwithsakthi.vercel.app" style="color: #6e48aa;">support@crackquizwithsakthi.vercel.app</a>
              </p>
            </div>
          </div>
          
          <!-- Bottom Bar -->
          <div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #888;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Crack Quiz With Sakthi. All rights reserved.</p>
            <p style="margin: 5px 0 0;">
              <a href="https://crackquizwithsakthi.vercel.app" style="color: #6e48aa; text-decoration: none;">Home</a> | 
              <a href="https://crackquizwithsakthi.vercel.app/privacy" style="color: #6e48aa; text-decoration: none;">Privacy Policy</a> | 
              <a href="https://crackquizwithsakthi.vercel.app/contact" style="color: #6e48aa; text-decoration: none;">Contact Us</a>
            </p>
          </div>
        </div>
      `
    };

    // Send email (don't await to speed up response)
    transporter.sendMail(mailOptions)
      .then(() => console.log(`Thank you email sent to ${user.email}`))
      .catch(err => console.error('Error sending thank you email:', err));

    // Send response
    res.status(200).json({
      success: true,
      message: 'Account verified successfully!',
      data: {
        userId: user._id,
        email: user.email,
        username: user.username,
        website: {
          name: 'Crack Quiz With Sakthi',
          url: 'https://crackquizwithsakthi.vercel.app',
          features: [
            'Comprehensive MCQ collection',
            'Detailed performance analytics',
            'Personalized learning paths',
            'Competitive exam preparation'
          ],
          loginUrl: 'https://crackquizwithsakthi.vercel.app/login'
        }
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during OTP verification',
      error: error.message
    });
  }
};
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
  exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Account not verified. Please check your email for OTP.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        image: user.image
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp -otpExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      image: user.image || null,
      isVerified: user.isVerified
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error fetching user profile', error: error.message });
  }
};

// @desc    Update user profile details
// @route   PUT /api/user/profile/update
// @access  Private
exports.updateUserProfile = async (req, res) => {
  const { username, email } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if new email already exists for another user
    if (email && email !== user.email) {
      const existingEmailUser = await User.findOne({ email });
      if (existingEmailUser && existingEmailUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Email already in use by another account' });
      }
    }

    // Check if new username already exists for another user
    if (username && username !== user.username) {
      const existingUsernameUser = await User.findOne({ username });
      if (existingUsernameUser && existingUsernameUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    user.username = username || user.username;
    user.email = email || user.email;

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        image: user.image
      }
    });

  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
};

// @desc    Update user password
// @route   PUT /api/user/password/update
// @access  Private
exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Server error updating password', error: error.message });
  }
};

// @desc    Upload user profile image
// @route   POST /api/user/upload-image
// @access  Private
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old image if it exists
    if (user.image) {
      const oldImagePath = path.join(__dirname, '..', 'public', user.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Save new image path (relative to public folder)
    const imagePath = `/uploads/${req.file.filename}`;
    user.image = imagePath;
    await user.save();

    res.status(200).json({
      message: 'Profile image uploaded successfully',
      imageUrl: imagePath
    });

  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({ message: 'Server error uploading image', error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -otp -otpExpires'); // Exclude sensitive fields
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).select('-password -otp -otpExpires');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error while updating user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
};


// controllers/authController.js (or your controller file)

exports.verifyEmailAddress = async (req, res) => {
  const { userId, otp } = req.query;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send('User not found');
    }

    if (user.isVerified) {
      return res.status(400).send('Email already verified.');
    }

    if (user.otp !== otp) {
      return res.status(400).send('Invalid OTP');
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).send('OTP expired');
    }

    // Update user verification
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Redirect or confirm success
    return res.send(`
      <html>
        <head>
          <title>Email Verified</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: #f4f4f4;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
            }
            .card {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 0 15px rgba(0,0,0,0.1);
              text-align: center;
            }
            .btn {
              margin-top: 20px;
              padding: 10px 25px;
              background: #6e48aa;
              color: white;
              border: none;
              border-radius: 5px;
              text-decoration: none;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>🎉 Your email has been verified!</h2>
            <p>You can now log in and start your learning journey.</p>
            <a href="https://crackquizwithsakthi.vercel.app/login" class="btn">Go to Login</a>
          </div>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('Error verifying email via link:', error);
    res.status(500).send('Server error while verifying email');
  }
};


exports.sendVerificationLink = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Email not registered." });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified. Please login." });
    }

    // Generate unique code
    const uniqueCode = crypto.randomBytes(16).toString("hex");
    user.verificationCode = uniqueCode;
    await user.save();

    // Create verification link
    const link = `https://gameappbackend-i8zv.onrender.com/api/auth/verify-email-address?code=${uniqueCode}&email=${email}`;

    // Mail options
    const mailOptions = {
  from: `"Crack Quiz With Sakthi" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "🔐 Verify Your Email Address",
  html: `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      body { font-family: 'Inter', sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .card { background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
      .header { background: linear-gradient(135deg, #6b46c1 0%, #805ad5 100%); padding: 24px; border-radius: 12px 12px 0 0; }
      .content { padding: 24px; }
      .button { background: linear-gradient(135deg, #6b46c1 0%, #805ad5 100%); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; }
      .footer { padding: 16px; text-align: center; font-size: 12px; color: #64748b; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <div class="header">
          <h1 style="color: white; font-size: 24px; font-weight: 700; text-align: center; margin: 0;">Verify Your Email</h1>
        </div>
        <div class="content">
          <p style="font-size: 16px; color: #334155; margin-bottom: 24px;">Hi there,</p>
          <p style="font-size: 16px; color: #334155; margin-bottom: 24px;">Thank you for registering with Crack Quiz With Sakthi! Please click the button below to verify your email address:</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${link}" class="button">Verify Email Address</a>
          </div>
          
          <p style="font-size: 14px; color: #64748b; margin-bottom: 24px;">If you didn't create an account with us, please ignore this email.</p>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 16px;">
            <p style="font-size: 14px; color: #64748b; margin-bottom: 8px;">Didn't work? Copy and paste this link in your browser:</p>
            <p style="font-size: 13px; color: #475569; word-break: break-all;">${link}</p>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Crack Quiz With Sakthi. All rights reserved.</p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `
};

    // Send email
    await transporter.sendMail(mailOptions);
    res.json({ message: "Verification email sent successfully." });

  } catch (err) {
    console.error("Error in sending verification email:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};
exports.verifyEmailAddress = async (req, res) => {
  const { code, email } = req.query;

  try {
    const user = await User.findOne({ email, verificationCode: code });

    if (!user) {
      return res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verification Failed | Crack Quiz With Sakthi</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Inter', sans-serif; }
            .gradient-bg { background: linear-gradient(135deg, #6b46c1 0%, #805ad5 100%); }
          </style>
        </head>
        <body class="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <div class="w-full max-w-md">
            <div class="gradient-bg text-white rounded-t-xl p-6 text-center">
              <h1 class="text-2xl font-bold">Verification Failed</h1>
            </div>
            
            <div class="bg-white rounded-b-xl shadow-lg p-6 text-center">
              <div class="flex justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-800 mb-2">Invalid or Expired Link</h2>
              <p class="text-gray-600 mb-6">The verification link you used is invalid or has expired. Please request a new verification email.</p>
              
              <a href="https://crackquizwithsakthi.vercel.app" class="inline-block gradient-bg text-white py-2 px-6 rounded-lg font-medium hover:opacity-90 transition">
                Return to Home
              </a>
            </div>
          </div>
        </body>
        </html>
      `);
    }

    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verified | Crack Quiz With Sakthi</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Inter', sans-serif; }
          .gradient-bg { background: linear-gradient(135deg, #6b46c1 0%, #805ad5 100%); }
          .checkmark-circle {
            stroke-dasharray: 166;
            stroke-dashoffset: 166;
            stroke-width: 2;
            stroke-miterlimit: 10;
            animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
          }
          .checkmark {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            display: block;
            stroke-width: 2;
            stroke: #fff;
            stroke-miterlimit: 10;
            margin: 10% auto;
            box-shadow: inset 0px 0px 0px #6b46c1;
            animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
          }
          .checkmark-check {
            transform-origin: 50% 50%;
            stroke-dasharray: 48;
            stroke-dashoffset: 48;
            animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
          }
          @keyframes stroke {
            100% { stroke-dashoffset: 0; }
          }
          @keyframes scale {
            0%, 100% { transform: none; }
            50% { transform: scale3d(1.1, 1.1, 1); }
          }
          @keyframes fill {
            100% { box-shadow: inset 0px 0px 0px 30px #6b46c1; }
          }
        </style>
      </head>
      <body class="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div class="w-full max-w-md">
          <div class="gradient-bg text-white rounded-t-xl p-6 text-center">
            <h1 class="text-2xl font-bold">Email Verified</h1>
          </div>
          
          <div class="bg-white rounded-b-xl shadow-lg p-6 text-center">
            <div class="mb-4">
              <svg class="checkmark mx-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle class="checkmark-circle" fill="none" cx="26" cy="26" r="25"/>
                <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-gray-800 mb-2">Successfully Verified!</h2>
            <p class="text-gray-600 mb-6">Your email address has been successfully verified. You can now login to your account.</p>
            
            <a href="https://crackquizwithsakthi.vercel.app" class="inline-block gradient-bg text-white py-2 px-6 rounded-lg font-medium hover:opacity-90 transition">
              Continue to Login
            </a>
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error | Crack Quiz With Sakthi</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Inter', sans-serif; }
          .gradient-bg { background: linear-gradient(135deg, #6b46c1 0%, #805ad5 100%); }
        </style>
      </head>
      <body class="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div class="w-full max-w-md">
          <div class="gradient-bg text-white rounded-t-xl p-6 text-center">
            <h1 class="text-2xl font-bold">Verification Error</h1>
          </div>
          
          <div class="bg-white rounded-b-xl shadow-lg p-6 text-center">
            <div class="flex justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-gray-800 mb-2">Server Error</h2>
            <p class="text-gray-600 mb-6">We encountered an error while verifying your email. Please try again later.</p>
            
            <a href="https://learnfromsakthi.vercel.app" class="inline-block gradient-bg text-white py-2 px-6 rounded-lg font-medium hover:opacity-90 transition">
              Return to Home
            </a>
          </div>
        </div>
      </body>
      </html>
    `);
  }
};