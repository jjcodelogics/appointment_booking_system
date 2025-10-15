import { Router } from 'express';
const router = Router();
import passport from '../middleware/passport.js'; 
import asyncHandler from 'express-async-handler';
import validate from '../middleware/validate.js';
import userSchemas from '../middleware/user.schemas.js';
const { UserRegisterSchema, UserLoginSchema } = userSchemas;
import dbModels from '../models/index.js'; 
const { User } = dbModels; 

// Route for user registration.
router.post('/register', 
  // NEW ZOD VALIDATION
  validate(UserRegisterSchema),
  
  async (req, res) => {
    
    const { username_email, name, password } = req.body; 
    try {
      // Data is now guaranteed to be valid and sanitized by Zod
      const newUser = await User.create({
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
// login route
router.post(
  '/login',
  validate(UserLoginSchema),
  // --- FIX: Add "passport." before the authenticate call ---
  passport.authenticate('local', { session: true }),
  (req, res) => {
    res.json({
        msg: 'Logged in successfully',
        user: {
            id: req.user.user_id,
            username: req.user.username_email,
        },
      redirection: '/dashboard', 
    });
  }
);

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