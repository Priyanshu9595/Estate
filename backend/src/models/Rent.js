const mongoose = require('mongoose');

const rentSchema = new mongoose.Schema({
  lease_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lease',
    required: true,
  },
  month: {
    type: String, // e.g., 'YYYY-MM'
    required: true,
  },
  rent_amount: {
    type: Number,
    required: true,
  },
  charges: {
    type: Number,
    default: 0,
  },
  due_date: {
    type: Date,
    required: true,
  },
  paid_amount: {
    type: Number,
    default: 0,
  },
  due_amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Partial', 'Overdue', 'Waived', 'Cancelled'],
    default: 'Pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Rent', rentSchema);
