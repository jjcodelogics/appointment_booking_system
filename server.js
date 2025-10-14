const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const session = require('express-session');
const passport = require('./src/middleware/passport');

// Middleware
app.use(helmet());
dotenv.config();
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const SequelizeStore = require('connect-session-sequelize')(session.Store);
const db = require('./src/models');
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
const { startReminderScheduler } = require('./scheduler');
startReminderScheduler();


// Import and use your routers
const loginRouter = require('./src/controllers/loginQueries');
app.use('/auth', loginRouter);
const pageRouter = require('./src/controllers/appointmentQueriesU');
app.use('/myappointments', pageRouter);
const contestRouter = require('./src/controllers/appointmentsQueriesA');
app.use('/appointments', contestRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});