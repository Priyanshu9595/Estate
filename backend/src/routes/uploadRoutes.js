const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 20000000 }, // 20MB limit
});

const uploadFileToGridFS = (file) => {
  return new Promise((resolve, reject) => {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
    const filename = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
    const uploadStream = bucket.openUploadStream(filename, { contentType: file.mimetype });
    
    uploadStream.on('finish', () => resolve(`/uploads/${filename}`));
    uploadStream.on('error', reject);
    uploadStream.end(file.buffer);
  });
};

// @route   POST /api/upload
// @desc    Upload multiple KYC files
// @access  Public (for now)
router.post('/', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'aadhaar', maxCount: 1 },
  { name: 'company_id', maxCount: 1 },
  { name: 'property_images', maxCount: 5 }
]), async (req, res) => {
  try {
    const fileUrls = {};
    if (req.files.photo) fileUrls.photo = await uploadFileToGridFS(req.files.photo[0]);
    if (req.files.aadhaar) fileUrls.aadhaar = await uploadFileToGridFS(req.files.aadhaar[0]);
    if (req.files.company_id) fileUrls.company_id = await uploadFileToGridFS(req.files.company_id[0]);
    
    if (req.files.property_images) {
      fileUrls.property_images = await Promise.all(
        req.files.property_images.map(file => uploadFileToGridFS(file))
      );
    }

    res.status(200).json({
      message: 'Files uploaded successfully to GridFS',
      fileUrls
    });
  } catch (error) {
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
});

module.exports = router;
