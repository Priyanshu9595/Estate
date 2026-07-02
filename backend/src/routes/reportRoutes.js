const express = require('express');
const router = express.Router();
const { getFinancialReports } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/financials', protect, authorize('Owner', 'Admin'), getFinancialReports);

module.exports = router;
