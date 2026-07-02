const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateProfile, createAdmin, getAdmins, getTenants } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/create-admin', protect, authorize('Owner'), createAdmin);
router.get('/admins', protect, authorize('Owner'), getAdmins);
router.get('/tenants', protect, authorize('Owner', 'Admin'), getTenants);

module.exports = router;
