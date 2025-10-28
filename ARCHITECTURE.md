# System Architecture

This document provides a comprehensive overview of the Appointment Booking System's architecture, design decisions, and technical implementation details.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  React 19 SPA (Vite)                                         │  │
│  │  - Auth components (Login/Register)                          │  │
│  │  - User Dashboard (view/manage appointments)                 │  │
│  │  - Admin Dashboard (weekly view, bulk actions)               │  │
│  │  - Booking components (service selection, time picker)       │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────────┘
                         │ HTTPS (REST API)
                         │ JSON payloads
                         │ Session cookies
┌────────────────────────▼────────────────────────────────────────────┐
│                       API GATEWAY LAYER                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Express 5 Server (Node.js 18+)                              │  │
│  │  - Helmet (security headers)                                 │  │
│  │  - CORS (origin whitelist)                                   │  │
│  │  - Rate limiting (in-memory, Redis in prod)                  │  │
│  │  - CSRF protection (@dr.pogodin/csurf)                       │  │
│  │  - Session management (express-session)                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
┌────────▼────────┐ ┌───▼────────┐ ┌───▼──────────────┐
│ Auth Middleware │ │ Validation │ │ Authorization    │
│ (Passport.js)   │ │ (Zod)      │ │ (role-based)     │
│ - Local strategy│ │ - Body     │ │ - isAuthenticated│
│ - Session store │ │ - Query    │ │ - canAccess      │
│ - bcrypt        │ │ - Params   │ │                  │
└────────┬────────┘ └───┬────────┘ └───┬──────────────┘
         └───────────────┼───────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────────┐
│                     BUSINESS LOGIC LAYER                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │ Auth Controller  │  │ Appointment      │  │ Admin Controller │ │
│  │ - Register       │  │ Controller       │  │ - Weekly view    │ │
│  │ - Login          │  │ - Book           │  │ - Bulk actions   │ │
│  │ - Logout         │  │ - Reschedule     │  │ - CSV export     │ │
│  │ - Get user       │  │ - Cancel         │  │ - Walk-in book   │ │
│  └──────────────────┘  │ - Get slots      │  │ - Audit log      │ │
│                        │ - Conflicts      │  └──────────────────┘ │
│                        └──────────────────┘                         │
└────────────────────────┬────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────────┐
│                      DATA ACCESS LAYER                               │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Sequelize ORM                                               │  │
│  │  - Models: User, Appointment, Service                        │  │
│  │  - Associations (1:N, N:1)                                   │  │
│  │  - Migrations for schema versioning                          │  │
│  │  - Hooks (password hashing before save)                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────────┐
│                      DATABASE LAYER                                  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL 14+ (Production)                                 │  │
│  │  SQLite 3 (Testing)                                          │  │
│  │  Tables: Users, Appointments, Services                       │  │
│  │  Indexes: user_id, appointment_date (unique), service_id     │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     BACKGROUND JOBS LAYER                            │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  node-cron Scheduler                                         │  │
│  │  - Hourly check for appointments (0 * * * *)                 │  │
│  │  - Send email reminders via nodemailer                       │  │
│  │  - Update reminder_sent flag (if column exists)              │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                                │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  SMTP Server (Gmail, SendGrid, custom)                       │  │
│  │  - Appointment confirmations                                 │  │
│  │  - Reminder emails                                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

**Legend:**

- **Solid lines (│, ─)**: Synchronous request/response flow
- **Components in boxes**: Discrete modules with single responsibility
- **Layers**: Logical separation of concerns (presentation, API, business, data)

---

## High-Level Components

### 1. Frontend (React SPA)

**Responsibilities:**

- Render UI components (auth, dashboard, booking forms)
- Manage local state with React hooks (useState, useEffect)
- Make authenticated API calls via centralized `api.js` utility
- Handle CSRF tokens automatically (stored in cookies, sent in headers)
- Display validation errors from backend

**Key Technologies:**

