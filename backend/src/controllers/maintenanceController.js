const Maintenance = require('../models/Maintenance');
const Property = require('../models/Property');

// @desc    Raise a maintenance request
// @route   POST /api/maintenance
// @access  Private (User)
const createMaintenanceRequest = async (req, res) => {
  try {
    const { property_id, category, priority, description } = req.body;

    const request = await Maintenance.create({
      property_id,
      user_id: req.user._id,
      category,
      priority,
      description,
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get maintenance requests for a property
// @route   GET /api/maintenance/property/:propertyId
// @access  Private (Admin/Owner)
const getMaintenanceByProperty = async (req, res) => {
  try {
    const requests = await Maintenance.find({ property_id: req.params.propertyId })
      .populate('user_id', 'name phone')
      .sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update maintenance status
// @route   PUT /api/maintenance/:id/status
// @access  Private (Admin)
const updateMaintenanceStatus = async (req, res) => {
  try {
    const { status, cost, repair_notes, technician_name } = req.body;
    
    const request = await Maintenance.findByIdAndUpdate(
      req.params.id,
      { status, cost, repair_notes, technician_name },
      { new: true }
    );

    if (!request) return res.status(404).json({ message: 'Request not found' });

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's maintenance requests
// @route   GET /api/maintenance/my-requests
// @access  Private (User)
const getMyMaintenance = async (req, res) => {
  try {
    const requests = await Maintenance.find({ user_id: req.user._id })
      .populate('property_id', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all maintenance requests for Admin's properties
// @route   GET /api/maintenance/admin-requests
// @access  Private (Admin)
const getAdminMaintenance = async (req, res) => {
  try {
    const properties = await Property.find({ assigned_admin_id: req.user._id });
    const propertyIds = properties.map(p => p._id);

    const requests = await Maintenance.find({ property_id: { $in: propertyIds } })
      .populate('property_id', 'name')
      .populate('user_id', 'name phone unit_no')
      .sort({ createdAt: -1 });
      
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all maintenance requests for Owner
// @route   GET /api/maintenance/all-requests
// @access  Private (Owner)
const getAllMaintenance = async (req, res) => {
  try {
    const requests = await Maintenance.find({})
      .populate('property_id', 'name')
      .populate('user_id', 'name phone unit_no')
      .sort({ createdAt: -1 });
      
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createMaintenanceRequest, getMaintenanceByProperty, updateMaintenanceStatus, getMyMaintenance, getAdminMaintenance, getAllMaintenance };
