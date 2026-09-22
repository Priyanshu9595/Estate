const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'controllers', 'propertyController.js');
let content = fs.readFileSync(filePath, 'utf-8');

// Update createProperty
content = content.replace(
  `const { assigned_admin_id, name, type, address, city, state, rent_amount, deposit_amount, amenities, rooms, images } = req.body;`,
  `const { assigned_admin_id, name, type, address, city, state, rent_amount, deposit_amount, amenities, rooms, images, description } = req.body;\n\n    let parsedAmenities = amenities;\n    if (typeof amenities === 'string') {\n      parsedAmenities = amenities.split(',').map(a => a.trim()).filter(a => a);\n    }`
);

content = content.replace(
  `      deposit_amount,\n      amenities,\n      images: images || [],`,
  `      deposit_amount,\n      amenities: parsedAmenities || [],\n      description,\n      images: images || [],`
);

// Update updateProperty
content = content.replace(
  `    const { assigned_admin_id, name, type, address, city, state, rent_amount, deposit_amount, rooms, images } = req.body;`,
  `    const { assigned_admin_id, name, type, address, city, state, rent_amount, deposit_amount, rooms, images, description, amenities } = req.body;\n\n    let parsedAmenities = amenities;\n    if (typeof amenities === 'string') {\n      parsedAmenities = amenities.split(',').map(a => a.trim()).filter(a => a);\n    }`
);

content = content.replace(
  `    property.rent_amount = rent_amount || property.rent_amount;\n    property.deposit_amount = deposit_amount || property.deposit_amount;\n    if (images !== undefined) property.images = images;`,
  `    property.rent_amount = rent_amount || property.rent_amount;\n    property.deposit_amount = deposit_amount || property.deposit_amount;\n    if (description !== undefined) property.description = description;\n    if (parsedAmenities !== undefined) property.amenities = parsedAmenities;\n    if (images !== undefined) property.images = images;`
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Updated propertyController.js');
