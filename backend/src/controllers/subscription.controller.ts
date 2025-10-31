import { Request, Response } from 'express';
import { AppDataSource } from '../config/databse';
import { SubscriptionPlan } from '../models/SubscriptionPlan';
import { PlanTemplate } from '../models/PlanTemplate';
import { Organization } from '../models/Organization';
import { StripeService } from '../services/stripe.service';
import { ErrorMessages, createErrorResponse } from '../utils/errorMessages';

export const getAllSubscriptions = async (req: Request, res: Response) => {
  try {
    const subRepo = AppDataSource.getRepository(SubscriptionPlan);
    const subscriptions = await subRepo.find({ relations: ['organization'] });
    res.json(subscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.DATABASE_ERROR));
  }
};

export const getSubscriptionByOrg = async (req: Request, res: Response) => {
  try {
    const { orgId } = req.params;
    const subRepo = AppDataSource.getRepository(SubscriptionPlan);
    const subscription = await subRepo.findOne({ 
      where: { orgId },
      relations: ['organization'] 
    });
    
    if (!subscription) {
      return res.status(404).json(createErrorResponse(ErrorMessages.SUBSCRIPTION_NOT_FOUND));
    }
    
    // Calculate remaining trial days if it's a free trial
    let remainingTrialDays = null;
    if (subscription.planName === 'Free Trial' && subscription.status === 'Trial') {
      const now = new Date();
      const renewalDate = new Date(subscription.renewalDate);
      const diffTime = renewalDate.getTime() - now.getTime();
      remainingTrialDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      
      // Update status if trial expired
      if (remainingTrialDays === 0 && subscription.status === 'Trial') {
        subscription.status = 'Expired';
        await subRepo.save(subscription);
      }
    }
    
    res.json({
      ...subscription,
      remainingTrialDays
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.DATABASE_ERROR));
  }
};

export const createSubscription = async (req: Request, res: Response) => {
  try {
    const { orgId, planName, billingCycle } = req.body;
    
    // Get organization details
    const orgRepo = AppDataSource.getRepository(Organization);
    const organization = await orgRepo.findOne({ where: { id: orgId } });
    
    if (!organization) {
      return res.status(404).json(createErrorResponse(ErrorMessages.ORGANIZATION_NOT_FOUND));
    }

    // Define plan pricing
    const planPricing = {
      'Free Trial': { monthly: 0, annual: 0 },
      'Esencial': { monthly: 49, annual: 490 },
      'Profesional': { monthly: 99, annual: 990 }
    };

    const price = planPricing[planName as keyof typeof planPricing]?.[billingCycle.toLowerCase() as 'monthly' | 'annual'] || 0;

    // Create subscription plan
    const subRepo = AppDataSource.getRepository(SubscriptionPlan);
    const subscription = await subRepo.save({
      id: require('crypto').randomUUID(),
      orgId,
      planName,
      price,
      billingCycle,
      status: planName === 'Free Trial' ? 'Trial' : 'Active',
      renewalDate: new Date(Date.now() + (billingCycle === 'Annual' ? 365 : 30) * 24 * 60 * 60 * 1000),
      features: getDefaultFeatures(planName),
      usage: getDefaultUsage(),
      overageCosts: getDefaultOverageCosts(planName),
      paymentMethod: { type: 'Not Set', last4: '', expiry: '' }
    });

    res.json(subscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.DATABASE_ERROR));
  }
};

