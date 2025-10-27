# Security Documentation

This document outlines the security measures implemented in the Appointment Booking System, identifies potential vulnerabilities, and provides recommendations for maintaining a secure application.

---

## Authentication & Authorization

### Current Implementation

**Authentication Mechanism:**
- **Strategy:** Session-based authentication using Passport.js with local strategy
- **Password Storage:** bcrypt hashing with automatic salting (10 rounds)
- **Session Management:** express-session with secure cookie configuration
- **Session Duration:** 2 days (configurable via `maxAge` in session config)

**Implementation Details:**
```javascript
// User model automatically hashes passwords before saving
User.beforeCreate(async (user) => {
  const salt = await genSalt(10);
  user.password = await hash(user.password, salt);
});

// Session cookies configuration
cookie: {
  httpOnly: true,                    // Prevents client-side JavaScript access
  secure: NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict',                // Prevents CSRF via cross-site requests
  maxAge: 2 * 24 * 60 * 60 * 1000   // 2 days
}
```

**Authorization Mechanism:**
- **Roles:** `user` (default), `admin`
- **Middleware:** 
  - `isAuthenticated` — Verifies user has valid session
  - `canAccess(['admin'])` — Checks if user has required role
- **Role Assignment:** Set during user creation (manual or via admin script)

**Endpoints Protected:**
- All `/api/appointments/*` require authentication
- All `/api/admin/*` require authentication + admin role
- Public endpoints: `/api/auth/login`, `/api/auth/register`

**Strengths:**
- ✅ Passwords never stored in plaintext
- ✅ bcrypt is resistant to rainbow table and brute force attacks
- ✅ Session cookies prevent token theft via XSS (httpOnly)
- ✅ sameSite=strict prevents CSRF attacks via cookies

**Limitations:**
- ⚠️ In-memory session store (MemoryStore) in development — sessions lost on restart
- ⚠️ No multi-factor authentication (MFA) — recommended for admin accounts
- ⚠️ No password complexity requirements — users can set weak passwords

**Recommendations:**
1. **Production Session Store:** Replace MemoryStore with connect-pg-simple (PostgreSQL) or connect-redis
   ```javascript
   const pgSession = require('connect-pg-simple')(session);
   store: new pgSession({ conObject: process.env.DATABASE_URL })
   ```
2. **Password Policies:** Enforce minimum length (12 chars), complexity (uppercase, lowercase, digit, special char)
3. **Multi-Factor Authentication:** Add TOTP (e.g., Speakeasy library) for admin accounts
4. **Account Lockout:** Lock account after 5 failed login attempts for 30 minutes
5. **Password Reset:** Implement secure password reset flow (email token with expiration)

---

## Secrets Management

### Current Implementation

**Environment Variables:**
- Secrets stored in `.env` file (development)
- File is excluded from git via `.gitignore`
- Variables loaded with `dotenv` package at app startup

**Secrets Stored:**
```bash
DB_PASSWORD          # Database credentials
SESSION_SECRET       # Session signing key
EMAIL_USER/EMAIL_PASS # SMTP credentials
```

**Access Control:**
- `.env` file has restricted permissions (should be `chmod 600` on production server)
- Only the Node.js process can read environment variables

**Strengths:**
- ✅ Secrets not hardcoded in source code
- ✅ `.env` file excluded from version control

**Limitations:**
- ⚠️ No secret rotation mechanism
- ⚠️ Secrets stored in plaintext on filesystem
- ⚠️ No audit trail for secret access

**Recommendations:**
1. **Production Secret Management:** Use a dedicated secret manager:
   - **AWS:** AWS Secrets Manager or Parameter Store
   - **Azure:** Azure Key Vault
   - **Self-hosted:** HashiCorp Vault
   - **SaaS:** Doppler, Infisical
