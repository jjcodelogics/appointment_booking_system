import asyncHandler from 'express-async-handler';
import dbModels from '../models/index.js';
import dotenv from 'dotenv';
dotenv.config();

// Destructure User model from dbModels

const { User } = dbModels;

// Session-based auth middleware (Passport/express-session)
// Relies on passport to populate req.isAuthenticated() and req.user

export const isAuthenticated = (req, res, next) => {
  // debug logs to understand why authentication fails for incoming requests
  console.log('AUTH CHECK - headers.cookie:', req.headers.cookie);
  console.log('AUTH CHECK - sessionID:', req.sessionID);
  console.log('AUTH CHECK - session.passport:', req.session?.passport);
  console.log('AUTH CHECK - req.isAuthenticated():', typeof req.isAuthenticated === 'function' ? req.isAuthenticated() : undefined);

  if ((typeof req.isAuthenticated === 'function' && req.isAuthenticated()) || req.session?.passport?.user) {
    return next();
  }

  return res.status(401).json({ msg: 'Unauthorized' });
};

export const requireAdmin = (req, res, next) => {
  if (req && req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ msg: 'Forbidden: Admins only' });
};

export default { isAuthenticated, requireAdmin };
