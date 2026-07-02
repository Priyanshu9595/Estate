const Lease = require('../models/Lease');
const Property = require('../models/Property');
const Unit = require('../models/Unit');
const Rent = require('../models/Rent');
const sendEmail = require('../utils/sendEmail');

// @desc    Create a lease
// @route   POST /api/leases
// @access  Private (Admin)
const createLease = async (req, res) => {
  try {
    const { property_id, unit_id, user_id, start_date, end_date, rent_amount, deposit } = req.body;

    const property = await Property.findById(property_id);
    if (!property || property.assigned_admin_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized for this property' });
    }

    const lease = await Lease.create({
      property_id,
      unit_id,
      user_id,
      start_date,
      end_date,
      rent_amount,
      deposit,
    });

    // Update unit and property status to occupied
    await Unit.findByIdAndUpdate(unit_id, { status: 'Occupied' });
    await Property.findByIdAndUpdate(property_id, { status: 'Occupied' });

    res.status(201).json(lease);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get leases for a property
// @route   GET /api/leases/property/:propertyId
// @access  Private (Admin/Owner)
const getLeasesByProperty = async (req, res) => {
  try {
    const leases = await Lease.find({ property_id: req.params.propertyId }).populate('user_id', 'name email phone');
    res.status(200).json(leases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Book a room (Create a new lease)
// @route   POST /api/leases/book
// @access  Private (User)
const bookRoom = async (req, res) => {
  try {
    if (req.user.role !== 'User') {
      return res.status(403).json({ message: 'Only Users can book rooms' });
    }

    const { property_id, unit_id } = req.body;

    const unit = await Unit.findById(unit_id);
    if (!unit) return res.status(404).json({ message: 'Room not found' });
    if (unit.status !== 'Available') return res.status(400).json({ message: 'Room is not available' });

    const property = await Property.findById(property_id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    // Check if user already has an active lease
    const existingLease = await Lease.findOne({ user_id: req.user._id, status: 'Active' });
    if (existingLease) {
      return res.status(400).json({ message: 'You already have an active booking.' });
    }

    // Set dates
    const start_date = new Date();
    const end_date = new Date();
    end_date.setMonth(end_date.getMonth() + 11); // Standard 11 month lease

    // Create Lease
    const lease = await Lease.create({
      property_id,
      unit_id,
      user_id: req.user._id,
      start_date,
      end_date,
      rent_amount: unit.rent_amount,
      deposit: property.deposit_amount || 0,
      status: 'Active',
    });

    // Update Unit Status
    unit.status = 'Occupied';
    await unit.save();

    // Calculate Prorated Rent for Current Month
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDate = today.getDate();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysRemaining = daysInMonth - currentDate + 1;
    const proratedRent = Math.round(daysRemaining * (unit.rent_amount / daysInMonth));

    // Generate Rent for current month (Paid immediately during booking)
    await Rent.create({
      lease_id: lease._id,
      month: today.toISOString().slice(0, 7),
      rent_amount: proratedRent,
      due_date: today,
      paid_amount: proratedRent,
      due_amount: 0,
      status: 'Paid'
    });

    // Generate Rent for NEXT month (Pending, due in 30 days)
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 30);

    await Rent.create({
      lease_id: lease._id,
      month: nextMonth.toISOString().slice(0, 7),
      rent_amount: unit.rent_amount,
      due_date: nextDueDate,
      paid_amount: 0,
      due_amount: unit.rent_amount,
      status: 'Pending'
    });

    // Send Confirmation Email
    try {
      const emailHtml = `
        <h2>Booking Confirmation</h2>
        <p>Dear ${req.user.name},</p>
        <p>Your room booking has been confirmed successfully!</p>
        <h3>Booking Details:</h3>
        <ul>
          <li><strong>Property:</strong> ${property.name}</li>
          <li><strong>Unit/Room:</strong> ${unit.unit_no}</li>
          <li><strong>Standard Rent:</strong> ₹${unit.rent_amount}/month</li>
          <li><strong>First Month (Prorated for ${daysRemaining} days):</strong> ₹${proratedRent}</li>
          <li><strong>Security Deposit:</strong> ₹${property.deposit_amount || 0}</li>
          <li><strong>Start Date:</strong> ${start_date.toDateString()}</li>
        </ul>
        <p>Welcome to EstateFlow!</p>
      `;
      await sendEmail({
        email: req.user.email,
        subject: 'Room Booking Confirmation - EstateFlow',
        html: emailHtml,
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // We don't fail the booking if email fails
    }

    res.status(201).json({ message: 'Room booked successfully!', lease });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Terminate lease (Leave room)
// @route   POST /api/leases/:id/terminate
// @access  Private (User)
const terminateLease = async (req, res) => {
  try {
    const { bank_name, account_number, ifsc_code } = req.body;
    const lease = await Lease.findById(req.params.id);
    if (!lease) return res.status(404).json({ message: 'Lease not found' });
    if (lease.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (lease.status !== 'Active') {
      return res.status(400).json({ message: 'Lease is not active' });
    }

    if (!bank_name || !account_number || !ifsc_code) {
      return res.status(400).json({ message: 'Bank details are required for refund processing.' });
    }

    // Calculate Refund (50% of deposit)
    const refundAmount = lease.deposit * 0.5;

    // Update Lease
    lease.status = 'Terminated';
    lease.end_date = new Date(); // Set end date to today
    lease.refund_status = 'Pending';
    lease.refund_amount = refundAmount;
    lease.bank_details = { bank_name, account_number, ifsc_code };
    await lease.save();

    // Update Unit Status back to Available
    const unit = await Unit.findById(lease.unit_id);
    if (unit) {
      unit.status = 'Available';
      await unit.save();
    }

    res.status(200).json({ message: `Lease terminated. A refund of ₹${refundAmount} has been requested and is pending owner approval.`, refundAmount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's active lease
// @route   GET /api/leases/my-lease
// @access  Private (User)
const getMyLease = async (req, res) => {
  try {
    const lease = await Lease.findOne({ user_id: req.user._id, status: 'Active' })
      .populate('property_id')
      .populate('unit_id');
      
    if (!lease) {
      return res.status(200).json(null); // Return null if no active lease
    }
    res.status(200).json(lease);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get leases expiring within 30 days
// @route   GET /api/leases/expiring
// @access  Private (Owner/Admin)
const getExpiringLeases = async (req, res) => {
  try {
    let properties;
    if (req.user.role === 'Owner') {
      properties = await Property.find({ owner_id: req.user._id });
    } else if (req.user.role === 'Admin') {
      properties = await Property.find({ assigned_admin_id: req.user._id });
    } else {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const propertyIds = properties.map(p => p._id);
    
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const expiringLeases = await Lease.find({
      property_id: { $in: propertyIds },
      status: 'Active',
      end_date: { $gte: today, $lte: thirtyDaysFromNow }
    }).populate('property_id unit_id user_id');

    res.status(200).json(expiringLeases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending refund requests
// @route   GET /api/leases/refunds/pending
// @access  Private (Owner/Admin)
const getPendingRefunds = async (req, res) => {
  try {
    let properties;
    if (req.user.role === 'Owner') {
      properties = await Property.find({ owner_id: req.user._id });
    } else if (req.user.role === 'Admin') {
      properties = await Property.find({ assigned_admin_id: req.user._id });
    } else {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const propertyIds = properties.map(p => p._id);
    const refunds = await Lease.find({
      property_id: { $in: propertyIds },
      refund_status: 'Pending'
    }).populate('property_id unit_id user_id');

    res.status(200).json(refunds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Process a pending refund
// @route   POST /api/leases/:id/process-refund
// @access  Private (Owner/Admin)
const processRefund = async (req, res) => {
  try {
    const lease = await Lease.findById(req.params.id).populate('property_id user_id unit_id');
    if (!lease) return res.status(404).json({ message: 'Lease not found' });
    
    // Authorization check
    if (req.user.role === 'Owner' && lease.property_id.owner_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (req.user.role === 'Admin' && lease.property_id.assigned_admin_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (lease.refund_status !== 'Pending') {
      return res.status(400).json({ message: 'Refund is not pending.' });
    }

    lease.refund_status = 'Processed';
    await lease.save();

    // Send email notification to tenant
    try {
      const emailHtml = `
        <h2>Refund Processed Successfully</h2>
        <p>Dear ${lease.user_id.name},</p>
        <p>Your refund of <strong>₹${lease.refund_amount}</strong> for Room ${lease.unit_id.unit_no} at ${lease.property_id.name} has been processed by the owner.</p>
        <p>The amount has been transferred to your requested bank account ending in <strong>${lease.bank_details.account_number.slice(-4)}</strong>.</p>
        <p>It may take 2-3 business days to reflect in your account.</p>
        <p>Thank you for staying with us!</p>
      `;
      await sendEmail({
        email: lease.user_id.email,
        subject: 'Refund Processed - EstateFlow',
        html: emailHtml,
      });
    } catch (emailError) {
      console.error('Failed to send refund email:', emailError);
    }

    res.status(200).json({ message: 'Refund processed successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createLease, getLeasesByProperty, bookRoom, terminateLease, getMyLease, getExpiringLeases, getPendingRefunds, processRefund };
