import { Request, Response } from 'express';
import { ErrorMessages, createErrorResponse } from '../utils/errorMessages';

export const getPlatformStripeConfig = async (req: Request, res: Response) => {
  try {
    const isConnected = !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key_here');
    const publishableKeySet = !!(process.env.STRIPE_PUBLISHABLE_KEY && process.env.STRIPE_PUBLISHABLE_KEY !== 'pk_test_your_stripe_publishable_key_here');
    
    res.json({ 
      isConnected,
      publishableKeySet,
      publishableKey: publishableKeySet ? process.env.STRIPE_PUBLISHABLE_KEY : null
    });
  } catch (error) {
    res.status(500).json(createErrorResponse(ErrorMessages.DATABASE_ERROR));
  }
};

export const updatePlatformStripeConfig = async (req: Request, res: Response) => {
  try {
    // In a real app, you'd save these to a database or config service
    // For now, we'll just validate and return the current environment config
    const { secretKey, publishableKey } = req.body;
    
    if (secretKey && !secretKey.startsWith('sk_test_')) {
      return res.status(400).json(createErrorResponse(ErrorMessages.VALIDATION_ERROR));
    }
    
    if (publishableKey && !publishableKey.startsWith('pk_test_')) {
      return res.status(400).json(createErrorResponse(ErrorMessages.VALIDATION_ERROR));
    }
    
    const isConnected = !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key_here');
    const publishableKeySet = !!(process.env.STRIPE_PUBLISHABLE_KEY && process.env.STRIPE_PUBLISHABLE_KEY !== 'pk_test_your_stripe_publishable_key_here');
    
    res.json({ 
      isConnected,
      publishableKeySet,
      publishableKey: publishableKeySet ? process.env.STRIPE_PUBLISHABLE_KEY : null,
      message: 'Configuration validated. Update environment variables to change keys.'
    });
  } catch (error) {
    res.status(500).json(createErrorResponse(ErrorMessages.DATABASE_ERROR));
  }
};
