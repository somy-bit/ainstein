import { Request, Response } from 'express';
import { AppDataSource } from '../config/databse';
import { Organization } from '../models/Organization';
import { User } from '../models/User';
import { SubscriptionPlan } from '../models/SubscriptionPlan';
import { ReferralProgramConfig } from '../models/ReferralProgramConfig';
import { ErrorMessages, createErrorResponse } from '../utils/errorMessages';
import { KnowledgeFile } from '../models/KnowledgeFile';
import { Lead } from '../models/Lead';
import { LeadStatusHistory } from '../models/LeadStatusHistory';
import { Partner } from '../models/Partner';
import { PartnerPerformance } from '../models/PartnerPerformance';
import { MarketingEvent } from '../models/MarketingEvent';
import { SubscriptionService } from '../services/subscriptionService';

export const getOrganizations = async (req: Request, res: Response) => {
  try {
    const orgRepo = AppDataSource.getRepository(Organization);
    const organizations = await orgRepo.find();
    res.json(organizations);
  } catch (error) {
    console.error('Get organizations failed:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.DATABASE_ERROR));
  }
};

export const deleteOrganization = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Deleting organization: ${id}`);
    
    let subscriptionWasCancelled = false;
    
    // Start transaction - everything must succeed or everything rolls back
    await AppDataSource.transaction(async manager => {
      // 0. Check for active subscription FIRST (before any deletion)
      const subscriptionRepo = manager.getRepository(SubscriptionPlan);
      const activeSubscription = await subscriptionRepo.findOne({ 
        where: { orgId: id, status: 'Active' } 
      });
      
      // 1. Cancel Stripe subscription FIRST (if active) - this can fail and rollback everything
      if (activeSubscription) {
        console.log(`💳 Found active subscription for org: ${id}`);
        console.log(`   - Subscription ID: ${activeSubscription.id}`);
        console.log(`   - Stripe Customer ID: ${activeSubscription.stripeCustomerId || 'Not set'}`);
        console.log(`   - Stripe Subscription ID: ${activeSubscription.stripeSubscriptionId || 'Not set'}`);
        
        if (activeSubscription.stripeSubscriptionId) {
          console.log(`💳 Cancelling Stripe subscription: ${activeSubscription.stripeSubscriptionId}`);
        } else {
          console.log(`💳 No Stripe subscription ID - will only update database status`);
        }
        
        try {
          await SubscriptionService.cancelSubscription(id, 'Organization deleted');
          subscriptionWasCancelled = true;
          console.log(`✅ Subscription cancellation completed for org: ${id}`);
        } catch (stripeError) {
          console.error(`❌ Failed to cancel subscription for org ${id}:`, stripeError);
          // Throw error to rollback the entire transaction
          throw new Error(`Failed to cancel subscription: ${stripeError instanceof Error ? stripeError.message : 'Unknown error'}`);
        }
      } else {
        console.log(`📋 No active subscription found for org: ${id} - proceeding with deletion`);
      }
      
      // 2. Delete in correct order due to foreign key constraints
      
      // Delete lead status history first (references leads)
      const leadIds = await manager.getRepository(Lead)
        .find({ where: { organizationId: id }, select: ['id'] });
      
      if (leadIds.length > 0) {
        const leadIdList = leadIds.map(lead => lead.id);
        await manager.getRepository(LeadStatusHistory)
          .createQueryBuilder()
          .delete()
          .where('lead_id IN (:...leadIds)', { leadIds: leadIdList })
          .execute();
        console.log(`🗑️ Deleted ${leadIds.length} lead status history records`);
      }
      
      // Delete partner performance records (references partners)
      const partnerIds = await manager.getRepository(Partner)
        .find({ where: { organizationId: id }, select: ['id'] });
      
      if (partnerIds.length > 0) {
        const partnerIdList = partnerIds.map(partner => partner.id);
        await manager.getRepository(PartnerPerformance)
          .createQueryBuilder()
          .delete()
          .where('partner_id IN (:...partnerIds)', { partnerIds: partnerIdList })
          .execute();
        console.log(`🗑️ Deleted ${partnerIds.length} partner performance records`);
      }
      
      // Delete leads (now safe to delete)
      const leadResult = await manager.delete(Lead, { organizationId: id });
      console.log(`🗑️ Deleted ${leadResult.affected || 0} leads`);
      
      // Delete knowledge files
      const fileResult = await manager.delete(KnowledgeFile, { organizationId: id });
      console.log(`🗑️ Deleted ${fileResult.affected || 0} knowledge files`);
      
      // Delete marketing events
      const eventResult = await manager.delete(MarketingEvent, { organizationId: id });
      console.log(`🗑️ Deleted ${eventResult.affected || 0} marketing events`);
      
      // Delete users (they reference organization and partners)
      const userResult = await manager.delete(User, { organizationId: id });
      console.log(`🗑️ Deleted ${userResult.affected || 0} users`);
      
      // Delete partners (now safe - no performance records)
      const partnerResult = await manager.delete(Partner, { organizationId: id });
      console.log(`🗑️ Deleted ${partnerResult.affected || 0} partners`);
      
      // Delete referral program config
      const configResult = await manager.delete(ReferralProgramConfig, { orgId: id });
      console.log(`🗑️ Deleted ${configResult.affected || 0} referral configs`);
      
      // Delete subscription plan (database record)
      const subResult = await manager.delete(SubscriptionPlan, { orgId: id });
      console.log(`🗑️ Deleted ${subResult.affected || 0} subscription plans`);
      
      // Finally delete organization
      const orgResult = await manager.delete(Organization, { id });
      console.log(`🗑️ Deleted ${orgResult.affected || 0} organizations`);
    });
    
    console.log(`✅ Organization ${id} deleted successfully (including Stripe cancellation)`);
    res.json({ 
      message: 'Organization deleted successfully',
      subscriptionCancelled: subscriptionWasCancelled
    });
  } catch (error) {
    console.error('Delete organization failed:', error);
    
    // Provide specific error message if it's a Stripe cancellation failure
    if (error instanceof Error && error.message.includes('Failed to cancel Stripe subscription')) {
      res.status(500).json(createErrorResponse(
        'Organization deletion failed: Could not cancel Stripe subscription. All data has been preserved.',
        { error: error.message }
      ));
    } else {
      res.status(500).json(createErrorResponse(ErrorMessages.ORGANIZATION_DELETE_FAILED));
    }
  }
};

export const addOrganization = async (req: Request, res: Response) => {
  try {
    const orgRepo = AppDataSource.getRepository(Organization);
    const org = await orgRepo.save(req.body);
    res.json(org);
  } catch (error) {
    res.status(500).json(createErrorResponse(ErrorMessages.ORGANIZATION_CREATION_FAILED));
  }
};

export const updateOrganization = async (req: Request, res: Response) => {
  try {
    const orgRepo = AppDataSource.getRepository(Organization);
    await orgRepo.update(req.params.id, req.body);
    const org = await orgRepo.findOne({ where: { id: req.params.id } });
    res.json(org);
  } catch (error) {
    res.status(500).json(createErrorResponse(ErrorMessages.ORGANIZATION_UPDATE_FAILED));
  }
};

export const getUsersByOrg = async (req: Request, res: Response) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const users = await userRepo.find({ where: { organizationId: req.params.orgId } });
    res.json(users);
  } catch (error) {
    res.status(500).json(createErrorResponse(ErrorMessages.DATABASE_ERROR));
  }
};

export const getSubscriptionForOrg = async (req: Request, res: Response) => {
  try {
    const subRepo = AppDataSource.getRepository(SubscriptionPlan);
    const subscription = await subRepo.findOne({ where: { orgId: req.params.orgId } });
    res.json(subscription);
  } catch (error) {
    res.status(500).json(createErrorResponse(ErrorMessages.DATABASE_ERROR));
  }
};

export const getReferralConfig = async (req: Request, res: Response) => {
  try {
    const configRepo = AppDataSource.getRepository(ReferralProgramConfig);
    const config = await configRepo.findOne({ where: { orgId: req.params.orgId } });
    res.json(config || {
      orgId: req.params.orgId,
      resellerCommissionRate: 10.00,
      leadReferralCommissionRate: 5.00,
      lastUpdated: new Date(),
      updatedBy: 'System Default'
    });
  } catch (error) {
    res.status(500).json(createErrorResponse(ErrorMessages.DATABASE_ERROR));
  }
};

export const updateReferralConfig = async (req: Request, res: Response) => {
  try {
    const configRepo = AppDataSource.getRepository(ReferralProgramConfig);
    const orgId = req.params.orgId;
    
    // Try to find existing config
    let config = await configRepo.findOne({ where: { orgId } });
    
    if (config) {
      // Update existing
      config.resellerCommissionRate = req.body.resellerCommissionRate || config.resellerCommissionRate;
      config.leadReferralCommissionRate = req.body.leadReferralCommissionRate || config.leadReferralCommissionRate;
      config.updatedBy = 'System User';
      config.lastUpdated = new Date();
      await configRepo.save(config);
    } else {
      // Create new
      config = configRepo.create({
        orgId,
        resellerCommissionRate: req.body.resellerCommissionRate || 10.00,
        leadReferralCommissionRate: req.body.leadReferralCommissionRate || 5.00,
        updatedBy: 'System User',
        lastUpdated: new Date()
      });
      await configRepo.save(config);
    }
    
    res.json(config);
  } catch (error) {
    console.error('Error updating referral config:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.DATABASE_ERROR, { error: (error as Error).message }) );
  }
};