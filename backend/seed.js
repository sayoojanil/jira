require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Bug = require('./models/Bug');
const File = require('./models/File');
const ActivityLog = require('./models/ActivityLog');

const seedDB = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/freelance-portal');
    console.log('Connected.');

    // Clear existing collections
    console.log('Clearing old data...');
    await User.deleteMany({});
    await Project.deleteMany({});
    await Bug.deleteMany({});
    await File.deleteMany({});
    await ActivityLog.deleteMany({});

    console.log('Creating fresh mock users...');
    // Create Admin
    const admin = await User.create({
      name: 'Executive Admin',
      email: 'admin@portal.com',
      password: 'admin123',
      role: 'admin',
    });

    // Create Team Member
    // const dev = await User.create({
    //   name: 'Senior Developer',
    //   email: 'dev@portal.com',
    //   password: 'dev123',
    //   role: 'team_member',
    // });

    // Create Client
    const client = await User.create({
      name: 'Acme Corp Client',
      email: 'client@portal.com',
      password: 'client123',
      role: 'client',
    });

    console.log('\n==================================================');
    console.log('DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('==================================================');
    console.log('You can now log in using the following accounts:');
    console.log('\n1. ADMIN ACCOUNT:');
    console.log('   Email:    admin@portal.com');
    console.log('   Password: admin123');
    console.log('\n2. DEVELOPER (TEAM) ACCOUNT:');
    console.log('   Email:    dev@portal.com');
    console.log('   Password: dev123');
    console.log('\n3. CLIENT ACCOUNT:');
    console.log('   Email:    client@portal.com');
    console.log('   Password: client123');
    console.log('==================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDB();
