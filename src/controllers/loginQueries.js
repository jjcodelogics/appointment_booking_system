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
  validate(userSchemas.register),
  asyncHandler(async (req, res, next) => {
    const { username_email, name, password } = req.body; 
    
    const existingUser = await db.User.findOne({ where: { username_email } });
    if (existingUser) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }

    const newUser = await db.User.create({
      username_email,
      name,
      password, 
    });

    // Automatically log the user in after successful registration
    req.login(newUser, (err) => {
      if (err) {
        return next(err);
      }
      // Return the new user object to the frontend
      return res.status(201).json(newUser);
    });
  })
);

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
      
      // Server-side redirect URL based on role
      const redirectUrl = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
      
      // respond after login so express-session sets cookie
      return res.json({
        msg: 'Logged in successfully',
        user: { user_id: user.user_id, name: user.name, username_email: user.username_email, role: user.role },
      });
    });
  })(req, res, next);
});

// New route to check if a user is logged in
router.get('/user', (req, res) => {
    if (req.isAuthenticated()) {
        // Send the full user object, not just the username
        res.json({ user: req.user });
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