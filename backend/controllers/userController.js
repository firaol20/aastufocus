import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwtUtils.js';
import passport from '../config/passport.js';
import cookieParser from 'cookie-parser';
import { signAccessToken, generateRefreshToken, persistRefreshToken, verifyRefreshToken } from '../utils/tokenService.js';
import config from '../config/environment.js';
import { validatePasswordStrength } from '../utils/passwordUtils.js';
import { AppError } from '../middleware/errorsHandler.js';
import { asyncHandler } from '../middleware/errorsHandler.js';
import emailService from '../services/emailService.js';
import crypto from 'node:crypto';

// register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, department, yearOfStudy, phone } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    throw new AppError('User with this email already exists', 400);
  }

  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    throw new AppError(`Password validation failed: ${passwordValidation.errors.join(', ')}`, 400);
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password, // Mongoose pre-save hook handles hashing
    department,
    yearOfStudy: yearOfStudy ? parseInt(yearOfStudy) : null,
    phone,
    verificationToken: otp,
    verificationExpires,
    isVerified: false
  });

  // Send verification OTP email
  try {
    await emailService.sendVerificationEmail(user, otp);
  } catch (emailError) {
    console.error('Failed to send verification email:', emailError);
  }

  const access = signAccessToken(user);
  const refresh = generateRefreshToken();
  await persistRefreshToken(user._id, refresh);

  const userWithoutPassword = user.toObject();
  delete userWithoutPassword.password;

  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please check your email to verify your account.',
    data: {
      user: userWithoutPassword,
      accessToken: access,
      refreshToken: refresh
    }
  });
});

// verify email (OTP)
export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new AppError('Email and OTP code are required', 400);
  }

  const user = await User.findOne({
    email: email.toLowerCase(),
    verificationToken: otp,
    verificationExpires: { $gt: new Date() }
  });

  if (!user) {
    throw new AppError('Invalid or expired verification code', 400);
  }

  user.isVerified = true;
  user.verificationToken = null;
  user.verificationExpires = null;
  await user.save();

  // Send welcome email after successful verification
  try {
    await emailService.sendWelcomeEmail(user);
  } catch (emailError) {
    console.error('Failed to send welcome email:', emailError);
  }

  res.json({
    success: true,
    message: 'Email verified successfully. Welcome to the fellowship!'
  });
});

// resend verification code
export const resendVerificationCode = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Email is required', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.isVerified) {
    throw new AppError('Email is already verified', 400);
  }

  // Generate new 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  user.verificationToken = otp;
  user.verificationExpires = verificationExpires;
  await user.save();

  // Send verification OTP email
  try {
    await emailService.sendVerificationEmail(user, otp);
  } catch (emailError) {
    console.error('Failed to send verification email:', emailError);
    throw new AppError('Failed to send verification email. Please try again later.', 500);
  }

  res.json({
    success: true,
    message: 'A new verification code has been sent to your email.'
  });
});

// register admin
export const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, department, yearOfStudy, phone } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('User with this email already exists', 400);
  }

  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    throw new AppError(`Password validation failed: ${passwordValidation.errors.join(', ')}`, 400);
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    department,
    yearOfStudy: yearOfStudy ? parseInt(yearOfStudy) : null,
    phone,
    role: 'admin',
    isVerified: true
  });

  const access = signAccessToken(user);
  const refresh = generateRefreshToken();
  await persistRefreshToken(user._id, refresh);

  const userWithoutPassword = user.toObject();
  delete userWithoutPassword.password;

  res.status(201).json({
    success: true,
    message: 'Admin user registered successfully',
    data: {
      user: userWithoutPassword,
      accessToken: access,
      refreshToken: refresh
    }
  });
});

// login
export const login = (req, res, next) => {
  passport.authenticate('local', { session: false }, async (err, user) => {
    if (err || !user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication failed' 
      });
    }

    try {
      // Update lastLogin
      user.lastLogin = new Date();
      await user.save();

      const access = signAccessToken(user);
      const refresh = generateRefreshToken();
      await persistRefreshToken(user._id, refresh);

      const commonCookie = {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      };

      const userWithoutPassword = user.toObject();
      delete userWithoutPassword.password;

      res
        .cookie('access_token', access, { ...commonCookie, maxAge: 365 * 24 * 60 * 60 * 1000 })
        .cookie('refresh_token', refresh, { ...commonCookie, maxAge: 365 * 24 * 60 * 60 * 1000 })
        .json({
          success: true,
          message: 'Login successful',
          data: {
            user: userWithoutPassword,
            accessToken: access,
            refreshToken: refresh
          }
        });
    } catch (e) {
      next(e);
    }
  })(req, res, next);
};

