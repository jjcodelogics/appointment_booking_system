# Quick Start - Deploy to Vercel

Follow these steps to quickly deploy this application to Vercel:

## Prerequisites
- [ ] Vercel account (https://vercel.com)
- [ ] PostgreSQL database (Vercel Postgres, Neon, Supabase, etc.)
- [ ] SMTP credentials for email notifications

## Deployment Steps

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login
```bash
vercel login
```

### 3. Deploy
From the project root:
```bash
vercel --prod
```

### 4. Configure Environment Variables
In the Vercel dashboard, add these required variables:

#### Database
- `DATABASE_URL` - Full PostgreSQL connection string
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_DIALECT=postgres`

#### Security
- `SESSION_SECRET` - Random secure string
- `CRON_SECRET` - Random secure string (for cron job authentication)

#### App URLs
- `FRONTEND_URL` - Your Vercel app URL (e.g., https://your-app.vercel.app)
- `BASE_URL` - Same as FRONTEND_URL

#### Email (for reminders)
- `EMAIL_HOST` - SMTP host
- `EMAIL_PORT` - SMTP port (usually 587)
- `EMAIL_USER` - SMTP username
- `EMAIL_PASS` - SMTP password
- `EMAIL_FROM` - From address (e.g., "Appointments <noreply@yourdomain.com>")

### 5. Test Your Deployment
- Visit your Vercel URL
- Register a new user
- Create an appointment
- Verify email is sent

## Important Notes

✅ **Automatic Features:**
- Database tables are created automatically on first run
- Default services are seeded automatically
- Cron job for reminders runs hourly (Vercel Pro+ required)

⚠️ **Manual Steps:**
- Create an admin account (currently requires local script)
- Configure custom domain (optional, in Vercel dashboard)

📚 **Full Documentation:**
See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions and troubleshooting.

## GitHub Integration (Alternative)

Instead of CLI deployment, you can:
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure environment variables
4. Deploy automatically on every push

---

**Questions?** See the full documentation or contact support.