- React 19 with functional components and hooks
- Vite for dev server and production builds
- Bootstrap 5 for responsive styling
- Axios for HTTP requests with credentials

**Interactions:**

- Communicates with backend via REST API (`/api/*`)
- Receives session cookies from backend (httpOnly, secure, sameSite)
- Proxies API requests during development (Vite proxy to `localhost:3000`)

**Data Flow:**

1. User interacts with UI (e.g., clicks "Book Appointment")
2. React component calls `api.bookAppointment({ service_id, date })`
3. Axios sends POST to `/api/appointments/book` with CSRF token
4. Backend validates, creates appointment, returns JSON
5. Component updates state and re-renders UI

---

### 2. Backend (Express API)

**Responsibilities:**

- Handle HTTP requests and route to appropriate controllers
- Authenticate users via Passport.js (local strategy with bcrypt)
- Authorize requests based on user roles (user, admin)
- Validate inputs with Zod schemas before processing
- Enforce rate limits to prevent abuse
- Protect against CSRF, XSS, SQL injection, and other attacks
- Log admin actions for audit trails

**Key Technologies:**

- Express 5 (REST API framework)
- Passport.js + passport-local (authentication)
- express-session (session management)
- Zod (schema validation)
- Helmet (security headers: CSP, HSTS, X-Frame-Options)
- @dr.pogodin/csurf (CSRF protection)
- bcrypt (password hashing)

**Interactions:**

- Receives HTTP requests from frontend
- Queries database via Sequelize ORM
- Sends emails via nodemailer
- Returns JSON responses (success, error, validation issues)

**Middleware Pipeline (Request Flow):**

```
Request → Rate Limiter → Helmet → CORS → Body Parser → Cookie Parser
  → Session Middleware → Passport → CSRF Check → Validation (Zod)
  → Authentication → Authorization → Controller → Response
```

---

### 3. Database (PostgreSQL with Sequelize)

**Responsibilities:**

- Persist users, appointments, and services
- Enforce data integrity (foreign keys, unique constraints)
- Support concurrent reads/writes with transactions
- Provide indexes for fast lookups (user_id, appointment_date)

**Schema:**

**Users Table:**

- `user_id` (PK, INT, auto-increment)
- `username_email` (STRING, unique, not null)
- `name` (STRING, not null)
- `password` (STRING, bcrypt hash, not null)
- `role` (STRING, default 'user', values: 'user'|'admin')
- `createdAt`, `updatedAt` (timestamps)

**Appointments Table:**

- `appointment_id` (PK, INT, auto-increment)
- `user_id` (FK → Users, INT, not null)
- `service_id` (FK → Services, INT, not null)
- `appointment_date` (DATETIME, unique, not null)
- `notes` (TEXT, nullable)
- `status` (STRING, default 'confirmed', values: 'confirmed'|'pending'|'cancelled'|'completed')
- `customer_name` (STRING, nullable, for admin walk-ins)
- `customer_phone` (STRING, nullable)
- `staff_assigned` (STRING, nullable)
- `createdAt`, `updatedAt` (timestamps)

**Services Table:**

- `service_id` (PK, INT, auto-increment)
- `gender_target` (ENUM, 'male'|'female', not null)
- `washing` (BOOLEAN, default false)
- `cutting` (BOOLEAN, default false)
- `coloring` (BOOLEAN, default false)
- `createdAt`, `updatedAt` (timestamps)

**Relationships:**

- User `1:N` Appointment (one user can have many appointments)
- Service `1:N` Appointment (one service can be booked for many appointments)

**Indexes:**

- `username_email` (unique) for fast login lookups
- `appointment_date` (unique) to prevent double-booking
- `user_id` (FK index) for efficient user appointment queries

---

### 4. Background Jobs (node-cron)

**Responsibilities:**

- Run scheduled tasks (hourly reminder checks)
- Query database for appointments with upcoming dates
- Send email reminders via nodemailer
- Update `reminder_sent` flag (if column exists) to prevent duplicates

