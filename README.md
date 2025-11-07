# AInstein - AI-Powered Partner Relationship Management (PRM)

A comprehensive Partner Relationship Management system powered by AI, built with React, TypeScript, Node.js, and PostgreSQL.

## Features

- 🤖 AI-powered partner insights and recommendations
- 👥 Partner management and onboarding
- 📊 Performance analytics and reporting
- 💳 Subscription management with Stripe integration
- 🔐 JWT-based authentication
- 📱 Responsive design
- 🌐 Multi-language support

## Prerequisites

**For Docker (Recommended):**
- Docker & Docker Compose only

**For Local Development:**
- Node.js 18+ 
- PostgreSQL 12+

## Quick Start

### 1. Clone and Setup Environment

```bash
git clone <your-repo-url>
cd demo-prm

# Run setup script (copies environment templates)
./quick-start.sh
```

### 2. Configure API Keys

Edit `.env` and `backend/.env` with your actual values:

**Required API Keys:**
- `GEMINI_API_KEY`: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- `STRIPE_SECRET_KEY` & `STRIPE_PUBLISHABLE_KEY`: Get from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
- `JWT_SECRET`: Generate with `openssl rand -base64 32`

### 3. Start Application

**Option A: Docker (Recommended - No Node.js/PostgreSQL needed)**
```bash
docker-compose up -d
```

**Option B: Local Development**
```bash
# Install dependencies first
npm install
cd backend && npm install && cd ..

# Start backend (Terminal 1)
cd backend && npm run dev

# Start frontend (Terminal 2)
npm run dev
```

## Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Default Admin**: admin@admin.com / password12345

## Project Structure

```
demo-prm/
├── components/          # React components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # API services
├── backend/            # Node.js backend
│   ├── src/           # TypeScript source
│   └── uploads/       # File uploads
├── translations/       # i18n files
└── docker-compose.yml # Container setup
```

## Development

### Building for Production

```bash
npm run build
```

### Database Setup

The application uses PostgreSQL with TypeORM. Database schema is automatically created on first run.

### API Documentation

Backend API runs on port 3001 with the following main endpoints:
- `/api/auth/*` - Authentication
- `/api/partners/*` - Partner management
- `/api/subscriptions/*` - Billing
- `/api/webhooks/*` - Stripe webhooks

## Deployment

1. Set production environment variables
2. Build the application: `npm run build`
3. Deploy using Docker or your preferred hosting platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
