require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Route to serve files from MongoDB GridFS
app.get('/uploads/:filename', async (req, res) => {
  try {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
    const files = await bucket.find({ filename: req.params.filename }).toArray();
    
    if (!files || files.length === 0) {
      return res.status(404).send('File not found');
    }
    
    res.set('Content-Type', files[0].contentType);
    const downloadStream = bucket.openDownloadStreamByName(req.params.filename);
    downloadStream.pipe(res);
  } catch (error) {
    res.status(500).send('Error retrieving file');
  }
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/units', require('./routes/unitRoutes'));
app.use('/api/leases', require('./routes/leaseRoutes'));
app.use('/api/rent', require('./routes/rentRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Basic route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'EstateFlow API is running' });
});

// Port configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
