# Stripe Integration Setup Guide

## Overview
This guide explains how to set up and use the Stripe integration in your demo-prm application.

## Prerequisites
- Stripe account (create at https://stripe.com)
- Node.js and npm installed
- Application running locally

## Setup Instructions

### 1. Get Stripe Test Keys
1. Log in to your Stripe Dashboard
2. Navigate to Developers > API keys
3. Copy your **Publishable key** (starts with `pk_test_`)
4. Copy your **Secret key** (starts with `sk_test_`)

### 2. Configure Backend Environment
Edit `/backend/.env` and replace the placeholder values:

```env
# Stripe Configuration (Test Keys)
STRIPE_SECRET_KEY=sk_test_your_actual_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 3. Configure Frontend Environment
Edit `/.env` and replace the placeholder value:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_stripe_publishable_key_here
```

### 4. Restart Application
After updating environment variables:
```bash
# Stop the application (Ctrl+C)
# Restart both frontend and backend
npm run dev
```

## Testing with Stripe Test Cards

Use these test card numbers for testing:

### Successful Payments
- **Visa**: 4242 4242 4242 4242
- **Visa (debit)**: 4000 0566 5566 5556
- **Mastercard**: 5555 5555 5555 4444

### Failed Payments (for testing error handling)
- **Declined**: 4000 0000 0000 0002
- **Insufficient funds**: 4000 0000 0000 9995
- **Expired card**: 4000 0000 0000 0069

### Test Details
- **Expiry**: Any future date (e.g., 12/25)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

## Features Implemented

### Backend
- ✅ Stripe SDK integration
- ✅ Payment intent creation
- ✅ Customer management
- ✅ Subscription handling
- ✅ Real-time configuration validation

### Frontend
- ✅ Stripe Elements integration
- ✅ Secure card input forms
- ✅ Payment processing
- ✅ Configuration management UI

## API Endpoints

### Platform Configuration
- `GET /api/platform/stripe-config` - Get Stripe configuration status
- `POST /api/platform/stripe-config` - Update Stripe configuration

### Payment Processing
- `POST /api/subscriptions/payment-intent` - Create payment intent

## Usage Examples

### Creating a Payment Intent
```javascript
const response = await fetch('/api/subscriptions/payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    amount: 49.99, 
    orgId: 'your-org-id' 
  })
});
```

### Using Stripe Elements in React
```jsx
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from './components/auth/StripeMockForm';

<Elements stripe={stripe}>
  <StripePaymentForm 
    amount={49.99}
    orgId="your-org-id"
    onPaymentSuccess={(paymentIntent) => console.log('Success:', paymentIntent)}
    onPaymentError={(error) => console.error('Error:', error)}
  />
</Elements>
```

## Security Notes

⚠️ **Important Security Considerations:**
- Never expose secret keys in frontend code
- Only test keys are allowed in this demo environment
- Use HTTPS in production
- Validate payments on the server side
- Store sensitive data securely

## Troubleshooting

### Common Issues

1. **"Stripe not loaded"**
   - Check that `VITE_STRIPE_PUBLISHABLE_KEY` is set correctly
   - Ensure the key starts with `pk_test_`

2. **"Payment failed"**
   - Verify backend `STRIPE_SECRET_KEY` is correct
   - Check network connectivity
   - Use valid test card numbers

3. **"Configuration not connected"**
   - Ensure environment variables are set
   - Restart the application after changing .env files

### Debug Steps
1. Check browser console for errors
2. Verify environment variables are loaded
3. Test with different browsers
4. Check Stripe Dashboard for payment logs

## Next Steps

To extend the Stripe integration:
1. Add webhook handling for payment confirmations
2. Implement subscription management
3. Add customer portal for self-service
4. Set up automated billing
5. Add payment method management

## Support

For Stripe-specific issues:
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com

For application issues:
- Check the console logs
- Review the API responses
- Test with different payment methods
