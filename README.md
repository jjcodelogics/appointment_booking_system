Appointment Booking System — README.md
Project: Appointment Booking System
Date: October 17, 2025

Overview
A full-stack appointment booking system with clear separation of concerns:

Backend: Node.js + Express API, Sequelize ORM, Passport.js session-based authentication, Zod validation.
Frontend: Lightweight multi-page React app served via CDN. All HTTP logic centralized in api.cdn.js as window.api.
Background: node-cron + nodemailer send hourly/daily appointment reminders.
Features
Session-based authentication (login, logout, register)
Role-based access control (user, admin)
Zod-powered request validation with consistent error responses
CRUD for user appointments (book, list, reschedule, cancel)
Admin endpoints to list and delete any appointment
Centralized frontend API abstraction (window.api) for clean components
Scheduler for email reminders
Tech stack
Backend: Node.js, Express, Sequelize (Postgres/MySQL), Passport.js, express-session, Zod, helmet, cors, bcrypt
Frontend: React, ReactDOM (CDN), vanilla HTML MPA structure
Background jobs: node-cron, nodemailer
Repo structure (recommended)
server/
server.js
passport.js
authMiddleware.js
authZMiddleware.js
validate.js
schemas/
models/
migrations/
loginQueries.js
scheduler.js
client/
index.html
login.html
dashboard.html
book.html
reschedule.html
main.cdn.js
api.cdn.js
components/
LoginRegister.js
UserDashboard.js
AdminDashboard.js
BookAppointment.js
RescheduleAppointment.js
.env.example
README.md
Installation
Clone repo
Copy .env.example to .env and set:
DATABASE_URL / DB connection details
SESSION_SECRET
SMTP credentials for nodemailer
Install server deps:
Code

Copy Code
cd server
npm install
Install client deps (if any build step) or ensure CDN links are present in HTML.
Run migrations and seed if applicable.
Start server:
Code

Copy Code
npm run dev
Environment variables (example)
DATABASE_URL or DB_HOST, DB_USER, DB_PASS, DB_NAME
SESSION_SECRET
NODE_ENV
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
BASE_URL (optional)
API summary
Authentication & user

POST /auth/register — register user
POST /auth/login — login (creates session)
GET /auth/user — get current user
POST /auth/logout — logout
User appointments (authenticated)

GET /myappointments — list current user's appointments
POST /myappointments/book — book appointment
DELETE /myappointments/cancel/:id — cancel user's appointment
PUT /myappointments/reschedule/:id — reschedule user's appointment
Admin (role: admin)

GET /appointments — list all appointments
DELETE /appointments/:id — delete appointment
All request bodies and params are validated with Zod; invalid payloads return 400 with structured errors.

Frontend notes
All network calls go through api.cdn.js exposed as window.api.
Use credentials: 'include' so session cookies are sent with requests.
Components are pure UI/state; they call window.api for actions (login, getMyAppointments, book, etc.).
Security & validation
Helmet for HTTP headers, CORS configured appropriately.
Passwords hashed with bcrypt.
Zod schemas enforce request shapes consistently.
Server-side RBAC checks for admin-only endpoints.
Rate limiting on login and admin endpoints to prevent abuse.
CSRF protection enabled for all state-changing requests.
Audit logging for admin actions with sensitive data redaction.
Scheduler
scheduler.js runs hourly/daily checks and sends reminders via nodemailer.
Store SMTP creds in environment variables and protect access.
Admin Dashboard
Admin routes and dashboard
Admin users (role = 'admin') have access to:
GET /api/admin/appointments - View all appointments with filters (defaults to current week)
POST /api/admin/appointments - Create appointments with required customer_name field
PUT /api/admin/appointments/:id - Update appointments (time, status, staff, notes)
POST /api/admin/appointments/bulk - Bulk cancel/reschedule operations
GET /api/admin/appointments/export - Export appointments as CSV

Admin features:
Weekly view of all appointments (Monday-Sunday)
Filters: date range, status, staff, search by customer name/phone
Inline editing of appointments with conflict detection
Bulk actions: cancel multiple appointments, export to CSV
Book appointments on behalf of customers (walk-ins, phone bookings)
Assign staff to appointments
Track appointment status: confirmed, pending, cancelled, completed

Role-based redirection:
On login, users are redirected based on their role:
Admin users → /admin/dashboard
Regular users → /dashboard

Security considerations:
All admin routes protected by isAuthenticated + canAccess(['admin']) middleware
Rate limiting: 5 login attempts per 15 minutes, 200 admin API calls per 15 minutes
Audit logging: All admin actions logged with timestamp, user, and target data
Server-side validation for all inputs (appointment times, conflicts, business hours)
CSRF protection enforced on all state-changing requests
Transaction support for data consistency during updates

Creating an admin user:
To create an admin user, use the database or a migration:
INSERT INTO "Users" (username_email, name, password, role, "createdAt", "updatedAt") 
VALUES ('admin@example.com', 'Admin User', '[hashed_password]', 'admin', NOW(), NOW());

Or programmatically:
const adminUser = await User.create({
  username_email: 'admin@example.com',
  name: 'Admin User',
  password: 'SecureAdminPass123!',
  role: 'admin'
});

Development tips
Keep API fetch logic centralized in api.js to simplify changes and testing.
Validate all inputs server-side even if validated client-side with Zod.
Use migrations to manage schema changes and seed admin user for testing.
Monitor audit logs for security and compliance.
Use environment variables for all sensitive configuration.
In production, replace in-memory rate limiting with Redis or similar distributed store.
Contributing
Follow existing code patterns for middleware, validation, and error handling.
Add Zod schemas for any new endpoints and include unit tests for validation logic.
Document new endpoints in README or a dedicated API doc.
License