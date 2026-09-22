const express = require('express');
const router = express.Router();
const { getProperties, createProperty, getPropertyById, updateProperty, deleteProperty } = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, authorize('Owner', 'Admin', 'User'), getProperties)
  .post(protect, authorize('Owner'), createProperty);

router.route('/:id')
  .get(protect, authorize('Owner', 'Admin', 'User'), getPropertyById)
  .put(protect, authorize('Owner'), updateProperty)
  .delete(protect, authorize('Owner'), deleteProperty);

module.exports = router;