**Implementation:**

- Cron expression: `0 * * * *` (runs at minute 0 of every hour)
- Queries appointments where `appointment_date` is today and `reminder_sent = false`
- Sends email to user's `username_email`
- Marks appointment as `reminder_sent = true`

**Trade-offs:**

- ✅ Simple in-process scheduling (no external dependencies)
- ❌ Not suitable for multi-instance deployments (use Redis-backed queue in production)
- ❌ No retry logic for failed emails (recommendation: integrate Bull or BeeQueue)

---

### 5. Authentication & Authorization

**Authentication (Passport.js):**

- **Strategy:** Local (username/password)
- **Session Store:** In-memory (development), connect-pg-simple (production recommended)
- **Password Hashing:** bcrypt with salts (10 rounds)
- **Session Cookies:** httpOnly, secure (HTTPS only), sameSite=strict
- **Session Duration:** 2 days (configurable)

**Authorization (Role-Based):**

- **Roles:** `user`, `admin`
- **Middleware:** `isAuthenticated` (checks session), `canAccess(['admin'])` (checks role)
- **Endpoints:** User endpoints require `isAuthenticated`, admin endpoints require both `isAuthenticated` + `canAccess(['admin'])`

**Flow:**

1. User submits login form (email, password)
2. Backend queries User table for matching `username_email`
3. bcrypt compares submitted password with stored hash
4. On success, Passport creates session and sets cookie
5. Subsequent requests include session cookie
6. Passport deserializes user from session ID

---

### 6. Validation Layer (Zod)

**Responsibilities:**

- Validate request body, query params, and URL params
- Ensure data types, required fields, and format constraints
- Return structured error messages (400 status) for invalid inputs

**Implementation:**

- Zod schemas defined in `src/middleware/*.schemas.js`
- Validation middleware: `validate(schema)` applied to routes
- Example schema (book appointment):
  ```javascript
  z.object({
    body: z.object({
      service_id: z.number().int().positive(),
      appointment_date: z.string().datetime(),
      notes: z.string().optional(),
    }),
  });
  ```

**Benefits:**

- Type safety at runtime
- Consistent error format across all endpoints
- Prevents injection attacks (e.g., SQL injection via malformed inputs)

---

### 7. External Services

**SMTP Server (nodemailer):**

- **Purpose:** Send appointment confirmations and reminders
- **Configuration:** SMTP host, port, user, password in `.env`
- **Supported Providers:** Gmail, SendGrid, Mailgun, custom SMTP
- **Email Templates:** HTML templates with appointment details (date, time)

**Error Handling:**

- Emails are sent asynchronously (non-blocking)
- Failures are logged but do not block appointment creation
- **Recommendation:** Implement retry logic with exponential backoff

---

## Key Design Decisions

### 1. Session-Based Authentication vs JWT

**Decision:** Use session-based authentication with Passport.js

**Rationale:**

- **Simpler revocation:** Logout invalidates session immediately (no token blacklist needed)
- **Built-in CSRF protection:** Session cookies + CSRF tokens prevent CSRF attacks
- **Stateful security:** Server controls session lifecycle (timeout, renewal)
- **Less client-side storage risk:** No tokens in localStorage (XSS risk)

**Trade-offs:**

- ✅ Easier to implement and secure for monolithic apps
- ✅ Automatic session expiration and renewal
- ❌ Requires session store (memory/Redis/DB) for horizontal scaling
- ❌ Not ideal for microservices or mobile apps (JWT better for stateless APIs)

**Alternative Considered:** JWT with refresh tokens

- Rejected due to added complexity (token refresh, blacklist management)
- Session-based is sufficient for current scale and architecture

---

### 2. Monolithic Architecture vs Microservices

**Decision:** Monolithic architecture (single Express app with modular structure)

**Rationale:**

- **Development speed:** Faster iteration without inter-service communication overhead
- **Deployment simplicity:** Single deployment artifact (no orchestration needed)
- **Transactional consistency:** Database transactions across all entities
- **Team size:** Small team benefits from single codebase

