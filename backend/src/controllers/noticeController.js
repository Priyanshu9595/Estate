const Notice = require('../models/Notice');
const Property = require('../models/Property');
const Lease = require('../models/Lease');

// @desc    Create a notice
// @route   POST /api/notices
// @access  Private (Owner/Admin)
const createNotice = async (req, res) => {
  try {
    if (req.user.role === 'User') {
      return res.status(403).json({ message: 'Only Owners or Admins can create notices.' });
    }

    const { property_id, title, content } = req.body;
    
    // Optional: Validate that admin/owner has access to this property
    const property = await Property.findById(property_id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    
    if (req.user.role === 'Owner' && property.owner_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized for this property.' });
    }
    if (req.user.role === 'Admin' && property.assigned_admin_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized for this property.' });
    }

    const notice = await Notice.create({
      property_id,
      author_id: req.user._id,
      title,
      content,
    });

    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get notices for a property
// @route   GET /api/notices/:propertyId
// @access  Private
const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find({ property_id: req.params.propertyId })
      .populate('author_id', 'name role')
      .sort({ createdAt: -1 });
    res.status(200).json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get notices for tenant's active lease
// @route   GET /api/notices/my-notices
// @access  Private (User)
const getMyNotices = async (req, res) => {
  try {
    const activeLease = await Lease.findOne({ user_id: req.user._id, status: 'Active' });
    if (!activeLease) return res.status(200).json([]);
    
    const notices = await Notice.find({ property_id: activeLease.property_id })
      .populate('author_id', 'name role')
      .sort({ createdAt: -1 });
      
    res.status(200).json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createNotice, getNotices, getMyNotices };
