const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper: Send JSON error response
const errorResponse = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message
  });
};

// Middleware: Authenticate user from token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    // Check for token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'No token provided');
    }

    const token = authHeader.replace('Bearer ', '').trim();

    // Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');

    // Get user from DB
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return errorResponse(res, 401, 'User not found');
    }

    // Optional: Account status check
    if (user.isActive === false) {
      return errorResponse(res, 403, 'Account is deactivated');
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth Error:', err.message);

    if (err.name === 'JsonWebTokenError') {
      return errorResponse(res, 401, 'Invalid token');
    }

    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Token expired');
    }

    return errorResponse(res, 500, 'Authentication failed');
  }
};

// Middleware: Authorize roles
const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(res, 403, `User role '${req.user?.role}' not authorized`);
    }
    next();
  };
};

// Helper: Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'default_secret_key', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

module.exports = {
  authenticate,
  authorize,
  generateToken
};
