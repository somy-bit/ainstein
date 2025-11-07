#!/bin/bash

# AInstein PRM Quick Start Script
# This script helps set up the project after cloning

echo "🚀 AInstein PRM Quick Start Setup"
echo "=================================="

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

echo ""
echo "🎉 Environment files created!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. 🔑 Edit .env and backend/.env with your API keys:"
echo "   - GEMINI_API_KEY (get from https://makersuite.google.com/app/apikey)"
echo "   - STRIPE_SECRET_KEY & STRIPE_PUBLISHABLE_KEY (get from Stripe dashboard)"
echo "   - JWT_SECRET (generate with: openssl rand -base64 32)"
echo ""
echo "2. 🐳 Start with Docker (RECOMMENDED - No Node.js/PostgreSQL needed):"
echo "   docker-compose up -d"
echo ""
echo "   OR"
echo ""
echo "3. 💻 Start locally (requires Node.js 18+ and PostgreSQL):"
echo "   npm install"
echo "   cd backend && npm install && cd .."
echo "   # Terminal 1: cd backend && npm run dev"
echo "   # Terminal 2: npm run dev"
echo ""
echo "4. 🌐 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend: http://localhost:3001"
echo "   Admin login: admin@admin.com / password12345"
echo ""
echo "📖 For detailed instructions, see README.md and DEPLOYMENT_CHECKLIST.md"
