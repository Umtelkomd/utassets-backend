const { AppDataSource } = require('./data-source');

const createUsers = async () => {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    const userRepository = AppDataSource.getRepository('User');

    // Create User A (Creator)
    const userA = userRepository.create({
      name: 'User A',
      email: 'creator@company.com',
      password: '123456', // Simple password for demo
      role: 'creator',
      active: true
    });

    // Create User B (Approver)
    const userB = userRepository.create({
      name: 'User B',
      email: 'approver@company.com',
      password: '123456', // Simple password for demo
      role: 'approver',
      active: true
    });

    // Check if users already exist
    const existingUser1 = await userRepository.findOne({ 
      where: { email: 'creator@company.com' } 
    });
    const existingUser2 = await userRepository.findOne({ 
      where: { email: 'approver@company.com' } 
    });

    if (existingUser1) {
      console.log('⚠️  User A already exists');
    } else {
      await userRepository.save(userA);
      console.log('✅ User A created successfully');
    }

    if (existingUser2) {
      console.log('⚠️  User B already exists');
    } else {
      await userRepository.save(userB);
      console.log('✅ User B created successfully');
    }

    console.log('\n📋 Access credentials:');
    console.log('User A (Payment Creator):');
    console.log('  Email: creator@company.com');
    console.log('  Password: 123456');
    console.log('');
    console.log('User B (Payment Approver):');
    console.log('  Email: approver@company.com');
    console.log('  Password: 123456');
    console.log('');

    await AppDataSource.destroy();
    console.log('✅ Process completed');
  } catch (error) {
    console.error('❌ Error creating users:', error);
    process.exit(1);
  }
};

// Execute script
createUsers(); 