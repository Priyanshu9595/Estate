const express = require('express');
const router = express.Router();
const { createMaintenanceRequest, getMaintenanceByProperty, updateMaintenanceStatus, getMyMaintenance, getAdminMaintenance, getAllMaintenance } = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('User'), createMaintenanceRequest);
router.get('/my-requests', protect, authorize('User'), getMyMaintenance);
router.get('/admin-requests', protect, authorize('Admin'), getAdminMaintenance);
router.get('/all-requests', protect, authorize('Owner'), getAllMaintenance);
router.get('/property/:propertyId', protect, authorize('Owner', 'Admin'), getMaintenanceByProperty);
router.put('/:id/status', protect, authorize('Admin'), updateMaintenanceStatus);

module.exports = router;
