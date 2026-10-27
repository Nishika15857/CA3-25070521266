const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'campusloop_super_secret_jwt_key_change_in_production';

// Protect routes — JWT required
exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated. Please log in.' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('+role +isActive');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account has been deactivated.' });
    }
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

// Optional auth — attach user if token present but don't block
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) req.user = user;
    }
  } catch (_) {}
  next();
};

// Admin only
exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required.' });
  }
  next();
};