**Trade-offs:**

- ✅ Reduced operational complexity
- ✅ Easier debugging and testing
- ❌ Harder to scale individual components independently
- ❌ All-or-nothing deployments (mitigated by blue-green or canary deploys)

**Future Path:** If specific components (e.g., email service) become bottlenecks, extract to separate service

---

### 3. PostgreSQL vs MongoDB

**Decision:** PostgreSQL with Sequelize ORM

**Rationale:**

- **Structured data:** Appointments have fixed schema (date, user, service)
- **ACID transactions:** Critical for preventing double-booking and race conditions
- **Foreign keys:** Enforce referential integrity (user_id, service_id)
- **SQL ecosystem:** Rich tooling for migrations, backups, replication

**Trade-offs:**

- ✅ Strong consistency and data integrity
- ✅ Mature ecosystem (pgAdmin, psql, extensions)
- ❌ Slightly more complex schema changes (migrations required)
- ❌ Less flexible for unstructured data (not needed here)

**Alternative Considered:** MongoDB

- Rejected due to lack of native foreign key support and weaker consistency guarantees

---

### 4. In-Memory Rate Limiting vs Redis

**Decision:** In-memory rate limiting (development), Redis (production recommendation)

**Rationale:**

- **Development:** In-memory Map is sufficient for single-instance testing
- **Production:** Redis required for multi-instance deployments (shared state)

**Implementation:**

- Current: `src/middleware/rateLimiter.js` with Map
- Production: Replace with `express-rate-limit` + `rate-limit-redis`

**Trade-offs:**

- ✅ Zero external dependencies for development
- ❌ Rate limits reset on server restart
- ❌ Does not work with load-balanced multi-instance deployments

---

### 5. Zod vs Joi for Validation

**Decision:** Zod for request validation

**Rationale:**

- **TypeScript-first:** Better type inference (even though we use JS, future-proof)
- **Lightweight:** Smaller bundle size than Joi
- **Composability:** Schemas can be easily composed and reused
- **Modern API:** Fluent, chainable methods

**Trade-offs:**

- ✅ Excellent DX with clear error messages
- ✅ Works seamlessly with ES modules
- ❌ Smaller community than Joi (but growing rapidly)

---

## API Surface Summary

### REST Endpoints

**Authentication:**

- `POST /api/auth/register` → Create new user (body: `{ username_email, name, password }`)
- `POST /api/auth/login` → Login and create session (body: `{ username_email, password }`)
- `GET /api/auth/user` → Get current authenticated user (returns user object or 401)
- `POST /api/auth/logout` → Destroy session and logout

**User Appointments:**

- `GET /api/appointments/my-appointments` → List current user's appointments (auth required)
- `GET /api/appointments/slots?date=YYYY-MM-DD` → Get booked time slots for a date
- `POST /api/appointments/book` → Book new appointment (body: `{ service_id, appointment_date, notes }`)
- `PUT /api/appointments/reschedule/:id` → Reschedule appointment (body: `{ appointment_date }`)
- `DELETE /api/appointments/cancel/:id` → Cancel appointment

**Admin Appointments:**

- `GET /api/admin/appointments` → List all appointments with filters (query: `start_date, end_date, status, staff, search`)
- `POST /api/admin/appointments` → Create appointment (walk-in/phone booking, body: `{ user_id, service_id, appointment_date, customer_name, customer_phone, staff_assigned }`)
- `PUT /api/admin/appointments/:id` → Update appointment (body: `{ appointment_date, status, staff_assigned, notes }`)
- `POST /api/admin/appointments/bulk` → Bulk cancel/reschedule (body: `{ action, appointment_ids, new_date? }`)
- `GET /api/admin/appointments/export` → Export appointments as CSV

**Response Format:**

- Success: `{ data: {...}, msg?: "Success message" }` (200/201)
- Error: `{ msg: "Error message" }` (400/401/403/500)
- Validation Error: `{ message: "Validation failed", errors: [{ path: "body.email", message: "Invalid email" }] }` (400)

