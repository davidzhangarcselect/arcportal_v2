#!/bin/bash

echo "🔄 Setting up database connection for Vercel deployment..."

# Step 1: Pull environment variables from Vercel
echo "📥 Pulling environment variables from Vercel..."
vercel env pull .env.local

# Step 2: Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Step 3: Generate Prisma client
echo "⚙️ Generating Prisma client..."
npx prisma generate

# Step 4: Seed the database
echo "🌱 Seeding database with initial data..."
npx prisma db seed

# Step 5: Redeploy to Vercel
echo "🚀 Redeploying to Vercel with database connection..."
vercel --prod

echo "✅ Database setup complete!"
echo "🌐 Your app should now be fully functional at your Vercel URL"