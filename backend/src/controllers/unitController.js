const Unit = require('../models/Unit');
const Property = require('../models/Property');

// @desc    Create a unit for a property
// @route   POST /api/units
// @access  Private (Admin)
const createUnit = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only Admins can create units' });
    }

    const { property_id, unit_no, floor, size, rent_amount } = req.body;

    const property = await Property.findById(property_id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    
    if (property.assigned_admin_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized for this property' });
    }

    const unit = await Unit.create({
      property_id,
      unit_no,
      floor,
      size,
      rent_amount,
    });

    res.status(201).json(unit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createUnit };