2. **Secret Rotation:** Rotate `SESSION_SECRET` and `DB_PASSWORD` quarterly
3. **Least Privilege:** Ensure app process runs with minimal OS permissions (non-root user)
4. **Encrypt at Rest:** Use encrypted volumes/filesystems for production servers
5. **Example with AWS Secrets Manager:**
   ```javascript
   const AWS = require('aws-sdk');
   const secretsManager = new AWS.SecretsManager();
   const secret = await secretsManager.getSecretValue({ SecretId: 'prod/db/password' }).promise();
   const DB_PASSWORD = JSON.parse(secret.SecretString).password;
   ```

---

## Input Validation & Output Encoding

### Input Validation (Zod)

**Current Implementation:**
- All API endpoints validate request body, query params, and URL params using Zod schemas
- Validation middleware: `validate(schema)` applied to each route
- Invalid inputs return `400` with structured error messages

**Example:**
```javascript
// Schema definition
const bookSchema = z.object({
  body: z.object({
    service_id: z.number().int().positive(),
    appointment_date: z.string().datetime(),
    notes: z.string().max(500).optional(),
  }),
});

// Middleware application
router.post('/book', validate(bookSchema), controller);
```

**Protections Against:**
- ✅ **SQL Injection:** Sequelize uses parameterized queries; Zod ensures data types are correct
- ✅ **NoSQL Injection:** Not applicable (using SQL database)
- ✅ **Command Injection:** No shell commands executed with user input
- ✅ **Type Confusion:** Zod enforces strict types (string, number, date)

**Strengths:**
- ✅ Consistent validation across all endpoints
- ✅ Type safety at runtime
- ✅ Clear error messages for debugging

**Limitations:**
- ⚠️ No rate limiting on validation failures (could be DoS vector)

**Recommendations:**
1. **Add Max Length Constraints:** Enforce max lengths for all string fields (e.g., name ≤ 100 chars)
2. **Sanitize HTML Input:** Use DOMPurify for any user-generated content displayed as HTML
3. **Validate File Uploads:** If file uploads are added, validate file types and sizes

---

### Output Encoding (XSS Prevention)

**Current Implementation:**
- **React Auto-Escaping:** React escapes all interpolated values by default (prevents XSS)
- **DOMPurify:** Included in dependencies for sanitizing HTML strings (if needed)
- **CSP Headers:** Helmet sets Content-Security-Policy to restrict inline scripts

**Helmet CSP Configuration:**
```javascript
contentSecurityPolicy: {
  directives: {
    "script-src": ["'self'", "https://unpkg.com", "https://cdn.jsdelivr.net"],
  },
}
```

**Protections Against:**
- ✅ **Reflected XSS:** React escaping prevents script injection via user input
- ✅ **Stored XSS:** Database stores raw data; React escapes on render
- ✅ **DOM-based XSS:** CSP blocks inline scripts and eval()

**Strengths:**
- ✅ Defense-in-depth (React escaping + CSP)
- ✅ CDN scripts whitelisted explicitly

