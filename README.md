# Appointment Booking System  
A production-ready full‑stack scheduling platform with role-based access, automated reminders, and strong security practices.

---

## Project Overview
Appointment Booking is a portfolio-grade full‑stack application designed for businesses and teams that need reliable booking, calendar-aware scheduling, and administrative tooling. The system demonstrates production-aware architecture, end-to-end validation, background job processing, and comprehensive test coverage — making it ideal to evaluate engineering skill in backend APIs, frontend UX, security, and DevOps readiness.

Core principals:
- Clean separation between API and UI (Express backend + React frontend)
- Role-based access control (User / Admin)
- Reliable email reminders and background scheduling
- Strong input validation, secure authentication, and audit logging

---

## Features
- Role-based authentication and session management (user, admin)
- Register, authenticate, and manage user profiles
- Create, reschedule, and cancel appointments with real-time availability checks
- Admin dashboard for viewing, filtering, and bulk-managing appointments
- Email confirmations and scheduled reminders to reduce no-shows
- Audit logging for administrative actions
- Robust validation using Zod and secure password hashing with bcrypt
- Background job scheduling with node-cron and nodemailer
- Production-aware security: Helmet, CSRF protection, rate limiting, and secure cookies
- Database migrations and seeders (Sequelize)
- Unit and integration test coverage (Mocha, Chai, Sinon)
- Prettier formatting for consistent code style

---

## Technical Stack
- Languages: JavaScript (ES2020+)
- Frontend: React 19 + Vite
- Backend: Node.js + Express 5
- ORM / DB: Sequelize + PostgreSQL
- Auth & Validation: Passport.js, Zod, bcrypt
- Scheduling & Email: node-cron, nodemailer
- Testing: Mocha, Chai, Sinon
- Dev tooling: ESLint, Prettier, sequelize-cli

---

## Installation and Setup (Local Development)
Prerequisites:
- Node.js 18+ (recommended)
- PostgreSQL 12+
- Yarn or npm
- A working SMTP account for email testing (or use a dev SMTP like Mailtrap)

1. Clone the repository
```bash
git clone https://github.com/jjcodelogics/appointment_booking.git
cd appointment_booking
```

2. Install dependencies
```bash
npm install
# or
# yarn install
```

3. Create environment variables
- Copy the example and update values:
```bash
cp .env.example .env
```
- Required variables (example):
```
NODE_ENV=development
PORT=3000

# Database (Postgres)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=appointment_db
DB_USER=postgres
DB_PASSWORD=postgres

# Session
SESSION_SECRET=your_strong_session_secret

# SMTP (for email notifications)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=supersecret

# Optional
FRONTEND_URL=http://localhost:5173
```

4. Run database migrations and (optional) seeders
```bash
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

5. (Optional) Create an admin account (CLI helper)
```bash
npm run create-admin
```

6. Start the app in development
- Start backend:
```bash
npm start       # Express server, default port 3000
```
- Start frontend (in a separate terminal):
```bash
npm run dev     # Vite frontend, default port 5173
```

7. Endpoints / URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000 (see API routes under src/controllers)

---

## Testing & Formatting
- Run tests:
```bash
npm test
```
- Apply code formatting:
```bash
npm run format
```

---

## Deployment Notes (Production Checklist)
- Containerize with Docker and use a process manager (PM2, Docker Compose, or Kubernetes)
- Configure HTTPS via a reverse proxy (Nginx, Traefik)
- Use a production session store (connect-pg-simple or Redis)
- Secure environment variables with a secrets manager
- Use a reliable transactional email provider for production reminders (SendGrid, SES, Mailgun)
- Configure logging and monitoring for background jobs and failed emails

---

## Screenshots
![Screenshot of User Dashboard]

![Screenshot of Admin Dashboard]

![Screenshot of Booking Page]

(Replace placeholders above with real screenshots in production — keep filenames descriptive and add alt text.)

---

## Files of Interest
- server.js — Express server and middleware setup
- scheduler.js — scheduled jobs for sending reminders
- src/ — React application and UI components
- src/controllers — API route handlers
- migrations/ and seeders/ — DB schema and fixtures

---

## Contribution Guidelines
Thanks for your interest in contributing. To contribute:
1. Fork the repository and create a feature branch (feature/short-description).
2. Keep commits small and focused; write clear commit messages.
3. Run tests and ensure formatting (npm test, npm run format).
4. Open a pull request with a descriptive title and summary of changes.

For major changes (architecture, DB migrations, or breaking API changes), open an issue first to discuss the plan.

---

## Contact
Developer: JJCodeLogics  
Email: jjcodelogics@gmail.com  
GitHub: https://github.com/jjcodelogics

---

_Generated: 2025-10-28_