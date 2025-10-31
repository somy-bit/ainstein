# 🚀 Quick Start Guide

## 📍 Environment Variables Location

**Backend Environment File:** `/Users/sara/Documents/builds/demo-prm/backend/.env`

```env
# EDIT THESE VALUES:
DB_PASSWORD=your_actual_postgres_password
JWT_SECRET=your-super-secret-jwt-key-change-this
```

## 🗄️ Database Setup

1. **Install PostgreSQL:**
   ```bash
   brew install postgresql@15
   brew services start postgresql@15
   ```

2. **Create Database:**
   ```bash
   psql postgres
   CREATE DATABASE prm_db;
   \q
   ```

3. **Update Password in .env:**
   Edit `/Users/sara/Documents/builds/demo-prm/backend/.env`

## ▶️ Start the Application

1. **Backend (Terminal 1):**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   ✅ Should show: "Server is running on port 3001"

2. **Frontend (Terminal 2):**
   ```bash
   npm run dev
   ```
   ✅ Should show: "Local: http://localhost:5173"

## 🔧 If Database Connection Fails:

Check your PostgreSQL password:
```bash
psql -U postgres -d prm_db
# If this works, use that password in .env
```

## 📁 Key Files:
- **Environment:** `backend/.env`
- **API Service:** `services/backendApiService.ts`
- **Backend Entry:** `backend/src/server.ts`
