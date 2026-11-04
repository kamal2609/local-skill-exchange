const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect middleware: Ensures request has a valid Bearer JWT and sets req.user
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: No authentication token provided',
      });
    }

    // Verify token
    const secret = process.env.JWT_SECRET || 'super_secret_local_skill_exchange_jwt_key_2026';
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: Invalid or expired authentication token',
      });
    }

    // Load user from database
    const user = await User.findById(decoded.id).select('-passwordHash -passwordResetToken -passwordResetExpires');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: User account no longer exists',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authorize middleware: Enforces Role-Based Access Control (RBAC)
 * @param  {...string} roles - Permitted roles (e.g. 'ADMIN', 'PROVIDER')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: User session required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' is not authorized to access this resource`,
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorize,
};
