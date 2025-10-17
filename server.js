import express from 'express'
const app = express();
const port = process.env.PORT || 3000;
import pkg from 'body-parser';
const { json, urlencoded } = pkg;
import cors from 'cors';
import 'dotenv/config'
import helmet from 'helmet';
import session, { Store } from 'express-session';
import passport from './src/middleware/passport.js';
import { join } from 'path';

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "script-src": [
          "'self'",
          "https://unpkg.com",
          "https://cdn.jsdelivr.net"
        ],
        // You can add other directives as needed
      },
    },
  })
);
app.use(cors({
    origin: [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://127.0.0.1:5500'
    ],
    credentials: true,
}));
app.use(json());
app.use(urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(join(process.cwd(), 'public')));

import connectSessionSequelize from 'connect-session-sequelize';
import db from './src/models/index.js';
const SequelizeStore = connectSessionSequelize(Store);
const store = new SequelizeStore({ db: db.sequelize });
store.sync();

// session and passport setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 172800000,
      sameSite: 'lax',
      httpOnly: true
    },
    store: store 
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Import and start the scheduler
import { startReminderScheduler } from './scheduler.js';
startReminderScheduler();


// Import and use your routers
import loginRouter from './src/controllers/loginQueries.js';
app.use('/auth', loginRouter);
import pageRouter from './src/controllers/appointmentQueriesU.js';
app.use('/myappointments', pageRouter);
import contestRouter from './src/controllers/appointmentsQueriesA.js';
app.use('/appointments', contestRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});