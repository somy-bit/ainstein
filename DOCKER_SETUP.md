# 🐳 Docker Setup Guide

## 📦 Container Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   PostgreSQL    │
│   (React)       │◄──►│   (Express)     │◄──►│   Database      │
│   Port: 5173    │    │   Port: 3001    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Option 1: One Command
```bash
./docker-start.sh
```

### Option 2: Manual
```bash
docker-compose up --build
```

## 📍 Access Points

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Database:** localhost:5432

## 🛠️ Development Mode

The containers are configured with volume mounts for live reloading:
- Backend code changes auto-restart the server
- Frontend code changes auto-refresh the browser

## 🗄️ Database

- **Container:** `prm-database`
- **Image:** `postgres:15`
- **Database:** `prm_db`
- **User:** `postgres`
- **Password:** `password`
- **Data:** Persisted in Docker volume `postgres_data`

## 🔧 Container Management

### Start containers:
```bash
docker-compose up
```

### Start in background:
```bash
docker-compose up -d
```

### Stop containers:
```bash
docker-compose down
```

### View logs:
```bash
docker-compose logs -f [service-name]
```

### Rebuild containers:
```bash
docker-compose up --build
```

## 🐛 Troubleshooting

### Port conflicts:
```bash
# Stop containers using ports
docker-compose down
# Or change ports in docker-compose.yml
```

### Database connection issues:
```bash
# Check database container
docker-compose logs database

# Connect to database
docker exec -it prm-database psql -U postgres -d prm_db
```

### Clear everything:
```bash
docker-compose down -v
docker system prune -a
```

## 📁 Docker Files

- `docker-compose.yml` - Main orchestration
- `docker-compose.override.yml` - Development overrides
- `backend/Dockerfile` - Backend container
- `Dockerfile.frontend` - Frontend container
