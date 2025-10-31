import { AppDataSource } from '../config/databse';

export const updateReferralConfigSchema = async () => {
  const queryRunner = AppDataSource.createQueryRunner();
  
  try {
    await queryRunner.connect();
    
    // Check if table exists and update schema
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS referral_program_configs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id VARCHAR NOT NULL UNIQUE,
        reseller_commission_rate DECIMAL(5,2) DEFAULT 10.00,
        lead_referral_commission_rate DECIMAL(5,2) DEFAULT 5.00,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by VARCHAR DEFAULT 'System'
      );
    `);
    
    // If table exists with old schema, try to migrate data
    const tableExists = await queryRunner.hasTable('referral_program_configs');
    if (tableExists) {
      // Check if old columns exist and drop them
      const hasOldColumns = await queryRunner.hasColumn('referral_program_configs', 'is_enabled');
      if (hasOldColumns) {
        await queryRunner.query(`
          ALTER TABLE referral_program_configs 
          DROP COLUMN IF EXISTS is_enabled,
          DROP COLUMN IF EXISTS referrer_reward,
          DROP COLUMN IF EXISTS referee_reward,
          DROP COLUMN IF EXISTS minimum_payout,
          DROP COLUMN IF EXISTS cookie_duration;
        `);
      }
      
      // Add new columns if they don't exist
      const hasNewColumns = await queryRunner.hasColumn('referral_program_configs', 'reseller_commission_rate');
      if (!hasNewColumns) {
        await queryRunner.query(`
          ALTER TABLE referral_program_configs 
          ADD COLUMN IF NOT EXISTS reseller_commission_rate DECIMAL(5,2) DEFAULT 10.00,
          ADD COLUMN IF NOT EXISTS lead_referral_commission_rate DECIMAL(5,2) DEFAULT 5.00,
          ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          ADD COLUMN IF NOT EXISTS updated_by VARCHAR DEFAULT 'System';
        `);
      }
    }
    
    console.log('Referral config schema updated successfully');
  } catch (error) {
    console.error('Error updating referral config schema:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
};
