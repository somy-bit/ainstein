import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppDataSource } from '../config/databse';
import { User } from '../models/User';
import { SubscriptionPlan } from '../models/SubscriptionPlan';
import { UserRole } from '../types';
import * as bcrypt from 'bcrypt';
import { ErrorMessages, createErrorResponse } from '../utils/errorMessages';

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const users = await userRepo.find({
      relations: ['organization'],
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
        isActive: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.DATABASE_ERROR));
  }
};

export const addUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json(createErrorResponse(ErrorMessages.AUTH_REQUIRED));
    }
    
    // Get creator's organization
    const userRepo = AppDataSource.getRepository(User);
    const creator = await userRepo.findOne({ where: { id: req.user.id } });
    
    if (!creator?.organizationId) {
      return res.status(400).json(createErrorResponse(ErrorMessages.ORGANIZATION_NOT_FOUND));
    }

    // Check subscription limits for specific roles only
    const roleToCheck = req.body.role;
    const limitedRoles = ['Organization', 'PartnerManager'];
    
    console.log('Role to check:', roleToCheck);
    console.log('Limited roles:', limitedRoles);
    console.log('Is role limited?', limitedRoles.includes(roleToCheck));
    
    if (limitedRoles.includes(roleToCheck)) {
      // Get organization's subscription plan
      const subscriptionRepo = AppDataSource.getRepository(SubscriptionPlan);
      const subscription = await subscriptionRepo.findOne({ 
        where: { orgId: creator.organizationId } 
      });
      
      if (subscription) {
        // Count existing users with the same role
        const existingUsersCount = await userRepo.count({
          where: { 
            organizationId: creator.organizationId,
            role: roleToCheck,
            isActive: true
          }
        });

        // Check limits based on role
        let limit = 0;
        if (roleToCheck === 'Organization') {
          limit = subscription.features.admins.limit;
        } else if (roleToCheck === 'PartnerManager') {
          limit = subscription.features.partnerManagers.limit;
        }

        if (existingUsersCount >= limit) {
          return res.status(400).json(createErrorResponse(
            `${ErrorMessages.SUBSCRIPTION_LIMIT_REACHED}. Maximum ${limit} ${roleToCheck} users allowed.`
          ));
        }
      }
    }
    
    // Generate UUID if not provided
    if (!req.body.id) {
      req.body.id = require('crypto').randomUUID();
    }
    
    // Set organizationId from creator (not from request body)
    req.body.organizationId = creator.organizationId;
    
    // Set default values for required fields
    if (!req.body.isActive) {
      req.body.isActive = true;
    }
    
    if (!req.body.mfaEnabled) {
      req.body.mfaEnabled = false;
    }
    
    // Set username to email if not provided
    if (!req.body.username && req.body.email) {
      req.body.username = req.body.email;
    }
    
    // Hash password if provided
    if (req.body.password) {
      const saltRounds = 12;
      
      // Always require password change for users created by managers
      req.body.mustChangePassword = true;
      
      // Hash the password
      req.body.password = await bcrypt.hash(req.body.password, saltRounds);
    }
    
    console.log('Creating user with data:', { ...req.body, password: '[HASHED]' });
    
    const user = await userRepo.save(req.body);
    
    // Remove password from response
    const { password: _, ...userResponse } = user;
    res.json(userResponse);
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json(createErrorResponse(
      ErrorMessages.USER_CREATION_FAILED,
      { error: (error as Error).message }
    ));
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json(createErrorResponse(ErrorMessages.AUTH_REQUIRED));
    }
    
    // Get updater's organization
    const userRepo = AppDataSource.getRepository(User);
    const updater = await userRepo.findOne({ where: { id: req.user.id } });
    
    if (!updater?.organizationId) {
      return res.status(400).json(createErrorResponse(ErrorMessages.ORGANIZATION_NOT_FOUND));
    }
    
    // Verify target user belongs to same organization
    const targetUser = await userRepo.findOne({ 
      where: { id: req.params.id, organizationId: updater.organizationId }
    });
    
    if (!targetUser) {
      return res.status(404).json(createErrorResponse(ErrorMessages.USER_NOT_FOUND));
    }
    
    // Prevent changing organizationId
    delete req.body.organizationId;
    
    // Hash password if being updated
    if (req.body.password) {
      const saltRounds = 12;
      req.body.password = await bcrypt.hash(req.body.password, saltRounds);
      
      // If setting a new password, clear mustChangePassword flag
      req.body.mustChangePassword = false;
    }
    
    await userRepo.update(req.params.id, req.body);
    const user = await userRepo.findOne({ where: { id: req.params.id } });
    
    // Remove password from response
    if (user) {
      const { password: _, ...userResponse } = user;
      res.json(userResponse);
    } else {
      res.status(404).json(createErrorResponse(ErrorMessages.USER_NOT_FOUND));
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.USER_UPDATE_FAILED));
  }
};

export const fetchCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json(createErrorResponse(ErrorMessages.AUTH_REQUIRED));
    }
    
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { id: req.user.id },
      relations: ['organization']
    });
    
    if (!user) {
      return res.status(404).json(createErrorResponse(ErrorMessages.USER_NOT_FOUND));
    }
    
    res.json({ user, organization: user.organization || {}, subscription: {} });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.DATABASE_ERROR));
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json(createErrorResponse(ErrorMessages.AUTH_REQUIRED));
    }
    
    const { id } = req.params;
    const userRepo = AppDataSource.getRepository(User);
    
    // Get deleter's organization
    const deleter = await userRepo.findOne({ where: { id: req.user.id } });
    
    if (!deleter?.organizationId) {
      return res.status(400).json(createErrorResponse(ErrorMessages.ORGANIZATION_NOT_FOUND));
    }
    
    // Verify target user belongs to same organization
    const user = await userRepo.findOne({ 
      where: { id, organizationId: deleter.organizationId }
    });
    
    if (!user) {
      return res.status(404).json(createErrorResponse(ErrorMessages.USER_NOT_FOUND));
    }
    
    // Add organization ID to request for usage counter update
    (req as any).organizationId = user.organizationId;
    
    await userRepo.remove(user);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.USER_DELETE_FAILED));
  }
};
