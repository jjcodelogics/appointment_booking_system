# Security Configuration Guide

## Overview
This document outlines the security measures implemented in the appointment booking system, with a focus on the admin dashboard functionality.

## Authentication & Authorization

### Session-Based Authentication
- Uses `express-session` with secure cookie configuration
- Session cookies are:
  - `httpOnly: true` - Prevents JavaScript access
  - `secure: true` (in production) - HTTPS only
  - `sameSite: 'strict'` (in production) - CSRF protection
  - Max age: 2 days

### Role-Based Access Control (RBAC)
- User roles stored in database: `user` or `admin`
- Middleware `canAccess(['admin'])` protects admin routes
- Server-side authorization checks on every request
- 403 Forbidden response for unauthorized access attempts

## Rate Limiting

### Login Endpoint Protection
```javascript
// 5 login attempts per 15 minutes per IP
loginRateLimit: {
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Please try again later.'
}
```

### Admin Endpoint Protection
```javascript
// 200 requests per 15 minutes per IP
adminRateLimit: {
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests to admin endpoints. Please slow down.'
}
```

**Production Note**: Replace in-memory rate limiting with Redis or similar distributed store for multi-instance deployments.

## CSRF Protection

### Configuration
- Uses `@dr.pogodin/csurf` package
- CSRF token automatically set in cookie: `XSRF-TOKEN`
- Axios automatically reads cookie and sets `X-XSRF-TOKEN` header
- All POST, PUT, DELETE requests require valid CSRF token

### Implementation
```javascript
// Server-side (server.js)
const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
});

// Client-side (automatic with axios)
const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Sends cookies with requests
});
```

## Input Validation & Sanitization

### Zod Schema Validation
All API inputs validated using Zod schemas:
- Type checking
- Format validation (dates, emails, etc.)
- Required field enforcement
- Custom validation rules

### SQL Injection Prevention
- Sequelize ORM with parameterized queries
- No raw SQL queries without parameter binding
- Input validation before database operations

### XSS Prevention
- All user inputs validated server-side
- HTML special characters sanitized when rendering
- Content Security Policy headers via Helmet
- DOMPurify available for client-side sanitization if needed

## Audit Logging

### What's Logged
- Admin action type (CREATE, UPDATE, DELETE, VIEW, EXPORT, etc.)
- Admin user ID and email
- Timestamp (ISO 8601)
- Target data (appointment IDs, changes made)
- Result (success/failure)

### Sensitive Data Redaction
Sensitive fields are automatically redacted in logs:
- Passwords
- SSN
- Credit card numbers
- CVV

### Example Log Entry
```json
{
  "timestamp": "2025-10-24T14:20:30.000Z",
  "action": "UPDATE_APPOINTMENT",
  "adminUserId": 1,
  "adminUserEmail": "admin@example.com",
  "targetData": {
    "appointment_id": 42,
    "updates": {
      "status": "cancelled"
    }
  },
  "result": "success"
}
```

**Production Note**: Configure persistent log storage (file, database, external service) instead of console output.

## Business Logic Security

### Appointment Conflict Detection
- Server-side validation prevents double-booking
- Checks existing appointments before creating/updating
- Transaction support ensures data consistency

### Business Hours Validation
```javascript
// Tuesday-Friday: 9 AM - 7 PM
// Saturday: 8 AM - 5 PM
// Sunday-Monday: Closed
```

### Staff Availability
- Future enhancement: validate staff assignment against staff schedule
- Current: accepts any staff name (manual validation)

## Environment Variables

### Required Configuration
```env
# Session Secret (REQUIRED - generate strong random string)
SESSION_SECRET=your-super-secret-session-key-here

# Node Environment
NODE_ENV=production

# Database Configuration
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=appointment_booking

# SMTP (for email reminders)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# Frontend URL (for CORS)
FRONTEND_URL=https://yourdomain.com
```

### Generating Secure Secrets
```bash
# Generate a secure session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## HTTP Security Headers

### Helmet Configuration
```javascript
helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "script-src": ["'self'", "https://unpkg.com", "https://cdn.jsdelivr.net"],
    },
  },
})
```

### CORS Configuration
```javascript
cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:5173'],
  credentials: true,
})
```

## Password Security

### Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Hashing
- Bcrypt with salt rounds: 10
- Passwords hashed before database storage
- `beforeCreate` hook in User model

## Deployment Checklist

### Production Security Steps

1. **Environment Variables**
   - [ ] Set strong `SESSION_SECRET`
   - [ ] Set `NODE_ENV=production`
   - [ ] Configure production database credentials
   - [ ] Set SMTP credentials for emails

2. **Session Store**
   - [ ] Replace MemoryStore with persistent store (Redis, PostgreSQL, etc.)
   - [ ] Configure session store connection

3. **Rate Limiting**
   - [ ] Replace in-memory rate limiting with Redis
   - [ ] Adjust rate limits based on traffic patterns

4. **Logging**
   - [ ] Configure persistent audit log storage
   - [ ] Set up log rotation
   - [ ] Configure log monitoring/alerting

5. **Database**
   - [ ] Run migrations in production
   - [ ] Create admin users securely
   - [ ] Set up database backups

6. **HTTPS**
   - [ ] Obtain SSL/TLS certificate
   - [ ] Configure HTTPS on web server
   - [ ] Enable secure cookie flags

7. **Monitoring**
   - [ ] Set up error tracking (e.g., Sentry)
   - [ ] Configure performance monitoring
   - [ ] Set up security alerts

## Vulnerability Reporting

If you discover a security vulnerability, please email security@yourdomain.com with details. Do not open public issues for security vulnerabilities.

## Regular Security Maintenance

- **Weekly**: Review audit logs for suspicious activity
- **Monthly**: Update dependencies with security patches
- **Quarterly**: Security audit and penetration testing
- **Annually**: Full security review and threat modeling

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
