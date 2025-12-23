# Vercel Deployment Guide

This document provides instructions for deploying the Appointment Booking System to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Vercel CLI installed globally: `npm i -g vercel`
3. A PostgreSQL database (e.g., Vercel Postgres, Neon, Supabase, or Railway)

## Deployment Steps

### 1. Install Vercel CLI (if not already installed)

```bash
npm i -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Configure Environment Variables

Before deploying, you need to set up environment variables in your Vercel project. You can do this either through the Vercel dashboard or using the CLI.

#### Required Environment Variables:

```
NODE_ENV=production
PORT=3000

# Database Configuration (PostgreSQL required)
DATABASE_URL=postgres://user:password@host:port/dbname
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=your_database_host
DB_DIALECT=postgres
DB_PORT=5432

# Session Configuration
SESSION_SECRET=your_secure_random_session_secret_here

# Server Configuration
FRONTEND_URL=https://your-app.vercel.app
BASE_URL=https://your-app.vercel.app

# Email Configuration (for sending appointment reminders)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email_username
EMAIL_PASS=your_email_password
EMAIL_FROM="Appointment System <noreply@yourdomain.com>"

# Cron Job Secret (generate a random string for security)
CRON_SECRET=your_secure_random_cron_secret_here

# Optional: Enable CSRF debugging if needed
DEBUG_CSRF=false
```

#### Setting Environment Variables via Vercel Dashboard:

1. Go to your project on Vercel
2. Navigate to Settings > Environment Variables
3. Add each variable listed above

#### Setting Environment Variables via CLI:

```bash
vercel env add DATABASE_URL
vercel env add SESSION_SECRET
# ... add all other variables
```

### 4. Deploy to Vercel

From the project root directory:

```bash
# For preview deployment
vercel

# For production deployment
vercel --prod
```

Alternatively, you can connect your GitHub repository to Vercel for automatic deployments:

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure the environment variables in the dashboard
4. Deploy

### 5. Post-Deployment

After deployment:

1. **Database Setup**: Ensure your PostgreSQL database is accessible and has the correct schema
   - The app will automatically sync models and create tables on first run
   - Default services will be seeded automatically if the services table is empty

2. **Create Admin Account**: After the first deployment, you may want to create an admin account
   - This currently requires running the script locally against your production database
   - Consider adding an API endpoint or admin creation functionality

3. **Configure Cron Jobs**: The application uses Vercel Cron Jobs for sending appointment reminders
   - The cron job is already configured in `vercel.json` to run hourly
   - Make sure to set the `CRON_SECRET` environment variable (generate a random secure string)
   - The cron endpoint is at `/api/cron` and runs every hour

4. **Test the Application**: 
   - Visit your Vercel URL
   - Test user registration and login
   - Create a test appointment
   - Check that emails are being sent

## Important Notes

### Database Considerations

- **PostgreSQL Required**: This app requires PostgreSQL. SQLite will not work on Vercel.
- **Connection Pooling**: For production, consider using connection pooling (PgBouncer) to handle serverless function connections efficiently.
- **Database Providers**: Recommended providers:
  - Vercel Postgres (integrated)
  - Neon (serverless PostgreSQL)
  - Supabase (includes PostgreSQL)
  - Railway
  - Amazon RDS

### Serverless Function Limitations

- **Execution Time**: Vercel serverless functions have a maximum execution time (10 seconds on Hobby, 60 seconds on Pro)
- **Cron Jobs**: This app uses Vercel Cron Jobs for sending appointment reminders
  - Configured in `vercel.json` to run hourly at the top of each hour
  - The cron endpoint is secured with the `CRON_SECRET` environment variable
  - Available on Vercel Pro plans and above (Hobby plans have limited cron capabilities)
  - Documentation: https://vercel.com/docs/cron-jobs

### Session Storage

- The app uses connect-pg-simple for PostgreSQL-backed sessions
- This is recommended for production and works well with Vercel's serverless architecture

### CORS and Cookies

- The app is configured to handle cross-origin cookies with `sameSite: 'none'` in production
- Ensure your FRONTEND_URL environment variable is set correctly

## Troubleshooting

### Build Fails

- Check that all dependencies are listed in package.json
- Verify that the build script (`vercel-build`) runs successfully locally
- Check Vercel build logs for specific errors

### Database Connection Issues

- Verify DATABASE_URL is correct and accessible from Vercel
- Check that your database allows connections from Vercel's IP ranges
- For Vercel Postgres, ensure you're using the correct connection string

### Session/Authentication Issues

- Verify SESSION_SECRET is set
- Check that cookies are being set correctly (inspect browser developer tools)
- Ensure trust proxy is set correctly in server.js

### Email Not Sending

- Verify SMTP credentials are correct
- Check email provider logs
- Test SMTP connection separately

## Vercel Configuration Files

- `vercel.json`: Deployment configuration
- `.vercelignore`: Files to exclude from deployment
- `api/index.js`: Serverless function wrapper for Express app

## Additional Resources

- Vercel Documentation: https://vercel.com/docs
- Vercel Node.js Runtime: https://vercel.com/docs/runtimes#official-runtimes/node-js
- Vercel Environment Variables: https://vercel.com/docs/concepts/projects/environment-variables
- Vercel Cron Jobs: https://vercel.com/docs/cron-jobs
