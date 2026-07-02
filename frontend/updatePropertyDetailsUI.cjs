const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'PropertyDetails.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

const oldHeader = `      {/* Property Header */}
      <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="text-primary w-8 h-8" />
              {property.name}
            </h1>
            <p className="text-gray-500 flex items-center gap-2 mt-2">
              <MapPin className="w-4 h-4" />
              {property.address}, {property.city}, {property.state}
            </p>
          </div>
          <div className="bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">
            <p className="text-sm text-primary font-semibold uppercase tracking-wider">{property.type}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-6 border-t border-gray-100">`;

const newHeader = `      {/* Property Images Gallery */}
      {property.images && property.images.length > 0 && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={\`md:col-span-\${property.images.length === 1 ? '4' : '2'} row-span-2\`}>
              <img src={\`\${API_URL}\${property.images[0]}\`} alt={property.name} className="w-full h-full object-cover rounded-2xl shadow-sm min-h-[300px] max-h-[400px]" />
            </div>
            {property.images.slice(1, 5).map((img, idx) => (
              <div key={idx} className="md:col-span-1">
                <img src={\`\${API_URL}\${img}\`} alt={\`\${property.name} \${idx+2}\`} className="w-full h-full object-cover rounded-xl shadow-sm min-h-[140px] max-h-[190px]" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Property Header */}
      <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="text-primary w-8 h-8" />
              {property.name}
            </h1>
            <p className="text-gray-500 flex items-center gap-2 mt-2">
              <MapPin className="w-4 h-4" />
              {property.address}, {property.city}, {property.state}
            </p>
          </div>
          <div className="bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">
            <p className="text-sm text-primary font-semibold uppercase tracking-wider">{property.type}</p>
          </div>
        </div>

        {property.description && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{property.description}</p>
          </div>
        )}

        {property.amenities && property.amenities.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Facilities</h3>
            <div className="flex flex-wrap gap-2">
              {property.amenities.map((amenity, i) => (
                <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold border border-blue-100">
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-6 border-t border-gray-100">`;

content = content.replace(oldHeader, newHeader);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully updated PropertyDetails.jsx layout');
