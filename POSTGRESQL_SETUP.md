# PostgreSQL Setup Guide

## 1. Install PostgreSQL

### macOS (Homebrew):
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Windows:
Download from https://www.postgresql.org/download/windows/

## 2. Create Database and User

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE prm_db;

# Create user (optional - you can use default postgres user)
CREATE USER prm_user WITH PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE prm_db TO prm_user;

# Exit
\q
```

## 3. Configure Environment Variables

**File:** `/Users/sara/Documents/builds/demo-prm/backend/.env`

```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_actual_password_here
DB_DATABASE=prm_db
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
```

## 4. Start the Backend

```bash
cd backend
npm install
npm run dev
```

## 5. Verify Connection

You should see:
```
✅ Data Source has been initialized successfully.
🚀 Server is running on port 3001
```

## 6. Test API

```bash
curl http://localhost:3001
# Should return: {"status":"PRM Backend operational"}
```
