import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminCard } from '../components/AdminCard';

const AdminBulkImport: React.FC = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('prices');
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);

  const dataTypes = [
    { value: 'prices', label: 'Prices', description: 'Import price data from CSV', route: '/admin/prices' },
    { value: 'suppliers', label: 'Suppliers', description: 'Import supplier data from CSV', route: '/admin/suppliers' },
    { value: 'agents', label: 'Agents', description: 'Import agent data from CSV', route: '/admin/agents' },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    setImporting(true);
    // The actual import is handled by individual managers
    // This page redirects to the appropriate manager
    const dataType = dataTypes.find(dt => dt.value === selectedType);
    if (dataType) {
      navigate(dataType.route);
    }
    setImporting(false);
  };

  const downloadTemplate = () => {
    // Generate template based on selected type
    let template = '';
    switch (selectedType) {
      case 'prices':
        template = 'Material,Location,Country,Price,Currency,Unit,Change %,Source,Verified\nCement,Nairobi,Kenya,850,KES,50kg bag,2.5,Market Survey,true';
        break;
      case 'suppliers':
        template = 'Name,Country,Industry,Materials,Rating,Verified,Phone,Email,Website\nABC Suppliers,Kenya,construction,Cement;Steel,4.5,true,+254712345678,info@abc.com,https://abc.com';
        break;
      case 'agents':
        template = 'Name,Service Type,Country,Regions,Rating,Verified,Phone,Email,Website\nLogistics Pro,logistics,Kenya,Kenya;Uganda,4.8,true,+254712345678,info@logistics.com,https://logistics.com';
        break;
    }

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedType}-template.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Bulk Import</h1>
          <p className="text-gray-400">Import data in bulk from CSV files</p>
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
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setFile(null);
                  setResult(null);
                }}
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white"
              >
                {dataTypes.map(dt => (
                  <option key={dt.value} value={dt.value}>{dt.label}</option>
                ))}
              </select>
              <p className="mt-2 text-sm text-gray-400">
                {dataTypes.find(dt => dt.value === selectedType)?.description}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Download Template
              </label>
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700"
              >
                <Download className="h-4 w-4" />
                <span>Download CSV Template</span>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select CSV File
              </label>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-600 rounded-lg hover:border-primary-500 transition-colors">
                  <Upload className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-300">
                    {file ? file.name : 'Choose CSV file'}
                  </span>
                </div>
              </label>
            </div>

            {file && (
              <div className="p-4 bg-primary-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-primary-300">
                  <FileText className="h-5 w-5" />
                  <span className="font-medium">{file.name}</span>
                  <span className="text-sm text-primary-400">
                    ({(file.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleImport}
                disabled={!file || importing}
                className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="h-4 w-4" />
                <span>{importing ? 'Importing...' : 'Import Data'}</span>
              </button>
              <button
                onClick={() => navigate('/admin')}
                className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>

            {result && (
              <div className={`p-4 rounded-lg ${result.failed > 0 ? 'bg-yellow-900/20' : 'bg-green-900/20'}`}>
                <div className="flex items-center gap-2">
                  {result.failed > 0 ? (
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  )}
                  <div>
                    <p className="font-medium text-white">
                      Import Complete
                    </p>
                    <p className="text-sm text-gray-400">
                      {result.success} successful, {result.failed} failed
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <h3 className="font-medium text-white mb-2">Import Instructions</h3>
              <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                <li>Download the CSV template for your data type</li>
                <li>Fill in the template with your data</li>
                <li>Ensure all required fields are filled</li>
                <li>Save the file as CSV format</li>
                <li>Upload the file using the form above</li>
                <li>Or use the import feature directly in each manager page</li>
              </ul>
            </div>
          </div>
        </AdminCard>
      </div>
      </div>
    </div>
  );
};

export default AdminBulkImport;

