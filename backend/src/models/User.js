const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Owner', 'Admin', 'User'],
    default: 'User',
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Vacated'],
    default: 'Active',
  },
  // Owner specific
  pan: {
    type: String,
  },
  address: {
    type: String,
  },
  bank_details: {
    accountName: String,
    accountNumber: String,
    ifsc: String,
    bankName: String,
  },
  // User/Tenant specific
  kyc_details: {
    photo: String, // URL to document
    aadhaar: String, // URL to document
    company_id: String, // URL to document
  },
  emergency_contact: {
    name: String,
    phone: String,
    relation: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
