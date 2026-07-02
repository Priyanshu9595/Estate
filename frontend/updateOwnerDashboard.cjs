const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'OwnerDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Update setNewProperty initial state
content = content.replace(
  `setNewProperty({ name: '', type: 'Apartment', address: '', city: '', state: '', rent_amount: '', deposit_amount: '', assigned_admin_id: '', rooms: '', images: [], imageFile: null });`,
  `setNewProperty({ name: '', type: 'Apartment', address: '', city: '', state: '', rent_amount: '', deposit_amount: '', assigned_admin_id: '', rooms: '', images: [], imageFiles: [], description: '', amenities: '' });`
);

// 2. Update handleEditProperty state
content = content.replace(
  `      rooms: 'Loading rooms...',
      images: property.images || [],
      imageFile: null`,
  `      rooms: 'Loading rooms...',
      images: property.images || [],
      imageFiles: [],
      description: property.description || '',
      amenities: property.amenities ? property.amenities.join(', ') : ''`
);

// 3. Update file upload logic in handleCreateProperty
const oldUploadLogic = `      if (newProperty.imageFile) {
        const formData = new FormData();
        formData.append('property_image', newProperty.imageFile);
        const uploadRes = await axios.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (uploadRes.data.fileUrls?.property_image) {
          uploadedImages.push(uploadRes.data.fileUrls.property_image);
        }
      }`;

const newUploadLogic = `      if (newProperty.imageFiles && newProperty.imageFiles.length > 0) {
        const formData = new FormData();
        Array.from(newProperty.imageFiles).forEach(file => {
          formData.append('property_images', file);
        });
        const uploadRes = await axios.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (uploadRes.data.fileUrls?.property_images) {
          uploadedImages.push(...uploadRes.data.fileUrls.property_images);
        }
      }`;

content = content.replace(oldUploadLogic, newUploadLogic);

// 4. Update the form UI to include description, amenities, and multiple files
const oldFileInput = `<label className="block text-sm font-medium mb-1">Property Image</label>
              <input type="file" accept="image/*" onChange={e => setNewProperty({...newProperty, imageFile: e.target.files[0]})} className="w-full border p-2 rounded-lg" />
              {newProperty.images?.length > 0 && (
                <div className="mt-2 text-sm text-gray-500">
                  <p>Current Image:</p>
                  <img src={\`\${API_URL}\${newProperty.images[0]}\`} alt="Property" className="h-20 w-32 object-cover rounded mt-1" />
                </div>
              )}`;

const newFormFields = `<div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea rows="3" value={newProperty.description || ''} onChange={e => setNewProperty({...newProperty, description: e.target.value})} className="w-full border p-2 rounded-lg" placeholder="Enter property details, nearby landmarks, etc." />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Facilities / Amenities (comma separated)</label>
              <input type="text" value={newProperty.amenities || ''} onChange={e => setNewProperty({...newProperty, amenities: e.target.value})} className="w-full border p-2 rounded-lg" placeholder="e.g. WiFi, AC, TV, Geyser, Power Backup" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Property Images (Max 5)</label>
              <input type="file" accept="image/*" multiple onChange={e => setNewProperty({...newProperty, imageFiles: e.target.files})} className="w-full border p-2 rounded-lg" />
              {newProperty.images?.length > 0 && (
                <div className="mt-2 text-sm text-gray-500">
                  <p>Current Images ({newProperty.images.length}):</p>
                  <div className="flex gap-2 mt-1 overflow-x-auto pb-2">
                    {newProperty.images.map((img, i) => (
                      <img key={i} src={\`\${API_URL}\${img}\`} alt="Property" className="h-20 w-32 object-cover rounded shrink-0" />
                    ))}
                  </div>
                </div>
              )}
              {newProperty.imageFiles?.length > 5 && (
                <p className="text-red-500 text-sm mt-1">Warning: Only the first 5 images will be uploaded.</p>
              )}`;

content = content.replace(oldFileInput, newFormFields);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Updated OwnerDashboard.jsx');
