#!/bin/bash
set -e

echo "🚀 QSI Container Started..."

# 1. Wait for Database (Simple retry logic)
echo "⏳ Waiting for Database to be ready..."
# We can use a simple timeout or just let Prisma retry connecting
node src/scripts/wait-for-db.js

# 2. Run Migrations Automatically
# This creates the tables if they don't exist
echo "🔄 Running Database Migrations..."
npx prisma migrate deploy

# 3. (Optional) Seed Data
# echo "🌱 Seeding initial data..."
# npx prisma db seed

# 4. Start the Server
echo "⚡ Starting Application..."
exec node index.js