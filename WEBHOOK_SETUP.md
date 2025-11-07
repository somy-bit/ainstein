# Stripe Webhook Setup Guide

## Overview
This guide walks you through setting up Stripe webhooks to enable immediate plan changes and real-time subscription updates.

## What Changed
- Plan changes now happen immediately instead of waiting for the next billing cycle
- Stripe webhooks automatically sync subscription status with your database
- Prorated charges/credits are calculated and billed immediately

## Step 1: Set Up Stripe Webhook Endpoint

### 1.1 Access Stripe Dashboard
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **Webhooks**
3. Click **Add endpoint**

### 1.2 Configure Endpoint
- **Endpoint URL**: `https://yourdomain.com/api/v1/webhooks/stripe`
- **Events to send**: Select these events:
  - `customer.subscription.updated`
  - `invoice.payment_succeeded` 
  - `customer.subscription.deleted`

### 1.3 Get Webhook Secret
1. After creating the endpoint, click on it
2. Copy the **Signing secret** (starts with `whsec_`)
3. Add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`

## Step 2: Update Environment Variables

Add these to your backend `.env` file:

```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
FRONTEND_URL=http://localhost:3000
```

## Step 3: Test the Setup

### 3.1 Local Testing with Stripe CLI
```bash
# Install Stripe CLI
npm install -g stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3001/api/v1/webhooks/stripe
```

### 3.2 Test Plan Change
1. Go to your subscription page
2. Click "Manage Billing" to open Stripe Customer Portal
3. Change your plan
4. Verify the change appears immediately in your app

## Step 4: Production Deployment

### 4.1 Update Webhook URL
- Change endpoint URL to your production domain
- Example: `https://api.yourapp.com/api/v1/webhooks/stripe`

### 4.2 Verify SSL Certificate
- Stripe requires HTTPS for webhook endpoints
- Ensure your production server has a valid SSL certificate

## How It Works

### Immediate Plan Changes
When a user changes their plan through Stripe Customer Portal:

1. **Stripe processes the change** with prorated billing
2. **Webhook fires** to your endpoint
3. **Your app updates** the subscription in real-time
4. **User sees changes** immediately

### Key Benefits
- ✅ Immediate plan activation
- ✅ Automatic prorated billing
- ✅ Real-time status sync
- ✅ Better user experience

## Troubleshooting

### Common Issues

**Webhook not receiving events:**
- Check endpoint URL is correct
- Verify webhook secret in environment variables
- Ensure server is accessible from internet

**Signature verification fails:**
- Confirm `STRIPE_WEBHOOK_SECRET` is correct
- Check that raw body is being passed to webhook handler

**Plan changes not reflecting:**
- Verify webhook events are being processed
- Check database for subscription updates
- Review server logs for errors

### Testing Commands

```bash
# Test webhook endpoint
curl -X POST http://localhost:3001/api/v1/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'

# Check server logs
npm run dev

# Verify database updates
# Check your subscription table for recent changes
```

## Security Notes

- Never expose webhook secrets in client-side code
- Always verify webhook signatures
- Use HTTPS in production
- Monitor webhook endpoint for unusual activity

## Support

If you encounter issues:
1. Check Stripe Dashboard webhook logs
2. Review your server error logs  
3. Test with Stripe CLI for local development
4. Verify all environment variables are set correctly
