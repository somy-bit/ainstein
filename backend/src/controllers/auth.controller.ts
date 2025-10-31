import { Request, Response } from 'express';
import { AppDataSource } from '../config/databse';
import { User } from '../models/User';
import { Organization } from '../models/Organization';
import { SubscriptionPlan } from '../models/SubscriptionPlan';
import { PlanTemplate } from '../models/PlanTemplate';
import { UserRole } from '../types';
import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { ENV } from '../config/environment';
import { StripeService } from '../services/stripe.service';
import { ErrorMessages, createErrorResponse } from '../utils/errorMessages';


export const getPlans = async (req: Request, res: Response) => {
  try {
    const planRepo = AppDataSource.getRepository(PlanTemplate);
    const plans = await planRepo.find({ where: { isActive: true } });
    res.json(plans);
  } catch (error) {
    console.error('Get plans failed:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.DATABASE_ERROR));
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    const userRepo = AppDataSource.getRepository(User);
    // Try to find user by username first, then by email if username not found
    let user = await userRepo.findOne({
      where: { username },
      relations: ['organization'],
      select: ['id', 'username', 'name', 'email', 'role', 'organizationId', 'isActive', 'mfaEnabled', 'mustChangePassword', 'password']
    });

    // If not found by username, try by email (in case email was sent as username)
    if (!user && username.includes('@')) {
      user = await userRepo.findOne({
        where: { email: username },
        relations: ['organization'],
        select: ['id', 'username', 'name', 'email', 'role', 'organizationId', 'isActive', 'mfaEnabled', 'mustChangePassword', 'password']
      });
    }

    if (!user) {
      return res.status(401).json(createErrorResponse(ErrorMessages.INVALID_CREDENTIALS));
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json(createErrorResponse(ErrorMessages.ACCOUNT_BLOCKED));
    }

    // Verify password
    if (!user.password) {
      return res.status(401).json(createErrorResponse(ErrorMessages.INVALID_CREDENTIALS));
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json(createErrorResponse(ErrorMessages.INVALID_CREDENTIALS));
    }

    const subscriptionRepo = AppDataSource.getRepository(SubscriptionPlan);
    const subscription = await subscriptionRepo.findOne({
      where: { orgId: user.organizationId }
    });

    const token = jwt.sign({ 
      id: user.id, 
      role: user.role, 
      organizationId: user.organizationId 
    }, ENV.JWT_SECRET);

    // Remove password from response
    const { password: _, ...userResponse } = user;

    // Check if user must change password
    if (user.mustChangePassword) {
      return res.json({
        token,
        user: userResponse,
        organization: user.organization,
        subscription: subscription || {},
        mustChangePassword: true
      });
    }

    res.json({
      token,
      user: userResponse,
      organization: user.organization,
      subscription: subscription || {}
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.LOGIN_FAILED));
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json(createErrorResponse(ErrorMessages.AUTH_REQUIRED));
    }
    
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as any;
    const userRepo = AppDataSource.getRepository(User);
    
    const user = await userRepo.findOne({
      where: { id: decoded.id },
      select: ['id', 'username', 'password', 'mustChangePassword']
    });
    
    if (!user || !user.password) {
      return res.status(404).json(createErrorResponse(ErrorMessages.USER_NOT_FOUND));
    }
    
    // Verify current password
    const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidCurrentPassword) {
      return res.status(400).json(createErrorResponse(ErrorMessages.CURRENT_PASSWORD_INCORRECT));
    }
    
    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password and clear mustChangePassword flag
    await userRepo.update(user.id, {
      password: hashedNewPassword,
      mustChangePassword: false
    });
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.PASSWORD_CHANGE_FAILED));
  }
};

