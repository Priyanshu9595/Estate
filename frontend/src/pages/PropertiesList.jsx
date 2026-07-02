import { API_URL } from '../config';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PropertiesList = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('default');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data } = await axios.get('/api/properties');
        setProperties(data);
      } catch (error) {
        console.error('Failed to fetch properties', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  if (loading) return <div className="p-6">Loading properties...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
        {user?.role === 'Owner' && (
          <button 
            onClick={() => navigate('/owner-dashboard', { state: { openCreateForm: true } })}
            className="bg-primary text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-800 transition-colors shadow-sm"
          >
            Add Property
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input 
          type="text" 
          placeholder="Search by location, city, state, or name..." 
          className="flex-1 px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select 
          className="px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-primary min-w-[200px] text-sm"
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value)}
        >
          <option value="default">Sort by Default</option>
          <option value="asc">Price: Low to High</option>
          <option value="desc">Price: High to Low</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties
          .filter(p => {
            if (!searchTerm) return true;
            const term = searchTerm.toLowerCase();
            return (p.city && p.city.toLowerCase().includes(term)) || 
                   (p.address && p.address.toLowerCase().includes(term)) || 
                   (p.name && p.name.toLowerCase().includes(term)) ||
                   (p.state && p.state.toLowerCase().includes(term));
          })
          .sort((a, b) => {
            if (sortOrder === 'asc') return a.rent_amount - b.rent_amount;
            if (sortOrder === 'desc') return b.rent_amount - a.rent_amount;
            return 0;
          })
          .map(property => (
          <Link to={`/property/${property._id}`} key={property._id} className="block group">
            <div className="bg-surface rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow h-full">
              <div className="h-48 bg-gray-200 overflow-hidden relative">
                {property.images && property.images.length > 0 ? (
                  <img src={`${API_URL}${property.images[0]}`} alt={property.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">{property.name}</h3>
                <p className="text-gray-500 text-sm mt-1">{property.address}, {property.city}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    (property.total_units > 0 && property.total_units === property.occupied_units) 
                      ? 'bg-red-100 text-red-800'
                      : property.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {(property.total_units > 0 && property.total_units === property.occupied_units) ? 'Full' : property.status}
                  </span>
                  <span className="font-bold text-primary">₹{property.rent_amount}/mo</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
        {properties.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 py-10">No properties available.</p>
        ) : properties.filter(p => {
            if (!searchTerm) return true;
            const term = searchTerm.toLowerCase();
            return (p.city && p.city.toLowerCase().includes(term)) || 
                   (p.address && p.address.toLowerCase().includes(term)) || 
                   (p.name && p.name.toLowerCase().includes(term)) ||
                   (p.state && p.state.toLowerCase().includes(term));
          }).length === 0 ? (
          <p className="col-span-full text-center text-gray-500 py-10">No properties match your search.</p>
        ) : null}
      </div>
    </div>
  );
};
export default PropertiesList;
