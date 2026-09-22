const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createNotice, getNotices, getMyNotices } = require('../controllers/noticeController');

router.get('/my-notices', protect, getMyNotices);
router.post('/', protect, createNotice);
router.get('/:propertyId', protect, getNotices);

module.exports = router;
