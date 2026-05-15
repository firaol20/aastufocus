import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from '../config/environment.js';
import User from '../models/User.js';

export const signAccessToken = (user) =>
  jwt.sign({ userId: user._id || user.id, role: user.role }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });

export const generateRefreshToken = () => crypto.randomBytes(64).toString('hex');

export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export const persistRefreshToken = async (userId, refreshToken) => {
  const hash = hashToken(refreshToken);
  await User.findByIdAndUpdate(userId, {
    refreshTokenHash: hash,
    refreshTokenSetAt: new Date(),
  });
};

export const verifyRefreshToken = async (userId, refreshToken) => {
  const user = await User.findById(userId).select('+refreshTokenHash');
  
  if (!user || !user.refreshTokenHash) return null;
  const matches = user.refreshTokenHash === hashToken(refreshToken);
  return matches ? user : null;
};
