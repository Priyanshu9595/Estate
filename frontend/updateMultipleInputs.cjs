const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'OwnerDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

const oldImageInputUI = `<div className="md:col-span-2">
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
              )}
            </div>`;

const newImageInputUI = `<div className="md:col-span-2 border border-gray-200 rounded-lg p-4 bg-gray-50">
              <label className="block text-sm font-bold text-gray-700 mb-3">Property Images (Upload up to 5)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Image {i + 1}</p>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => {
                        const newFiles = [...(newProperty.imageFiles || [])];
                        newFiles[i] = e.target.files[0];
                        setNewProperty({...newProperty, imageFiles: newFiles});
                      }} 
                      className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100" 
                    />
                  </div>
                ))}
              </div>
              
              {newProperty.images?.length > 0 && (
                <div className="mt-4 text-sm text-gray-500 border-t pt-4">
                  <p className="font-semibold mb-2">Currently Saved Images ({newProperty.images.length}):</p>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {newProperty.images.map((img, i) => (
                      <img key={i} src={\`\${API_URL}\${img}\`} alt="Property" className="h-24 w-36 object-cover rounded-lg shadow-sm shrink-0 border" />
                    ))}
                  </div>
                </div>
              )}
            </div>`;

content = content.replace(oldImageInputUI, newImageInputUI);

const oldUploadLogic = `Array.from(newProperty.imageFiles).forEach(file => {
          formData.append('property_images', file);
        });`;

const newUploadLogic = `Array.from(newProperty.imageFiles).forEach(file => {
          if (file) formData.append('property_images', file);
        });`;

content = content.replace(oldUploadLogic, newUploadLogic);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully updated OwnerDashboard multiple inputs');
