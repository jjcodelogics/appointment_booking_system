const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const db = require('../models');

const User = db.User; 

// Configure the local strategy for authentication.
passport.use(
  new LocalStrategy(
    { usernameField: 'username_email' }, 
    async (username_email, password, done) => {
    try {
      const user = await User.findOne({ where: { username_email: username_email } });
      
      if (!user) {
        return done(null, false, { message: 'Invalid credentials.' });
      }


      const isMatch = await user.validPassword(password);
      if (!isMatch) {
        return done(null, false, { message: 'Invalid credentials.' });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// Serialize user: We store the user's ID in the session.
passport.serializeUser((user, done) => {
  done(null, user.user_id); 
});

// Deserialize user: This retrieves the full user object from the database
passport.deserializeUser(async (id, done) => {
  try {
    // FIX: Use the correct model reference (User)
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});


module.exports = passport;