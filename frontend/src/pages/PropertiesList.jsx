import { API_URL } from '../config';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Star, Search, SlidersHorizontal, MapPin, Building2 } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Premium Hero Section */}
      <div className="bg-slate-900 text-white pt-16 pb-24 relative overflow-hidden">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
              Find Your Next <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Perfect Home.</span>
            </h1>
            <p className="text-lg text-slate-400 font-medium max-w-xl">
              Explore hand-picked properties designed for comfortable and modern living.
            </p>
          </div>
          
          {user?.role === 'Owner' && (
            <button 
              onClick={() => navigate('/owner-dashboard', { state: { openCreateForm: true } })}
              className="bg-primary/20 backdrop-blur-md border border-primary/30 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/40 transition-colors shadow-lg flex items-center gap-2"
            >
              <Building2 size={18} /> Add Property
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        
        {/* Floating Search Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-xl shadow-slate-200/50 flex flex-col sm:flex-row gap-4 mb-12 border border-slate-100">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
              <Search size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Search by location, city, state, or name..." 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all font-medium text-slate-700"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative min-w-[240px]">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
              <SlidersHorizontal size={20} />
            </div>
            <select 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all font-medium text-slate-700 appearance-none"
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
            >
              <option value="default">Sort by Default</option>
              <option value="asc">Price: Low to High</option>
              <option value="desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
          .map(property => {
            const isFull = property.total_units > 0 && property.total_units === property.occupied_units;
            return (
              <Link to={`/property/${property._id}`} key={property._id} className="block group">
                <div className="bg-white rounded-3xl shadow-sm hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] border border-slate-100 hover:border-blue-100 overflow-hidden transition-all duration-300 hover:-translate-y-2 h-full flex flex-col">
                  
                  {/* Image Section - 4:3 Aspect Ratio */}
                  <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                    {property.images && property.images.length > 0 ? (
                      <img src={`${API_URL}${property.images[0]}`} alt={property.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-200 font-medium">
                        No Image
                      </div>
                    )}
                    
                    {/* Dark gradient at the bottom for contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/0 to-slate-900/0 pointer-events-none"></div>

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                      <span className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg backdrop-blur-md border border-white/20 ${
                        isFull 
                          ? 'bg-red-500/90 text-white'
                          : property.status === 'Available' ? 'bg-green-500/90 text-white' : 'bg-blue-500/90 text-white'
                      }`}>
                        {isFull ? 'Sold Out' : property.status}
                      </span>

                      {property.average_rating > 0 && (
                        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md text-white px-3 py-1.5 rounded-xl border border-white/10 shadow-lg">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-xs">{property.average_rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Price Tag over image */}
                    <div className="absolute bottom-4 left-4 text-white">
                      <div className="text-2xl font-black tracking-tight drop-shadow-md">
                        ₹{property.rent_amount}
                        <span className="text-sm font-medium text-white/80 ml-1">{property.type === 'DailyRoom' ? '/day' : '/mo'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors line-clamp-1">{property.name}</h3>
                      <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-4">
                        <MapPin size={16} className="text-slate-400 flex-shrink-0" />
                        <span className="line-clamp-1">{property.address}, {property.city}</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-medium text-slate-600">
                      <span>{property.type === 'DailyRoom' ? 'Hotel/Daily Room' : 'PG/Apartment'}</span>
                      <span className="text-primary group-hover:translate-x-1 transition-transform">View Details →</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
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
    </div>
  );
};
export default PropertiesList;
