# 🚀 Project Setup Guide

## Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- Docker & Docker Compose (optional)

## 📋 Quick Setup (Local Development)

### 1. Clone & Install
```bash
git clone <repository-url>
cd demo-prm
npm install
cd backend && npm install && cd ..
```

### 2. Environment Setup
```bash
# Copy environment templates
cp .env.example .env
cp backend/.env.example backend/.env

# Edit the files with your actual values:
# - Database credentials
# - JWT secret (generate random string)
# - Gemini API key
# - Stripe keys (optional)
```

### 3. Database Setup
```bash
# Start PostgreSQL and create database
createdb ainstein_prm

# Or use Docker for database only:
docker run -d \
  --name postgres \
  -e POSTGRES_DB=ainstein_prm \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  postgres:15
```

### 4. Run Application
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
npm run dev
```

## 🐳 Docker Setup (Production)

### 1. Environment Setup
```bash
cp docker-compose.example.yml docker-compose.yml
# Edit docker-compose.yml with your values
```

### 2. Run with Docker
```bash
docker-compose up -d
```

## 🔑 Required API Keys

### Gemini AI (Required)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Add to `.env` files

### Stripe (Optional - for payments)
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Get test keys
3. Add to `.env` files

## 📱 Access URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database: localhost:5432

## 🔧 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Reset database
dropdb ainstein_prm && createdb ainstein_prm
```

### Port Conflicts
```bash
# Check what's using ports
lsof -i :3000
lsof -i :3001
lsof -i :5432
```

### Environment Variables
```bash
# Verify environment files exist
ls -la .env backend/.env

# Check if variables are loaded
echo $GEMINI_API_KEY
```

## 📚 Additional Documentation
- API_ANALYSIS.md - API endpoints
- STRIPE_SETUP.md - Payment integration
- DOCKER_SETUP.md - Docker details
