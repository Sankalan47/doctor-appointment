// server/src/api/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import User, { UserRole } from '../../database/models/User';
import Patient from '../../database/models/Patient';
import Doctor from '../../database/models/Doctor';
import config from '../../config';
import { TokenResponse } from '../../types';
import logger from '../../utils/logger';
import { AuthRequest } from '../../middleware/auth.middleware';

/**
 * Register a new user
 * @route POST /api/v1/auth/register
 * @access Public
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      throw new Error('Validation failed');
    }

    const { firstName, lastName, email, password, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Create user
    const user = await User.create({
      id: uuidv4(),
      firstName,
      lastName,
      email,
      password,
      phone,
      role: role || UserRole.PATIENT,
      isEmailVerified: false,
      isPhoneVerified: false,
      isActive: true,
    });

    // Create patient or doctor record based on role
    if (user.role === UserRole.PATIENT) {
      await Patient.create({
        id: uuidv4(),
        userId: user.id,
      });
    } else if (user.role === UserRole.DOCTOR) {
      await Doctor.create({
        id: uuidv4(),
        userId: user.id,
        licenseNumber: req.body.licenseNumber || '',
        consultationFee: 0,
        offersHomeVisit: false,
        offersTeleConsultation: true,
        status: 'pending',
        education: [],
        experience: [],
      });
    }

    // Generate tokens
    const tokens = generateTokens(user);

    // Save refresh token to user
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * @route POST /api/v1/auth/login
 * @access Public
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      throw new Error('Validation failed');
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(401);
      throw new Error('Account is disabled');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const tokens = generateTokens(user);

    // Save refresh token to user
    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
      },
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user
 * @route GET /api/v1/auth/me
 * @access Private
 */
export const getCurrentUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized');
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh token
 * @route POST /api/v1/auth/refresh-token
 * @access Public
 */
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401);
      throw new Error('Refresh token is required');
    }

    // Find user with this refresh token
    const user = await User.findOne({ where: { refreshToken } });
    if (!user) {
      res.status(401);
      throw new Error('Invalid refresh token');
    }

    // Verify refresh token
    try {
      jwt.verify(refreshToken, config.jwt.secret);
    } catch (error) {
      res.status(401);
      throw new Error('Invalid refresh token');
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    // Save new refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 * @route POST /api/v1/auth/logout
 * @access Private
 */
export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized');
    }

    // Find user
    const user = await User.findByPk(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Clear refresh token
    user.refreshToken = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request password reset
 * @route POST /api/v1/auth/forgot-password
 * @access Public
 */
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal that user doesn't exist
      res.status(200).json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link',
      });
      return;
    }

    // Generate reset token (would normally send an email here)
    const resetToken = jwt.sign({ id: user.id }, config.jwt.secret, { expiresIn: '1h' });

    // In a real implementation, send email with resetToken
    logger.info(`Reset token for ${email}: ${resetToken}`);

    res.status(200).json({
      success: true,
      message: 'If your email is registered, you will receive a password reset link',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password
 * @route POST /api/v1/auth/reset-password
 * @access Public
 */
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, password } = req.body;

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret) as { id: string };
    } catch (error) {
      res.status(400);
      throw new Error('Invalid or expired token');
    }

    // Find user
    const user = await User.findByPk(decoded.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Update password
    user.password = password;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate JWT tokens
 */
const generateTokens = (user: User): TokenResponse => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.accessExpiresIn }
  );

  const refreshToken = jwt.sign({ id: user.id }, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: parseInt(config.jwt.accessExpiresIn) * 60, // Convert minutes to seconds
  };
};
