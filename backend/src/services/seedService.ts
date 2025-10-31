import { AppDataSource } from '../config/databse';
import { User } from '../models/User';
import { Organization } from '../models/Organization';
import { SubscriptionPlan } from '../models/SubscriptionPlan';
import { UserRole } from '../types';
import * as bcrypt from 'bcrypt';

export class SeedService {
  static async seedAdminUser(): Promise<void> {
    try {
      const userRepo = AppDataSource.getRepository(User);
      const orgRepo = AppDataSource.getRepository(Organization);
      const subRepo = AppDataSource.getRepository(SubscriptionPlan);

      // Check if admin user already exists
      const existingAdmin = await userRepo.findOne({
        where: { username: 'admin@admin.com' }
      });

      if (existingAdmin) {
        console.log('✅ Admin user already exists');
        return;
      }

      console.log('🌱 Creating admin user and organization...');

      // Create admin organization
      const adminOrg = await orgRepo.save({
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'AInstein Global Inc',
        isActive: true,
        subscriptionId: '660e8400-e29b-41d4-a716-446655440001'
      });

      // Hash default password
      const hashedPassword = await bcrypt.hash('password12345', 12);

      // Create admin user
      const adminUser = await userRepo.save({
        id: '440e8400-e29b-41d4-a716-446655440001',
        username: 'admin@admin.com',
        name: 'Sarah',
        email: 'admin@admin.com',
        role: UserRole.AINSTEIN_ADMIN,
        organizationId: adminOrg.id,
        password: hashedPassword,
        isActive: true,
        mfaEnabled: false,
        isGoogleUser: false
      });

      // Create admin subscription
      await subRepo.save({
        id: '660e8400-e29b-41d4-a716-446655440001',
        orgId: adminOrg.id,
        planName: 'Profesional',
        price: 99,
        billingCycle: 'Monthly',
        status: 'Active',
        renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        features: {
          partnerManagers: { limit: 999 },
          admins: { limit: 999 },
          partners: { limit: 999 },
          textTokens: { limit: 999999 },
          speechToTextMinutes: { limit: 999 },
          storageGB: { limit: 999 }
        },
        usage: {
          partners: { current: 0 },
          textTokens: { current: 0 },
          speechToTextMinutes: { current: 0 },
          storageGB: { current: 0 }
        },
        overageCosts: {
          additionalPartner: 0,
          textTokensPer1k: 0,
          speechToTextPerMinute: 0,
          storagePerGB: 0
        },
        paymentMethod: {
          type: 'Not Set',
          last4: '',
          expiry: ''
        }
      });

      console.log('✅ Admin user created successfully');
      console.log('   Username: admin@admin.com');
      console.log('   Password: password12345');
      console.log('   Organization: AInstein Global Inc');

    } catch (error) {
      console.error('❌ Failed to seed admin user:', error);
      throw error;
    }
  }
}
