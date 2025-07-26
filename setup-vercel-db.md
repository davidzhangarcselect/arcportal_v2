# Setting up Vercel Postgres Database

## Steps to configure your database for Vercel deployment:

### 1. Add Vercel Postgres to your project
1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your `arc-portal` project
3. Go to the "Storage" tab
4. Click "Create Database"
5. Select "Postgres"
6. Choose a database name (e.g., `arc-portal-db`)
7. Select a region close to your users
8. Click "Create"

### 2. Configure Environment Variables
After creating the database, Vercel will automatically add these environment variables to your project:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL` 
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### 3. Update your Prisma configuration
Your `DATABASE_URL` environment variable will be automatically set to `POSTGRES_PRISMA_URL`.

### 4. Run database migrations
After the database is set up, you'll need to run:
```bash
vercel env pull .env.local
npx prisma migrate deploy
npx prisma db seed
```

### 5. Redeploy
```bash
vercel --prod
```

## Alternative: Quick Setup with Supabase (if you prefer)
1. Go to https://supabase.com
2. Create a new project
3. Get your database URL from Settings > Database
4. Add it as `DATABASE_URL` environment variable in Vercel