const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  rent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rent',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  mode: {
    type: String,
    enum: ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Online'],
    required: true,
  },
  transaction_ref: {
    type: String,
  },
  paid_on: {
    type: Date,
    default: Date.now,
  },
  receipt_no: {
    type: String,
  },
  notes: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
