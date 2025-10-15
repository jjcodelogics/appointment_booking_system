// /src/middleware/passport.js

import passportPkg from 'passport'; 
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import dbModels from '../models/index.js'; 

// Destructure utility functions from the imported passport package
const { use, serializeUser, deserializeUser } = passportPkg;

// FIX: Destructure the model from dbModels and alias it to _User
const { User: _User } = dbModels; 

// Define aliases for use in the rest of the file
const passport = passportPkg; 
const User = _User; 

// Configure the local strategy for authentication.
use(
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
serializeUser((user, done) => {
  done(null, user.user_id); 
});

// Deserialize user: This retrieves the full user object from the database
deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});


export default passport;