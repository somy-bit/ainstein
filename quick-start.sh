#!/bin/bash

# AInstein PRM Quick Start Script
# This script helps set up the project after cloning

echo "🚀 AInstein PRM Quick Start Setup"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Create environment files
echo "📝 Setting up environment files..."

if [ ! -f .env ]; then
    cp .env.template .env
    echo "✅ Created .env from template"
else
    echo "⚠️  .env already exists"
fi

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env from template"
else
    echo "⚠️  backend/.env already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env and backend/.env with your API keys:"
echo "   - GEMINI_API_KEY (get from https://makersuite.google.com/app/apikey)"
echo "   - STRIPE_SECRET_KEY & STRIPE_PUBLISHABLE_KEY (get from Stripe dashboard)"
echo "   - JWT_SECRET (generate with: openssl rand -base64 32)"
echo ""
echo "2. Start the application:"
echo "   Option A - Docker: docker-compose up -d"
echo "   Option B - Local:"
echo "     Terminal 1: cd backend && npm run dev"
echo "     Terminal 2: npm run dev"
echo ""
echo "3. Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend: http://localhost:3001"
echo "   Admin login: admin@admin.com / password12345"
echo ""
echo "📖 For detailed instructions, see README.md and DEPLOYMENT_CHECKLIST.md"
