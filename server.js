import express from 'express';
const app = express();
const port = process.env.PORT || 3000;
import pkg from 'body-parser';
const { json, urlencoded } = pkg;
import cors from 'cors';
import 'dotenv/config';
import helmet from 'helmet';
import session from 'express-session';
import { join } from 'path';

import { initializeModels } from './src/models/index.js';

// Initialize models before importing db/passport
await initializeModels();

// import db after models are initialized
import db from './src/models/index.js';
const { sequelize } = db;

import passport from './src/middleware/passport.js';

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
    ],
    credentials: true,
  })
);
app.use(json());
app.use(urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(join(process.cwd(), 'public')));

app.use(
  session({
    name: 'sessionId',
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
    },
    // store: new (require('connect-pg-simple')(session))({ conObject: process.env.DATABASE_URL }) // optional
  })
);

// Test database connection
sequelize
  .authenticate()
  .then(() => console.log('Database connected successfully.'))
  .catch((err) => console.error('Unable to connect to the database:', err));

app.use(passport.initialize());
app.use(passport.session());

// mount routes AFTER passport.session()
import loginRouter from './src/controllers/loginQueries.js';
app.use('/auth', loginRouter);
import myappointmentsRouter from './src/controllers/appointmentQueriesU.js';
app.use('/myappointments', myappointmentsRouter);
import adminAppointmentsRouter from './src/controllers/appointmentsQueriesA.js';
app.use('/appointments', adminAppointmentsRouter);

import debugSessionRouter from './src/controllers/debugSession.js';
app.use('/debug', debugSessionRouter);

import { startReminderScheduler } from './scheduler.js';
startReminderScheduler();

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
