# PostgreSQL Setup Instructions

## 1. Install PostgreSQL locally

### macOS (using Homebrew):
```bash
brew install postgresql
brew services start postgresql
```

### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## 2. Create database and user

```bash
# Connect to PostgreSQL as superuser
psql postgres

# Create database
CREATE DATABASE prm_db;

# Create user (optional, you can use default postgres user)
CREATE USER prm_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE prm_db TO prm_user;

# Exit
\q
```

## 3. Update backend/.env file

Make sure your backend/.env file has the correct database credentials:

```
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=prm_db
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## 4. Install backend dependencies and start

```bash
cd backend
npm install
npm run dev
```

The TypeORM will automatically create the tables on first run (synchronize: true).
