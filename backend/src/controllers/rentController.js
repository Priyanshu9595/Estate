const Rent = require('../models/Rent');
const Lease = require('../models/Lease');

// @desc    Generate rent for a lease
// @route   POST /api/rent
// @access  Private (Admin)
const generateRent = async (req, res) => {
  try {
    const { lease_id, month, due_date } = req.body;

    const lease = await Lease.findById(lease_id);
    if (!lease) return res.status(404).json({ message: 'Lease not found' });

    const existingRent = await Rent.findOne({ lease_id, month });
    if (existingRent) return res.status(400).json({ message: 'Rent for this month already exists' });

    const rent = await Rent.create({
      lease_id,
      month,
      rent_amount: lease.rent_amount,
      due_date,
      due_amount: lease.rent_amount,
      status: 'Pending'
    });

    res.status(201).json(rent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get rent ledger for a lease
// @route   GET /api/rent/lease/:leaseId
// @access  Private
const getRentByLease = async (req, res) => {
  try {
    const rentLedger = await Rent.find({ lease_id: req.params.leaseId }).sort({ due_date: -1 });
    res.status(200).json(rentLedger);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's next pending rent
// @route   GET /api/rent/my-rent
// @access  Private (User)
const getMyRent = async (req, res) => {
  try {
    // Find active lease for user
    const lease = await Lease.findOne({ user_id: req.user._id, status: 'Active' });
    if (!lease) {
      return res.status(200).json(null);
    }
    
    // Find the next pending rent
    const nextRent = await Rent.findOne({ lease_id: lease._id, status: 'Pending' }).sort({ due_date: 1 });
    res.status(200).json(nextRent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { generateRent, getRentByLease, getMyRent };
