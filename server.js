import express from 'express';
const app = express();
// Trust first proxy (Render, Heroku, etc.) so secure cookies and req.secure work correctly behind TLS termination
app.set('trust proxy', 1);
const PORT = process.env.PORT || 4000;
import pkg from 'body-parser';
const { json, urlencoded } = pkg;
import cors from 'cors';
import 'dotenv/config';
import helmet from 'helmet';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
const PgSession = connectPgSimple(session);
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
        'script-src': ["'self'", 'https://unpkg.com', 'https://cdn.jsdelivr.net'],
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
const sessionOptions = {
  name: 'sessionId',
  secret: process.env.SESSION_SECRET || 'a-secure-default-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    // Use 'none' in production so cookies are sent cross-site (frontend and backend on different origins)
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
  },
};

if (process.env.DATABASE_URL) {
  // Use Postgres-backed session store in production when DATABASE_URL exists
  // Ask connect-pg-simple to create the session table if missing
  sessionOptions.store = new PgSession({
    conObject: { connectionString: process.env.DATABASE_URL },
    createTableIfMissing: true,
  });
  console.log('Session store: configured connect-pg-simple with DATABASE_URL');
} else {
  // Fallback to MemoryStore with a warning
  console.warn(
    'Session store: DATABASE_URL not provided. Using default MemoryStore (not recommended for production).'
  );
}

app.use(session(sessionOptions));

// Test database connection
sequelize
  .authenticate()
  .then(() => console.log('Database connected successfully.'))
  .catch(err => console.error('Unable to connect to the database:', err));

app.use(passportMiddleware.initialize());
app.use(passportMiddleware.session());

// Debug middleware for CSRF issues (enable by setting DEBUG_CSRF='true')
if (process.env.DEBUG_CSRF === 'true') {
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/appointments') || req.path.startsWith('/api/auth')) {
      console.log('CSRF debug:', {
        path: req.path,
        cookies: req.cookies,
        headers: {
          'x-xsrf-token': req.headers['x-xsrf-token'],
          'x-csrf-token': req.headers['x-csrf-token'],
          cookie: req.headers['cookie'],
        },
        sessionID: req.sessionID,
      });
    }
    next();
  });
}

// Initialize CSRF protection after session and cookieParser
const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    // Allow CSRF cookie to be sent cross-site in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
});

// Apply CSRF protection to protected routes
app.use(csrfProtection);

// Attach CSRF token cookie to responses so SPA clients can read it. This must run BEFORE route handlers
app.use((req, res, next) => {
  // Explicitly set options so the frontend can read the XSRF-TOKEN cookie when frontend and backend are on different origins
  res.cookie('XSRF-TOKEN', req.csrfToken(), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  next();
});

// API endpoint for the frontend to get the CSRF token (if needed, though Axios handles it)
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Apply rate limiting to login/register endpoints
import { loginRateLimit } from './src/middleware/rateLimiter.js';
import loginRouter from './src/controllers/loginQueries.js';
app.use('/api/auth/login', loginRateLimit);
app.use('/api/auth/register', loginRateLimit);
app.use('/api/auth', loginRouter); // Standardized path to /api/auth

// Mount protected API routes AFTER CSRF protection and token middleware
import appointmentRouter from './src/controllers/appointmentRoutes.js'; // Import the new router
app.use('/api/appointments', appointmentRouter); // Mount it at /api/appointments
import adminRouter from './src/controllers/adminRoutes.js'; // Import admin routes
app.use('/api/admin', adminRouter); // Mount admin routes at /api/admin

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

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
