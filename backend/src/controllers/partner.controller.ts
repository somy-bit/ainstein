import { Request, Response } from 'express';
import { AppDataSource } from '../config/databse';
import { Partner } from '../models/Partner';
import { User } from '../models/User';
import { SubscriptionPlan } from '../models/SubscriptionPlan';
import { PartnerPerformanceService } from '../services/partnerPerformance.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { ErrorMessages, createErrorResponse } from '../utils/errorMessages';

export const getAllPartners = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔍 getAllPartners called by user:', req.user?.id);
    console.log('👤 User role:', req.user?.role);
    
    // Check if user has admin role
    if (req.user?.role !== 'AInsteinAdmin') {
      console.log('❌ Access denied for role:', req.user?.role);
      return res.status(403).json(createErrorResponse('Access denied. Admin privileges required.'));
    }

    console.log('✅ Admin access granted, fetching all partners...');
    
    const partnerRepo = AppDataSource.getRepository(Partner);
    const partners = await partnerRepo.find({ 
      relations: ['organization'],
      select: {
        id: true,
        name: true,
        tier: true,
        specialization: true,
        region: true,
        performanceScore: true,
        contactEmail: true,
        category: true,
        country: true,
        isActive: true,
        organizationId: true,
        organizationName: true,
        isvType: true,
        phone: true,
        website: true,
        description: true
      }
    });
    
    console.log('📊 Found partners:', partners.length);
    
    // Add dynamic performance scores for all partners
    const partnersWithPerformance = await Promise.all(
      partners.map(async (partner) => {
        const dynamicScore = await PartnerPerformanceService.calculatePerformanceScore(partner.id);
        return {
          ...partner,
          performanceScore: dynamicScore
        };
      })
    );
    
    console.log('🔍 Partners with dynamic performance:', partnersWithPerformance.map(p => ({ 
      name: p.name, 
      org: p.organizationName, 
      performance: p.performanceScore 
    })));
    
    res.json(partnersWithPerformance);
  } catch (error) {
    console.error('❌ Get all partners failed:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.DATABASE_ERROR));
  }
};

export const getPartners = async (req: AuthRequest, res: Response) => {
  try {
    const partnerRepo = AppDataSource.getRepository(Partner);
    const organizationId = req.user?.organizationId;
    
    if (!organizationId) {
      return res.status(400).json(createErrorResponse(ErrorMessages.ORGANIZATION_NOT_FOUND));
    }
    
    const partners = await partnerRepo.find({ 
      where: { organizationId },
      relations: ['organization'],
      select: {
        id: true,
        name: true,
        tier: true,
        specialization: true,
        region: true,
        performanceScore: true,
        contactEmail: true,
        category: true,
        country: true,
        isActive: true,
        organizationId: true,
        organizationName: true
      }
    });

    // Add dynamic performance scores
    const partnersWithPerformance = await Promise.all(
      partners.map(async (partner) => {
        const dynamicScore = await PartnerPerformanceService.calculatePerformanceScore(partner.id);
        return {
          ...partner,
          performanceScore: dynamicScore
        };
      })
    );

    res.json(partnersWithPerformance);
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.DATABASE_ERROR));
  }
};

export const getPartnerById = async (req: Request, res: Response) => {
  try {
    const partnerRepo = AppDataSource.getRepository(Partner);
    const partner = await partnerRepo.findOne({ where: { id: req.params.id } });
    if (!partner) {
      return res.status(404).json(createErrorResponse(ErrorMessages.PARTNER_NOT_FOUND));
    }
    res.json(partner);
  } catch (error) {
    console.error('Error fetching partner:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.DATABASE_ERROR));
  }
};

export const addPartner = async (req: Request, res: Response) => {
  try {
    const partnerRepo = AppDataSource.getRepository(Partner);
    
    // Check subscription limits
    if (req.body.organizationId) {
      const subscriptionRepo = AppDataSource.getRepository(SubscriptionPlan);
      const subscription = await subscriptionRepo.findOne({ 
        where: { orgId: req.body.organizationId } 
      });
      
      if (subscription) {
        const currentPartnerCount = await partnerRepo.count({
          where: { organizationId: req.body.organizationId, isActive: true }
        });
        
        if (currentPartnerCount >= subscription.features.partners.limit) {
          return res.status(400).json(createErrorResponse(ErrorMessages.PARTNER_LIMIT_REACHED));
        }
      }
    }
    
    // Generate UUID for the partner if not provided
    if (!req.body.id) {
      req.body.id = require('crypto').randomUUID();
    }
    
    // Set default values for required fields if not provided
    if (!req.body.isActive) {
      req.body.isActive = true;
    }
    
    console.log('Creating partner with data:', req.body);
    
    const partner = await partnerRepo.save(req.body);
    
    // Update subscription usage
    if (req.body.organizationId) {
      await updatePartnerUsage(req.body.organizationId, 1);
    }
    
    res.json(partner);
  } catch (error) {
    console.error('Error adding partner:', error);
    res.status(500).json(createErrorResponse(
      ErrorMessages.PARTNER_CREATION_FAILED,
      { error: (error as Error).message }
    ));
  }
};

export const updatePartner = async (req: Request, res: Response) => {
  try {
    const partnerRepo = AppDataSource.getRepository(Partner);
    const userRepo = AppDataSource.getRepository(User);
    
    // Get current partner data
    const currentPartner = await partnerRepo.findOne({ where: { id: req.params.id } });
    if (!currentPartner) {
      return res.status(404).json(createErrorResponse(ErrorMessages.PARTNER_NOT_FOUND));
    }
    
    // Update partner
    await partnerRepo.update(req.params.id, req.body);
    
    // If isActive status changed, update all associated users
    if (req.body.hasOwnProperty('isActive') && req.body.isActive !== currentPartner.isActive) {
      await userRepo.update(
        { partnerId: req.params.id },
        { isActive: req.body.isActive }
      );
      console.log(`Updated all users for partner ${req.params.id} to isActive: ${req.body.isActive}`);
    }
    
    const partner = await partnerRepo.findOne({ where: { id: req.params.id } });
    res.json(partner);
  } catch (error) {
    console.error('Error updating partner:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.PARTNER_UPDATE_FAILED));
  }
};

export const deletePartner = async (req: Request, res: Response) => {
  try {
    const partnerRepo = AppDataSource.getRepository(Partner);
    
    // Get partner to check organization
    const partner = await partnerRepo.findOne({ where: { id: req.params.id } });
    if (!partner) {
      return res.status(404).json(createErrorResponse(ErrorMessages.PARTNER_NOT_FOUND));
    }
    
    await partnerRepo.delete(req.params.id);
    
    // Update subscription usage (decrement)
    await updatePartnerUsage(partner.organizationId, -1);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting partner:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.PARTNER_DELETE_FAILED));
  }
};

// Helper function to update partner usage
async function updatePartnerUsage(organizationId: string, increment: number) {
  try {
    const subRepo = AppDataSource.getRepository(SubscriptionPlan);
    const subscription = await subRepo.findOne({ where: { orgId: organizationId } });
    
    if (subscription) {
      const currentUsage = subscription.usage.partners?.current || 0;
      subscription.usage = {
        ...subscription.usage,
        partners: { current: Math.max(0, currentUsage + increment) }
      };
      await subRepo.save(subscription);
    }
  } catch (error) {
    console.error('Error updating partner usage:', error);
  }
}