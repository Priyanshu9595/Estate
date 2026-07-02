import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Wrench } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [expiringLeases, setExpiringLeases] = useState([]);

  // Resolve Modal State
  const [resolvingReq, setResolvingReq] = useState(null);
  const [resolveData, setResolveData] = useState({ cost: '', technician_name: '', repair_notes: '' });
  
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [propRes, maintRes, leaseRes] = await Promise.all([
        axios.get('/api/properties'),
        axios.get('/api/maintenance/admin-requests'),
        axios.get('/api/leases/expiring')
      ]);
      setProperties(propRes.data);
      setMaintenance(maintRes.data);
      setExpiringLeases(leaseRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (reqId, newStatus) => {
    if (newStatus === 'Resolved') {
      const req = maintenance.find(m => m._id === reqId);
      setResolvingReq(req);
      setResolveData({ cost: '', technician_name: '', repair_notes: '' });
      return; // Stop here, modal will handle the rest
    }
    
    try {
      await axios.put(`/api/maintenance/${reqId}/status`, { status: newStatus });
      fetchDashboardData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/maintenance/${resolvingReq._id}/status`, { 
        status: 'Resolved',
        cost: Number(resolveData.cost),
        technician_name: resolveData.technician_name,
        repair_notes: resolveData.repair_notes
      });
      setResolvingReq(null);
      fetchDashboardData();
    } catch (err) {
      alert('Failed to resolve request');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Managing properties assigned to {user?.name}</p>
        </div>
      </div>

      {expiringLeases.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-r-lg shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400 text-xl font-bold">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-bold text-yellow-800">
                Action Required: {expiringLeases.length} lease(s) expiring within 30 days
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc pl-5 space-y-1">
                  {expiringLeases.map(lease => (
                    <li key={lease._id}>
                      <strong>{lease.user_id?.name}</strong> at {lease.property_id?.name} (Room {lease.unit_id?.unit_no}) - Expires on {new Date(lease.end_date).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-4">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Assigned Properties</h3>
          <p className="text-4xl font-bold text-blue-900 mt-2">{properties.length}</p>
        </div>
        <div className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4">
            <Wrench className="w-6 h-6" />
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Pending Maintenance</h3>
          <p className="text-4xl font-bold text-red-500 mt-2">{maintenance.filter(m => m.status === 'Open' || m.status === 'In Progress').length}</p>
        </div>
      </div>

      {/* Maintenance Section for Admin */}
      <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Maintenance Requests</h2>
      <div className="bg-surface rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {maintenance.map(req => (
              <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{req.description}</p>
                  <p className="text-xs text-gray-500">{req.category} • {new Date(req.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{req.property_id?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  <p className="font-medium">{req.user_id?.name}</p>
                  <p className="text-xs">Room: {req.user_id?.unit_no || 'N/A'}</p>
                  <p className="text-xs">{req.user_id?.phone}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    req.status === 'Resolved' ? 'bg-green-100 text-green-800' : 
                    req.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <select 
                    className="border border-gray-300 rounded p-1 text-sm bg-white"
                    value={req.status}
                    onChange={(e) => handleStatusChange(req._id, e.target.value)}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </td>
              </tr>
            ))}
            {maintenance.length === 0 && (
              <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No maintenance requests yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Resolve Modal */}
      {resolvingReq && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Resolve Maintenance Issue</h2>
              <p className="text-sm text-gray-500 mt-1">{resolvingReq.description}</p>
            </div>
            <form onSubmit={handleResolveSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technician Name / Who fixed it?</label>
                <input type="text" required value={resolveData.technician_name} onChange={e => setResolveData({...resolveData, technician_name: e.target.value})} className="w-full border border-gray-200 bg-gray-50 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="e.g. Ramesh Plumbing" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost (₹)</label>
                <input type="number" required value={resolveData.cost} onChange={e => setResolveData({...resolveData, cost: e.target.value})} className="w-full border border-gray-200 bg-gray-50 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="e.g. 500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Repair Notes & Details</label>
                <textarea required value={resolveData.repair_notes} onChange={e => setResolveData({...resolveData, repair_notes: e.target.value})} className="w-full border border-gray-200 bg-gray-50 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm" rows="3" placeholder="Explain what was fixed..."></textarea>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setResolvingReq(null)} className="flex-1 border border-gray-200 px-4 py-2.5 rounded-lg font-bold text-gray-700 hover:bg-gray-50 text-sm">Cancel</button>
                <button type="submit" className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-green-700 shadow-sm text-sm">Mark Resolved</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-900 mb-4">Managed Properties</h2>
      <div className="bg-surface rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rent</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rooms (T/O/V)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {properties.map(p => (
              <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-primary">
                  <Link to={`/property/${p._id}`} className="hover:underline flex items-center gap-2">
                    {p.name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{p.city}, {p.state}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">₹{p.rent_amount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                  <span className="font-bold text-gray-700">{p.total_units || 0}</span> /
                  <span className="font-bold text-blue-600 ml-1">{p.occupied_units || 0}</span> /
                  <span className="font-bold text-green-600 ml-1">{(p.total_units || 0) - (p.occupied_units || 0)}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
            {properties.length === 0 && (
              <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No properties assigned yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AdminDashboard;
