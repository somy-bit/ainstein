import { AppDataSource } from '../config/databse';
import { KnowledgeFile } from '../models/KnowledgeFile';
import { SubscriptionPlan } from '../models/SubscriptionPlan';

export class StorageService {
  static async calculateOrganizationStorageUsage(organizationId: string): Promise<number> {
    try {
      const fileRepo = AppDataSource.getRepository(KnowledgeFile);
      
      // Get all files for the organization
      const files = await fileRepo.find({ 
        where: { organizationId },
        select: ['size']
      });
      
      console.log(`Found ${files.length} files for org ${organizationId}`);
      
      // Calculate total size in GB
      const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
      const totalGB = totalBytes / (1024 * 1024 * 1024);
      
      console.log(`Total storage: ${totalBytes} bytes = ${totalGB} GB`);
      
      return Math.round(totalGB * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      console.error('Error calculating storage usage:', error);
      return 0;
    }
  }

  static async updateSubscriptionStorageUsage(organizationId: string): Promise<void> {
    try {
      console.log(`Updating storage usage for org: ${organizationId}`);
      
      const currentUsage = await this.calculateOrganizationStorageUsage(organizationId);
      
      const subscriptionRepo = AppDataSource.getRepository(SubscriptionPlan);
      const subscription = await subscriptionRepo.findOne({ 
        where: { orgId: organizationId }
      });
      
      if (subscription) {
        console.log('Found subscription, updating storage usage to:', currentUsage);
        
        // Update the usage in the subscription
        const updatedUsage = {
          ...subscription.usage,
          storageGB: { current: currentUsage }
        };
        
        subscription.usage = updatedUsage;
        await subscriptionRepo.save(subscription);
        
        console.log('✅ Storage usage updated successfully');
      } else {
        console.log('❌ No subscription found for organization:', organizationId);
      }
    } catch (error) {
      console.error('Error updating subscription storage usage:', error);
    }
  }
}
