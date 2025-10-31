import Stripe from 'stripe';
import { SubscriptionPlan } from '../models/SubscriptionPlan';
import { AppDataSource } from '../config/databse';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export class SubscriptionService {
  static async cancelSubscription(orgId: string, reason?: string): Promise<SubscriptionPlan> {
    const subscriptionRepo = AppDataSource.getRepository(SubscriptionPlan);
    
    console.log(`🔍 Looking up subscription for org: ${orgId}`);
    const subscription = await subscriptionRepo.findOne({ where: { orgId } });
    if (!subscription) {
      console.error(`❌ Subscription not found for org: ${orgId}`);
      throw new Error('Subscription not found');
    }

    console.log(`📋 Found subscription: ${subscription.id} (Status: ${subscription.status})`);
    if (subscription.status === 'Cancelled') {
      console.error(`❌ Subscription already cancelled for org: ${orgId}`);
      throw new Error('Subscription already cancelled');
    }

    // Cancel Stripe subscription at period end
    if (subscription.stripeSubscriptionId) {
      console.log(`💳 Cancelling Stripe subscription: ${subscription.stripeSubscriptionId}`);
      try {
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });
        console.log(`✅ Stripe subscription cancelled: ${subscription.stripeSubscriptionId}`);
      } catch (stripeError) {
        console.error(`❌ Stripe cancellation failed:`, stripeError);
        throw stripeError;
      }
    } else {
      console.log(`⚠️ No Stripe subscription ID found - only updating database status`);
    }

    // Update subscription in database
    console.log(`💾 Updating subscription status in database`);
    subscription.status = 'Cancelled';
    subscription.cancelledAt = new Date();
    subscription.cancellationReason = reason || 'User requested cancellation';
    subscription.endsAt = subscription.renewalDate; // Access ends at current period end

    const savedSubscription = await subscriptionRepo.save(subscription);
    console.log(`✅ Subscription database status updated to Cancelled`);
    
    return savedSubscription;
  }

  static async checkAccess(orgId: string): Promise<{ hasAccess: boolean; reason?: string }> {
    const subscriptionRepo = AppDataSource.getRepository(SubscriptionPlan);
    
    const subscription = await subscriptionRepo.findOne({ where: { orgId } });
    if (!subscription) {
      return { hasAccess: false, reason: 'No subscription found' };
    }

    // Check if cancelled and past end date
    if (subscription.status === 'Cancelled' && subscription.endsAt) {
      if (new Date() > subscription.endsAt) {
        return { hasAccess: false, reason: 'Subscription expired' };
      }
    }

    // Check other statuses
    if (subscription.status === 'Expired') {
      return { hasAccess: false, reason: 'Subscription expired' };
    }

    return { hasAccess: true };
  }
}
