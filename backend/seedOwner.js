require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const seedOwner = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const ownerEmail = 'owner@estateflow.com';
    const ownerExists = await User.findOne({ email: ownerEmail });

    if (ownerExists) {
      console.log('Owner already exists!');
      process.exit();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Owner@123', salt);

    const owner = await User.create({
      name: 'Super Owner',
      email: ownerEmail,
      password: hashedPassword,
      phone: '9999999999',
      role: 'Owner',
    });

    console.log('Owner seeded successfully:');
    console.log(`Email: ${owner.email}`);
    console.log('Password: Owner@123');
    
    process.exit();
  } catch (error) {
    console.error('Error seeding owner:', error);
    process.exit(1);
  }
};

seedOwner();
