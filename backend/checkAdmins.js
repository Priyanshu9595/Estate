require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const checkAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({ role: 'Admin' });
    console.log(`Found ${users.length} Admins in DB:`);
    users.forEach(u => console.log(`- ${u.email} (Name: ${u.name})`));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
checkAdmins();
