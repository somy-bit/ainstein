import { AppDataSource } from '../config/databse';
import { SubscriptionPlan } from '../models/SubscriptionPlan';
import { User } from '../models/User';
import { Partner } from '../models/Partner';
import { UserRole } from '../types';

export const syncUsageCounters = async () => {
  try {
    await AppDataSource.initialize();
    
    const subRepo = AppDataSource.getRepository(SubscriptionPlan);
    const userRepo = AppDataSource.getRepository(User);
    const partnerRepo = AppDataSource.getRepository(Partner);
    
    // Get all subscriptions
    const subscriptions = await subRepo.find();
    
    for (const subscription of subscriptions) {
      console.log(`Syncing usage for organization: ${subscription.orgId} (${subscription.planName})`);
      
      // Count actual users by role
      const partnerManagerCount = await userRepo.count({ 
        where: { organizationId: subscription.orgId, role: UserRole.PARTNER_MANAGER } 
      });
      
      const adminCount = await userRepo.count({ 
        where: { organizationId: subscription.orgId, role: UserRole.ORGANIZATION } 
      });
      
      // Count actual partners
      const partnerCount = await partnerRepo.count({ 
        where: { organizationId: subscription.orgId } 
      });
      
      console.log(`Actual counts - Partner Managers: ${partnerManagerCount}, Admins: ${adminCount}, Partners: ${partnerCount}`);
      
      // Update usage counters
      subscription.usage = {
        ...subscription.usage,
        partners: { current: partnerCount },
        // Note: partnerManagers and admins are not in the usage object by default, but we can add them
      };
      
      // Add partner manager and admin counts to usage if they don't exist
      const usage = subscription.usage as Record<string, { current: number }>;
      if (!subscription.usage.hasOwnProperty('partnerManagers')) {
        usage.partnerManagers = { current: partnerManagerCount };
      } else {
        usage.partnerManagers.current = partnerManagerCount;
      }
      
      if (!subscription.usage.hasOwnProperty('admins')) {
        usage.admins = { current: adminCount };
      } else {
        usage.admins.current = adminCount;
      }
      
      await subRepo.save(subscription);
      console.log(`Updated usage counters for ${subscription.orgId}`);
    }
    
    console.log('Usage sync completed');
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error syncing usage counters:', error);
  }
};

// Run if called directly
if (require.main === module) {
  syncUsageCounters();
}
