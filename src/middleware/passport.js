// /src/middleware/passport.js
import { Passport } from 'passport'; 
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';

const passport = new Passport();

passport.use(
  new LocalStrategy(
    { usernameField: 'username_email' }, 
    async (username_email, password, done) => {
      try {
        // dynamically get the initialized db so User is defined
        const dbModule = (await import('../models/index.js')).default;
        const { User } = dbModule;
        if (!User) return done(new Error('User model not loaded'));

        const user = await User.findOne({ where: { username_email } });
        
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
    }
  )
);

// Serialize user: We store the user's ID in the session.
passport.serializeUser((user, done) => {
  // store primary key only
  done(null, user.user_id ?? user.id);
});

// Deserialize user: This retrieves the full user object from the database
passport.deserializeUser(async (id, done) => {
  try {
    const db = (await import('../models/index.js')).default;
    const { User } = db;
    const user = await User.findByPk(id);
    done(null, user || null);
  } catch (err) {
    done(err);
  }
});

export default passport;