const User = require('../models/User.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const transporter = require('../config/mail.js');
const generateOTP = require('../utils/generateOTP.js');
const path = require('path');
const fs = require('fs');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
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
      message: 'Registration successful! OTP sent to your email. Please verify.',
      userId: user._id,
      email: user.email
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
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