require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const email = 'priyanshu@admin.co.in';
    const admin = await User.findOne({ email });
    
    if (admin) {
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash('Admin@123', salt);
      await admin.save();
      console.log(`Password for ${email} has been reset to: Admin@123`);
    } else {
      console.log('Admin not found!');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
resetAdmin();
