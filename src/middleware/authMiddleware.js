import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import dbModels from '../models/index.js';
import dotenv from 'dotenv';
dotenv.config();

// Destructure User model from dbModels

const { User } = dbModels;

export const isAuthenticated = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ msg: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(decoded.id);

    if (!req.user) {
      return res.status(401).json({ msg: 'Unauthorized: User not found' });
    }

    next();
  } catch (error) {
    res.status(401).json({ msg: 'Unauthorized: Invalid token' });
  }
});

export const isAdmin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ msg: 'Forbidden: Admins only' });
});
