import 'reflect-metadata';
import { AppDataSource } from '../config/databse';
import { User } from '../models/User';
import * as bcrypt from 'bcrypt';

const DEFAULT_PASSWORD = 'password12345';
const SALT_ROUNDS = 12;

async function updateAllPasswords() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    // Hash the default password
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
    console.log('✅ Password hashed');

    // Get user repository
    const userRepo = AppDataSource.getRepository(User);

    // Get all users first
    const users = await userRepo.find();
    console.log(`📊 Found ${users.length} users to update`);

    // Update each user individually
    let updatedCount = 0;
    for (const user of users) {
      await userRepo.update(user.id, {
        password: hashedPassword
      });
      updatedCount++;
    }

    console.log(`✅ Updated ${updatedCount} users with default password`);
    console.log('📝 Default password has been set for all users');
    
    // List all users for verification
    const updatedUsers = await userRepo.find({
      select: ['id', 'username', 'name', 'email', 'role']
    });
    
    console.log('\n👥 Users updated:');
    updatedUsers.forEach(user => {
      console.log(`- ${user.username} (${user.name}) - ${user.role}`);
    });

  } catch (error) {
    console.error('❌ Error updating passwords:', error);
  } finally {
    await AppDataSource.destroy();
    console.log('✅ Database connection closed');
  }
}

// Run the script
updateAllPasswords();
