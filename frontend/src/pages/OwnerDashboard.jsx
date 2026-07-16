import { API_URL } from '../config';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { Building2, DollarSign, Shield, Wrench, Edit, Trash2, User, Mail, Lock, Phone, Megaphone } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const OwnerDashboard = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [expiringLeases, setExpiringLeases] = useState([]);
  const [pendingRefunds, setPendingRefunds] = useState([]);
  
  // Admin Creation State
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Notice Creation State
  const [noticePropertyId, setNoticePropertyId] = useState('');
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeMsg, setNoticeMsg] = useState('');
  const [noticeErr, setNoticeErr] = useState('');

  // Modal State for Stats
  const [activeModal, setActiveModal] = useState(null);

  // Maintenance Expenses State
  const [expenses, setExpenses] = useState([]);

  // Property Creation State
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState(null);
  const [propMessage, setPropMessage] = useState('');
  const [propError, setPropError] = useState('');
  const [newProperty, setNewProperty] = useState({
    name: '',
    type: 'Apartment',
    address: '',
    city: '',
    state: '',
    rent_amount: '',
    deposit_amount: '',
    assigned_admin_id: '',
    rooms: '',
    images: [],
    imageFile: null
  });

  useEffect(() => {
    fetchProperties();
    fetchAdmins();
    fetchExpenses();
    fetchExpiringLeases();
    fetchPendingRefunds();
  }, []);

  const fetchPendingRefunds = async () => {
    try {
      const { data } = await axios.get('/api/leases/refunds/pending');
      setPendingRefunds(data);
    } catch (err) {
      console.error('Failed to fetch pending refunds', err);
    }
  };

  const fetchExpiringLeases = async () => {
    try {
      const { data } = await axios.get('/api/leases/expiring');
      setExpiringLeases(data);
    } catch (err) {
      console.error('Failed to fetch expiring leases', err);
    }
  };

  useEffect(() => {
    if (location.state?.openCreateForm) {
      setShowPropertyForm(true);
      setTimeout(() => {
        window.scrollTo({ top: 400, behavior: 'smooth' });
      }, 100);
      // Clean up the state so it doesn't re-trigger on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchExpenses = async () => {
    try {
      const { data } = await axios.get('/api/maintenance/all-requests');
      setExpenses(data);
    } catch (err) {
      console.error('Failed to fetch expenses', err);
    }
  };

  const fetchProperties = async () => {
    try {
      const { data } = await axios.get('/api/properties');
      setProperties(data);
    } catch (err) {
      console.error('Failed to fetch properties', err);
    }
  };

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

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    setNoticeMsg('');
    setNoticeErr('');
    try {
      await axios.post('/api/notices', {
        property_id: noticePropertyId,
        title: noticeTitle,
        content: noticeContent
      });
      setNoticeMsg('Notice broadcasted successfully!');
      setNoticeTitle('');
      setNoticeContent('');
      setNoticePropertyId('');
    } catch (err) {
      setNoticeErr(err.response?.data?.message || 'Failed to send notice');
    }
  };

  const handleCreateProperty = async (e) => {
    e.preventDefault();
    setPropMessage('');
    setPropError('');
    try {
      if (!newProperty.assigned_admin_id) {
        setPropError('Please assign an Admin to this property.');
        return;
      }
      
      let uploadedImages = [...(newProperty.images || [])];
      
      if (newProperty.imageFiles && newProperty.imageFiles.length > 0) {
        const formData = new FormData();
        Array.from(newProperty.imageFiles).forEach(file => {
          if (file) formData.append('property_images', file);
        });
        const uploadRes = await axios.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (uploadRes.data.fileUrls?.property_images) {
          uploadedImages.push(...uploadRes.data.fileUrls.property_images);
        }
      }
      
      const payload = { ...newProperty, images: uploadedImages };
      
      if (editingPropertyId) {
        // Update existing property
        const { data } = await axios.put(`/api/properties/${editingPropertyId}`, payload);
        setPropMessage(`Property "${data.name}" updated successfully!`);
      } else {
        // Create new property
        const { data } = await axios.post('/api/properties', payload);
        setPropMessage(`Property "${data.name}" created successfully!`);
      }
      
      setShowPropertyForm(false);
      setEditingPropertyId(null);
      setNewProperty({ name: '', type: 'Apartment', address: '', city: '', state: '', rent_amount: '', deposit_amount: '', assigned_admin_id: '', rooms: '', images: [], imageFiles: [], description: '', amenities: '' });
      fetchProperties();
    } catch (err) {
      setPropError(err.response?.data?.message || 'Failed to save property');
    }
  };

  const handleEditProperty = async (property) => {
    setEditingPropertyId(property._id);
    setNewProperty({
      name: property.name,
      type: property.type,
      address: property.address,
      city: property.city,
      state: property.state,
      rent_amount: property.rent_amount,
      deposit_amount: property.deposit_amount,
      assigned_admin_id: property.assigned_admin_id,
      rooms: 'Loading rooms...',
      images: property.images || [],
      imageFiles: [],
      description: property.description || '',
      amenities: property.amenities ? property.amenities.join(', ') : ''
    });
    setShowPropertyForm(true);
    window.scrollTo({ top: 500, behavior: 'smooth' });

    try {
      const { data } = await axios.get(`/api/properties/${property._id}`);
      setNewProperty(prev => ({ ...prev, rooms: data.units.length }));
    } catch (err) {
      setPropError('Failed to load existing rooms');
      setNewProperty(prev => ({ ...prev, rooms: 0 }));
    }
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property? This will also delete all associated rooms.')) return;
    
    setPropMessage('');
    setPropError('');
    try {
      await axios.delete(`/api/properties/${id}`);
      setPropMessage('Property deleted successfully!');
      fetchProperties();
    } catch (err) {
      setPropError(err.response?.data?.message || 'Failed to delete property');
    }
  };

  const handleProcessRefund = async (leaseId) => {
    if (!window.confirm('Are you sure you want to mark this refund as paid? This will notify the tenant via email.')) return;
    try {
      await axios.post(`/api/leases/${leaseId}/process-refund`);
      alert('Refund processed successfully!');
      fetchPendingRefunds();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process refund');
    }
  };

  // Prepare Chart Data
  const revenueData = properties.map(p => ({
    name: p.name,
    Revenue: p.active_revenue || 0,
    Potential: (p.rent_amount * (p.total_units || 0)) || 0
  }));

  const totalOccupied = properties.reduce((acc, p) => acc + (p.occupied_units || 0), 0);
  const totalVacant = properties.reduce((acc, p) => acc + ((p.total_units || 0) - (p.occupied_units || 0)), 0);
  
  const occupancyData = [
    { name: 'Occupied', value: totalOccupied },
    { name: 'Vacant', value: totalVacant }
  ];
  const COLORS = ['#3b82f6', '#22c55e']; // blue-500, green-500

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Owner Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome back, {user?.name}. Here is an overview of your portfolio.</p>

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

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8 items-start">
        {/* Stats Column */}
        <div className="xl:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-start">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-4">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Total Properties</h3>
            <p className="text-4xl font-bold text-blue-900 mt-2">{properties.length}</p>
          </div>
          <div 
            onClick={() => setActiveModal('revenue')}
            className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-start cursor-pointer hover:ring-2 hover:ring-green-100 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-4">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Active Revenue (Monthly)</h3>
            <p className="text-4xl font-bold text-green-500 mt-2">
              ₹{properties.reduce((acc, curr) => acc + (curr.active_revenue || 0), 0).toLocaleString('en-IN')}
            </p>
          </div>
          <div 
            onClick={() => setActiveModal('deposits')}
            className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-start cursor-pointer hover:ring-2 hover:ring-purple-100 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Security Deposits (Advances) Held</h3>
            <p className="text-4xl font-bold text-purple-500 mt-2">
              ₹{properties.reduce((acc, curr) => acc + (curr.total_advance || 0), 0).toLocaleString('en-IN')}
            </p>
          </div>
          <div 
            onClick={() => setActiveModal('maintenance')}
            className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-start cursor-pointer hover:ring-2 hover:ring-red-100 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Total Maintenance Expenses</h3>
            <p className="text-4xl font-bold text-red-500 mt-2">
              ₹{expenses.reduce((acc, curr) => acc + (curr.cost || 0), 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Create Admin Form */}
        <div className="xl:col-span-1 bg-surface p-6 rounded-xl shadow-sm border border-gray-100">
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
      </div>

      {/* Analytics & Charts Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics Overview</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Chart */}
          <div className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue by Property</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, undefined]}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  <Bar dataKey="Potential" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Occupancy Chart */}
          <div className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Overall Occupancy Rate</h3>
            <div className="h-[300px] w-full flex items-center justify-center relative">
              {totalOccupied === 0 && totalVacant === 0 ? (
                <p className="text-gray-500">No rooms available</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={occupancyData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {occupancyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                    <span className="text-3xl font-extrabold text-gray-900">
                      {Math.round((totalOccupied / (totalOccupied + totalVacant)) * 100) || 0}%
                    </span>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Occupied</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Manage Buildings</h2>
        <button 
          onClick={() => {
            setShowPropertyForm(!showPropertyForm);
            if (showPropertyForm) {
              setEditingPropertyId(null);
              setNewProperty({ name: '', type: 'Apartment', address: '', city: '', state: '', rent_amount: '', deposit_amount: '', assigned_admin_id: '', rooms: '', images: [], imageFile: null });
            }
          }}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          {showPropertyForm ? 'Cancel' : '+ Add New Building'}
        </button>
      </div>

      {/* Broadcast Notice Form */}
      <div className="bg-yellow-50 rounded-xl shadow-sm border border-yellow-100 overflow-hidden mb-8 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="w-6 h-6 text-yellow-600" />
          <h3 className="text-lg font-bold text-gray-900">Broadcast Notice to Tenants</h3>
        </div>
        {noticeMsg && <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4 text-sm font-medium">{noticeMsg}</div>}
        {noticeErr && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm font-medium">{noticeErr}</div>}
        <form onSubmit={handleCreateNotice} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <select required value={noticePropertyId} onChange={e => setNoticePropertyId(e.target.value)} className="w-full border border-gray-300 p-2 rounded-lg text-sm bg-white">
              <option value="">Select Property...</option>
              {properties.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <input type="text" placeholder="Notice Title (e.g., Water Supply Cut)" required value={noticeTitle} onChange={e => setNoticeTitle(e.target.value)} className="w-full border border-gray-300 p-2 rounded-lg text-sm bg-white" />
          </div>
          <div className="md:col-span-3">
            <textarea rows="2" placeholder="Write your notice here..." required value={noticeContent} onChange={e => setNoticeContent(e.target.value)} className="w-full border border-gray-300 p-2 rounded-lg text-sm bg-white" />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button type="submit" className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors">
              Send Broadcast
            </button>
          </div>
        </form>
      </div>

      {propMessage && <div className="bg-green-50 text-green-600 p-4 rounded-md mb-6">{propMessage}</div>}
      {propError && <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">{propError}</div>}

      {showPropertyForm && (
        <div className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h3 className="text-xl font-bold mb-6 border-b pb-2">{editingPropertyId ? 'Edit Building' : 'Building Setup'}</h3>
          <form onSubmit={handleCreateProperty} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Building Name</label>
              <input type="text" required value={newProperty.name} onChange={e => setNewProperty({...newProperty, name: e.target.value})} className="w-full border p-2 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Building Type</label>
              <select value={newProperty.type} onChange={e => setNewProperty({...newProperty, type: e.target.value})} className="w-full border p-2 rounded-lg">
                <option>Apartment</option>
                <option>House</option>
                <option>Commercial</option>
                <option>PG</option>
                <option>Flat</option>
                <option>DailyRoom</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Address</label>
              <input type="text" required value={newProperty.address} onChange={e => setNewProperty({...newProperty, address: e.target.value})} className="w-full border p-2 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input type="text" required value={newProperty.city} onChange={e => setNewProperty({...newProperty, city: e.target.value})} className="w-full border p-2 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <input type="text" required value={newProperty.state} onChange={e => setNewProperty({...newProperty, state: e.target.value})} className="w-full border p-2 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Base Rent Amount (₹)</label>
              <input type="number" required value={newProperty.rent_amount} onChange={e => setNewProperty({...newProperty, rent_amount: e.target.value})} className="w-full border p-2 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Deposit Amount (₹)</label>
              <input type="number" required value={newProperty.deposit_amount} onChange={e => setNewProperty({...newProperty, deposit_amount: e.target.value})} className="w-full border p-2 rounded-lg" />
            </div>
            <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <label className="block text-sm font-bold text-blue-900 mb-1">Assign Admin</label>
              <select required value={newProperty.assigned_admin_id} onChange={e => setNewProperty({...newProperty, assigned_admin_id: e.target.value})} className="w-full border p-2 rounded-lg">
                <option value="">-- Select an Admin --</option>
                {admins.filter(admin => {
                  const assignedAdminIds = properties.map(p => p.assigned_admin_id?._id || p.assigned_admin_id);
                  return !assignedAdminIds.includes(admin._id) || admin._id === newProperty.assigned_admin_id;
                }).map(admin => (
                  <option key={admin._id} value={admin._id}>{admin.name} ({admin.email})</option>
                ))}
              </select>
              {admins.length === 0 && <p className="text-xs text-red-500 mt-1">Please create an Admin first before adding a building!</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Total Number of Rooms</label>
              <p className="text-xs text-gray-500 mb-2">Example: Entering 50 will create rooms 101 through 150</p>
              <input type="number" min="1" required value={newProperty.rooms} onChange={e => setNewProperty({...newProperty, rooms: e.target.value})} className="w-full border p-2 rounded-lg" placeholder="e.g. 50" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea rows="3" value={newProperty.description || ''} onChange={e => setNewProperty({...newProperty, description: e.target.value})} className="w-full border p-2 rounded-lg" placeholder="Enter property details, nearby landmarks, etc." />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Facilities / Amenities (comma separated)</label>
              <input type="text" value={newProperty.amenities || ''} onChange={e => setNewProperty({...newProperty, amenities: e.target.value})} className="w-full border p-2 rounded-lg" placeholder="e.g. WiFi, AC, TV, Geyser, Power Backup" />
            </div>
            <div className="md:col-span-2 border border-gray-200 rounded-lg p-4 bg-gray-50">
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
                      <img key={i} src={`${API_URL}${img}`} alt="Property" className="h-24 w-36 object-cover rounded-lg shadow-sm shrink-0 border" />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button type="submit" className="md:col-span-2 bg-accent text-white py-3 rounded-lg font-bold hover:bg-sky-500 transition-colors shadow-md">
              {editingPropertyId ? 'Update Building Details' : 'Create Building & Assign Admin'}
            </button>
          </form>
        </div>
      )}

      {/* List Properties Table */}
      <div className="bg-surface rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Building Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Rent</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rooms (T/O/V)</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {properties.map(p => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-500">{p.city}, {p.state}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-500">₹{p.rent_amount}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                    <span className="font-bold text-gray-700">{p.total_units || 0}</span> /
                    <span className="font-bold text-blue-600 ml-1">{p.occupied_units || 0}</span> /
                    <span className="font-bold text-green-600 ml-1">{(p.total_units || 0) - (p.occupied_units || 0)}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right font-bold text-green-600">₹{p.active_revenue || 0}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => handleEditProperty(p)} 
                        className="inline-flex items-center gap-1 border border-blue-500 text-blue-500 px-3 py-1 rounded-md text-xs font-semibold hover:bg-blue-50 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteProperty(p._id)} 
                        className="inline-flex items-center gap-1 border border-red-500 text-red-500 px-3 py-1 rounded-md text-xs font-semibold hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {properties.length === 0 && (
                <tr><td colSpan="6" className="px-4 py-4 text-center text-gray-500">No buildings created yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Maintenance Expenses Table */}
      <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-12">Maintenance Expenses Breakdown</h2>
      <div className="bg-surface rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property & Room</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason / Issue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technician</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cost (₹)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {expenses.filter(e => e.status === 'Resolved' && e.cost > 0).map(exp => (
              <tr key={exp._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(exp.updatedAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  <p className="font-medium">{exp.property_id?.name}</p>
                  <p className="text-xs text-gray-500">Room: {exp.user_id?.unit_no || 'N/A'}</p>
                </td>
                <td className="px-6 py-4 text-gray-700">
                  <p className="text-sm font-medium">{exp.description}</p>
                  <p className="text-xs text-gray-500">Notes: {exp.repair_notes}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exp.technician_name || 'Unknown'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-red-600">₹{exp.cost}</td>
              </tr>
            ))}
            {expenses.filter(e => e.status === 'Resolved' && e.cost > 0).length === 0 && (
              <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No expenses recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pending Refunds Table */}
      {pendingRefunds.length > 0 && (
        <>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-12">Pending Refund Requests</h2>
          <div className="bg-surface rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-red-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-red-700 uppercase tracking-wider">Tenant</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-red-700 uppercase tracking-wider">Property & Room</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-red-700 uppercase tracking-wider">Bank Details</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-red-700 uppercase tracking-wider">Refund Amount</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-red-700 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingRefunds.map(refund => (
                  <tr key={refund._id} className="hover:bg-red-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                      {refund.user_id?.name} <br/>
                      <span className="text-xs text-gray-500 font-normal">{refund.user_id?.phone}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      <p className="font-medium">{refund.property_id?.name}</p>
                      <p className="text-xs text-gray-500">Room: {refund.unit_id?.unit_no}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      <p className="text-sm font-bold">{refund.bank_details?.bank_name}</p>
                      <p className="text-xs text-gray-600">A/C: {refund.bank_details?.account_number}</p>
                      <p className="text-xs text-gray-600">IFSC: {refund.bank_details?.ifsc_code}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-black text-red-600">
                      ₹{refund.refund_amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => handleProcessRefund(refund._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
                      >
                        Mark as Paid
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Stat Modals */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setActiveModal(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {activeModal === 'revenue' && 'Active Revenue Breakdown'}
                {activeModal === 'deposits' && 'Security Deposits Breakdown'}
                {activeModal === 'maintenance' && 'Maintenance Expenses Breakdown'}
              </h2>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {activeModal === 'revenue' && (
                <ul className="space-y-4">
                  {properties.filter(p => p.active_revenue > 0).map(p => (
                    <li key={p._id} className="flex justify-between items-center pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                      <div>
                        <p className="font-semibold text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.occupied_units} Room(s) Occupied</p>
                      </div>
                      <p className="font-bold text-green-600 text-lg">₹{p.active_revenue.toLocaleString('en-IN')}</p>
                    </li>
                  ))}
                  {properties.filter(p => p.active_revenue > 0).length === 0 && <p className="text-gray-500 text-center py-4">No active revenue yet.</p>}
                </ul>
              )}
              {activeModal === 'deposits' && (
                <ul className="space-y-4">
                  {properties.filter(p => p.total_advance > 0).map(p => (
                    <li key={p._id} className="flex justify-between items-center pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                      <div>
                        <p className="font-semibold text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-500">Advances from active leases</p>
                      </div>
                      <p className="font-bold text-purple-600 text-lg">₹{p.total_advance.toLocaleString('en-IN')}</p>
                    </li>
                  ))}
                  {properties.filter(p => p.total_advance > 0).length === 0 && <p className="text-gray-500 text-center py-4">No security deposits held yet.</p>}
                </ul>
              )}
              {activeModal === 'maintenance' && (
                <ul className="space-y-4">
                  {expenses.filter(e => e.status === 'Resolved' && e.cost > 0).map(e => (
                    <li key={e._id} className="flex justify-between items-center pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                      <div>
                        <p className="font-semibold text-gray-800">{e.property_id?.name || 'Unknown Property'}</p>
                        <p className="text-xs text-gray-500">{e.description} • {e.technician_name}</p>
                      </div>
                      <p className="font-bold text-red-600 text-lg">₹{e.cost.toLocaleString('en-IN')}</p>
                    </li>
                  ))}
                  {expenses.filter(e => e.status === 'Resolved' && e.cost > 0).length === 0 && <p className="text-gray-500 text-center py-4">No expenses recorded yet.</p>}
                </ul>
              )}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default OwnerDashboard;
