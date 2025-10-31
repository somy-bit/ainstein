#!/bin/bash

echo "🐳 Starting PRM Application with Docker..."

# Build and start all containers
docker-compose up --build

echo "✅ Application started!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:3001"
echo "🗄️ Database: localhost:5432"
