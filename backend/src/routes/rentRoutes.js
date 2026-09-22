const express = require('express');
const router = express.Router();
const { generateRent, getRentByLease, getMyRent, getMyRentHistory } = require('../controllers/rentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('Admin'), generateRent);
router.get('/my-rent', protect, authorize('User'), getMyRent);
router.get('/my-history', protect, authorize('User'), getMyRentHistory);
router.get('/lease/:leaseId', protect, getRentByLease);

module.exports = router;
