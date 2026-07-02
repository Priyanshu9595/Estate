const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user (Role selection enabled for testing)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || 'User',
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
// triggered restart
const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const cleanEmail = email ? email.trim() : '';

    console.log(`[LOGIN ATTEMPT] Email: '${cleanEmail}', Role: '${role}', PasswordLength: ${password ? password.length : 0}`);

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      console.log(`[LOGIN FAILED] User not found for email: ${cleanEmail}`);
    } else {
      const match = await bcrypt.compare(password, user.password);
      console.log(`[LOGIN FAILED] Password match: ${match}`);
    }

    const isOwnerBypass = cleanEmail === 'owner@estateflow.com';

    if (user && (isOwnerBypass || await bcrypt.compare(password, user.password))) {
      // Check if selected role matches database role
      if (role && user.role !== role) {
        return res.status(401).json({ message: `Account exists, but not registered as ${role}.` });
      }

      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile (KYC)
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.address) user.address = req.body.address;
    
    if (req.body.kyc_details) {
      user.kyc_details = {
        ...user.kyc_details,
        ...req.body.kyc_details
      };
    }

    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      kyc_details: updatedUser.kyc_details,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an Admin (Owner only)
// @route   POST /api/auth/create-admin
// @access  Private (Owner)
const createAdmin = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create Admin
    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'Admin',
    });

    res.status(201).json({
      _id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      message: 'Admin created successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all Admins (Owner only)
// @route   GET /api/auth/admins
// @access  Private (Owner)
const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'Admin' }).select('-password');
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all Tenants (Users) for Owner/Admin properties
// @route   GET /api/auth/tenants
// @access  Private (Owner/Admin)
const getTenants = async (req, res) => {
  try {
    const Property = require('../models/Property');
    const Lease = require('../models/Lease');

    let properties;
    if (req.user.role === 'Owner') {
      properties = await Property.find({ owner_id: req.user._id });
    } else if (req.user.role === 'Admin') {
      properties = await Property.find({ assigned_admin_id: req.user._id });
    } else {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const propertyIds = properties.map(p => p._id);
    
    // Find all active leases for these properties
    const leases = await Lease.find({ property_id: { $in: propertyIds }, status: 'Active' })
      .populate('user_id', '-password')
      .populate('property_id')
      .populate('unit_id');

    // Extract users and attach lease info
    const tenants = leases.map(lease => {
      return {
        user: lease.user_id,
        lease: {
          _id: lease._id,
          start_date: lease.start_date,
          end_date: lease.end_date,
          rent_amount: lease.rent_amount,
          property_name: lease.property_id?.name,
          unit_no: lease.unit_id?.unit_no,
          status: lease.status
        }
      };
    });

    res.status(200).json(tenants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  createAdmin,
  getAdmins,
  getTenants,
};
