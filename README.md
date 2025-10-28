# Appointment Booking System

A production-oriented full-stack appointment booking platform with role-based access control, automated reminders, and strong security practices. This repository is a portfolio-quality project demonstrating end-to-end development (React + Express + Sequelize).

Highlights for recruiters
- Role-based authentication (user / admin) with session-based auth using Passport.js
- Robust input validation with Zod and secure password hashing with bcrypt
- Background scheduling for email reminders (node-cron + nodemailer)
- Comprehensive test coverage (unit + integration) with Mocha/Chai
- Production-aware security: CSRF protection, Helmet, rate limiting, and secure session cookies

Quick demo (development)
1. Install dependencies:

   npm install

2. Create a .env file (example in README) and run migrations:

   npx sequelize-cli db:migrate

3. Create an admin user (CLI helper):

   npm run create-admin

4. Start backend and frontend in separate terminals:

   npm start               # starts Express server (default port 3000)
   npm run dev             # starts Vite frontend (default port 5173)

Frontend: http://localhost:5173  •  Backend API: http://localhost:3000

Key features
- Users: register, login, book, reschedule, and cancel appointments with real-time availability checking
- Admins: view and manage appointments, perform bulk operations, and export data
- Email confirmations and reminders to reduce no-shows
- Audit logging for admin actions

Tech stack
- Frontend: React 19 + Vite
- Backend: Node.js + Express 5
- Database: PostgreSQL (Sequelize ORM)
- Auth/Validation: Passport.js and Zod
- Scheduling: node-cron
- Testing: Mocha, Chai, Sinon

Testing
- Run test suite:

  npm test

- Tests cover models, controllers, middleware, and integration flows.

Formatting
- Code is formatted with Prettier. To apply formatting locally:

  npm run format

Deployment notes
- Recommended production setup: containerize the app, use a process manager (PM2), configure HTTPS via reverse proxy, and use a persistent session store (connect-pg-simple).
- Ensure environment variables are set securely (SESSION_SECRET, DB credentials, SMTP credentials).

Files of interest
- server.js — Express server and middleware setup
- scheduler.js — scheduled jobs for sending reminders
- src/ — React app and components
- src/controllers — API route handlers
- migrations/ and seeders/ — DB schema and fixtures

Contact
- Developer: JJCodeLogics
- Email: jjcodelogics@gmail.com
- GitHub: https://github.com/jjcodelogics

---

_Generated: 2025-10-28_
