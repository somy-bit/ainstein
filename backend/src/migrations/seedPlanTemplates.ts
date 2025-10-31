import { AppDataSource } from '../config/databse';
import { PlanTemplate } from '../models/PlanTemplate';

export const seedPlanTemplates = async () => {
  try {
    const planRepo = AppDataSource.getRepository(PlanTemplate);
    
    // Check if plans already exist
    const existingPlans = await planRepo.count();
    if (existingPlans > 0) {
      console.log('Plan templates already exist, skipping seed');
      return;
    }

    const basicPlan = planRepo.create({
      name: 'Basic Plan',
      price: 19.99,
      billingCycle: 'Monthly',
      trialDays: 30,
      stripePriceId: process.env.STRIPE_PRICE_ID_BASIC || 'price_basic_monthly', // Use env var or fallback
      features: {
        partnerManagers: { limit: 1 },
        admins: { limit: 1 },
        partners: { limit: 5 },
        textTokens: { limit: 2000 },
        speechToTextMinutes: { limit: 30 },
        storageGB: { limit: 2 }
      },
      overageCosts: {
        additionalPartner: 5.00,
        textTokensPer1k: 0.01,
        speechToTextPerMinute: 0.05,
        storagePerGB: 2.00
      },
      isActive: true
    });

    const premiumPlan = planRepo.create({
      name: 'Premium Plan',
      price: 49.99,
      billingCycle: 'Monthly',
      trialDays: 30,
      stripePriceId: process.env.STRIPE_PRICE_ID_PREMIUM || 'price_premium_monthly', // Use env var or fallback
      features: {
        partnerManagers: { limit: 5 },
        admins: { limit: 3 },
        partners: { limit: 50 },
        textTokens: { limit: 10000 },
        speechToTextMinutes: { limit: 120 },
        storageGB: { limit: 10 }
      },
      overageCosts: {
        additionalPartner: 4.00,
        textTokensPer1k: 0.008,
        speechToTextPerMinute: 0.04,
        storagePerGB: 1.50
      },
      isActive: true
    });

    await planRepo.save([basicPlan, premiumPlan]);
    console.log('Plan templates seeded successfully');
  } catch (error) {
    console.error('Failed to seed plan templates:', error);
  }
};
