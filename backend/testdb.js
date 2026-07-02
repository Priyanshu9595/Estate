require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

const checkDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    const users = await User.find({});
    console.log('All Users in DB:');
    users.forEach(u => console.log(`- ${u.email} (Role: ${u.role})`));

    const owner = await User.findOne({ email: 'owner@estateflow.com' });
    if (owner) {
      const isMatch = await bcrypt.compare('Owner@123', owner.password);
      console.log(`Password match for Owner@123: ${isMatch}`);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
checkDb();
