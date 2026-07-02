import { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, FileText, Wrench } from 'lucide-react';

const Reports = () => {
  const [rentData, setRentData] = useState([]);
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data } = await axios.get('/api/reports/financials');
      setRentData(data.rentData);
      setMaintenanceData(data.maintenanceData);
    } catch (err) {
      console.error('Failed to fetch reports', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = (data, filename) => {
    if (data.length === 0) return alert('No data to export');
    
    // Get headers
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Add header row
    csvRows.push(headers.join(','));
    
    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header] !== null && row[header] !== undefined ? row[header] : '';
        // Escape quotes and commas
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
    
    // Create Blob and download
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) return <div className="p-6">Loading reports...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Financial Reports & Analytics</h1>
      <p className="text-gray-600 mb-8">Export your financial and maintenance data for accounting purposes.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Rent Report Card */}
        <div className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                <FileText size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Rent Ledger</h2>
            </div>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              Contains all rent generation records, including paid amounts, due amounts, statuses, and associated tenants.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
              <p className="text-sm font-medium text-gray-700">Total Records: <span className="font-bold">{rentData.length}</span></p>
            </div>
          </div>
          <button 
            onClick={() => downloadCSV(rentData, 'rent_ledger.csv')}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-colors shadow-sm"
          >
            <Download size={18} /> Export Rent as CSV
          </button>
        </div>

        {/* Maintenance Report Card */}
        <div className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                <Wrench size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Maintenance Expenses</h2>
            </div>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              Contains all maintenance requests, resolutions, and associated costs for your managed properties.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
              <p className="text-sm font-medium text-gray-700">Total Records: <span className="font-bold">{maintenanceData.length}</span></p>
            </div>
          </div>
          <button 
            onClick={() => downloadCSV(maintenanceData, 'maintenance_expenses.csv')}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold transition-colors shadow-sm"
          >
            <Download size={18} /> Export Maintenance as CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