export const registerTrial = async (req: Request, res: Response) => {
  console.log('Registration request received:', {
    body: req.body,
    headers: req.headers,
    method: req.method,
    url: req.url
  });

  // Start database transaction
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const { orgData, adminData, selectedPlan, paymentMethodId, paymentMethodData } = req.body;
    
    console.log('Parsed registration data:', { orgData, adminData, selectedPlan, paymentMethodId });

    if (!orgData || !adminData || !selectedPlan) {
      console.error('Missing required data:', { orgData: !!orgData, adminData: !!adminData, selectedPlan: !!selectedPlan });
      return res.status(400).json(createErrorResponse(ErrorMessages.MISSING_REQUIRED_FIELDS));
    }

    if (!paymentMethodId) {
      return res.status(400).json(createErrorResponse(ErrorMessages.PAYMENT_METHOD_REQUIRED));
    }

    // Get plan from database using transaction
    const planRepo = queryRunner.manager.getRepository(PlanTemplate);
    const plan = await planRepo.findOne({ 
      where: { id: selectedPlan.toString(), isActive: true } 
    });
    
    if (!plan) {
      await queryRunner.rollbackTransaction();
      return res.status(400).json(createErrorResponse(ErrorMessages.INVALID_PLAN_SELECTED));
    }
    
    // Validate Stripe price ID exists
    if (!plan.stripePriceId) {
      await queryRunner.rollbackTransaction();
      return res.status(400).json({
        error: 'Plan configuration error',
        message: `Plan ${plan.name} does not have a valid Stripe price ID configured`,
        details: [{ field: 'selectedPlan', message: 'Plan not properly configured for billing' }]
      });
    }
    
    console.log('Found plan:', plan.name, 'with Stripe price ID:', plan.stripePriceId);

    const orgRepo = queryRunner.manager.getRepository(Organization);
    const userRepo = queryRunner.manager.getRepository(User);

    console.log('Creating organization...');
    const org = await orgRepo.save({
      name: orgData.name,
      companyId: orgData.companyId,
      address: orgData.address,
      city: orgData.city,
      province: orgData.province,
      postalCode: orgData.postalCode,
      country: orgData.country,
      isActive: true
    });
    console.log('Organization created:', org);

    console.log('Creating user...');
    
    // Hash the password before saving
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);
    console.log('Password hashed for user');
    
    const user = await userRepo.save({
      username: adminData.username || adminData.email,
      name: adminData.name,
      lastNamePaternal: adminData.lastNamePaternal,
      lastNameMaternal: adminData.lastNameMaternal,
      email: adminData.email,
      phone: adminData.phone,
      country: adminData.country,
      role: UserRole.ORGANIZATION,
      organizationId: org.id,
      password: hashedPassword,
      isActive: true,
      mfaEnabled: false,
      isGoogleUser: false
    });
    console.log('User created with hashed password:', user.username);

    // Create Stripe customer and trial subscription
    console.log('Creating Stripe customer...');
    const stripeCustomer = await StripeService.createCustomer(
      adminData.email,
      `${adminData.name} ${adminData.lastNamePaternal}`,
      org.id
    );
    console.log('Stripe customer created:', stripeCustomer.id);

    // Attach payment method to customer
    console.log('Attaching payment method to customer...');
    await StripeService.attachPaymentMethodToCustomer(paymentMethodId, stripeCustomer.id);
    
    // Create subscription based on trial days
    let stripeSubscription;
    const hasTrialDays = plan.trialDays && plan.trialDays > 0;
    
    if (hasTrialDays) {
      console.log(`Creating Stripe trial subscription for ${plan.name} with ${plan.trialDays} days trial...`);
      stripeSubscription = await StripeService.createTrialSubscriptionWithPaymentMethod(
        stripeCustomer.id,
        plan.stripePriceId, // Use validated price ID
        paymentMethodId,
        plan.trialDays
      );
    } else {
      console.log(`Creating immediate Stripe subscription for ${plan.name} (no trial)...`);
      stripeSubscription = await StripeService.createSubscriptionWithPaymentMethod(
        stripeCustomer.id,
        plan.stripePriceId, // Use validated price ID
        paymentMethodId
      );
    }
    console.log('Stripe subscription created:', stripeSubscription.id);

    // Create local subscription record using transaction
    console.log('Creating local subscription record...');
    const subRepo = queryRunner.manager.getRepository(SubscriptionPlan);
    
    const subscription = await subRepo.save({
      orgId: org.id,
      planName: hasTrialDays ? 'Free Trial' : plan.name,
      price: hasTrialDays ? 0 : plan.price,
      billingCycle: plan.billingCycle,
      status: hasTrialDays ? 'Trial' : 'Active',
      renewalDate: new Date(Date.now() + (hasTrialDays ? plan.trialDays : 30) * 24 * 60 * 60 * 1000),
      stripeCustomerId: stripeCustomer.id,
      stripeSubscriptionId: stripeSubscription.id,
      features: plan.features,
      usage: {
        partners: { current: 0 },
        textTokens: { current: 0 },
        speechToTextMinutes: { current: 0 },
        storageGB: { current: 0 }
      },
      overageCosts: plan.overageCosts || {
        additionalPartner: plan.price < 30 ? 15 : 10,
        textTokensPer1k: 0.02,
        speechToTextPerMinute: 0.1,
        storagePerGB: plan.price < 30 ? 8 : 5
      },
      paymentMethod: { 
        type: paymentMethodData?.last4 ? 'Visa' : 'Not Set', 
        last4: paymentMethodData?.last4 || '', 
        expiry: '12/28',
        cardholderName: paymentMethodData?.cardholderName || ''
      }
    } as any);
    console.log('Subscription created:', subscription);

    // Commit transaction on success
    await queryRunner.commitTransaction();

    res.json({
      user,
      selectedPlan: plan.name,
      subscriptionStatus: hasTrialDays ? 'trial' : 'active',
      trialEndsAt: hasTrialDays ? subscription.renewalDate : null,
      regularPrice: plan.price,
      currentPrice: hasTrialDays ? 0 : plan.price,
      stripeCustomerId: stripeCustomer.id,
      stripeSubscriptionId: stripeSubscription.id,
      paymentMethodAttached: true,
      hasTrialDays: hasTrialDays,
      trialDays: plan.trialDays || 0
    });
  } catch (error) {
    // Rollback transaction on any error
    await queryRunner.rollbackTransaction();
    console.error('Registration error details:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Handle duplicate user error
    if (error instanceof Error && error.message.includes('duplicate key value violates unique constraint')) {
      if (error.message.includes('username')) {
        return res.status(400).json({
          error: 'User already exists',
          message: 'A user with this email already exists. Please use a different email or try logging in.',
          details: [{ field: 'email', message: 'Email already registered' }]
        });
      }
    }
    
    // Handle Stripe-specific errors
    if (error instanceof Error && error.message.includes('stripe')) {
      return res.status(500).json(createErrorResponse(ErrorMessages.STRIPE_ERROR));
    }
    
    res.status(500).json(createErrorResponse(ErrorMessages.REGISTRATION_FAILED, 
      { error: error instanceof Error ? error.message : 'Unknown error' }));
  } finally {
    // Always release the query runner
    await queryRunner.release();
  }
};