import { API_URL } from '../config';
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building2, MapPin, IndianRupee, ArrowLeft, CheckCircle2, User, Phone, Mail, FileText, Calendar, X, PenTool } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SignatureCanvas from 'react-signature-canvas';
import { useRef } from 'react';
import { generateLeasePDF } from '../utils/leaseGenerator';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasActiveLease, setHasActiveLease] = useState(false);
  
  // Booking Modal State
  const [bookingUnit, setBookingUnit] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingDates, setBookingDates] = useState({ start_date: '', end_date: '' });
  
  // Tenant Details Modal State
  const [viewingTenantUnit, setViewingTenantUnit] = useState(null);
  
  // KYC & Signature State
  const [bookingStep, setBookingStep] = useState(1); // 1: KYC, 2: Signature, 3: Payment
  const sigPad = useRef({});
  const [signatureData, setSignatureData] = useState(null);
  const [numberOfPersons, setNumberOfPersons] = useState('');
  const [kycData, setKycData] = useState([{
    phone: user?.phone || '',
    address: user?.address || '',
    photo: null,
    aadhaar: null,
    company_id: null
  }]);

  const handlePersonCountChange = (count) => {
    if (count === '') {
      setNumberOfPersons('');
      setKycData(prev => prev.slice(0, 1));
      return;
    }
    const newCount = Math.max(1, parseInt(count) || 1);
    setNumberOfPersons(newCount);
    
    setKycData(prev => {
      if (newCount > prev.length) {
        const additional = Array(newCount - prev.length).fill().map(() => ({
          phone: '', address: '', photo: null, aadhaar: null, company_id: null
        }));
        return [...prev, ...additional];
      } else {
        return prev.slice(0, newCount);
      }
    });
  };

  useEffect(() => {
    fetchPropertyData();
  }, [id]);

  const calculateDailyAmount = (rentAmount) => {
    if (!bookingDates.start_date || !bookingDates.end_date) return 0;
    const diffTime = Math.abs(new Date(bookingDates.end_date) - new Date(bookingDates.start_date));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays * rentAmount : rentAmount;
  };

  const calculateProratedRent = (rentAmount) => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysRemaining = daysInMonth - today.getDate() + 1;
    return {
      amount: Math.round(daysRemaining * (rentAmount / daysInMonth)),
      days: daysRemaining,
      totalDays: daysInMonth
    };
  };

  const fetchPropertyData = async () => {
    try {
      const response = await axios.get(`/api/properties/${id}`);
      setData(response.data);

      if (user?.role === 'User') {
        const leaseRes = await axios.get('/api/leases/my-lease');
        if (leaseRes.data && leaseRes.data._id) {
          setHasActiveLease(true);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch property details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading property details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!data) return <div className="p-8 text-center text-gray-500">Property not found</div>;

  const { property, units } = data;

  const handleKycNext = (e) => {
    e.preventDefault();
    if (property.type === 'DailyRoom' && (!bookingDates.start_date || !bookingDates.end_date)) {
      setBookingError('Please select check-in and check-out dates.');
      return;
    }
    for (let i = 0; i < kycData.length; i++) {
      const p = kycData[i];
      if (!p.phone || !p.address || !p.photo || !p.aadhaar || !p.company_id) {
        setBookingError(`Please fill all fields and select all documents for Person ${i + 1}.`);
        return;
      }
      if (p.phone.length !== 10) {
        setBookingError(`Phone number for Person ${i + 1} must be exactly 10 digits.`);
        return;
      }
    }
    setBookingError('');
    setBookingStep(2);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBookRoom = async () => {
    setBookingLoading(true);
    setBookingError('');
    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Razorpay SDK failed to load. Are you online?');
      }

      let amount = 0;
      if (property.type === 'DailyRoom') {
        amount = calculateDailyAmount(bookingUnit.rent_amount) + (property.deposit_amount || 0);
      } else {
        const proratedRentObj = calculateProratedRent(bookingUnit.rent_amount);
        amount = proratedRentObj.amount + property.deposit_amount;
      }
      
      // 1. Razorpay Order Creation
      const orderRes = await axios.post('/api/payments/create-order', { amount });
      
      if (!orderRes.data.id) {
         throw new Error('Order creation failed. Check backend Razorpay keys.');
      }

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: orderRes.data.key_id, // Dynamically use the key loaded from backend .env
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        name: 'EstateFlow',
        description: `Booking for ${property.name} - Room ${bookingUnit.unit_no}`,
        order_id: orderRes.data.id,
        handler: async function (response) {
          try {
            setBookingLoading(true); // Re-enable loading during verify
            // 3. Verify Payment Signature on backend
            await axios.post('/api/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            // 4. Upload KYC files for all persons
            let allKycUrls = [];
            for (let i = 0; i < kycData.length; i++) {
              const formData = new FormData();
              formData.append('photo', kycData[i].photo);
              formData.append('aadhaar', kycData[i].aadhaar);
              formData.append('company_id', kycData[i].company_id);
              
              const uploadRes = await axios.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
              });
              
              allKycUrls = [...allKycUrls, ...uploadRes.data.fileUrls];
            }

            // 5. Update User Profile with KYC urls and phone/address (from main person)
            await axios.put('/api/auth/profile', {
              phone: kycData[0].phone,
              address: kycData[0].address,
              kyc_details: allKycUrls
            });

            // 6. Finalize Lease Booking
            await axios.post('/api/leases/book', {
              property_id: property._id,
              unit_id: bookingUnit._id,
              ...(property.type === 'DailyRoom' && { start_date: bookingDates.start_date, end_date: bookingDates.end_date })
            });

            // 7. Generate and Download PDF
            generateLeasePDF({
              tenantName: user?.name,
              ownerName: 'EstateFlow Admin',
              propertyName: property.name,
              unitNo: bookingUnit.unit_no,
              rentAmount: bookingUnit.rent_amount,
              depositAmount: property.deposit_amount,
              startDate: new Date(),
              tenantSignature: signatureData
            });

            // Close modal and redirect
            setBookingUnit(null);
            setBookingStep(1);
            setSignatureData(null);
            navigate('/user-dashboard');
          } catch (verifyErr) {
             console.error(verifyErr);
             setBookingError(verifyErr.response?.data?.message || 'Payment verification or booking failed after payment.');
             setBookingLoading(false);
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: kycData.phone
        },
        theme: {
          color: '#3399cc'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response) {
         setBookingError(response.error.description);
         setBookingLoading(false);
      });
      
      paymentObject.open();

    } catch (err) {
      setBookingError(err.response?.data?.message || err.message || 'Transaction failed. Please try again.');
      setBookingLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link to={-1} className="inline-flex items-center text-secondary hover:text-primary transition-colors font-medium text-sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>

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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-6 border-t border-gray-100">
          <div>
            <p className="text-sm text-gray-500 mb-1">Base Rent</p>
            <p className="text-xl font-bold text-gray-900 flex items-center">
              <IndianRupee className="w-5 h-5 mr-1 text-gray-400" />
              {property.rent_amount}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Advance Pay</p>
            <p className="text-xl font-bold text-gray-900 flex items-center">
              <IndianRupee className="w-5 h-5 mr-1 text-gray-400" />
              {property.deposit_amount}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Status</p>
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
              property.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {property.status}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Rooms</p>
            <p className="text-xl font-bold text-primary">{units.length}</p>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Rooms ({units.length})</h2>
      
      {units.length === 0 ? (
        <div className="bg-yellow-50 text-yellow-800 p-6 rounded-xl border border-yellow-200 text-center">
          No rooms were created for this property yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {units.map((unit) => (
            <div 
              key={unit._id} 
              onClick={() => {
                if (unit.status === 'Occupied' && (user?.role === 'Admin' || user?.role === 'Owner') && unit.tenant) {
                  setViewingTenantUnit(unit);
                }
              }}
              className="bg-surface rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group"
            >
              {/* Top Accent Bar based on status */}
              <div className={`absolute top-0 left-0 w-full h-1 ${
                unit.status === 'Available' ? 'bg-green-500' : 
                unit.status === 'Occupied' ? 'bg-blue-500' : 'bg-orange-500'
              }`} />
              
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-3xl font-black text-gray-900 group-hover:text-primary transition-colors">
                  {unit.unit_no}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  unit.status === 'Available' ? 'bg-green-100 text-green-700' : 
                  unit.status === 'Occupied' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {unit.status}
                </span>
              </div>
              
              <div className="pt-4 border-t border-gray-50 flex justify-between items-end">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Rent Amount</p>
                  <p className="text-xl font-bold text-gray-900">₹{unit.rent_amount}</p>
                </div>
                
                {user?.role === 'User' && unit.status === 'Available' && !hasActiveLease && (
                  <div className="text-right flex flex-col items-end">
                    <button 
                      onClick={() => setBookingUnit(unit)}
                      className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-800 transition-colors shadow-sm"
                    >
                      Book Now
                    </button>
                    <p className="text-[11px] text-gray-500 mt-1.5 font-semibold bg-gray-100 px-2 py-0.5 rounded-md">
                      {property.type === 'DailyRoom' ? `Pay ₹${unit.rent_amount} / day` : `Pay ₹${calculateProratedRent(unit.rent_amount).amount + property.deposit_amount} today`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {bookingUnit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-primary p-6 text-white text-center shrink-0 relative">
              <button 
                onClick={() => setBookingUnit(null)} 
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-1"
                type="button"
              >
                <X className="w-6 h-6" />
              </button>
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-90" />
              <h2 className="text-2xl font-bold">
                {bookingStep === 1 ? 'Tenant KYC Details' : bookingStep === 2 ? 'Digital Signature' : 'Confirm Booking'}
              </h2>
              <p className="opacity-90 mt-1">Room {bookingUnit.unit_no} at {property.name}</p>
              <div className="mt-3 inline-block bg-white/20 px-4 py-1.5 rounded-full text-sm font-bold">
                {property.type === 'DailyRoom' ? (
                  bookingDates.start_date && bookingDates.end_date ? 
                  `Total Payable: ₹${calculateDailyAmount(bookingUnit.rent_amount) + (property.deposit_amount || 0)}` : 'Select dates to see price'
                ) : (
                  `Total Payable Today: ₹${calculateProratedRent(bookingUnit.rent_amount).amount + property.deposit_amount}`
                )}
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {bookingError && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium">{bookingError}</div>}
              
              {bookingStep === 1 && (
                <form onSubmit={handleKycNext} className="space-y-4">

                  {property.type === 'DailyRoom' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-secondary mb-1">Check-in Date</label>
                        <input type="date" required className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 outline-none text-sm" value={bookingDates.start_date} onChange={e => setBookingDates({...bookingDates, start_date: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-secondary mb-1">Check-out Date</label>
                        <input type="date" required className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 outline-none text-sm" value={bookingDates.end_date} onChange={e => setBookingDates({...bookingDates, end_date: e.target.value})} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-semibold text-secondary mb-1">Number of Persons</label>
                        <input type="number" min="1" max="10" required className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 outline-none text-sm" value={numberOfPersons} onChange={e => handlePersonCountChange(e.target.value)} />
                      </div>
                    </div>
                  )}

                  {kycData.map((person, index) => (
                    <div key={index} className="space-y-4 pt-4 border-t border-gray-200 mt-4">
                      <h3 className="font-bold text-gray-900">Person {index + 1} {index === 0 && '(Primary)'}</h3>
                      <div>
                        <label className="block text-sm font-semibold text-secondary mb-1">Phone Number</label>
                        <input 
                          type="text" 
                          pattern="[0-9]{10}"
                          maxLength="10"
                          title="Phone number must be exactly 10 digits"
                          className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none text-sm" 
                          value={person.phone}
                          onChange={e => {
                            // Only allow numbers
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            const newKyc = [...kycData];
                            newKyc[index].phone = val;
                            setKycData(newKyc);
                          }}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-secondary mb-1">Current Address</label>
                        <textarea 
                          className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none text-sm" 
                          rows="2"
                          value={person.address}
                          onChange={e => {
                            const newKyc = [...kycData];
                            newKyc[index].address = e.target.value;
                            setKycData(newKyc);
                          }}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Passport Size Photo</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100"
                          onChange={e => {
                            const newKyc = [...kycData];
                            newKyc[index].photo = e.target.files[0];
                            setKycData(newKyc);
                          }}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Card (Image/PDF)</label>
                        <input 
                          type="file" 
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100"
                          onChange={e => {
                            const newKyc = [...kycData];
                            newKyc[index].aadhaar = e.target.files[0];
                            setKycData(newKyc);
                          }}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company / Student ID</label>
                        <input 
                          type="file" 
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100"
                          onChange={e => {
                            const newKyc = [...kycData];
                            newKyc[index].company_id = e.target.files[0];
                            setKycData(newKyc);
                          }}
                          required
                        />
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                    <button 
                      type="button"
                      onClick={() => setBookingUnit(null)}
                      className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 px-4 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-blue-800 transition-colors shadow-sm text-sm"
                    >
                      Next Step
                    </button>
                  </div>
                </form>
              )}

              {bookingStep === 2 && (
                <div>
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
                    <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2"><PenTool size={18} /> Lease Agreement Terms</h3>

                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      {property.type === 'DailyRoom' ? (
                        <>
                          <li>Daily Rate: ₹{bookingUnit.rent_amount}</li>
                          <li>Total Stay: {calculateDailyAmount(bookingUnit.rent_amount) / bookingUnit.rent_amount || 0} days</li>
                          <li>Security Deposit: ₹{property.deposit_amount || 0}</li>
                          <li>Total Payable: ₹{calculateDailyAmount(bookingUnit.rent_amount) + (property.deposit_amount || 0)}</li>
                        </>
                      ) : (
                        <>
                          <li>Standard Monthly Rent: ₹{bookingUnit.rent_amount}</li>
                          <li>First Month Prorated Rent ({calculateProratedRent(bookingUnit.rent_amount).days} days): ₹{calculateProratedRent(bookingUnit.rent_amount).amount}</li>
                          <li>Advance Pay: ₹{property.deposit_amount}</li>
                          <li>Notice Period: 30 Days</li>
                          <li>Payment Date: 1st of every month</li>
                        </>
                      )}
                    </ul>

                  </div>
                  
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Please sign below to agree to the terms:</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 mb-4 overflow-hidden">
                    <SignatureCanvas 
                      penColor="black"
                      canvasProps={{width: 500, height: 200, className: 'w-full h-[200px]'}}
                      ref={sigPad}
                    />
                  </div>
                  <button 
                    onClick={() => sigPad.current.clear()}
                    className="text-sm text-gray-500 hover:text-red-500 font-medium mb-6"
                  >
                    Clear Signature
                  </button>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => setBookingStep(1)}
                      className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => {
                        try {
                          if (!sigPad.current) {
                            alert('Signature pad not initialized.');
                            return;
                          }
                          if (sigPad.current.isEmpty && sigPad.current.isEmpty()) {
                            alert('Please provide your digital signature.');
                            return;
                          }
                          
                          let dataUrl = '';
                          if (typeof sigPad.current.getTrimmedCanvas === 'function') {
                            try {
                              dataUrl = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
                            } catch (e) {
                              console.warn('getTrimmedCanvas failed, falling back to getCanvas', e);
                              dataUrl = sigPad.current.getCanvas().toDataURL('image/png');
                            }
                          } else if (typeof sigPad.current.getCanvas === 'function') {
                            dataUrl = sigPad.current.getCanvas().toDataURL('image/png');
                          } else if (typeof sigPad.current.toDataURL === 'function') {
                            dataUrl = sigPad.current.toDataURL('image/png');
                          } else {
                            throw new Error('Could not extract image from signature pad.');
                          }

                          setSignatureData(dataUrl);
                          setBookingError('');
                          setBookingStep(3);
                        } catch (error) {
                          console.error('Signature Capture Error:', error);
                          alert('Error capturing signature: ' + error.message);
                          setBookingError('Error capturing signature: ' + error.message);
                        }
                      }}
                      className="flex-1 px-4 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-blue-800 transition-colors shadow-sm text-sm"
                    >
                      Sign & Continue
                    </button>
                  </div>
                </div>
              )}

              {bookingStep === 3 && (
                <div>

                  <div className="space-y-4 mb-8">
                    {property.type === 'DailyRoom' ? (
                      <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                        <span className="text-gray-600">Total Stay ({calculateDailyAmount(bookingUnit.rent_amount) / bookingUnit.rent_amount || 0} days)</span>
                        <span className="font-bold text-gray-900">₹{calculateDailyAmount(bookingUnit.rent_amount)}</span>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                        <span className="text-gray-600">First Month Rent (Prorated for {calculateProratedRent(bookingUnit.rent_amount).days} days)</span>
                        <span className="font-bold text-gray-900">₹{calculateProratedRent(bookingUnit.rent_amount).amount}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <span className="text-gray-600">Advance Pay / Deposit</span>
                      <span className="font-bold text-gray-900">₹{property.deposit_amount || 0}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-gray-900 font-bold">Total Payable Now</span>
                      <span className="text-2xl font-black text-primary">₹{property.type === 'DailyRoom' ? calculateDailyAmount(bookingUnit.rent_amount) + (property.deposit_amount || 0) : calculateProratedRent(bookingUnit.rent_amount).amount + property.deposit_amount}</span>
                    </div>
                  </div>


                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6 flex items-center justify-center gap-2">
                    <span className="font-semibold text-gray-700">Secured by</span>
                    <span className="font-black text-[#3395FF] tracking-tight">Razorpay</span>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => setBookingStep(2)}
                      disabled={bookingLoading}
                      className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleBookRoom}
                      disabled={bookingLoading}
                      className="flex-1 px-4 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-70 text-sm"
                    >
                      {bookingLoading ? 'Processing...' : 'Pay & Generate Lease'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tenant Details Modal */}
      {viewingTenantUnit && viewingTenantUnit.tenant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-primary p-6 text-white flex justify-between items-start shrink-0">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <User className="w-6 h-6" /> Tenant Details
                </h2>
                <p className="opacity-90 mt-1">Room {viewingTenantUnit.unit_no} at {property.name}</p>
              </div>
              <button 
                onClick={() => setViewingTenantUnit(null)}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="space-y-6">
                
                {/* Profile Section */}
                <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                  {viewingTenantUnit.tenant.kyc_details?.[0] ? (
                    <img 
                      src={`${API_URL}${viewingTenantUnit.tenant.kyc_details[0]}`} 
                      alt="Tenant Photo" 
                      className="w-20 h-20 rounded-full object-cover border-4 border-gray-50 shadow-sm"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center border-4 border-gray-50 shadow-sm">
                      <User className="w-10 h-10 text-primary opacity-50" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{viewingTenantUnit.tenant.name}</h3>
                    <p className="text-gray-500 flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4" /> {viewingTenantUnit.tenant.email}
                    </p>
                    {viewingTenantUnit.tenant.phone && (
                      <p className="text-gray-500 flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4" /> {viewingTenantUnit.tenant.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Lease Details */}
                {viewingTenantUnit.lease && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" /> Lease Agreement
                    </h4>
                    <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Rent Amount</p>
                        <p className="font-semibold text-gray-900">₹{viewingTenantUnit.lease.rent_amount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Deposit Paid</p>
                        <p className="font-semibold text-gray-900">₹{viewingTenantUnit.lease.deposit}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Start Date</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(viewingTenantUnit.lease.start_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">End Date</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(viewingTenantUnit.lease.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* KYC Documents */}
                {viewingTenantUnit.tenant.kyc_details && viewingTenantUnit.tenant.kyc_details.length > 1 && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" /> KYC Documents
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {viewingTenantUnit.tenant.kyc_details.slice(1).map((doc, idx) => (
                        <a 
                          key={idx}
                          href={`${API_URL}${doc}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-primary hover:shadow-sm transition-all group"
                        >
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {idx === 0 ? 'Aadhaar Card' : 'Company ID'}
                            </p>
                            <p className="text-xs text-primary font-medium">View File →</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 flex justify-end">
               <button 
                  onClick={() => setViewingTenantUnit(null)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;
