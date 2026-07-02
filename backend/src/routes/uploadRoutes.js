const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 20000000 }, // 20MB limit
});

// @route   POST /api/upload
// @desc    Upload multiple KYC files
// @access  Public (for now)
router.post('/', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'aadhaar', maxCount: 1 },
  { name: 'company_id', maxCount: 1 },
  { name: 'property_image', maxCount: 1 }
]), (req, res) => {
  try {
    const fileUrls = {};
    if (req.files.photo) fileUrls.photo = `/uploads/${req.files.photo[0].filename}`;
    if (req.files.aadhaar) fileUrls.aadhaar = `/uploads/${req.files.aadhaar[0].filename}`;
    if (req.files.company_id) fileUrls.company_id = `/uploads/${req.files.company_id[0].filename}`;
    if (req.files.property_image) fileUrls.property_image = `/uploads/${req.files.property_image[0].filename}`;

    res.status(200).json({
      message: 'Files uploaded successfully',
      fileUrls
    });
  } catch (error) {
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
});

module.exports = router;
