import { AppDataSource } from '../config/databse';
import { seedPlanTemplates } from '../migrations/seedPlanTemplates';

const runSeed = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');
    
    await seedPlanTemplates();
    
    await AppDataSource.destroy();
    console.log('Seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

runSeed();
