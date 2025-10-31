import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppDataSource } from '../config/databse';
import { Lead } from '../models/Lead';
import { User } from '../models/User';
import { ErrorMessages, createErrorResponse } from '../utils/errorMessages';
import { LeadStatusHistory } from '../models/LeadStatusHistory';
import { PartnerPerformanceService } from '../services/partnerPerformance.service';

export const getLeads = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json(createErrorResponse(ErrorMessages.AUTH_REQUIRED));
    }
    
    // Get user's organization
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: req.user.id } });
    
    if (!user?.organizationId) {
      return res.status(400).json(createErrorResponse(ErrorMessages.ORGANIZATION_NOT_FOUND));
    }
    
    // Fetch leads for user's organization only
    const leadRepo = AppDataSource.getRepository(Lead);
    const leads = await leadRepo.find({ 
      where: { organizationId: user.organizationId },
      relations: ['partner'] 
    });
    
    res.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.DATABASE_ERROR));
  }
};

export const addLead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json(createErrorResponse(ErrorMessages.AUTH_REQUIRED));
    }
    
    // Get user's organization
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: req.user.id } });
    
    if (!user?.organizationId) {
      return res.status(400).json(createErrorResponse(ErrorMessages.ORGANIZATION_NOT_FOUND));
    }
    
    const leadRepo = AppDataSource.getRepository(Lead);
    
    // Generate UUID for the lead if not provided
    if (!req.body.id) {
      req.body.id = require('crypto').randomUUID();
    }
    
    // Set createdDate if not provided
    if (!req.body.createdDate) {
      req.body.createdDate = new Date();
    }
    
    // Set default status if not provided
    if (!req.body.status) {
      req.body.status = 'New';
    }
    
    // Set organizationId from authenticated user
    req.body.organizationId = user.organizationId;
    
    console.log('Creating lead with data:', req.body);
    
    const lead = await leadRepo.save(req.body);

    // Track performance if lead is assigned to a partner
    if (lead.partnerId) {
      // Record initial status history
      const historyRepo = AppDataSource.getRepository(LeadStatusHistory);
      await historyRepo.save({
        leadId: lead.id,
        oldStatus: undefined,
        newStatus: lead.status,
        changedBy: req.user.id,
        changedAt: new Date()
      });

      // Update partner performance for lead assignment
      await PartnerPerformanceService.updatePartnerPerformance(
        lead.partnerId,
        lead.id,
        undefined,
        lead.status
      );
    }

    res.json(lead);
  } catch (error) {
    console.error('Error adding lead:', error);
    res.status(500).json({ 
      error: 'Failed to add lead',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateLead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json(createErrorResponse(ErrorMessages.AUTH_REQUIRED));
    }
    
    // Get user's organization
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: req.user.id } });
    
    if (!user?.organizationId) {
      return res.status(400).json(createErrorResponse(ErrorMessages.ORGANIZATION_NOT_FOUND));
    }
    
    const leadRepo = AppDataSource.getRepository(Lead);
    
    // Verify lead belongs to user's organization
    const existingLead = await leadRepo.findOne({ 
      where: { id: req.params.id, organizationId: user.organizationId }
    });
    
    if (!existingLead) {
      return res.status(404).json(createErrorResponse(ErrorMessages.LEAD_NOT_FOUND));
    }

    const oldStatus = existingLead.status;
    const newStatus = req.body.status;

    // Update the lead
    await leadRepo.update(req.params.id, req.body);
    const updatedLead = await leadRepo.findOne({ where: { id: req.params.id } });

    // Track status change if status was updated
    if (newStatus && oldStatus !== newStatus) {
      // Record status history
      const historyRepo = AppDataSource.getRepository(LeadStatusHistory);
      await historyRepo.save({
        leadId: req.params.id,
        oldStatus,
        newStatus,
        changedBy: req.user.id,
        changedAt: new Date()
      });

      // Update partner performance if lead has a partner
      if (existingLead.partnerId) {
        await PartnerPerformanceService.updatePartnerPerformance(
          existingLead.partnerId,
          req.params.id,
          oldStatus,
          newStatus
        );
      }
    }

    res.json(updatedLead);
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.LEAD_UPDATE_FAILED));
  }
};
