import prisma from '../utils/prisma.js';
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

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (existingUser) {
    throw new AppError('User with this email already exists', 400);
  }

  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    throw new AppError(`Password validation failed: ${passwordValidation.errors.join(', ')}`, 400);
  }

  // Hash password manually since we moved from Mongoose hooks
  const salt = await bcrypt.genSalt(config.BCRYPT_SALT_ROUNDS || 12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      department,
      yearOfStudy: yearOfStudy ? parseInt(yearOfStudy) : null,
      phone,
      verificationToken: otp, // We store OTP in the verificationToken field
      verificationExpires,
      isVerified: false
    }
  });

  // Send verification OTP email
  try {
    await emailService.sendVerificationEmail(user, otp);
  } catch (emailError) {
    console.error('Failed to send verification email:', emailError);
  }

  const access = signAccessToken(user);
  const refresh = generateRefreshToken();
  await persistRefreshToken(user.id, refresh);

  // Exclude password from response
  const { password: _, ...userWithoutPassword } = user;

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

  const user = await prisma.user.findFirst({
    where: {
      email: email.toLowerCase(),
      verificationToken: otp,
      verificationExpires: { gt: new Date() }
    }
  });

  if (!user) {
    throw new AppError('Invalid or expired verification code', 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationToken: null,
      verificationExpires: null
    }
  });

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

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.isVerified) {
    throw new AppError('Email is already verified', 400);
  }

  // Generate new 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await prisma.user.update({
    where: { id: user.id },
    data: {
      verificationToken: otp,
      verificationExpires
    }
  });

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

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });
  if (existingUser) {
    throw new AppError('User with this email already exists', 400);
  }

  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    throw new AppError(`Password validation failed: ${passwordValidation.errors.join(', ')}`, 400);
  }

  // Hash password manually
  const salt = await bcrypt.genSalt(config.BCRYPT_SALT_ROUNDS || 12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      department,
      yearOfStudy: yearOfStudy ? parseInt(yearOfStudy) : null,
      phone,
      role: 'admin',
      isVerified: true
    }
  });

  const access = signAccessToken(user);
  const refresh = generateRefreshToken();
  await persistRefreshToken(user.id, refresh);

  // Exclude password from response
  const { password: _, ...userWithoutPassword } = user;

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
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      const access = signAccessToken(user);
      const refresh = generateRefreshToken();
      await persistRefreshToken(user.id, refresh);

      const commonCookie = {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      };

      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user;

      res
        .cookie('access_token', access, { ...commonCookie, maxAge: 15 * 60 * 1000 })
        .cookie('refresh_token', refresh, { ...commonCookie, maxAge: 30 * 24 * 60 * 60 * 1000 })
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
  await persistRefreshToken(user.id, newRefresh);

  const commonCookie = {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  };

  res
    .cookie('access_token', access, { ...commonCookie, maxAge: 15 * 60 * 1000 })
    .cookie('refresh_token', newRefresh, { ...commonCookie, maxAge: 30 * 24 * 60 * 60 * 1000 })
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
  const user = await prisma.user.findUnique({
    where: { id: req.user.id }
  });
  
  const { password: _, ...userWithoutPassword } = user;

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

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      name,
      department,
      yearOfStudy: yearOfStudy ? parseInt(yearOfStudy) : undefined,
      phone
    }
  });

  const { password: _, ...userWithoutPassword } = updatedUser;

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

  const user = await prisma.user.findUnique({
    where: { id: req.user.id }
  });

  if (!user || !user.password || !(await bcrypt.compare(currentPassword, user.password))) {
    throw new AppError('Current password is incorrect', 400);
  }

  const passwordValidation = validatePasswordStrength(newPassword);
  if (!passwordValidation.isValid) {
    throw new AppError(`Password validation failed: ${passwordValidation.errors.join(', ')}`, 400);
  }

  const salt = await bcrypt.genSalt(config.BCRYPT_SALT_ROUNDS || 12);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await prisma.user.update({
    where: { id: req.user.id },
    data: {
      password: hashedPassword,
      passwordChangedAt: new Date()
    }
  });

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// get all users
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, department, search } = req.query;

  const where = { isActive: true };
  if (role) where.role = role;
  if (department) where.department = department;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { department: { contains: search, mode: 'insensitive' } }
    ];
  }

  const take = parseInt(limit);
  const skip = (parseInt(page) - 1) * take;

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take,
    skip
  });

  const total = await prisma.user.count({ where });

  const usersWithoutPasswords = users.map(u => {
    const { password: _, ...uNoPass } = u;
    return uNoPass;
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
  const user = await prisma.user.findUnique({
    where: { id: req.params.id }
  });
  
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const { password: _, ...userWithoutPassword } = user;

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

  const updatedUser = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      name,
      email: email?.toLowerCase(),
      role,
      department,
      yearOfStudy: yearOfStudy ? parseInt(yearOfStudy) : undefined,
      phone,
      isActive
    }
  });

  const { password: _, ...userWithoutPassword } = updatedUser;

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
  await prisma.user.delete({
    where: { id: req.params.id }
  });

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// deactivate user (Admin only!)
export const deactivateUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { isActive: false }
  });

  const { password: _, ...userWithoutPassword } = user;

  res.json({
    success: true,
    message: 'User deactivated successfully',
    data: {
      user: userWithoutPassword
    }
  });
});