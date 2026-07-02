const Property = require('../models/Property');
const Rent = require('../models/Rent');
const Payment = require('../models/Payment');
const Maintenance = require('../models/Maintenance');
const Lease = require('../models/Lease');

// @desc    Get financial and occupancy reports
// @route   GET /api/reports/financials
// @access  Private (Owner/Admin)
const getFinancialReports = async (req, res) => {
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

    // Get all leases for these properties
    const leases = await Lease.find({ property_id: { $in: propertyIds } }).populate('property_id unit_id user_id');
    const leaseIds = leases.map(l => l._id);

    // Get all rents and payments for these leases
    const rents = await Rent.find({ lease_id: { $in: leaseIds } }).populate({
      path: 'lease_id',
      populate: { path: 'property_id unit_id user_id' }
    });

    // We can also get payments if needed, but rent has paid_amount which is enough for basic reporting
    
    // Get all maintenance requests for these properties
    const maintenance = await Maintenance.find({ property_id: { $in: propertyIds } }).populate('property_id user_id');

    // Structure the data for easy CSV export on frontend
    const rentData = rents.map(r => ({
      PropertyName: r.lease_id?.property_id?.name || 'N/A',
      Unit: r.lease_id?.unit_id?.unit_no || 'N/A',
      Tenant: r.lease_id?.user_id?.name || 'N/A',
      Month: r.month,
      RentAmount: r.rent_amount,
      PaidAmount: r.paid_amount,
      DueAmount: r.due_amount,
      Status: r.status
    }));

    const maintenanceData = maintenance.map(m => ({
      PropertyName: m.property_id?.name || 'N/A',
      Category: m.category,
      Description: m.description,
      Status: m.status,
      Cost: m.cost || 0,
      Technician: m.technician_name || 'N/A',
      Date: new Date(m.createdAt).toLocaleDateString()
    }));

    res.status(200).json({
      rentData,
      maintenanceData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getFinancialReports };
