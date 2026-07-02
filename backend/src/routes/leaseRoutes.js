const express = require('express');
const router = express.Router();
const { createLease, getLeasesByProperty, bookRoom, terminateLease, getMyLease, getExpiringLeases, getPendingRefunds, processRefund } = require('../controllers/leaseController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('Admin'), createLease);
router.get('/expiring', protect, authorize('Owner', 'Admin'), getExpiringLeases);
router.get('/refunds/pending', protect, authorize('Owner', 'Admin'), getPendingRefunds);
router.post('/:id/process-refund', protect, authorize('Owner', 'Admin'), processRefund);
router.get('/property/:propertyId', protect, authorize('Owner', 'Admin'), getLeasesByProperty);

router.post('/book', protect, authorize('User'), bookRoom);
router.post('/:id/terminate', protect, authorize('User'), terminateLease);
router.get('/my-lease', protect, authorize('User'), getMyLease);

module.exports = router;