export const updateSubscriptionUsage = async (req: Request, res: Response) => {
  try {
    const { orgId } = req.params;
    const { usageType, increment } = req.body;
    
    const subRepo = AppDataSource.getRepository(SubscriptionPlan);
    const subscription = await subRepo.findOne({ where: { orgId } });
    
    if (!subscription) {
      return res.status(404).json(createErrorResponse(ErrorMessages.SUBSCRIPTION_NOT_FOUND));
    }

    // Update usage
    const currentUsage = subscription.usage[usageType as keyof typeof subscription.usage]?.current || 0;
    subscription.usage = {
      ...subscription.usage,
      [usageType]: { current: currentUsage + increment }
    };

    await subRepo.save(subscription);
    res.json(subscription);
  } catch (error) {
    console.error('Error updating usage:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.SUBSCRIPTION_UPDATE_FAILED));
  }
};

export const changePlan = async (req: Request, res: Response) => {
  try {
    const { orgId, newPlanId } = req.body;
    
    if (!orgId || !newPlanId) {
      return res.status(400).json(createErrorResponse(ErrorMessages.MISSING_REQUIRED_FIELDS));
    }

    const subRepo = AppDataSource.getRepository(SubscriptionPlan);
    const planRepo = AppDataSource.getRepository(PlanTemplate);
    
    // Get current subscription
    const subscription = await subRepo.findOne({ where: { orgId } });
    if (!subscription) {
      return res.status(404).json(createErrorResponse(ErrorMessages.SUBSCRIPTION_NOT_FOUND));
    }
    
    // Get new plan details
    const newPlan = await planRepo.findOne({ where: { id: newPlanId, isActive: true } });
    if (!newPlan) {
      return res.status(400).json(createErrorResponse(ErrorMessages.INVALID_PLAN_SELECTED));
    }
    
    // Schedule plan change for next billing cycle
    subscription.pendingPlanId = newPlan.id;
    subscription.pendingPlanName = newPlan.name;
    subscription.pendingPlanPrice = newPlan.price;
    subscription.planChangeEffectiveDate = subscription.renewalDate;
    
    await subRepo.save(subscription);
    
    res.json({
      message: 'Plan change scheduled successfully',
      currentPlan: subscription.planName,
      newPlan: newPlan.name,
      effectiveDate: subscription.renewalDate
    });
  } catch (error) {
    console.error('Error changing plan:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.DATABASE_ERROR));
  }
};

export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { amount, orgId } = req.body;
    
    if (!amount) {
      return res.status(400).json(createErrorResponse(ErrorMessages.MISSING_REQUIRED_FIELDS));
    }

    // Create payment intent using Stripe
    const paymentIntent = await StripeService.createPaymentIntent(
      amount,
      'usd'
    );

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.PAYMENT_FAILED));
  }
};
    

// Helper functions
function getDefaultFeatures(planName: string) {
  const features = {
    'Free Trial': {
      partnerManagers: { limit: 1 },
      admins: { limit: 1 },
      partners: { limit: 5 },
      textTokens: { limit: 10000 },
      speechToTextMinutes: { limit: 60 },
      storageGB: { limit: 1 }
    },
    'Esencial': {
      partnerManagers: { limit: 2 },
      admins: { limit: 2 },
      partners: { limit: 25 },
      textTokens: { limit: 50000 },
      speechToTextMinutes: { limit: 300 },
      storageGB: { limit: 5 }
    },
    'Profesional': {
      partnerManagers: { limit: 10 },
      admins: { limit: 5 },
      partners: { limit: 100 },
      textTokens: { limit: 200000 },
      speechToTextMinutes: { limit: 1200 },
      storageGB: { limit: 20 }
    }
  };
  return features[planName as keyof typeof features] || features['Free Trial'];
}

function getDefaultUsage() {
  return {
    partners: { current: 0 },
    textTokens: { current: 0 },
    speechToTextMinutes: { current: 0 },
    storageGB: { current: 0 }
  };
}

function getDefaultOverageCosts(planName: string) {
  const costs = {
    'Free Trial': {
      additionalPartner: 15,
      textTokensPer1k: 0.02,
      speechToTextPerMinute: 0.1,
      storagePerGB: 8
    },
    'Esencial': {
      additionalPartner: 15,
      textTokensPer1k: 0.02,
      speechToTextPerMinute: 0.1,
      storagePerGB: 8
    },
    'Profesional': {
      additionalPartner: 10,
      textTokensPer1k: 0.01,
      speechToTextPerMinute: 0.05,
      storagePerGB: 2
    }
  };
  return costs[planName as keyof typeof costs] || costs['Free Trial'];
}
