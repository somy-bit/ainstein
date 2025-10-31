import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';

/// <reference types="vite/client" />

interface StripeContextType {
  stripe: Stripe | null;
  isLoading: boolean;
}

const StripeContext = createContext<StripeContextType>({
  stripe: null,
  isLoading: true,
});

export const useStripe = () => {
  const context = useContext(StripeContext);
  if (!context) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  return context;
};

interface StripeProviderProps {
  children: React.ReactNode;
}

export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeStripe = async () => {
      const publishableKey = (import.meta as { env?: Record<string, string> }).env?.VITE_STRIPE_PUBLISHABLE_KEY;
      
      // For demo purposes, use a test key if the placeholder is still there
      const testKey = publishableKey === 'pk_test_your_stripe_publishable_key_here' 
        ? 'pk_test_51234567890' // This will fail gracefully and show form anyway
        : publishableKey;
      
      if (testKey && testKey.startsWith('pk_test_')) {
        try {
          const stripeInstance = await loadStripe(testKey);
          setStripe(stripeInstance);
        } catch (error) {
          console.error('Failed to load Stripe:', error);
          // Set stripe to null but stop loading so form can show
          setStripe(null);
        }
      } else {
        // No valid key, but stop loading
        setStripe(null);
      }
      
      setIsLoading(false);
    };

    initializeStripe();
  }, []);

  return (
    <StripeContext.Provider value={{ stripe, isLoading }}>
      {children}
    </StripeContext.Provider>
  );
};