**Limitations:**
- ⚠️ CSP allows CDN scripts (unpkg, jsdelivr) — could be compromised
- ⚠️ No CSP reporting endpoint (can't monitor violations)

**Recommendations:**
1. **Strict CSP:** Remove CDN allowlist or use Subresource Integrity (SRI) hashes
2. **CSP Reporting:** Add `report-uri` or `report-to` directive to monitor violations
3. **Sanitize Rich Text:** If adding rich text editor, use DOMPurify to sanitize before storing

---

## CSRF Protection

### Current Implementation

**Mechanism:**
- **Library:** @dr.pogodin/csurf (double-submit cookie pattern)
- **Token Generation:** Server generates CSRF token and sets it in a cookie (`XSRF-TOKEN`)
- **Token Validation:** Client includes token in request header (`X-CSRF-Token`) or body (`_csrf`)
- **Protected Routes:** All state-changing routes (POST, PUT, DELETE) except `/api/auth/*`

**Flow:**
1. User visits app → Server sets `XSRF-TOKEN` cookie
2. Client reads cookie and includes it in request headers
3. Server validates token matches cookie
4. If invalid, return `403 Invalid CSRF token`

**Exemptions:**
- `/api/auth/login` and `/api/auth/register` (cannot require token before login)

**Strengths:**
- ✅ Prevents CSRF attacks on authenticated endpoints
- ✅ Double-submit pattern is simple and effective

**Limitations:**
- ⚠️ Auth endpoints not protected (acceptable trade-off for initial login)
- ⚠️ Relies on sameSite=strict cookies (won't work on older browsers)

**Recommendations:**
1. **Monitor CSRF Errors:** Log all CSRF failures to detect potential attacks
2. **Rotate Tokens:** Generate new token after sensitive actions (password change, role change)
3. **Test Coverage:** Add integration tests for CSRF protection

---

## Rate Limiting

### Current Implementation

**Mechanism:**
- **Library:** Custom in-memory rate limiter (`src/middleware/rateLimiter.js`)
- **Storage:** JavaScript Map (in-process, non-persistent)
- **Limits:**
  - Login endpoints: 5 attempts per 15 minutes per IP
  - Admin endpoints: 200 requests per 15 minutes per IP

**Implementation:**
```javascript
// Login rate limit
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Please try again later.',
});

// Admin rate limit
export const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});
```

**Protections Against:**
- ✅ **Brute Force:** Limits login attempts to prevent password guessing
- ✅ **DoS:** Limits admin API calls to prevent resource exhaustion

**Strengths:**
- ✅ Zero external dependencies for development
- ✅ Simple and lightweight

**Limitations:**
- ⚠️ In-memory state — resets on server restart
- ⚠️ Does not work with load-balanced deployments (each instance has separate limits)
- ⚠️ No distributed rate limiting

**Recommendations:**
1. **Production Rate Limiter:** Use Redis-backed rate limiter for multi-instance deployments
   ```javascript
   import rateLimit from 'express-rate-limit';
   import RedisStore from 'rate-limit-redis';
   
   const limiter = rateLimit({
     store: new RedisStore({ client: redisClient }),
     windowMs: 15 * 60 * 1000,
     max: 5,
   });
   ```
2. **Per-User Limits:** Add per-user rate limits (in addition to per-IP)
3. **Progressive Delays:** Implement exponential backoff for repeated failures
4. **Captcha:** Add CAPTCHA after 3 failed login attempts

---

## Dependency & Supply Chain Security

### Current Implementation

**Dependency Management:**
- **Lock Files:** `package-lock.json` ensures reproducible builds
- **npm audit:** Developers can run `npm audit` to check for known vulnerabilities
- **Dependency Count:** 20+ direct dependencies, 400+ transitive dependencies

**Checking for Vulnerabilities:**
- Run `npm audit` to check for current vulnerabilities and security advisories

**Strengths:**
- ✅ Lock file prevents dependency confusion attacks
- ✅ npm audit provides vulnerability scanning

**Limitations:**
- ⚠️ No automated dependency updates
- ⚠️ No CI/CD integration for security scanning
- ⚠️ Vulnerabilities may exist in transitive dependencies

**Recommendations:**
1. **Automated Scanning:** Integrate Snyk, Dependabot, or npm audit in CI pipeline
2. **Dependency Updates:** Enable Dependabot or Renovate for automated PRs
3. **Minimal Dependencies:** Audit dependencies regularly; remove unused packages
4. **Subresource Integrity:** Use SRI hashes for CDN scripts in HTML
   ```html
   <script src="https://unpkg.com/react@19/umd/react.production.min.js" 
           integrity="sha384-ABC123..." crossorigin="anonymous"></script>
   ```
5. **Lock File Audits:** Commit lock file and review changes in PRs

---

## Transport Security

### Current Implementation

**HTTPS:**
- **Development:** HTTP (localhost)
- **Production:** HTTPS required (enforced by `secure: true` cookie flag)

**CORS Configuration:**
```javascript
cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:5173',
  ],
  credentials: true,
})
```

**Strengths:**
- ✅ Cookies only sent over HTTPS in production
- ✅ CORS restricts cross-origin requests to whitelisted origins

**Limitations:**
- ⚠️ No HSTS header (Strict-Transport-Security)
- ⚠️ No TLS version enforcement (relies on reverse proxy)

**Recommendations:**
1. **HSTS Header:** Add via Helmet (already installed, just enable):
   ```javascript
   app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true }));
   ```
2. **TLS 1.3 Only:** Configure Nginx/Caddy to only accept TLS 1.3 (or 1.2 minimum)
3. **Certificate Management:** Use Let's Encrypt with automatic renewal (Certbot, Caddy)
4. **Redirect HTTP to HTTPS:** Ensure all HTTP traffic redirects to HTTPS at reverse proxy

---

## Data Protection

### Encryption at Rest

**Current State:**
- **Database:** No encryption at rest (depends on PostgreSQL/hosting provider)
- **Files:** No file storage (appointments data only)

**Recommendations:**
1. **Database Encryption:** Enable PostgreSQL transparent data encryption (TDE)
   - Managed PostgreSQL (AWS RDS, Azure Database) supports encryption by default
2. **Disk Encryption:** Use encrypted volumes (LUKS on Linux, AWS EBS encryption)
3. **Backup Encryption:** Encrypt database backups before storing in S3 (AES-256)

---

### Encryption in Transit

**Current State:**
- **App to Client:** HTTPS in production (TLS 1.2/1.3)
- **App to Database:** Depends on PostgreSQL configuration (likely unencrypted in dev)
- **App to SMTP:** Depends on email provider (TLS supported)

**Recommendations:**
1. **Force TLS for Database:** Configure PostgreSQL to require SSL/TLS connections
   ```javascript
   dialectOptions: {
     ssl: {
       require: true,
       rejectUnauthorized: false, // Set to true with valid CA cert
     }
   }
   ```
2. **SMTP TLS:** Ensure nodemailer uses STARTTLS or TLS for email transmission
   ```javascript
   secure: true, // TLS on port 465
   ```

---

### Backups & Disaster Recovery

**Current State:**
- No automated backups implemented

**Recommendations:**
1. **Automated Backups:** Use PostgreSQL's `pg_dump` or managed service backups (RDS automated backups)
2. **Backup Schedule:** Daily full backups, hourly incremental (if supported)
3. **Retention Policy:** Keep 7 daily, 4 weekly, 12 monthly backups
4. **Off-site Storage:** Store backups in S3 with versioning enabled
5. **Backup Testing:** Restore backups quarterly to verify integrity
6. **Disaster Recovery Plan:** Document RTO (Recovery Time Objective) and RPO (Recovery Point Objective)

---

### Data Retention & Deletion

**Current State:**
- No data retention policy (appointments kept indefinitely)
- No GDPR compliance measures (if applicable)

**Recommendations:**
1. **Retention Policy:** Delete appointments older than 2 years (configurable)
2. **User Deletion:** Implement "Delete Account" feature (anonymize or hard delete)
3. **GDPR Compliance (if applicable):**
   - **Right to Access:** API endpoint to export user's data (JSON)
   - **Right to Erasure:** Delete user and appointments, or anonymize
   - **Data Minimization:** Only collect necessary data (no PII in logs)
4. **Soft Deletes:** Use `deletedAt` column for audit trail (Sequelize paranoid mode)

---

## Logging & Access Control

### Audit Logging

**Current Implementation:**
- **Admin Actions:** Logged with timestamp, user ID, action, and target data
- **Sensitive Data Redaction:** Passwords, SSN, credit cards redacted in logs
- **Storage:** Console logs (development), should be persistent storage in production

**Example Log Entry:**
```json
{
  "timestamp": "2025-10-27T10:30:00.000Z",
  "action": "UPDATE_APPOINTMENT",
  "adminUserId": 42,
  "adminUserEmail": "admin@example.com",
  "targetData": { "appointment_id": 123, "status": "cancelled" },
  "result": "success"
}
```

**Strengths:**
- ✅ All admin actions logged for accountability
- ✅ Sensitive fields redacted

**Limitations:**
- ⚠️ Logs stored in console (ephemeral in production without log aggregation)
- ⚠️ No log rotation (can fill disk)

**Recommendations:**
1. **Persistent Logging:** Use Winston or Pino to write logs to files or remote service
   ```javascript
   const winston = require('winston');
   const logger = winston.createLogger({
     transports: [
       new winston.transports.File({ filename: 'logs/audit.log' }),
       new winston.transports.Console(),
     ],
   });
   ```
2. **Log Aggregation:** Send logs to centralized service (ELK stack, CloudWatch, Datadog)
3. **Log Retention:** Retain audit logs for 1+ years for compliance
4. **Alerting:** Set up alerts for suspicious patterns (multiple failed logins, bulk deletes)
5. **Immutable Logs:** Write logs to append-only storage (S3 with Object Lock)

---

### Access Control for Sensitive Data

**Current Implementation:**
- User appointments: Users can only access their own appointments (filtered by `user_id`)
- Admin appointments: Admins can access all appointments

**PII Handling:**
- `username_email`, `customer_name`, `customer_phone` considered PII
- No masking or redaction in responses

**Recommendations:**
1. **Field-Level Encryption:** Encrypt PII fields in database (e.g., `customer_phone`)
2. **API Response Masking:** Mask sensitive fields for non-admins (e.g., show only last 4 digits of phone)
3. **Role-Based Views:** Different API responses for users vs admins

---

## Incident Response & Reporting

### Current State
- No formal incident response plan

### Recommended Plan

**Incident Classification:**
1. **P0 (Critical):** Data breach, SQL injection exploit, RCE
2. **P1 (High):** XSS/CSRF exploit, unauthorized admin access
3. **P2 (Medium):** Rate limit bypass, session hijacking
4. **P3 (Low):** Outdated dependency, weak password

**Response Steps:**
1. **Detection:** Monitor logs, set up alerts (Sentry, Datadog)
2. **Containment:** Revoke sessions, block IPs, disable vulnerable endpoints
3. **Eradication:** Patch vulnerability, rotate secrets
4. **Recovery:** Restore from backups if needed, verify data integrity
5. **Post-Mortem:** Document incident, root cause, and remediation

**Reporting:**
- Security issues: Report to `jjcodelogics@gmail.com` with subject "SECURITY"
- Bug bounty: Not currently available (consider HackerOne for future)

---

## Security Testing

### Current Testing

**Unit & Integration Tests:**
- Authentication tests (login, register, session validation)
- Authorization tests (role-based access control)
- Validation tests (Zod schema enforcement)
- Middleware tests (rate limiting, CSRF)

**Run Tests:**
```bash
npm test
```

**Coverage:**
- Comprehensive coverage for models, controllers, middleware (actual coverage can be measured with tools like nyc/istanbul)

**Strengths:**
- ✅ Comprehensive test suite for auth, validation, and business logic

**Limitations:**
- ⚠️ No SAST (Static Application Security Testing)
- ⚠️ No DAST (Dynamic Application Security Testing)
- ⚠️ No penetration testing

---

### Recommended Security Testing

**1. Static Analysis (SAST):**
- **Tool:** ESLint with security plugins (eslint-plugin-security)
- **Integration:** Run in CI pipeline before deploy
- **Example:**
  ```bash
  npm install --save-dev eslint eslint-plugin-security
  npx eslint --plugin security .
  ```

**2. Dynamic Analysis (DAST):**
- **Tool:** OWASP ZAP or Burp Suite
- **Scope:** Scan staging environment before production deploy
- **Frequency:** Weekly or after major changes

**3. Dependency Scanning:**
- **Tool:** Snyk or npm audit
- **Integration:** Run in CI, fail build on high/critical vulnerabilities
- **Example:**
  ```yaml
  # GitHub Actions
  - name: Security audit
    run: npm audit --audit-level=high
  ```

**4. Secrets Scanning:**
- **Tool:** TruffleHog, git-secrets, or GitHub Secret Scanning
- **Scope:** Scan commit history for accidentally committed secrets
- **Example:**
  ```bash
  docker run --rm -v $(pwd):/repo trufflesecurity/trufflehog filesystem /repo
  ```

**5. Penetration Testing:**
- **Frequency:** Annually or before major releases
- **Scope:** Full application (auth, API, admin panel)
- **Provider:** Internal security team or external firm

---

## Known Limitations & Immediate Improvements

### High Priority (Address Before Production)

1. **Replace In-Memory Session Store**
   - **Risk:** Sessions lost on restart; does not scale horizontally
   - **Fix:** Use connect-pg-simple or connect-redis

2. **Replace In-Memory Rate Limiter**
   - **Risk:** Rate limits reset on restart; ineffective with load balancer
   - **Fix:** Use express-rate-limit with Redis store

3. **Add Dependency Scanning to CI**
   - **Risk:** Deploying known vulnerabilities
   - **Fix:** Add `npm audit` to CI pipeline

4. **Enable HSTS Header**
   - **Risk:** Man-in-the-middle attacks on HTTP connections
   - **Fix:** Enable Helmet HSTS middleware

5. **Enforce Password Complexity**
   - **Risk:** Users can set weak passwords (e.g., "123456")
   - **Fix:** Add Zod validation for password strength

---

### Medium Priority (Address Within 3 Months)

6. **Implement MFA for Admin Accounts**
   - **Risk:** Compromised admin password grants full access
   - **Fix:** Add TOTP-based MFA (Speakeasy, QR code via qrcode.js)

7. **Add CSP Reporting**
   - **Risk:** CSP violations not monitored
   - **Fix:** Add `report-uri` to CSP header

8. **Encrypt Database Connection**
   - **Risk:** Database credentials sent in plaintext over network
   - **Fix:** Enable SSL/TLS for PostgreSQL connections

9. **Implement Account Lockout**
   - **Risk:** Brute force attacks can try unlimited passwords
   - **Fix:** Lock account after 5 failed attempts for 30 minutes

10. **Add Data Retention Policy**
    - **Risk:** PII stored indefinitely; GDPR/privacy non-compliance
    - **Fix:** Auto-delete appointments older than 2 years

---

### Low Priority (Nice to Have)

11. **Add Security Headers Audit**
    - Use securityheaders.com to audit and improve headers

12. **Implement API Versioning**
    - Future-proof API for backward compatibility

13. **Add Honeypot Fields**
    - Detect bots submitting forms

14. **Rotate Secrets Quarterly**
    - Automate secret rotation with Vault or AWS Secrets Manager

---

## Security Summary

**Implemented Controls:**
- ✅ Session-based authentication with bcrypt password hashing
- ✅ Role-based authorization (user, admin)
- ✅ CSRF protection on state-changing requests
- ✅ Input validation with Zod on all endpoints
- ✅ Rate limiting on login and admin endpoints
- ✅ Security headers via Helmet (CSP, X-Frame-Options, HSTS-ready)
- ✅ Audit logging for admin actions with PII redaction
- ✅ SQL injection protection via Sequelize ORM
- ✅ XSS prevention via React auto-escaping

**Critical Gaps:**
- ⚠️ In-memory session/rate limiter (not production-ready)
- ⚠️ No MFA for admin accounts
- ⚠️ No automated dependency scanning
- ⚠️ No data retention policy
- ⚠️ No password complexity enforcement

**Recommendation:** Address high-priority items before production deployment. This system has a solid security foundation but requires hardening for multi-instance production environments.

---

*Generated on: 2025-10-27*
