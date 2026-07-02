import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Mail, Phone, Home } from 'lucide-react';

const TenantList = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const { data } = await axios.get('/api/auth/tenants');
      setTenants(data);
    } catch (err) {
      console.error('Failed to fetch tenants', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTenants = tenants.filter(t => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (t.user?.name && t.user.name.toLowerCase().includes(term)) ||
      (t.user?.email && t.user.email.toLowerCase().includes(term)) ||
      (t.lease?.property_name && t.lease.property_name.toLowerCase().includes(term))
    );
  });

  if (loading) return <div className="p-6">Loading tenants...</div>;

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tenant Directory</h1>
          <p className="text-gray-600">View and manage all active tenants across your properties.</p>
        </div>
        <div className="w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by name, email, or property..."
            className="w-full sm:w-80 px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property & Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lease Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTenants.map((tenant, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {tenant.user?.name ? tenant.user.name.charAt(0).toUpperCase() : <Users size={20} />}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{tenant.user?.name}</div>
                        <div className="text-xs text-gray-500">ID: {tenant.user?._id?.substring(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <Mail size={14} className="mr-1.5 text-gray-400" /> {tenant.user?.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Phone size={14} className="mr-1.5 text-gray-400" /> {tenant.user?.phone || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm font-medium text-gray-900 mb-1">
                      <Home size={14} className="mr-1.5 text-primary" /> {tenant.lease?.property_name}
                    </div>
                    <div className="text-sm text-gray-500 ml-5">
                      Unit: <span className="font-semibold text-gray-700">{tenant.lease?.unit_no}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{new Date(tenant.lease?.start_date).toLocaleDateString()}</div>
                    <div className="text-xs mt-0.5">to {new Date(tenant.lease?.end_date).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {tenant.lease?.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredTenants.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p>No tenants found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TenantList;
