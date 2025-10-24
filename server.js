import express from 'express';
const app = express();
const port = process.env.PORT || 3000;
import pkg from 'body-parser';
const { json, urlencoded } = pkg;
import cors from 'cors';
import 'dotenv/config';
import helmet from 'helmet';
import session from 'express-session';
import csurf from '@dr.pogodin/csurf';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import { join } from 'path';

import { initializeModels } from './src/models/index.js';

// Initialize models before importing db/passport
await initializeModels();

// import db after models are initialized
import db from './src/models/index.js';
const { sequelize } = db;

// Sync all defined models to the database.
// This will create the tables if they don't exist.
try {
  await sequelize.sync({ alter: true }); // Use { force: true } to drop and recreate tables
  console.log('All models were synchronized successfully.');
} catch (error) {
  console.error('Unable to synchronize the database:', error);
  process.exit(1); // Exit if we can't sync
}

// import passport after db is ready
import passportMiddleware from './src/middleware/passport.js';

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "script-src": [
          "'self'",
          "https://unpkg.com",
          "https://cdn.jsdelivr.net",
        ],
      },
    },
  })
);
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://127.0.0.1:5500',
      'http://localhost:5173', // <-- add Vite dev server origin
    ],
    credentials: true,
  })
);
app.use(json());
app.use(urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(join(process.cwd(), 'public')));

// Initialize cookie-parser
app.use(cookieParser());

// Initialize session middleware
app.use(
  session({
    name: 'sessionId',
    secret: process.env.SESSION_SECRET || 'a-secure-default-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      // Use stricter sameSite in production, relax in development so cookies are forwarded during local dev
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
    },
    // WARNING: The default MemoryStore is not for production.
    // It will leak memory and not persist across restarts.
    // For production, uncomment and configure a persistent store like this:
    // store: new (require('connect-pg-simple')(session))({ conObject: process.env.DATABASE_URL })
  })
);

// Test database connection
sequelize
  .authenticate()
  .then(() => console.log('Database connected successfully.'))
  .catch((err) => console.error('Unable to connect to the database:', err));

app.use(passportMiddleware.initialize());
app.use(passportMiddleware.session());

// mount API routes BEFORE CSRF protection
import loginRouter from './src/controllers/loginQueries.js';
app.use('/api/auth', loginRouter); // Standardized path to /api/auth
import appointmentRouter from './src/controllers/appointmentRoutes.js'; // Import the new router
app.use('/api/appointments', appointmentRouter); // Mount it at /api/appointments

// Initialize CSRF protection after session and cookieParser
const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
});
app.use(csrfProtection);

// Middleware to attach CSRF token to all responses for non-API GET requests
app.use((req, res, next) => {
  res.cookie('XSRF-TOKEN', req.csrfToken());
  next();
});

// API endpoint for the frontend to get the CSRF token (if needed, though Axios handles it)
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

import { startReminderScheduler } from './scheduler.js';
startReminderScheduler();

// CSRF error handler
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    console.error('CSRF token error:', err.message);
    res.status(403).json({ msg: 'Invalid CSRF token. Please refresh and try again.' });
  } else {
    next(err);
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
