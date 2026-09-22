const express = require('express');
const router = express.Router();
const { createUnit } = require('../controllers/unitController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .post(protect, authorize('Admin'), createUnit);

module.exports = router;
