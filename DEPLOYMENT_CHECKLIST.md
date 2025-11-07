# Deployment Checklist

## Pre-Deployment Verification

### ✅ Environment Files
- [ ] `.env.template` exists with all required variables
- [ ] `backend/.env.example` exists with all required variables
- [ ] No actual API keys in template files
- [ ] All sensitive files are in `.gitignore`

### ✅ Dependencies
- [ ] `package.json` has all required dependencies
- [ ] `backend/package.json` has all required dependencies
- [ ] No security vulnerabilities in dependencies
- [ ] Build process works without errors

### ✅ Configuration Files
- [ ] `docker-compose.yml` is properly configured
- [ ] `Dockerfile` exists for backend
- [ ] `vite.config.ts` is properly configured
- [ ] `tsconfig.json` is valid

### ✅ Code Quality
- [ ] No hardcoded API keys or secrets
- [ ] All TypeScript errors resolved
- [ ] Build completes successfully
- [ ] No console errors in development

### ✅ Git Repository
- [ ] All necessary files are committed
- [ ] Sensitive files are ignored
- [ ] README.md has clear setup instructions
- [ ] Repository is clean (no uncommitted changes)

## Deployment Steps

### 1. Clone Repository
```bash
git clone <repository-url>
cd demo-prm
```

### 2. Environment Setup
```bash
# Copy and configure environment files
cp .env.template .env
cd backend && cp .env.example .env && cd ..

# Edit .env files with actual values:
# - GEMINI_API_KEY
# - STRIPE_SECRET_KEY
# - STRIPE_PUBLISHABLE_KEY
# - JWT_SECRET
# - Database credentials
```

### 3. Install Dependencies
```bash
npm install
cd backend && npm install && cd ..
```

### 4. Database Setup
```bash
# Ensure PostgreSQL is running
# Database will be auto-created on first backend start
```

### 5. Start Application
```bash
# Option 1: Docker (Recommended)
docker-compose up -d

# Option 2: Local Development
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
npm run dev
```

### 6. Verify Deployment
- [ ] Frontend loads at http://localhost:3000
- [ ] Backend API responds at http://localhost:3001
- [ ] Database connection works
- [ ] Authentication system works
- [ ] Stripe integration works (if configured)
- [ ] AI features work (if Gemini API key provided)

## Required API Keys

### Gemini AI (Required for AI features)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Add to `GEMINI_API_KEY` in both `.env` files

### Stripe (Required for subscriptions)
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Get publishable and secret keys
3. Create products and get price IDs
4. Add to environment files

### JWT Secret (Required for authentication)
```bash
# Generate secure JWT secret
openssl rand -base64 32
```

## Troubleshooting

### Common Issues
1. **Port conflicts**: Change ports in environment files
2. **Database connection**: Verify PostgreSQL is running
3. **API key errors**: Ensure all required keys are set
4. **Build errors**: Check Node.js version (18+ required)
5. **CORS errors**: Verify frontend/backend URLs match

### Logs
- Frontend: Check browser console
- Backend: Check terminal output
- Database: Check PostgreSQL logs
