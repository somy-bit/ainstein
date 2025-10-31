import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/databse';
import { SubscriptionPlan } from '../models/SubscriptionPlan';
import { User } from '../models/User';
import { Partner } from '../models/Partner';
import { UserRole } from '../types';

interface LimitCheckRequest extends Request {
  organizationId?: string;
}

export const checkSubscriptionLimit = (limitType: 'partnerManagers' | 'admins' | 'partners') => {
  return async (req: LimitCheckRequest, res: Response, next: NextFunction) => {
    try {
      // Get organization ID from request (could be from auth middleware or request body)
      const orgId = req.organizationId || req.body.organizationId || req.params.orgId;
      
      if (!orgId) {
        return res.status(400).json({ error: 'Organization ID required' });
      }

      // Get subscription plan
      const subRepo = AppDataSource.getRepository(SubscriptionPlan);
      const subscription = await subRepo.findOne({ where: { orgId } });
      
      if (!subscription) {
        return res.status(404).json({ error: 'Subscription not found' });
      }

      // Check if subscription is expired
      if (subscription.status === 'Expired') {
        return res.status(403).json({ error: 'Subscription expired. Please upgrade your plan.' });
      }

      // Get current count based on limit type
      let currentCount = 0;
      const userRepo = AppDataSource.getRepository(User);
      const partnerRepo = AppDataSource.getRepository(Partner);

      switch (limitType) {
        case 'partnerManagers':
          currentCount = await userRepo.count({ 
            where: { organizationId: orgId, role: UserRole.PARTNER_MANAGER } 
          });
          break;
        case 'admins':
          currentCount = await userRepo.count({ 
            where: { organizationId: orgId, role: UserRole.ORGANIZATION } 
          });
          break;
        case 'partners':
          currentCount = await partnerRepo.count({ 
            where: { organizationId: orgId } 
          });
          break;
      }

      // Check limit
      const limit = subscription.features[limitType]?.limit || 0;
      
      if (currentCount >= limit) {
        return res.status(403).json({ 
          error: `${limitType} limit reached. Current: ${currentCount}/${limit}. Please upgrade your plan.`,
          currentCount,
          limit,
          planName: subscription.planName
        });
      }

      next();
    } catch (error) {
      console.error('Error checking subscription limit:', error);
      res.status(500).json({ error: 'Failed to check subscription limits' });
    }
  };
};

export const checkUsageLimit = (limitType: 'textTokens' | 'speechToTextMinutes' | 'storageGB', increment: number = 1) => {
  return async (req: LimitCheckRequest, res: Response, next: NextFunction) => {
    try {
      const orgId = req.organizationId || req.body.organizationId || req.params.orgId;
      
      if (!orgId) {
        return res.status(400).json({ error: 'Organization ID required' });
      }

      const subRepo = AppDataSource.getRepository(SubscriptionPlan);
      const subscription = await subRepo.findOne({ where: { orgId } });
      
      if (!subscription) {
        return res.status(404).json({ error: 'Subscription not found' });
      }

      if (subscription.status === 'Expired') {
        return res.status(403).json({ error: 'Subscription expired. Please upgrade your plan.' });
      }

      const currentUsage = subscription.usage[limitType]?.current || 0;
      const limit = subscription.features[limitType]?.limit || 0;
      
      if (currentUsage + increment > limit) {
        return res.status(403).json({ 
          error: `${limitType} limit would be exceeded. Current: ${currentUsage}/${limit}. Please upgrade your plan.`,
          currentUsage,
          limit,
          planName: subscription.planName
        });
      }

      next();
    } catch (error) {
      console.error('Error checking usage limit:', error);
      res.status(500).json({ error: 'Failed to check usage limits' });
    }
  };
};
