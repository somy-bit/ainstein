# 🚀 Quick Start Guide - New Machine Setup

## ✅ **Verified Working Setup**

### **Prerequisites**
- Docker & Docker Compose installed
- Git installed

---

## **Step 1: Clone Repository**
```bash
git clone <your-repository-url>
cd demo-prm
```

## **Step 2: Configure Environment (REQUIRED)**
```bash
# Copy template
cp .env.docker .env

# Edit .env file with your actual keys
nano .env  # or use any text editor
```

**Required keys in `.env`:**
```bash
JWT_SECRET=your-secure-32-character-random-string-here
GEMINI_API_KEY=AIzaSyC...your_actual_gemini_key
STRIPE_SECRET_KEY=sk_test_...your_actual_stripe_secret
STRIPE_PUBLISHABLE_KEY=pk_test_...your_actual_stripe_publishable
STRIPE_PRICE_ID_BASIC=price_...your_basic_plan_id
STRIPE_PRICE_ID_PREMIUM=price_...your_premium_plan_id
STRIPE_PRICE_ID_ENTERPRISE=price_...your_enterprise_plan_id
```

## **Step 3: Start Application**
```bash
docker-compose up -d
```

## **Step 4: Access Application**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Admin Login:** `admin@admin.com` / `password12345`

---

## **Getting Your Keys**

### 🔑 **JWT Secret**
```bash
# Generate random string
openssl rand -base64 32
# OR any secure 32+ character string
```

### 🤖 **Gemini API Key**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy key (starts with `AIzaSyC...`)

### 💳 **Stripe Keys & Price IDs**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. **API Keys:** Developers > API keys
3. **Price IDs:** Products > Create products > Copy price IDs

---

## **Verification Checklist**

After `docker-compose up -d`:

```bash
# Check all containers running
docker-compose ps

# Should show:
# prm-database   Up
# prm-backend    Up  
# prm-frontend   Up

# Check logs if issues
docker-compose logs backend
```

---

## **What Happens Automatically**

✅ PostgreSQL database created  
✅ All tables & schemas created  
✅ Admin user seeded (`admin@admin.com`)  
✅ Plan templates created with YOUR Stripe price IDs  
✅ All services connected  

---

## **Troubleshooting**

**Port conflicts:**
```bash
# Change ports in docker-compose.yml if needed
ports:
  - "3001:3001"  # Change first number: "3002:3001"
```

**Container issues:**
```bash
# Restart containers
docker-compose down
docker-compose up -d

# Rebuild if needed
docker-compose up -d --build
```

**Database issues:**
```bash
# Reset database
docker-compose down -v
docker-compose up -d
```

---

## **Success Indicators**

✅ `docker-compose ps` shows all containers "Up"  
✅ http://localhost:3000 loads the app  
✅ Can login with `admin@admin.com` / `password12345`  
✅ No errors in `docker-compose logs`  

**Total setup time: 3-5 minutes**
