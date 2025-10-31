
import React, { useState } from 'react';
import { CardElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { useTranslations } from '../../hooks/useTranslations';
import { useStripe as useStripeContext } from '../../contexts/StripeContext';
import { createPaymentIntent } from '../../services/backendApiService';
import { StripePaymentIntent, StripePaymentMethod } from '../../types';

interface StripePaymentFormProps {
  onPaymentSuccess?: (paymentIntent: StripePaymentIntent | StripePaymentMethod) => void;
  onPaymentError?: (error: string) => void;
  amount?: number;
  orgId?: string;
  onSubmit?: () => void;
}

const StripePaymentFormInner: React.FC<StripePaymentFormProps> = ({
  onPaymentSuccess,
  onPaymentError,
  amount = 0,
  orgId,
  onSubmit
}) => {
  const t = useTranslations();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardholderName, setCardholderName] = useState('');

  const handlePayment = async () => {
    console.log('Starting payment method creation for trial...');
    setIsProcessing(true);

    try {
      // For trial registration, we create a payment method instead of charging
      if (amount === 0) {
        if (!stripe || !elements) {
          console.log('Stripe not loaded, using mock payment method...');
          onPaymentSuccess?.({ 
            payment_method: 'pm_mock_' + Date.now(),
            status: 'succeeded',
            cardholderName: cardholderName || 'Test User',
            last4: '4242'
          });
          setIsProcessing(false);
          return true;
        }

        const cardElement = elements.getElement(CardElement);
        
        if (!cardElement) {
          console.error('Card element not found');
          onPaymentError?.('Card element not found.');
          setIsProcessing(false);
          return false;
        }

        console.log('Creating payment method...');
        const { error, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement as any,
          billing_details: {
            name: cardholderName,
          },
        });

        if (error) {
          console.error('Payment method creation error:', error);
          onPaymentError?.(error.message || 'Failed to save payment method');
          setIsProcessing(false);
          return false;
        } else if (paymentMethod) {
          console.log('Payment method created:', paymentMethod);
          onPaymentSuccess?.(paymentMethod);
          setIsProcessing(false);
          return true;
        }
      } else {
        // Original payment processing for non-trial payments
        console.log('Creating payment intent with amount:', amount);
        const { clientSecret, paymentIntentId } = await createPaymentIntent({ amount, orgId });
        console.log('Payment intent created:', { clientSecret, paymentIntentId });

        // Check if this is a mock payment intent (for demo purposes)
        if (clientSecret.startsWith('pi_mock_')) {
          console.log('Processing mock payment...');
          onPaymentSuccess?.({ 
            id: paymentIntentId, 
            status: 'succeeded',
            amount: amount * 100,
            currency: 'usd',
            cardholderName: cardholderName || 'Test User',
            last4: '4242'
          });
          setIsProcessing(false);
          return true;
        }

        // Real Stripe payment processing
        if (!stripe || !elements) {
          console.error('Stripe not loaded for real payment');
          onPaymentError?.('Stripe not loaded. Please configure your Stripe keys.');
          setIsProcessing(false);
          return false;
        }

        const cardElement = elements.getElement(CardElement);
        
        if (!cardElement) {
          console.error('Card element not found');
          onPaymentError?.('Card element not found.');
          setIsProcessing(false);
          return false;
        }

        console.log('Confirming card payment with Stripe...');
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement as any,
            billing_details: {
              name: cardholderName,
            },
          },
        });

        if (error) {
          console.error('Stripe payment error:', error);
          onPaymentError?.(error.message || 'Payment failed');
          setIsProcessing(false);
          return false;
        } else if (paymentIntent?.status === 'succeeded') {
          console.log('Payment succeeded:', paymentIntent);
          onPaymentSuccess?.(paymentIntent);
          setIsProcessing(false);
          return true;
        }
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      onPaymentError?.('Payment processing failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setIsProcessing(false);
      return false;
    }
    
    setIsProcessing(false);
    return false;
  };

  // Expose the payment handler to parent
  React.useEffect(() => {
    if (onSubmit) {
      (window as Window & { stripePaymentHandler?: () => Promise<boolean> }).stripePaymentHandler = handlePayment;
    }
  }, [onSubmit]);

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
    },
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Cardholder Name
        </label>
        <input
          type="text"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder="Enter cardholder name"
          className="w-full p-3 border border-slate-300 rounded-md bg-white"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {amount === 0 ? 'Payment Method (for future billing)' : t('cardNumber')}
        </label>
        <div className="p-3 border border-slate-300 rounded-md bg-white">
          {stripe ? (
            <CardElement options={cardElementOptions} />
          ) : (
            <div className="text-gray-500 py-2">
              Configure Stripe keys to enable secure card input
            </div>
          )}
        </div>
      </div>
      
      {!stripe && (
        <p className="text-sm text-gray-600 text-center">
          Add your Stripe test keys to .env to enable real payments
        </p>
      )}
      
      {isProcessing && (
        <p className="text-sm text-blue-600 text-center">
          {amount === 0 ? 'Saving payment method...' : 'Processing payment...'}
        </p>
      )}

      <button
        type="button"
        onClick={handlePayment}
        disabled={isProcessing || !cardholderName.trim()}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing 
          ? (amount === 0 ? 'Saving...' : 'Processing...') 
          : (amount === 0 ? 'Save Payment Method' : `Pay $${amount}`)
        }
      </button>
    </div>
  );
};

const StripePaymentForm: React.FC<StripePaymentFormProps> = (props) => {
  const { stripe, isLoading } = useStripeContext();

  if (isLoading) {
    return <div className="p-4 text-center">Loading Stripe...</div>;
  }

  return (
    <Elements stripe={stripe}>
      <StripePaymentFormInner {...props} />
    </Elements>
  );
};

export default StripePaymentForm;
