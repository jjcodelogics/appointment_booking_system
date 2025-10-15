// /src/middleware/passport.js
import { Passport } from 'passport'; 
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import dbModels from '../models/index.js';

const passport = new Passport();

const { User: _User } = dbModels; 
const User = _User; 

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
// FIX 4: Call the method on the 'passport' instance
passport.serializeUser((user, done) => {
  done(null, user.user_id); 
});

// Deserialize user: This retrieves the full user object from the database
// FIX 4: Call the method on the 'passport' instance
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});


export default passport;