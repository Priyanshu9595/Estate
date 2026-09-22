const express = require('express');
const router = express.Router();
const { recordPayment, createRazorpayOrder, verifyRazorpayPayment } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('Admin'), recordPayment);
router.post('/create-order', protect, authorize('User'), createRazorpayOrder);
router.post('/verify', protect, authorize('User'), verifyRazorpayPayment);

module.exports = router;
