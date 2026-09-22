const Review = require('../models/Review');
const Lease = require('../models/Lease');

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private (User)
const createReview = async (req, res) => {
  try {
    if (req.user.role !== 'User') {
      return res.status(403).json({ message: 'Only Tenants can write reviews.' });
    }

    const { property_id, rating, comment } = req.body;

    // Check if tenant has or had a lease in this property
    const lease = await Lease.findOne({
      user_id: req.user._id,
      property_id,
    });

    if (!lease) {
      return res.status(403).json({ message: 'You must have rented this property to leave a review.' });
    }

    // Check if user already reviewed
    const existingReview = await Review.findOne({
      property_id,
      user_id: req.user._id,
    });

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment;
      await existingReview.save();
      return res.status(200).json(existingReview);
    }

    const review = await Review.create({
      property_id,
      user_id: req.user._id,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reviews for a property
// @route   GET /api/reviews/:propertyId
// @access  Public/Private
const getPropertyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ property_id: req.params.propertyId })
      .populate('user_id', 'name')
      .sort({ createdAt: -1 });
      
    // Calculate average
    const totalRating = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    res.status(200).json({
      reviews,
      averageRating,
      totalReviews: reviews.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReview, getPropertyReviews };
