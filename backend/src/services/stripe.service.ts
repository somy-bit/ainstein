import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key');

export class StripeService {
  // Create a customer
  static async createCustomer(email: string, name: string, organizationId: string) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          organizationId,
        },
      });
      return customer;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw error;
    }
  }

  // Create a subscription
  static async createSubscription(customerId: string, priceId: string) {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });
      return subscription;
    } catch (error) {
      console.error('Error creating Stripe subscription:', error);
      throw error;
    }
  }

  // Create subscription with payment method (immediate charge)
  static async createSubscriptionWithPaymentMethod(
    customerId: string, 
    priceId: string, 
    paymentMethodId: string
  ) {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        default_payment_method: paymentMethodId,
        expand: ['latest_invoice.payment_intent'],
      });
      return subscription;
    } catch (error) {
      console.error('Error creating subscription with payment method:', error);
      throw error;
    }
  }
  static async createTrialSubscription(customerId: string, priceId: string, trialDays: number = 30) {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        trial_period_days: trialDays,
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });
      return subscription;
    } catch (error) {
      console.error('Error creating trial subscription:', error);
      throw error;
    }
  }

  // Attach payment method to customer
  static async attachPaymentMethodToCustomer(paymentMethodId: string, customerId: string) {
    try {
      const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
      
      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
      
      return paymentMethod;
    } catch (error) {
      console.error('Error attaching payment method:', error);
      throw error;
    }
  }

  // Create trial subscription with payment method
  static async createTrialSubscriptionWithPaymentMethod(
    customerId: string, 
    priceId: string, 
    paymentMethodId: string, 
    trialDays: number = 30
  ) {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        trial_period_days: trialDays,
        default_payment_method: paymentMethodId,
        expand: ['latest_invoice.payment_intent'],
      });
      return subscription;
    } catch (error) {
      console.error('Error creating trial subscription with payment method:', error);
      throw error;
    }
  }

  // Create payment intent for one-time payments
  static async createPaymentIntent(amount: number, currency: string = 'usd', customerId?: string) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency,
        customer: customerId,
        automatic_payment_methods: { enabled: true },
      });
      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  // Get subscription details
  static async getSubscription(subscriptionId: string) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      throw error;
    }
  }

  // Cancel subscription
  static async cancelSubscription(subscriptionId: string) {
    try {
      const subscription = await stripe.subscriptions.cancel(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  // Update subscription with immediate effect
  static async updateSubscription(subscriptionId: string, priceId: string) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: priceId,
        }],
        proration_behavior: 'always_invoice', // Creates immediate invoice for prorated amount
        billing_cycle_anchor: 'now', // Resets billing cycle to start immediately
      });
      return updatedSubscription;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  // Webhook signature verification
  static verifyWebhookSignature(payload: string, signature: string, endpointSecret: string) {
    try {
      return stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw error;
    }
  }
}
