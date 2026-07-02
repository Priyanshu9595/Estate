const Property = require('../models/Property');
const Unit = require('../models/Unit');
const Lease = require('../models/Lease');

// @desc    Get all properties (filtered by role) with stats
// @route   GET /api/properties
// @access  Private (Owner/Admin)
const getProperties = async (req, res) => {
  try {
    let properties;
    if (req.user.role === 'Owner') {
      properties = await Property.find({ owner_id: req.user._id }).lean();
    } else if (req.user.role === 'Admin') {
      properties = await Property.find({ assigned_admin_id: req.user._id }).lean();
    } else if (req.user.role === 'User') {
      properties = await Property.find({}).lean(); // Users can see all properties
    } else {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Attach stats (Occupied rooms and actual revenue)
    const propertyIds = properties.map(p => p._id);
    const units = await Unit.find({ property_id: { $in: propertyIds } });
    
    // Include Active leases AND Terminated leases that still have a Pending refund
    const activeLeases = await Lease.find({ 
      property_id: { $in: propertyIds },
      $or: [
        { status: 'Active' },
        { status: 'Terminated', refund_status: 'Pending' }
      ]
    });

    const propertiesWithStats = properties.map(prop => {
      const propUnits = units.filter(u => u.property_id.toString() === prop._id.toString());
      const totalUnits = propUnits.length;
      const occupiedUnits = propUnits.filter(u => u.status === 'Occupied');
      const activeRevenue = occupiedUnits.reduce((acc, curr) => acc + (curr.rent_amount || prop.rent_amount), 0);
      
      const propLeases = activeLeases.filter(l => l.property_id.toString() === prop._id.toString());
      const totalAdvance = propLeases.reduce((acc, curr) => acc + (curr.deposit || 0), 0);
      
      return {
        ...prop,
        total_units: totalUnits,
        occupied_units: occupiedUnits.length,
        active_revenue: activeRevenue,
        total_advance: totalAdvance
      };
    });

    res.status(200).json(propertiesWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a property
// @route   POST /api/properties
// @access  Private (Owner)
const createProperty = async (req, res) => {
  try {
    if (req.user.role !== 'Owner') {
      return res.status(403).json({ message: 'Only Owners can create properties' });
    }

    const { assigned_admin_id, name, type, address, city, state, rent_amount, deposit_amount, amenities, rooms, images } = req.body;

    const property = await Property.create({
      owner_id: req.user._id,
      assigned_admin_id,
      name,
      type,
      address,
      city,
      state,
      rent_amount,
      deposit_amount,
      amenities,
      images: images || [],
    });

    // Create units if number of rooms is provided
    if (rooms && !isNaN(rooms) && Number(rooms) > 0) {
      const numRooms = Number(rooms);
      const unitsToCreate = [];
      for (let i = 1; i <= numRooms; i++) {
        unitsToCreate.push({
          property_id: property._id,
          unit_no: `${100 + i}`,
          rent_amount: rent_amount,
          status: 'Available',
        });
      }
      if (unitsToCreate.length > 0) {
        await Unit.insertMany(unitsToCreate);
      }
    }

    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get property details by ID
// @route   GET /api/properties/:id
// @access  Private
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    // Validate access based on role
    if (req.user.role === 'Owner' && property.owner_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (req.user.role === 'Admin' && property.assigned_admin_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    let units = await Unit.find({ property_id: property._id })
      .collation({ locale: "en_US", numericOrdering: true })
      .sort({ unit_no: 1 })
      .lean();

    // If Admin or Owner, attach tenant details for occupied units
    if (req.user.role === 'Admin' || req.user.role === 'Owner') {
      const activeLeases = await Lease.find({ property_id: property._id, status: 'Active' })
        .populate('user_id', 'name email phone address kyc_details')
        .lean();
        
      units = units.map(unit => {
        if (unit.status === 'Occupied') {
          const lease = activeLeases.find(l => l.unit_id.toString() === unit._id.toString());
          if (lease && lease.user_id) {
            unit.tenant = lease.user_id;
            unit.lease = {
              start_date: lease.start_date,
              end_date: lease.end_date,
              rent_amount: lease.rent_amount,
              deposit: lease.deposit
            };
          }
        }
        return unit;
      });
    }

    res.status(200).json({ property, units });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a property
// @route   PUT /api/properties/:id
// @access  Private (Owner)
const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    if (req.user.role !== 'Owner' || property.owner_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { assigned_admin_id, name, type, address, city, state, rent_amount, deposit_amount, rooms, images } = req.body;
    
    property.assigned_admin_id = assigned_admin_id || property.assigned_admin_id;
    property.name = name || property.name;
    property.type = type || property.type;
    property.address = address || property.address;
    property.city = city || property.city;
    property.state = state || property.state;
    property.rent_amount = rent_amount || property.rent_amount;
    property.deposit_amount = deposit_amount || property.deposit_amount;
    if (images !== undefined) property.images = images;

    const updatedProperty = await property.save();

    // Sync units if number of rooms is provided
    if (rooms !== undefined && !isNaN(rooms)) {
      const numRooms = Number(rooms);
      const expectedRoomNos = [];
      for (let i = 1; i <= numRooms; i++) {
        expectedRoomNos.push(`${100 + i}`);
      }

      const existingUnits = await Unit.find({ property_id: property._id });
      const existingRoomNos = existingUnits.map(u => u.unit_no);
      
      // Delete units not in the new list
      const unitsToDelete = existingRoomNos.filter(no => !expectedRoomNos.includes(no));
      if (unitsToDelete.length > 0) {
        await Unit.deleteMany({ property_id: property._id, unit_no: { $in: unitsToDelete } });
      }
      
      // Create new units
      const unitsToCreateNos = expectedRoomNos.filter(no => !existingRoomNos.includes(no));
      if (unitsToCreateNos.length > 0) {
        const unitsToCreate = unitsToCreateNos.map(roomNo => ({
          property_id: property._id,
          unit_no: roomNo,
          rent_amount: property.rent_amount,
          status: 'Available',
        }));
        await Unit.insertMany(unitsToCreate);
      }
    }

    res.status(200).json(updatedProperty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a property
// @route   DELETE /api/properties/:id
// @access  Private (Owner)
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    if (req.user.role !== 'Owner' || property.owner_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Unit.deleteMany({ property_id: property._id });
    await Property.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Property removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProperties, createProperty, getPropertyById, updateProperty, deleteProperty };
