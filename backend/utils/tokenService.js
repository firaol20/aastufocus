import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from '../config/environment.js';
import prisma from './prisma.js';

export const signAccessToken = (user) =>
  jwt.sign({ userId: user.id, role: user.role }, config.JWT_SECRET, { expiresIn: '15m' });

export const generateRefreshToken = () => crypto.randomBytes(64).toString('hex');

export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export const persistRefreshToken = async (userId, refreshToken) => {
  const hash = hashToken(refreshToken);
  await prisma.user.update({
    where: { id: userId },
    data: {
      refreshTokenHash: hash,
      refreshTokenSetAt: new Date(),
    },
  });
};

export const verifyRefreshToken = async (userId, refreshToken) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  
  if (!user || !user.refreshTokenHash) return null;
  const matches = user.refreshTokenHash === hashToken(refreshToken);
  return matches ? user : null;
};
