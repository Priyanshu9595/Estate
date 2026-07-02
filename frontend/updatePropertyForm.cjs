const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'PropertyDetails.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

const oldForm = `
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

                    <input 
                      type="text" 
                      className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none text-sm" 
                      value={kycData.phone}
                      onChange={e => setKycData({...kycData, phone: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-1">Current Address</label>
                    <textarea 
                      className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none text-sm" 
                      rows="2"
                      value={kycData.address}
                      onChange={e => setKycData({...kycData, address: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Passport Size Photo</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100"
                      onChange={e => setKycData({...kycData, photo: e.target.files[0]})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Card (Image/PDF)</label>
                    <input 
                      type="file" 
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100"
                      onChange={e => setKycData({...kycData, aadhaar: e.target.files[0]})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company / Student ID</label>
                    <input 
                      type="file" 
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100"
                      onChange={e => setKycData({...kycData, company_id: e.target.files[0]})}
                      required
                    />
                  </div>
`;

const newForm = `
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
                          className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none text-sm" 
                          value={person.phone}
                          onChange={e => {
                            const newKyc = [...kycData];
                            newKyc[index].phone = e.target.value;
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
`;

const replacedContent = content.replace(oldForm.trim(), newForm.trim());

if (replacedContent === content) {
    console.error("Failed to replace form chunk. Please check the string matching.");
} else {
    fs.writeFileSync(filePath, replacedContent, 'utf-8');
    console.log('Successfully updated PropertyDetails.jsx form');
}
