const mongoose = require('mongoose');

const maintenanceRequestSchema = new mongoose.Schema({
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
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Plumbing', 'Electrical', 'Appliance', 'Carpentry', 'Other'],
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved'],
    default: 'Pending',
  },
  admin_notes: {
    type: String,
    default: '',
  }
}, { timestamps: true });

module.exports = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);
