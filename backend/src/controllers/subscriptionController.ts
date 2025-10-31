import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { SubscriptionService } from '../services/subscriptionService';
import { SubscriptionPlan } from '../models/SubscriptionPlan';
import { AppDataSource } from '../config/databse';
import { getAvailablePlans } from '../services/planConfig';
import { ErrorMessages, createErrorResponse, getErrorMessage } from '../utils/errorMessages';

export const getPlans = async (req: Request, res: Response) => {
  try {
    const plans = await getAvailablePlans();
    res.json(plans);
  } catch (error) {
    console.error('Get plans failed:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.INTERNAL_SERVER_ERROR));
  }
};

export const cancelSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { orgId, reason } = req.body;

    if (!orgId) {
      return res.status(400).json(createErrorResponse(ErrorMessages.MISSING_REQUIRED_FIELDS));
    }

    const cancelledSubscription = await SubscriptionService.cancelSubscription(orgId, reason);
    
    res.json({
      message: 'Subscription cancelled successfully',
      subscription: cancelledSubscription,
      endsAt: cancelledSubscription.endsAt
    });
  } catch (error) {
    console.error('Subscription cancellation failed:', error);
    res.status(400).json(createErrorResponse(ErrorMessages.SUBSCRIPTION_CANCEL_FAILED, { error: `Subscription cancellation failed `  }));
  }
};

export const getSubscriptionStatus = async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.user?.organizationId;

    if (!orgId) {
      return res.status(400).json(createErrorResponse(ErrorMessages.MISSING_REQUIRED_FIELDS));
    }

    const subscriptionRepo = AppDataSource.getRepository(SubscriptionPlan);
    const subscription = await subscriptionRepo.findOne({ where: { orgId } });
    
    if (!subscription) {
      return res.status(404).json(createErrorResponse(ErrorMessages.SUBSCRIPTION_NOT_FOUND));
    }

    const accessCheck = await SubscriptionService.checkAccess(orgId);
    
    res.json({
      subscription,
      access: accessCheck
    });
  } catch (error) {
    console.error('Get subscription status failed:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.INTERNAL_SERVER_ERROR));
  }
};
