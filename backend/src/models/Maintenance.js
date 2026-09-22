const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  property_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    enum: ['Plumbing', 'Electrical', 'Appliance', 'Carpentry', 'Other'],
    required: true,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium',
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected'],
    default: 'Open',
  },
  cost: {
    type: Number,
    default: 0,
  },
  technician_name: {
    type: String,
  },
  repair_notes: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
