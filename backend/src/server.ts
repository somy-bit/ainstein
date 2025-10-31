import 'reflect-metadata';
import app from './app';
import { AppDataSource } from './config/databse';
import { ENV } from './config/environment';
import { SeedService } from './services/seedService';

AppDataSource.initialize()
  .then(async () => {
    console.log('✅ Data Source has been initialized successfully.');
    
    // Automatically seed admin user on startup
    await SeedService.seedAdminUser();
    
    app.listen(Number(ENV.PORT), '0.0.0.0', () => {
      console.log(`🚀 Server is running on port ${ENV.PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('👤 Admin credentials: admin@admin.com / password12345');
    });
  })
  .catch((error: Error) => {
    console.error('❌ Error during Data Source initialization:', error);
    process.exit(1);
  });