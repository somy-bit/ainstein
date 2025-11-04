# AInstein PRM Setup Guide

## Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (if running locally)

## Environment Setup

### 1. Root Directory (for Docker & Frontend)
```bash
cp .env.template .env
```
Edit `.env` and fill in:
- `GEMINI_API_KEY`: Get from https://makersuite.google.com/app/apikey
- `STRIPE_SECRET_KEY` & `STRIPE_PUBLISHABLE_KEY`: Get from Stripe dashboard
- `JWT_SECRET`: Generate with `openssl rand -base64 32`
- Stripe Price IDs: Create products in Stripe dashboard

### 2. Backend Directory (for local development)
```bash
cd backend
cp .env.example .env
```
Edit `backend/.env` with the same values plus database configuration.

## Running the Application

### Docker (Recommended)
```bash
docker-compose up -d
```

### Local Development
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (in new terminal)
npm install
npm run dev
```

## Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Admin Login: admin@admin.com / password12345

## API Keys Required
1. **Gemini API Key**: For AI functionality
2. **Stripe Keys**: For subscription management
3. **JWT Secret**: For authentication security
