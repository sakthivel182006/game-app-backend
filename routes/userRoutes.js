const express = require('express');
const router = express.Router();
const {
  registerUser,
  verifyOTP,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updatePassword,
  uploadProfileImage,
  getAllUsers,
  updateUser,
  deleteUser,
  sendVerificationLink,
  verifyEmailAddress
  

} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../config/multer');

// Email Verification Routes
router.post('/auth/send-verification-link', sendVerificationLink);
router.get('/auth/verify-email-address', verifyEmailAddress);

router.post('/auth/register', registerUser);
router.post('/auth/verify-otp', verifyOTP);
router.post('/auth/login', loginUser);

// User Profile Routes (Protected)
router.route('/user/profile')
  .get(protect, getUserProfile);

router.get('/getallusers',getAllUsers);

router.put('/updateuser/:id',updateUser);

router.delete('/deleteuser/:id',deleteUser);

router.route('/user/profile/update')
  .put(protect, updateUserProfile);

router.route('/user/password/update')
  .put(protect, updatePassword);

router.route('/user/upload-image')
  .post(protect, upload.single('profileImage'), uploadProfileImage);

module.exports = router;