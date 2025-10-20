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
import db from './src/models/index.js';

const { sequelize } = db;

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
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 172800000, // Set cookie expiration (e.g., 2 days)
      sameSite: 'lax',
      httpOnly: true,
    },
  })
);

// Test database connection
sequelize
  .authenticate()
  .then(() => console.log('Database connected successfully.'))
  .catch((err) => console.error('Unable to connect to the database:', err));

import passport from './src/middleware/passport.js';

app.use(passport.initialize());
app.use(passport.session());

import { startReminderScheduler } from './scheduler.js';
startReminderScheduler();

import loginRouter from './src/controllers/loginQueries.js';
app.use('/auth', loginRouter);
import pageRouter from './src/controllers/appointmentQueriesU.js';
app.use('/myappointments', pageRouter);
import contestRouter from './src/controllers/appointmentsQueriesA.js';
app.use('/appointments', contestRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});