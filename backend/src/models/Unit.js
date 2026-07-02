const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  property_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  unit_no: {
    type: String,
    required: true,
  },
  floor: {
    type: String,
  },
  size: {
    type: String, // e.g., '1000 sq ft', '2BHK'
  },
  rent_amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Under Maintenance'],
    default: 'Available',
  },
}, { timestamps: true });

module.exports = mongoose.model('Unit', unitSchema);
