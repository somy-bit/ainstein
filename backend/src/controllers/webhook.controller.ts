import { Request, Response } from 'express';
import { AppDataSource } from '../config/databse';
import { SubscriptionPlan } from '../models/SubscriptionPlan';
import { StripeService } from '../services/stripe.service';
import Stripe from 'stripe';

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = StripeService.verifyWebhookSignature(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send('Webhook signature verification failed');
  }

  const subRepo = AppDataSource.getRepository(SubscriptionPlan);

  try {
    switch (event.type) {
      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(updatedSubscription, subRepo);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice, subRepo);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(deletedSubscription, subRepo);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  subRepo: any
) {
  const dbSubscription = await subRepo.findOne({
    where: { stripeSubscriptionId: subscription.id }
  });

  if (dbSubscription) {
    // Update plan details immediately
    const priceId = subscription.items.data[0]?.price.id;
    const planName = getPlanNameFromPriceId(priceId);
    
    dbSubscription.planName = planName as any;
    dbSubscription.status = subscription.status === 'active' ? 'Active' : 'Inactive';
    dbSubscription.renewalDate = new Date((subscription as any).current_period_end * 1000);
    
    // Clear pending plan changes since they're now active
    dbSubscription.pendingPlanId = undefined;
    dbSubscription.pendingPlanName = undefined;
    dbSubscription.pendingPlanPrice = undefined;
    dbSubscription.planChangeEffectiveDate = undefined;

    await subRepo.save(dbSubscription);
    console.log(`Subscription updated for customer: ${subscription.customer}`);
  }
}

async function handlePaymentSucceeded(
  invoice: Stripe.Invoice,
  subRepo: any
) {
  if ((invoice as any).subscription) {
    const dbSubscription = await subRepo.findOne({
      where: { stripeSubscriptionId: (invoice as any).subscription }
    });

    if (dbSubscription) {
      dbSubscription.status = 'Active';
      dbSubscription.renewalDate = new Date((invoice as any).period_end! * 1000);
      await subRepo.save(dbSubscription);
      console.log(`Payment succeeded for subscription: ${(invoice as any).subscription}`);
    }
  }
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  subRepo: any
) {
  const dbSubscription = await subRepo.findOne({
    where: { stripeSubscriptionId: subscription.id }
  });

  if (dbSubscription) {
    dbSubscription.status = 'Cancelled';
    await subRepo.save(dbSubscription);
    console.log(`Subscription cancelled: ${subscription.id}`);
  }
}

function getPlanNameFromPriceId(priceId: string): string {
  // Map your Stripe price IDs to plan names
  const priceMapping: { [key: string]: string } = {
    'price_essential_monthly': 'Esencial',
    'price_essential_annual': 'Esencial',
    'price_professional_monthly': 'Profesional',
    'price_professional_annual': 'Profesional',
  };
  
  return priceMapping[priceId] || 'Unknown';
}
