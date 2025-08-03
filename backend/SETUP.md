# 🚀 Backend Setup Instructions

## Quick Start

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### 2. Database Setup
```bash
# Create database (if PostgreSQL is running)
createdb soccer_management

# Or use existing PostgreSQL instance and update .env
```

### 3. Installation
```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# Default: postgresql://postgres:password@localhost:5432/soccer_management
```

### 4. Database Migration
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 5. Run Development Server
```bash
npm run dev

# Server runs on http://localhost:3000
# API available at http://localhost:3000/api/v1
```

## Default Credentials
After first run, a demo organization and admin user are created:
- Email: `admin@demosoccerclub.com`
- Password: `admin123`

## Common Issues

### PostgreSQL not running
```bash
# macOS
brew services start postgresql

# Ubuntu/Debian
sudo systemctl start postgresql

# Windows
# Start PostgreSQL from Services
```

### Database connection error
1. Check PostgreSQL is running
2. Verify credentials in .env
3. Ensure database exists: `createdb soccer_management`

### Port already in use
Change PORT in .env file to another port (e.g., 3001)

## API Testing
Use Postman or curl to test:
```bash
# Health check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demosoccerclub.com","password":"admin123"}'
```
