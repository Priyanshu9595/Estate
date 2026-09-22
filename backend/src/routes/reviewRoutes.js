const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createReview, getPropertyReviews } = require('../controllers/reviewController');

router.post('/', protect, createReview);
router.get('/:propertyId', getPropertyReviews);

module.exports = router;
