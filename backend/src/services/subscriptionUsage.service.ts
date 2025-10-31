import { AppDataSource } from '../config/databse';
import { SubscriptionPlan } from '../models/SubscriptionPlan';

export class SubscriptionUsageService {
  static async updateUsage(
    orgId: string, 
    usageType: 'textTokens' | 'speechToTextMinutes' | 'storageGB', 
    increment: number
  ) {
    try {
      const subRepo = AppDataSource.getRepository(SubscriptionPlan);
      const subscription = await subRepo.findOne({ where: { orgId } });
      
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Update usage
      const currentUsage = subscription.usage[usageType]?.current || 0;
      subscription.usage = {
        ...subscription.usage,
        [usageType]: { current: currentUsage + increment }
      };

      await subRepo.save(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Error updating subscription usage:', error);
      throw error;
    }
  }

  static async getCurrentUsage(orgId: string) {
    try {
      const subRepo = AppDataSource.getRepository(SubscriptionPlan);
      const subscription = await subRepo.findOne({ where: { orgId } });
      
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      return subscription.usage;
    } catch (error) {
      console.error('Error getting subscription usage:', error);
      throw error;
    }
  }

  static async checkLimit(
    orgId: string, 
    limitType: 'textTokens' | 'speechToTextMinutes' | 'storageGB', 
    increment: number = 1
  ): Promise<{ allowed: boolean; currentUsage: number; limit: number; planName: string }> {
    try {
      const subRepo = AppDataSource.getRepository(SubscriptionPlan);
      const subscription = await subRepo.findOne({ where: { orgId } });
      
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const currentUsage = subscription.usage[limitType]?.current || 0;
      const limit = subscription.features[limitType]?.limit || 0;
      const allowed = currentUsage + increment <= limit;

      return {
        allowed,
        currentUsage,
        limit,
        planName: subscription.planName
      };
    } catch (error) {
      console.error('Error checking subscription limit:', error);
      throw error;
    }
  }
}
