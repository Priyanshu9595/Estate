import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, Edit, Trash2, Users } from 'lucide-react';

const AdminList = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  
  // Admin Creation State
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Editing State
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editAdminForm, setEditAdminForm] = useState({ name: '', email: '', phone: '', password: '', status: 'Active' });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const { data } = await axios.get('/api/auth/admins');
      setAdmins(data);
    } catch (err) {
      console.error('Failed to fetch admins', err);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const { data } = await axios.post('/api/auth/create-admin', {
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        phone: adminPhone,
      });
      setMessage(data.message);
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');
      setAdminPhone('');
      fetchAdmins(); // Refresh admin list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create admin');
    }
  };

  const openEditAdminModal = (admin) => {
    setEditingAdmin(admin);
    setEditAdminForm({
      name: admin.name,
      email: admin.email,
      phone: admin.phone || '',
      password: '',
      status: admin.status || 'Active'
    });
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...editAdminForm };
      if (!payload.password) delete payload.password;
      await axios.put(`/api/auth/admins/${editingAdmin._id}`, payload);
      setEditingAdmin(null);
      fetchAdmins();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update admin');
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm('Are you sure you want to delete this admin? They will be unassigned from all their properties.')) return;
    try {
      await axios.delete(`/api/auth/admins/${id}`);
      fetchAdmins();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete admin');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
          <p className="text-gray-600">Create, view, and manage your admins.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Create Admin Form */}
        <div className="xl:col-span-1 bg-surface p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Create Admin Account</h2>
          {message && <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4 text-sm">{message}</div>}
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">{error}</div>}

          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input type="text" placeholder="Full Name" required value={adminName} onChange={(e) => setAdminName(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input type="email" placeholder="Email Address" required value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input type="password" placeholder="Password" required value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input type="tel" placeholder="Phone Number" required value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" />
            </div>
            <button type="submit" className="w-full bg-primary text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors">
              Create Admin
            </button>
          </form>
        </div>

        {/* Manage Admins List */}
        <div className="xl:col-span-2">
          <div className="bg-surface rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full">
            <h2 className="text-xl font-bold text-gray-900 p-6 border-b border-gray-100">Manage Admins</h2>
            {admins.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No admins created yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Admin Details</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned Hostels</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {admins.map(admin => (
                      <tr key={admin._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-gray-900">{admin.name}</div>
                          <div className="text-sm text-gray-500">{admin.email}</div>
                          <div className="text-sm text-gray-500">{admin.phone}</div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${admin.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {admin.status === 'Active' ? 'Working' : 'Not Working'}
                          </span>
                        </td>
                        <td className="p-4">
                          {admin.assigned_properties && admin.assigned_properties.length > 0 ? (
                            <ul className="list-disc list-inside text-sm text-gray-700">
                              {admin.assigned_properties.map(p => (
                                <li key={p._id}>{p.name}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-sm text-gray-400 italic">No assigned hostels</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => openEditAdminModal(admin)} className="text-primary hover:text-blue-700 p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors mr-2">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteAdmin(admin._id)} className="text-red-600 hover:text-red-700 p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Admin Modal */}
      {editingAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Edit Admin</h3>
              <button onClick={() => setEditingAdmin(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleUpdateAdmin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Name</label>
                  <input type="text" required value={editAdminForm.name} onChange={e => setEditAdminForm({...editAdminForm, name: e.target.value})} className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
                  <input type="email" required value={editAdminForm.email} onChange={e => setEditAdminForm({...editAdminForm, email: e.target.value})} className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Phone</label>
                  <input type="tel" required value={editAdminForm.phone} onChange={e => setEditAdminForm({...editAdminForm, phone: e.target.value})} className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">New Password (Optional)</label>
                  <input type="password" placeholder="Leave empty to keep current" value={editAdminForm.password} onChange={e => setEditAdminForm({...editAdminForm, password: e.target.value})} className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Status</label>
                  <select value={editAdminForm.status} onChange={e => setEditAdminForm({...editAdminForm, status: e.target.value})} className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary">
                    <option value="Active">Working (Active)</option>
                    <option value="Inactive">Not Working (Inactive)</option>
                  </select>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setEditingAdmin(null)} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminList;
