import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const UserDashboard = () => {
  const { user } = useAuth();
  const [activeLease, setActiveLease] = useState(null);
  const [nextRent, setNextRent] = useState(null);
  const [rentHistory, setRentHistory] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refundMessage, setRefundMessage] = useState('');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    bank_name: '',
    account_number: '',
    ifsc_code: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [leaseRes, rentRes, maintenanceRes] = await Promise.all([
        axios.get('/api/leases/my-lease'),
        axios.get('/api/rent/my-rent'),
        axios.get('/api/maintenance/my-requests')
      ]);
      setActiveLease(leaseRes.data);
      setNextRent(rentRes.data);
      setMaintenanceRequests(maintenanceRes.data);

      if (leaseRes.data && leaseRes.data._id) {
        const historyRes = await axios.get(`/api/rent/lease/${leaseRes.data._id}`);
        setRentHistory(historyRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = (rent) => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(24);
      doc.setTextColor(37, 99, 235); // primary color
      doc.text('EstateFlow', 14, 25);
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Payment Receipt', 14, 35);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Receipt ID: RCPT-${String(rent._id).substring(0, 8).toUpperCase()}`, 14, 45);
      doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, 14, 50);

      // Tenant Details
      doc.setTextColor(0, 0, 0);
      doc.text('Billed To:', 14, 65);
      doc.setFontSize(11);
      doc.text(String(user?.name || 'Tenant'), 14, 72);
      doc.text(String(user?.email || ''), 14, 78);
      
      // Property Details
      if (activeLease?.property_id) {
        doc.setFontSize(10);
        doc.text('Property Details:', 120, 65);
        doc.setFontSize(11);
        doc.text(String(activeLease.property_id.name || ''), 120, 72);
        if (activeLease.unit_id) {
          doc.text(`Unit/Room: ${String(activeLease.unit_id.unit_no || '')}`, 120, 78);
        }
      }

      // Payment Details Table
      autoTable(doc, {
        startY: 90,
        head: [['Description', 'Month', 'Amount', 'Status']],
        body: [
          ['Rent Payment', String(rent.month || ''), `Rs. ${rent.paid_amount || 0}`, String(rent.status || '')],
        ],
        headStyles: { fillColor: [37, 99, 235] },
        theme: 'grid'
      });

      // Footer
      const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY : 120;
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('Thank you for your payment!', 14, finalY + 20);
      doc.text('EstateFlow Property Management System', 14, finalY + 26);

      doc.save(`EstateFlow-Receipt-${rent.month}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF receipt. Check console for details.');
    }
  };

  const handleLeaveRoom = async (e) => {
    e.preventDefault();
    if (!bankDetails.bank_name || !bankDetails.account_number || !bankDetails.ifsc_code) {
      return alert('Please fill in all bank details.');
    }
    
    try {
      const { data } = await axios.post(`/api/leases/${activeLease._id}/terminate`, bankDetails);
      setRefundMessage(data.message);
      setActiveLease(null);
      setShowRefundModal(false);
    } catch (err) {
      console.error('Failed to leave room', err);
      alert(err.response?.data?.message || 'Failed to terminate lease');
    }
  };

  // Maintenance form state
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [category, setCategory] = useState('Plumbing');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return alert('Please enter a description');
    if (!activeLease) return alert('You do not have an active lease');
    
    setIsSubmitting(true);
    try {
      await axios.post('/api/maintenance', {
        property_id: activeLease.property_id._id,
        category,
        priority: 'Medium',
        description
      });
      setDescription('');
      setShowMaintenanceForm(false);
      fetchDashboardData(); // refresh list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // This is a simplified fetch, we'd ideally fetch lease by user ID
  // But our backend MVP currently has getLeasesByProperty
  // For the sake of the MVP UI placeholder, we'll just show the user's name

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome back, {user?.name}. Manage your rentals and requests here.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Active Lease / Rent Section */}
        <div className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Current Booking Status</h2>
          
          {refundMessage && (
            <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 mb-4 font-medium">
              {refundMessage}
            </div>
          )}

          {loading ? (
            <div className="text-gray-500">Checking your booking status...</div>
          ) : activeLease ? (
            <>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-100 text-blue-700 px-3 py-1 text-xs font-bold rounded-bl-lg">
                   {nextRent ? `Due: ${new Date(nextRent.due_date).toLocaleDateString()}` : 'Fully Paid'}
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800">Monthly Rent</p>
                  <p className="text-2xl font-bold text-blue-900">₹{activeLease.rent_amount}</p>
                  {nextRent && (
                    <p className="text-xs text-blue-700 mt-1 font-medium">
                      Payment for {nextRent.month}
                    </p>
                  )}
                </div>
                {nextRent ? (
                  <button 
                    onClick={() => alert(`Redirecting to pay ₹${nextRent.due_amount} for ${nextRent.month}...`)}
                    className="bg-primary hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-bold transition-colors shadow-sm w-full sm:w-auto z-10 text-sm"
                  >
                    Pay Rent Now
                  </button>
                ) : (
                  <div className="bg-green-100 text-green-700 px-6 py-2 rounded-lg font-bold shadow-sm w-full sm:w-auto text-center">
                    All clear!
                  </div>
                )}
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between border-b border-gray-100 pb-3">
                  <span className="text-gray-500">Property</span>
                  <span className="font-bold text-gray-900">{activeLease.property_id?.name}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-3">
                  <span className="text-gray-500">Room Number</span>
                  <span className="font-bold text-primary">{activeLease.unit_id?.unit_no}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-3">
                  <span className="text-gray-500">Initial Advance Paid</span>
                  <span className="font-bold text-gray-900">₹{activeLease.deposit}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-3">
                  <span className="text-gray-500">Move-in Date</span>
                  <span className="font-medium text-gray-900">{new Date(activeLease.start_date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-3">Planning to move out? You will receive a 50% refund (₹{activeLease.deposit * 0.5}) of your initial advance deposit.</p>
                <button 
                  onClick={() => setShowRefundModal(true)}
                  className="w-full bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white px-4 py-3 rounded-lg font-bold transition-colors"
                >
                  Leave Room & Claim Refund
                </button>
              </div>

              {/* Payment History */}
              <div className="pt-6 mt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Payment History</h3>
                {rentHistory.length > 0 ? (
                  <div className="space-y-3">
                    {rentHistory.map(rent => (
                      <div key={rent._id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="font-bold text-gray-900">{rent.month}</p>
                          <p className="text-sm text-gray-500">₹{rent.rent_amount} • {rent.status}</p>
                        </div>
                        {rent.status === 'Paid' && (
                          <button 
                            onClick={() => downloadReceipt(rent)}
                            className="flex items-center gap-2 text-primary hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                          >
                            <span className="text-lg">📄</span> Download PDF
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No payment history available.</p>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏠</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Active Booking</h3>
              <p className="text-gray-500 mb-6">You don't have any active room bookings right now.</p>
              <a href="/properties" className="inline-block bg-primary text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-800 transition-colors shadow-sm text-sm">
                Browse Properties
              </a>
            </div>
          )}
        </div>

        {/* Maintenance Section */}
        <div className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Maintenance</h2>
            <button 
              onClick={() => setShowMaintenanceForm(!showMaintenanceForm)}
              className="text-primary text-sm font-medium hover:underline"
            >
              {showMaintenanceForm ? 'Cancel' : '+ New Request'}
            </button>
          </div>

          {showMaintenanceForm && (
            <form onSubmit={handleMaintenanceSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="mb-3">
                <label className="block text-sm font-semibold text-secondary mb-1">Category</label>
                <select 
                  className="w-full border border-gray-200 bg-gray-50 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>Plumbing</option>
                  <option>Electrical</option>
                  <option>Appliance</option>
                  <option>Carpentry</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-secondary mb-1">Description</label>
                <textarea 
                  className="w-full border border-gray-200 bg-gray-50 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm" 
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue..."
                  required
                ></textarea>
              </div>
              <button disabled={isSubmitting} className="bg-primary text-white px-4 py-2.5 rounded-lg font-bold w-full hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-50 text-sm">
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          )}

          <div className="space-y-4">
            {maintenanceRequests.map(req => (
              <div key={req._id} className="p-3 border rounded-lg flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">{req.description}</p>
                  <p className="text-sm text-gray-500">{req.category} • Raised {new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  req.status === 'Resolved' || req.status === 'Closed' ? 'bg-green-100 text-green-800' :
                  req.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {req.status}
                </span>
              </div>
            ))}
            {maintenanceRequests.length === 0 && (
              <p className="text-gray-500 text-sm italic">No past maintenance requests.</p>
            )}
          </div>
        </div>

      </div>

      {/* Refund Modal */}
      {showRefundModal && activeLease && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="bg-red-600 p-6 text-white text-center">
              <h2 className="text-2xl font-bold">Leave Room</h2>
              <p className="opacity-90 mt-1">Request 50% Deposit Refund (₹{activeLease.deposit * 0.5})</p>
            </div>
            <form onSubmit={handleLeaveRoom} className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Please provide your bank details. The owner will process your refund manually and you will receive an email confirmation once it is transferred.
              </p>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Bank Name</label>
                  <input type="text" required value={bankDetails.bank_name} onChange={e => setBankDetails({...bankDetails, bank_name: e.target.value})} className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="e.g. HDFC Bank" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Account Number</label>
                  <input type="text" required value={bankDetails.account_number} onChange={e => setBankDetails({...bankDetails, account_number: e.target.value})} className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="Enter account number" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">IFSC Code</label>
                  <input type="text" required value={bankDetails.ifsc_code} onChange={e => setBankDetails({...bankDetails, ifsc_code: e.target.value})} className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="e.g. HDFC0001234" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowRefundModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">
                  Confirm Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default UserDashboard;
