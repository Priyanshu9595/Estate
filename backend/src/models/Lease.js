const mongoose = require('mongoose');

const leaseSchema = new mongoose.Schema({
  property_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  unit_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Tenant
    required: true,
  },
  start_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
    required: true,
  },
  rent_amount: {
    type: Number,
    required: true,
  },
  deposit: {
    type: Number,
    required: true,
  },
  notice_period: {
    type: Number, // in days
    default: 30,
  },
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Terminated', 'Archived'],
    default: 'Active',
  },
  refund_status: {
    type: String,
    enum: ['None', 'Pending', 'Processed'],
    default: 'None',
  },
  refund_amount: {
    type: Number,
    default: 0,
  },
  bank_details: {
    bank_name: { type: String, default: '' },
    account_number: { type: String, default: '' },
    ifsc_code: { type: String, default: '' },
  },
}, { timestamps: true });

module.exports = mongoose.model('Lease', leaseSchema);
