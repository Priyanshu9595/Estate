require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');
const Property = require('./src/models/Property');

const imageUrls = [
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
];

const fixImages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });

    const properties = await Property.find();
    console.log(`Found ${properties.length} properties to fix.`);

    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      const imageUrl = imageUrls[i % imageUrls.length];

      console.log(`Fetching image for ${property.name}...`);
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');

      const filename = `property_image-${Date.now()}-${i}.jpg`;
      
      console.log(`Uploading ${filename} to GridFS...`);
      const uploadStream = bucket.openUploadStream(filename, { contentType: 'image/jpeg' });
      
      uploadStream.end(buffer);

      await new Promise((resolve, reject) => {
        uploadStream.on('finish', resolve);
        uploadStream.on('error', reject);
      });

      property.images = [`/uploads/${filename}`];
      await property.save();
      console.log(`Successfully updated ${property.name}!`);
    }

    console.log('All properties fixed!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing images:', error);
    process.exit(1);
  }
};

fixImages();
