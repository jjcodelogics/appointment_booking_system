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

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
app.use(json());
app.use(urlencoded({ extended: true }));

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
    cookie: { secure: false, maxAge: 172800000, sameSite: "none", httpOnly: true  },
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