const express = require('express');
const router = express.Router();
const { generateRent, getRentByLease, getMyRent } = require('../controllers/rentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('Admin'), generateRent);
router.get('/my-rent', protect, authorize('User'), getMyRent);
router.get('/lease/:leaseId', protect, getRentByLease);

module.exports = router;
