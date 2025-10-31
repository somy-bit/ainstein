import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/databse';
import { SubscriptionPlan } from '../models/SubscriptionPlan';
import { User } from '../models/User';
import { Partner } from '../models/Partner';
import { UserRole } from '../types';

interface UsageRequest extends Request {
  organizationId?: string;
}

export const updateUsageAfterUserOperation = (operation: 'create' | 'delete') => {
  return async (req: UsageRequest, res: Response, next: NextFunction) => {
    // Store original res.json to intercept successful responses
    const originalJson = res.json;
    
    res.json = function(data: Record<string, unknown>) {
      // Only update usage if the operation was successful (status < 400)
      if (res.statusCode < 400) {
        updateUserUsageCounters(req, operation).catch(console.error);
      }
      return originalJson.call(this, data);
    };
    
    next();
  };
};

export const updateUsageAfterPartnerOperation = (operation: 'create' | 'delete') => {
  return async (req: UsageRequest, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    
    res.json = function(data: Record<string, unknown>) {
      if (res.statusCode < 400) {
        updatePartnerUsageCounters(req, operation).catch(console.error);
      }
      return originalJson.call(this, data);
    };
    
    next();
  };
};

async function updateUserUsageCounters(req: UsageRequest, operation: 'create' | 'delete') {
  try {
    const orgId = req.organizationId || req.body.organizationId || req.params.orgId;
    if (!orgId) return;

    const subRepo = AppDataSource.getRepository(SubscriptionPlan);
    const userRepo = AppDataSource.getRepository(User);
    
    const subscription = await subRepo.findOne({ where: { orgId } });
    if (!subscription) return;

    // Count actual users
    const partnerManagerCount = await userRepo.count({ 
      where: { organizationId: orgId, role: UserRole.PARTNER_MANAGER } 
    });
    
    const adminCount = await userRepo.count({ 
      where: { organizationId: orgId, role: UserRole.ORGANIZATION } 
    });

    // Update usage counters
    const updatedUsage = {
      ...subscription.usage,
      partnerManagers: { current: partnerManagerCount },
      admins: { current: adminCount }
    };

    subscription.usage = updatedUsage;
    await subRepo.save(subscription);
    
    console.log(`Updated user usage counters for org ${orgId}: PM=${partnerManagerCount}, Admins=${adminCount}`);
  } catch (error) {
    console.error('Error updating user usage counters:', error);
  }
}

async function updatePartnerUsageCounters(req: UsageRequest, operation: 'create' | 'delete') {
  try {
    const orgId = req.organizationId || req.body.organizationId || req.params.orgId;
    if (!orgId) return;

    const subRepo = AppDataSource.getRepository(SubscriptionPlan);
    const partnerRepo = AppDataSource.getRepository(Partner);
    
    const subscription = await subRepo.findOne({ where: { orgId } });
    if (!subscription) return;

    // Count actual partners
    const partnerCount = await partnerRepo.count({ 
      where: { organizationId: orgId } 
    });

    // Update usage counters
    subscription.usage = {
      ...subscription.usage,
      partners: { current: partnerCount }
    };

    await subRepo.save(subscription);
    
    console.log(`Updated partner usage counters for org ${orgId}: Partners=${partnerCount}`);
  } catch (error) {
    console.error('Error updating partner usage counters:', error);
  }
}
