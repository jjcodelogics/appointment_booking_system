import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import passport from '../middleware/passport.js';
// Correctly import the default export (no curly braces)
import validate from '../middleware/validate.js';
import { userSchemas } from '../middleware/user.schemas.js';
import db from '../models/index.js';

const router = Router();

// Route for user registration.
router.post('/register', 
  // Use the correct schema path
  validate(userSchemas.register),
  
  async (req, res) => {
    
    const { username_email, name, password } = req.body; 
    try {
      // Data is now guaranteed to be valid and sanitized by Zod
      const newUser = await db.User.create({
        username_email,
        name,
        password, 
      });

      res.status(201).json({
        msg: 'New user created!',
        user: {
          id: newUser.user_id,
          // Use username_email for consistency with model
          username: newUser.username_email, 
        },
      });
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
          return res.status(409).json({ msg: 'This email is already registered.' });
      }
      console.error(err);
      res.status(500).json({
        msg: 'User was not created',
        error: err.message,
      });
    }
});

// login route
// Use the correct schema path
router.post('/login', validate(userSchemas.login), (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ msg: info?.message || 'Invalid credentials' });

    req.logIn(user, (err) => {
      if (err) return next(err);
      console.log('Login success - user:', { id: user.user_id, email: user.username_email, role: user.role });
      console.log('session.passport after login:', req.session.passport);
      // respond after login so express-session sets cookie
      return res.json({
        msg: 'Logged in successfully',
        user: { user_id: user.user_id, username_email: user.username_email, role: user.role },
      });
    });
  })(req, res, next);
});

// New route to check if a user is logged in
router.get('/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ username: req.user.username_email }); // Use username_email
    } else {
        res.status(401).json({ msg: 'Not authenticated' });
    }
});

// logout route
router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ msg: 'Logout failed.' });
        }
        res.status(200).json({ msg: 'Logged out successfully.' });
    });
});

export default router;