# Admin Dashboard Setup Guide

This guide will help you set up and use the admin dashboard for the appointment booking system.

## Prerequisites

1. Node.js (v16 or higher)
2. PostgreSQL database
3. npm or yarn package manager

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and update it with your settings:

```bash
cp .env.example .env
```

Edit `.env` and update the following critical settings:

```env
# Generate a secure session secret
SESSION_SECRET=your-super-secret-session-key-here

# Database connection
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=appointment_booking

# Environment
NODE_ENV=development
```

**Generate a secure session secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Database Setup

Run migrations to create the database tables:

```bash
npx sequelize-cli db:migrate
```

If you need to reset the database (WARNING: This will delete all data):

```bash
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:migrate
```

### 4. Create an Admin User

Use the built-in script to create an admin user:

```bash
npm run create-admin admin@example.com "Admin User" "SecurePass123!"
```

Or use the full command:

```bash
node scripts/create-admin.js admin@example.com "Admin User" "SecurePass123!"
```

**Password Requirements:**
- At least 8 characters long
- Contains at least one uppercase letter
- Contains at least one lowercase letter
- Contains at least one number
- Contains at least one special character

### 5. Seed Sample Data (Optional)

If you want to populate the database with sample services:

```bash
npx sequelize-cli db:seed:all
```

## Running the Application

### Development Mode

Start the server and frontend separately:

**Terminal 1 - Backend Server:**
```bash
npm start
```

**Terminal 2 - Frontend Dev Server:**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Production Mode

Build the frontend and start the server:

```bash
npm run build
npm start
```

## Using the Admin Dashboard

### Login

1. Navigate to the application URL
2. Click "Login / Register"
3. Enter your admin credentials
4. You will be automatically redirected to the admin dashboard

### Admin Dashboard Features

#### 1. View Appointments

- By default, shows appointments for the current week (Monday-Sunday)
- View appointment details including:
  - Date and time
  - Customer name
  - Phone number
  - Service type
  - Status
  - Assigned staff
  - Notes

#### 2. Filter Appointments

Use the filters section to narrow down appointments:

- **Start Date / End Date**: Select a custom date range
- **Status**: Filter by confirmed, pending, cancelled, or completed
- **Staff**: Filter by assigned staff member
- **Search**: Search by customer name or phone number

#### 3. Edit Appointments

Click the "Edit" button on any appointment to:

- Change the appointment date/time
- Update customer information
- Change the status
- Assign or reassign staff
- Add or modify notes

Click "Save" to apply changes or "Cancel" to discard.

**Note:** The system validates:
- No double-booking (conflict detection)
- Business hours compliance
- Required fields

#### 4. Book New Appointments

Click "Book New Appointment" to create an appointment:

**Required Fields:**
- Customer name (required for admin bookings)
- Date
- Time
- At least one service (cut, wash, or color)
- Gender preference

**Optional Fields:**
- Phone number
- Staff assignment
- Status (defaults to confirmed)
- Notes

#### 5. Bulk Actions

Select multiple appointments using checkboxes to:

- **Cancel Selected**: Cancel multiple appointments at once
- **Export CSV**: Export selected appointments to CSV file

#### 6. Export Appointments

Click "Export CSV" to download appointment data including:
- Appointment ID
- Date and time
- Customer information
- Service details
- Status
- Staff assignment
- Notes

## Security Features

### Authentication & Authorization

- Only users with `role = 'admin'` can access admin routes
- Session-based authentication with secure cookies
- Server-side authorization checks on every request

### Rate Limiting

- **Login**: 5 attempts per 15 minutes per IP
- **Admin API**: 200 requests per 15 minutes per IP

### CSRF Protection

- All state-changing requests require valid CSRF token
- Automatically handled by axios in the frontend

### Audit Logging

All admin actions are logged including:
- User who performed the action
- Action type (create, update, delete, view, export)
- Timestamp
- Target data (with sensitive fields redacted)

View logs in the console or configure persistent logging in production.

## API Endpoints

### Admin Appointments

```
GET    /api/admin/appointments          - List appointments (with filters)
POST   /api/admin/appointments          - Create appointment
PUT    /api/admin/appointments/:id      - Update appointment
POST   /api/admin/appointments/bulk     - Bulk operations
GET    /api/admin/appointments/export   - Export to CSV
```

### Authentication

```
POST   /api/auth/login                  - Login
POST   /api/auth/logout                 - Logout
GET    /api/auth/user                   - Get current user
```

## Troubleshooting

### Cannot login as admin

1. Verify the user exists in the database:
```sql
SELECT * FROM "Users" WHERE role = 'admin';
```

2. Ensure the password is correct (use create-admin script to reset if needed)

3. Check browser console for any CSRF token errors

### Appointments not showing

1. Check that the date range includes existing appointments
2. Verify the status filter is not too restrictive
3. Check browser console and server logs for errors

### CSRF token errors

1. Clear browser cookies
2. Refresh the page to get a new CSRF token
3. Ensure `withCredentials: true` is set in axios configuration

### Rate limiting errors

If you see "Too many requests" errors:
1. Wait 15 minutes for the rate limit to reset
2. Check for automation or scripts hitting the API too frequently
3. Adjust rate limits in `src/middleware/rateLimiter.js` if needed for development

## Production Deployment

### Security Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production`
- [ ] Generate and set a strong `SESSION_SECRET`
- [ ] Use HTTPS (set `secure: true` for cookies)
- [ ] Configure persistent session store (Redis, PostgreSQL, etc.)
- [ ] Configure persistent rate limiting (Redis)
- [ ] Set up persistent audit logging
- [ ] Configure database backups
- [ ] Review and adjust rate limits for your traffic
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Configure log rotation
- [ ] Enable database SSL connections

See [SECURITY.md](./SECURITY.md) for detailed production security configuration.

## Support

For issues or questions:
1. Check the [README.md](./README.md) for general documentation
2. Review [SECURITY.md](./SECURITY.md) for security-related concerns
3. Check server logs for error messages
4. Open an issue on the GitHub repository

## Additional Resources

- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [React Documentation](https://react.dev/)
