const crypto = require('crypto');
const User = require('../models/User');
const CreditTransaction = require('../models/CreditTransaction');
const generateToken = require('../utils/generateToken');

/**
 * @desc    Register a new user and award 3.0 starter credits
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, username, email, password, bio, city, preferredLearningMode, role } = req.body;

    // Check if email already in use
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists',
      });
    }

    // Check if username already in use
    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: 'This username is already taken. Please choose another.',
      });
    }

    // Hash password
    const passwordHash = await User.hashPassword(password);

    // Create user with default 3.0 credits
    const user = await User.create({
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      passwordHash,
      bio: bio || '',
      city: city || 'Local Community',
      preferredLearningMode: preferredLearningMode || 'ONLINE',
      role: role === 'PROVIDER' ? 'PROVIDER' : 'LEARNER',
      creditsBalance: 3.0,
    });

    // Record welcome bonus transaction in credit ledger
    try {
      await CreditTransaction.create({
        receiverId: user._id,
        senderId: null,
        amount: 3.0,
        type: 'WELCOME_BONUS',
        description: 'Starter welcome bonus for joining Local Skill Exchange',
      });
    } catch (txError) {
      console.warn('Could not record welcome bonus ledger transaction:', txError.message);
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account successfully registered! 3.0 starter credits awarded.',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          creditsBalance: user.creditsBalance,
          city: user.city,
          bio: user.bio,
          preferredLearningMode: user.preferredLearningMode,
          profilePicture: user.profilePicture,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & return JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const cleanId = identifier.trim().toLowerCase();

    // Find by either email or username
    const user = await User.findOne({
      $or: [{ email: cleanId }, { username: cleanId }],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email/username and password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email/username and password.',
      });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          creditsBalance: user.creditsBalance,
          city: user.city,
          bio: user.bio,
          preferredLearningMode: user.preferredLearningMode,
          profilePicture: user.profilePicture,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently logged in user profile with real-time balance
 * @route   GET /api/auth/me
 * @access  Protected
 */
const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate password reset token
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address.',
      });
    }

    // Generate random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token and store in DB with 10-minute expiry
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // In local development, return token directly for easy manual verification
    res.json({
      success: true,
      message: 'Password reset link generated successfully.',
      data: {
        resetToken,
        resetUrl: `/reset-password?token=${resetToken}`,
        expiresIn: '10 minutes',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password using reset token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Hash provided token to match stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired.',
      });
    }

    // Set new password
    user.passwordHash = await User.hashPassword(password);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save({ validateBeforeSave: false });

    const newToken = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Password has been successfully updated. You may now log in.',
      data: {
        token: newToken,
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          creditsBalance: user.creditsBalance,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
};

