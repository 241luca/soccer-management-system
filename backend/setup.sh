#!/bin/bash

echo "🚀 Setting up Soccer Management System Backend..."

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    echo "   On macOS: brew services start postgresql"
    echo "   On Ubuntu: sudo systemctl start postgresql"
    exit 1
fi

# Create database if it doesn't exist
echo "📦 Creating database..."
createdb soccer_management 2>/dev/null || echo "ℹ️  Database already exists"

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your database credentials"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run migrations
echo "🗄️  Running database migrations..."
npx prisma migrate dev --name init

echo "✅ Backend setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your database credentials (if needed)"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Server will be available at http://localhost:3000"
echo "4. Default admin credentials: admin@demosoccerclub.com / admin123"
