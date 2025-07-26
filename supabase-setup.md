# Alternative: Supabase Database Setup

If you prefer to use Supabase instead of Vercel Postgres:

## 1. Create Supabase Project
1. Go to https://supabase.com
2. Sign up/login with GitHub
3. Click "New Project"
4. Choose your organization
5. Name: `arc-portal`
6. Database Password: (create a strong password)
7. Region: Choose closest to your users
8. Click "Create new project"

## 2. Get Database URL
1. In your Supabase project dashboard
2. Go to Settings → Database
3. Copy the "Connection string" under "Connection pooling"
4. It will look like: `postgresql://postgres.xxx:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres`

## 3. Add to Vercel Environment Variables
1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add new variable:
   - Name: `DATABASE_URL`
   - Value: (paste your Supabase connection string)
   - Environment: Production, Preview, Development

## 4. Run Setup Commands
```bash
# Pull the new environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy

# Seed database
npx prisma db seed

# Redeploy
vercel --prod
```

## Benefits of Supabase:
- Free tier with 500MB database
- Built-in auth (if needed later)
- Real-time subscriptions
- Auto-generated APIs
- Great dashboard for data management