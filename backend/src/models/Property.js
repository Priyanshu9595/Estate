const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assigned_admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Apartment', 'House', 'Commercial', 'PG', 'Flat', 'DailyRoom'],
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  rent_amount: {
    type: Number,
    required: true,
  },
  deposit_amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Under Maintenance', 'Inactive'],
    default: 'Available',
  },
  amenities: [String],
  images: [String], // Array of URLs
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
