# PRM Portal Setup Guide

## Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher) OR **Docker**
- **Git**

## Required API Keys

You **MUST** provide these keys for the app to work:

1. **JWT Secret** - Any secure random string (32+ characters)
2. **Gemini API Key** - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
3. **Stripe Keys** - Get from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
4. **Stripe Price IDs** - Create products in Stripe Dashboard

---

## Setup Options

### Option 1: Docker (Recommended)

```bash
# 1. Clone repository
git clone <repository-url>
cd demo-prm

# 2. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your keys (see below)

# 3. Start with Docker
docker-compose up -d

# App will be available at:
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

### Option 2: Manual Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd demo-prm

# 2. Install dependencies
npm install
cd backend && npm install && cd ..

# 3. Setup PostgreSQL database
psql postgres
CREATE DATABASE prm_db;
CREATE USER prm_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE prm_db TO prm_user;
\c prm_db;
GRANT ALL ON SCHEMA public TO prm_user;
\q

# 4. Configure environment files
cp .env.example .env.local
cp backend/.env.example backend/.env
# Edit both files with your keys

# 5. Start application
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend  
npm run dev
```

---

## Environment Configuration

### Backend (.env) - **ALL REQUIRED**

```bash
# Database (use these values for Docker)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=prm_db

# JWT Secret (generate random 32+ character string)
JWT_SECRET=your_super_secure_jwt_secret_key_here_32_chars_min

# Gemini AI (get from Google AI Studio)
GEMINI_API_KEY=AIzaSyC...your_actual_gemini_key

# Stripe (get from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_test_...your_actual_stripe_secret
STRIPE_PUBLISHABLE_KEY=pk_test_...your_actual_stripe_publishable

# Stripe Price IDs (create in Stripe Dashboard)
STRIPE_PRICE_ID_BASIC=price_...your_basic_plan_id
STRIPE_PRICE_ID_PREMIUM=price_...your_premium_plan_id
STRIPE_PRICE_ID_ENTERPRISE=price_...your_enterprise_plan_id
```

### Frontend (.env.local)

```bash
GEMINI_API_KEY=AIzaSyC...your_actual_gemini_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...your_actual_stripe_publishable
```

---

## Getting Your Keys

### 1. JWT Secret
```bash
# Generate random string (any method)
openssl rand -base64 32
# OR use any 32+ character random string
```

### 2. Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key (starts with `AIzaSyC...`)

### 3. Stripe Keys & Price IDs
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get API keys from "Developers > API keys"
3. Create products in "Products" section
4. Copy price IDs (start with `price_...`)

---

## Default Admin Access

- **Username:** `admin@admin.com`
- **Password:** `password12345`

---

## Port Configuration

**Docker automatically handles ports:**
- Frontend: `3000` (mapped to container)
- Backend: `3001` (mapped to container)
- Database: `5432` (mapped to container)

**Manual setup uses:**
- Frontend: `5173` (Vite default)
- Backend: `3001`
- Database: `5432`

---

## What Happens Automatically

✅ Database tables created  
✅ Admin user seeded  
✅ Plan templates created with YOUR Stripe price IDs  
✅ All integrations configured  

**Setup time: 2-3 minutes with keys ready**