---

## Observability & Monitoring

**Current Implementation:**

- Console logs for errors and key events (app startup, DB connection, email sent)
- Audit logs for admin actions (JSON format with `[AUDIT]` prefix)

**Recommendations:**

- **Logging:** Integrate Winston or Pino for structured logging (JSON logs)
- **APM:** Use New Relic, Datadog, or open-source APM (Elastic APM) for request tracing
- **Error Tracking:** Sentry for frontend and backend error reporting
- **Metrics:** Prometheus + Grafana for custom metrics (request rate, response time, DB query time)
- **Health Checks:** Add `/health` endpoint for load balancer checks
- **Uptime Monitoring:** UptimeRobot or Pingdom for external monitoring

---

## Deployment Topology

**Current State:**

- Single-region deployment (assumption: US-East or developer's region)
- Single instance (no load balancing)
- In-memory session store (not production-ready)

**Production Recommendations:**

### Single-Region Production Deployment

```
[Users] → [Cloudflare/CDN] → [Load Balancer (Nginx)]
            → [App Instance 1] ──┐
            → [App Instance 2] ──┼─→ [PostgreSQL Primary]
            → [App Instance N] ──┘   └─→ [PostgreSQL Replica (read)]

                                   [Redis] ← Session Store + Rate Limiter
                                   [S3/Object Storage] ← Backups, Logs
                                   [SMTP Service] ← Emails
```

**Components:**

- **CDN:** Cloudflare or AWS CloudFront for static assets and DDoS protection
- **Load Balancer:** Nginx or AWS ALB with health checks, SSL termination
- **App Instances:** 2+ Node.js processes (PM2 cluster mode or Docker containers)
- **Database:** PostgreSQL with replication (primary for writes, replica for reads)
- **Session Store:** Redis with persistence (AOF or RDB snapshots)
- **Object Storage:** S3 for database backups, log archives, and exports (CSV)

### Multi-Region Deployment (Future)

- Deploy app instances in multiple regions (e.g., US-East, EU-West)
- Use DNS-based load balancing (Route 53, Cloudflare Load Balancer)
- PostgreSQL multi-region replication (active-passive or active-active with CRDT)
- Redis Sentinel or Cluster for session store replication

---

## Environment Variables & Secrets

**Required Environment Variables:**

```bash
# Database
DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_NAME_TEST
PROD_DB_HOST, PROD_DB_USER, PROD_DB_PASSWORD, PROD_DB_NAME

# Session
SESSION_SECRET (long random string, e.g., 64 chars)

# Email
EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS

# Environment
NODE_ENV (development|production)
PORT (default 3000)
FRONTEND_URL (for CORS)
```

**Secret Management:**

- Development: `.env` file (not committed to git)
- Production: Use secret management service (AWS Secrets Manager, Vault, Doppler)
- CI/CD: GitHub Secrets or equivalent for automated deployments

---

## Reviewer/Interviewer Checklist

Use these talking points to demonstrate your understanding of the system:

1. **Explain the request lifecycle:** From user clicking "Book Appointment" to database commit
2. **Defend session-based auth:** Why not JWT? What are the trade-offs?
3. **Describe conflict prevention:** How does the system prevent double-booking?
4. **Explain CSRF protection:** How does the CSRF token flow work?
5. **Discuss scalability:** How would you scale this to 10,000 concurrent users?
6. **Database design:** Why is `appointment_date` unique? What happens if two users try to book the same slot?
7. **Security layers:** Walk through all security measures from input to output
8. **Error handling:** How does the system handle DB failures, email send failures, and validation errors?
9. **Testing strategy:** What types of tests are included? How do you test auth and permissions?
10. **Deployment pipeline:** If you were to add CI/CD, what would the pipeline look like? (Build → Test → Security Scan → Deploy)

---

_Generated on: 2025-10-27_
