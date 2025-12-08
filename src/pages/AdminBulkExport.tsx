import React, { useState } from 'react';
import { Download, FileText, CheckCircle, Database } from 'lucide-react';
import { unifiedApi } from '../services/unifiedApi';
import { AdminCard } from '../components/AdminCard';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminBulkExport: React.FC = () => {
  const [selectedType, setSelectedType] = useState('prices');
  const [format, setFormat] = useState('csv');
  const [exporting, setExporting] = useState(false);

  const dataTypes = [
    { value: 'prices', label: 'Prices', api: () => unifiedApi.prices.get({ limit: 10000 }) },
    { value: 'suppliers', label: 'Suppliers', api: () => unifiedApi.suppliers.get({ limit: 10000 }) },
    { value: 'agents', label: 'Agents', api: () => unifiedApi.agents.getAll({ limit: 10000 }) },
    { value: 'financing', label: 'Financing Offers', api: () => unifiedApi.financing.getAll({ limit: 10000 }) },
    { value: 'logistics', label: 'Logistics Routes', api: () => unifiedApi.logistics.getAll({ limit: 10000 }) },
    { value: 'demand', label: 'Demand Data', api: () => unifiedApi.demand.getAll({ limit: 10000 }) },
    { value: 'risk', label: 'Risk Alerts', api: () => unifiedApi.riskProfile.getAllAlerts({ limit: 10000 }) },
  ];

  const handleExport = async () => {
    setExporting(true);
    try {
      const dataType = dataTypes.find(dt => dt.value === selectedType);
      if (!dataType) return;

      const result = await dataType.api();
      const data = result.data || result || [];

      if (format === 'csv') {
        exportToCSV(data, selectedType);
      } else if (format === 'json') {
        exportToJSON(data, selectedType);
      }

      alert(`Successfully exported ${data.length} records`);
    } catch (err: any) {
      alert(err.message || 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const exportToCSV = (data: any[], type: string) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        if (Array.isArray(value)) return value.join(';');
        if (value === null || value === undefined) return '';
        return String(value).replace(/,/g, ';');
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportToJSON = (data: any[], type: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Bulk Export</h1>
          <p className="text-gray-400">Export data in bulk to CSV or JSON format</p>
        </div>

        <div className="space-y-6">
          <AdminCard>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Data Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white"
              >
                {dataTypes.map(dt => (
                  <option key={dt.value} value={dt.value}>{dt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Export Format
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="csv"
                    checked={format === 'csv'}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-4 h-4 text-red-600"
                  />
                  <span className="text-gray-300">CSV</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="json"
                    checked={format === 'json'}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-4 h-4 text-red-600"
                  />
                  <span className="text-gray-300">JSON</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <>
                  <LoadingSpinner />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Export Data</span>
                </>
              )}
            </button>

            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <h3 className="font-medium text-white mb-2">Export Information</h3>
              <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                <li>CSV format is best for spreadsheet applications</li>
                <li>JSON format preserves data structure and types</li>
                <li>All records will be exported (up to 10,000)</li>
                <li>Exports include all fields for the selected data type</li>
              </ul>
            </div>
          </div>
        </AdminCard>
      </div>
    </div>
  );
};

export default AdminBulkExport;

