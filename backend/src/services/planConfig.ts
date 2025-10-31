import { AppDataSource } from '../config/databse';
import { PlanTemplate } from '../models/PlanTemplate';

export const getPlanConfig = async (planName: string) => {
  // First try to get from database plan templates
  try {
    const planRepo = AppDataSource.getRepository(PlanTemplate);
    const planTemplate = await planRepo.findOne({ 
      where: { name: planName, isActive: true } 
    });
    
    if (planTemplate) {
      return {
        id: planTemplate.id,
        name: planTemplate.name,
        price: Number(planTemplate.price),
        billingCycle: planTemplate.billingCycle,
        trialDays: planTemplate.trialDays,
        stripePriceId: planTemplate.stripePriceId,
        features: planTemplate.features,
        overageCosts: planTemplate.overageCosts,
        isActive: planTemplate.isActive
      };
    }
  } catch (error) {
    console.warn('Could not fetch plan from database, falling back to env config:', error);
  }

  // Fallback to environment-based configuration
  const prefix = `PLAN_${planName.toUpperCase().replace(' ', '_')}`;
  
  return {
    price: Number(process.env[`${prefix}_PRICE`]) || 0,
    features: {
      partners: { limit: Number(process.env[`${prefix}_PARTNERS`]) || 0 },
      textTokens: { limit: Number(process.env[`${prefix}_TOKENS`]) || 0 },
      speechToTextMinutes: { limit: Number(process.env[`${prefix}_SPEECH_MINUTES`]) || 0 },
      storageGB: { limit: Number(process.env[`${prefix}_STORAGE_GB`]) || 0 },
      admins: { limit: planName === 'Free Trial' ? 1 : planName === 'Esencial' ? 3 : 10 },
      partnerManagers: { limit: planName === 'Free Trial' ? 2 : planName === 'Esencial' ? 10 : 50 }
    },
    overageCosts: {
      additionalPartner: Number(process.env.OVERAGE_PARTNER_COST) || 5,
      textTokensPer1k: Number(process.env.OVERAGE_TOKEN_PER_1K) || 0.002,
      speechToTextPerMinute: Number(process.env.OVERAGE_SPEECH_PER_MINUTE) || 0.05,
      storagePerGB: Number(process.env.OVERAGE_STORAGE_PER_GB) || 2
    }
  };
};

export const getAvailablePlans = async () => {
  try {
    const planRepo = AppDataSource.getRepository(PlanTemplate);
    const planTemplates = await planRepo.find({ 
      where: { isActive: true },
      order: { price: 'ASC' }
    });
    
    return planTemplates.map(plan => ({
      id: plan.id,
      name: plan.name,
      price: Number(plan.price),
      billingCycle: plan.billingCycle,
      trialDays: plan.trialDays,
      stripePriceId: plan.stripePriceId,
      features: plan.features,
      overageCosts: plan.overageCosts,
      isActive: plan.isActive
    }));
  } catch (error) {
    console.warn('Could not fetch plans from database, falling back to static config:', error);
    
    // Fallback to static configuration
    return [
      { name: 'Free Trial', ...(await getPlanConfig('Free Trial')) },
      { name: 'Esencial', ...(await getPlanConfig('Esencial')) },
      { name: 'Profesional', ...(await getPlanConfig('Profesional')) }
    ];
  }
};
