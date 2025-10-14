// This file is a dedicated Passport.js configuration file.
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const db = require('../models');

// Configure the local strategy for authentication.
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await db.Users.findOne({ where: { username: username } });
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      // Use bcrypt to securely compare the hashed password from the database
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// Serialize user: This determines which user data to store in the session.
// We store the user's ID because it's a small, unique identifier.
passport.serializeUser((user, done) => {
  done(null, user.user_id); // Use user.user_id from your model
});

// Deserialize user: This retrieves the full user object from the database
// based on the ID stored in the session.
passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.Users.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Middleware to check if a user is authenticated
// We can now attach this directly to the passport object for easier access.
passport.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ msg: 'You are not logged in' });
};

// Export the passport object itself, which contains all the configured methods
// and our custom isAuthenticated function.
module.exports = passport;