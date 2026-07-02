const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'PropertyDetails.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add bookingDates state
content = content.replace(
  `  const [bookingError, setBookingError] = useState('');`,
  `  const [bookingError, setBookingError] = useState('');\n  const [bookingDates, setBookingDates] = useState({ start_date: '', end_date: '' });`
);

// 2. Add calculateDailyAmount helper
content = content.replace(
  `  const calculateProratedRent = (rentAmount) => {`,
  `  const calculateDailyAmount = (rentAmount) => {\n    if (!bookingDates.start_date || !bookingDates.end_date) return 0;\n    const diffTime = Math.abs(new Date(bookingDates.end_date) - new Date(bookingDates.start_date));\n    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));\n    return diffDays > 0 ? diffDays * rentAmount : rentAmount;\n  };\n\n  const calculateProratedRent = (rentAmount) => {`
);

// 3. Update handleKycNext to validate dates for DailyRoom
content = content.replace(
  `    if (!kycData.phone || !kycData.address || !kycData.photo || !kycData.aadhaar || !kycData.company_id) {`,
  `    if (property.type === 'DailyRoom' && (!bookingDates.start_date || !bookingDates.end_date)) {\n      setBookingError('Please select check-in and check-out dates.');\n      return;\n    }\n    if (!kycData.phone || !kycData.address || !kycData.photo || !kycData.aadhaar || !kycData.company_id) {`
);

// 4. Update handleBookRoom amount calculation
content = content.replace(
  `      const proratedRentObj = calculateProratedRent(bookingUnit.rent_amount);\n      const amount = proratedRentObj.amount + property.deposit_amount;`,
  `      let amount = 0;\n      if (property.type === 'DailyRoom') {\n        amount = calculateDailyAmount(bookingUnit.rent_amount) + (property.deposit_amount || 0);\n      } else {\n        const proratedRentObj = calculateProratedRent(bookingUnit.rent_amount);\n        amount = proratedRentObj.amount + property.deposit_amount;\n      }`
);

// 5. Update /api/leases/book payload
content = content.replace(
  `            await axios.post('/api/leases/book', {\n              property_id: property._id,\n              unit_id: bookingUnit._id\n            });`,
  `            await axios.post('/api/leases/book', {\n              property_id: property._id,\n              unit_id: bookingUnit._id,\n              ...(property.type === 'DailyRoom' && { start_date: bookingDates.start_date, end_date: bookingDates.end_date })\n            });`
);

// 6. Update Room Grid button text
content = content.replace(
  `                    <p className="text-[11px] text-gray-500 mt-1.5 font-semibold bg-gray-100 px-2 py-0.5 rounded-md">\n                      Pay ₹{calculateProratedRent(unit.rent_amount).amount + property.deposit_amount} today\n                    </p>`,
  `                    <p className="text-[11px] text-gray-500 mt-1.5 font-semibold bg-gray-100 px-2 py-0.5 rounded-md">\n                      {property.type === 'DailyRoom' ? \`Pay ₹\${unit.rent_amount} / day\` : \`Pay ₹\${calculateProratedRent(unit.rent_amount).amount + property.deposit_amount} today\`}\n                    </p>`
);

// 7. Update Modal Header amount
content = content.replace(
  `              <div className="mt-3 inline-block bg-white/20 px-4 py-1.5 rounded-full text-sm font-bold">\n                Total Payable Today: ₹{calculateProratedRent(bookingUnit.rent_amount).amount + property.deposit_amount}\n              </div>`,
  `              <div className="mt-3 inline-block bg-white/20 px-4 py-1.5 rounded-full text-sm font-bold">\n                {property.type === 'DailyRoom' ? (\n                  bookingDates.start_date && bookingDates.end_date ? \n                  \`Total Payable: ₹\${calculateDailyAmount(bookingUnit.rent_amount) + (property.deposit_amount || 0)}\` : 'Select dates to see price'\n                ) : (\n                  \`Total Payable Today: ₹\${calculateProratedRent(bookingUnit.rent_amount).amount + property.deposit_amount}\`\n                )}\n              </div>`
);

// 8. Add Date inputs to Step 1
const dateInputs = `
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
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-1">Phone Number</label>
`;
content = content.replace(
  `                  <div>\n                    <label className="block text-sm font-semibold text-secondary mb-1">Phone Number</label>`,
  dateInputs
);

// 9. Update Step 2 Lease Terms
const leaseTerms = `
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
`;
content = content.replace(
  `                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">\n                      <li>Standard Monthly Rent: ₹{bookingUnit.rent_amount}</li>\n                      <li>First Month Prorated Rent ({calculateProratedRent(bookingUnit.rent_amount).days} days): ₹{calculateProratedRent(bookingUnit.rent_amount).amount}</li>\n                      <li>Advance Pay: ₹{property.deposit_amount}</li>\n                      <li>Notice Period: 30 Days</li>\n                      <li>Payment Date: 1st of every month</li>\n                    </ul>`,
  leaseTerms
);

// 10. Update Step 3 Payment Summary
const paymentSummary = `
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
`;
content = content.replace(
  `                  <div className="space-y-4 mb-8">\n                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">\n                      <span className="text-gray-600">First Month Rent (Prorated for {calculateProratedRent(bookingUnit.rent_amount).days} days)</span>\n                      <span className="font-bold text-gray-900">₹{calculateProratedRent(bookingUnit.rent_amount).amount}</span>\n                    </div>\n                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">\n                      <span className="text-gray-600">Advance Pay</span>\n                      <span className="font-bold text-gray-900">₹{property.deposit_amount}</span>\n                    </div>\n                    <div className="flex justify-between items-center pt-2">\n                      <span className="text-gray-900 font-bold">Total Payable Now</span>\n                      <span className="text-2xl font-black text-primary">₹{calculateProratedRent(bookingUnit.rent_amount).amount + property.deposit_amount}</span>\n                    </div>\n                  </div>`,
  paymentSummary
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully updated PropertyDetails.jsx');
