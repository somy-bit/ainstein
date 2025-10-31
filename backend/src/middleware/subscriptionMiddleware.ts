import { Request, Response, NextFunction } from 'express';
import { SubscriptionService } from '../services/subscriptionService';

// augment Express types so `req.user?.organizationId` is recognized
declare global {
  namespace Express {
    interface Request {
      user?: {
        id?: string;
        organizationId?: string;
        role?: string;
        email?: string;
      };
    }
  }
}

export const checkSubscriptionAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId;
    
    if (!orgId) {
      return res.status(401).json({ error: 'No organization context' });
    }

    const { hasAccess, reason } = await SubscriptionService.checkAccess(orgId);
    
    if (!hasAccess) {
      return res.status(403).json({ 
        error: 'Subscription access denied', 
        reason,
        code: 'SUBSCRIPTION_EXPIRED'
      });
    }

    next();
  } catch (error) {
    console.error('Subscription access check failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