// refresh token
export const refreshToken = asyncHandler(async (req, res) => {
  const refresh = req.cookies?.refresh_token;
  const userId = req.body?.userId;
  if (!refresh || !userId) {
    return res.status(401).json({ success: false, message: 'No refresh token' });
  }

  const user = await verifyRefreshToken(userId, refresh);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }

  const access = signAccessToken(user);
  const newRefresh = generateRefreshToken();
  await persistRefreshToken(user._id, newRefresh);

  const commonCookie = {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  };

  res
    .cookie('access_token', access, { ...commonCookie, maxAge: 365 * 24 * 60 * 60 * 1000 })
    .cookie('refresh_token', newRefresh, { ...commonCookie, maxAge: 365 * 24 * 60 * 60 * 1000 })
    .json({ 
      success: true, 
      message: 'Token refreshed',
      data: {
        accessToken: access,
        refreshToken: newRefresh
      }
    });
});

// logout
export const logout = (req, res) => {
  res
    .clearCookie('access_token', { path: '/' })
    .clearCookie('refresh_token', { path: '/' })
    .json({ success: true, message: 'Logged out successfully' });
};

// get profile
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  const userWithoutPassword = user.toObject();
  delete userWithoutPassword.password;

  res.json({
    success: true,
    data: {
      user: userWithoutPassword
    }
  });
});

// update profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, department, yearOfStudy, phone } = req.body;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, {
    name,
    department,
    yearOfStudy: yearOfStudy ? parseInt(yearOfStudy) : undefined,
    phone
  }, { new: true });

  const userWithoutPassword = updatedUser.toObject();
  delete userWithoutPassword.password;

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: userWithoutPassword
    }
  });
});

// change password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  if (!user || !user.password || !(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 400);
  }

  const passwordValidation = validatePasswordStrength(newPassword);
  if (!passwordValidation.isValid) {
    throw new AppError(`Password validation failed: ${passwordValidation.errors.join(', ')}`, 400);
  }

  user.password = newPassword;
  user.passwordChangedAt = new Date();
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// get all users
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, department, search } = req.query;

  const query = { isActive: true };
  if (role) query.role = role;
  if (department) query.department = department;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { department: { $regex: search, $options: 'i' } }
    ];
  }

  const take = parseInt(limit);
  const skip = (parseInt(page) - 1) * take;

  const [users, total] = await Promise.all([
    User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(take),
    User.countDocuments(query)
  ]);

  const usersWithoutPasswords = users.map(u => {
    const uObj = u.toObject();
    delete uObj.password;
    return uObj;
  });

  res.json({
    success: true,
    data: {
      users: usersWithoutPasswords,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / take),
        totalUsers: total,
        usersPerPage: take
      }
    }
  });
});

// get user by id
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const userWithoutPassword = user.toObject();
  delete userWithoutPassword.password;

  res.json({
    success: true,
    data: {
      user: userWithoutPassword
    }
  });
});

// update user (Admin only!)
export const updateUser = asyncHandler(async (req, res) => {
  const { name, email, role, department, yearOfStudy, phone, isActive } = req.body;

  const updatedUser = await User.findByIdAndUpdate(req.params.id, {
    name,
    email: email?.toLowerCase(),
    role,
    department,
    yearOfStudy: yearOfStudy ? parseInt(yearOfStudy) : undefined,
    phone,
    isActive
  }, { new: true });

  const userWithoutPassword = updatedUser.toObject();
  delete userWithoutPassword.password;

  res.json({
    success: true,
    message: 'User updated successfully',
    data: {
      user: userWithoutPassword
    }
  });
});

// delete user (Admin only!)
export const deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// deactivate user (Admin only!)
export const deactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });

  const userWithoutPassword = user.toObject();
  delete userWithoutPassword.password;

  res.json({
    success: true,
    message: 'User deactivated successfully',
    data: {
      user: userWithoutPassword
    }
  });
});