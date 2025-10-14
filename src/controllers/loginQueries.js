const express = require('express');
const router = express.Router();
const passport = require('../middleware/passport');
const db = require('../models');  
const asyncHandler = require('express-async-handler');

// NEW ZOD IMPORTS
const validate = require('../middleware/validate');
const { UserRegisterSchema, UserLoginSchema } = require('../middleware/user.schemas');
// END NEW ZOD IMPORTS


// Route for user registration.
router.post('/register', 
  // NEW ZOD VALIDATION
  validate(UserRegisterSchema),
  
  async (req, res) => {
    // OLD EXPRESS-VALIDATOR ERROR HANDLING REMOVED. Zod's middleware handles it.
    
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
router.post(
  '/login',
  // NEW ZOD VALIDATION
  validate(UserLoginSchema),
  // PASSPORT AUTHENTICATION
  passport.authenticate('local', { session: true }),
  (req, res) => {
    res.json({
        msg: 'Logged in successfully',
        user: {
            id: req.user.user_id,
            // Use username_email for consistency
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

module.exports = router;