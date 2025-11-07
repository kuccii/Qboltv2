import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';
import { usePrices } from '../hooks/useData';
import { unifiedApi } from '../services/unifiedApi';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminPriceManager: React.FC = () => {
  const { prices, loading, error, refetch } = usePrices({ limit: 1000 });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPrice, setEditingPrice] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [formData, setFormData] = useState({
    material: '',
    location: '',
    country: 'Kenya',
    price: '',
    currency: 'KES',
    unit: 'ton',
    change_percent: '0',
    source: 'Admin Entry',
    verified: true
  });

  const countries = ['Kenya', 'Rwanda', 'Uganda', 'Tanzania', 'Ethiopia', 'Somalia'];
  const units = ['ton', '50kg bag', 'kg', 'liter', 'meter', 'm³', 'sheet', 'acre'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPrice) {
        // Update existing price
        await unifiedApi.prices.update(editingPrice.id, {
          price: parseFloat(formData.price),
          change_percent: parseFloat(formData.change_percent),
          updated_at: new Date().toISOString()
        });
      } else {
        // Create new price
        await unifiedApi.prices.create({
          material: formData.material,
          location: formData.location,
          country: formData.country,
          price: parseFloat(formData.price),
          currency: formData.currency,
          unit: formData.unit,
          change_percent: parseFloat(formData.change_percent),
          source: formData.source,
          verified: formData.verified
        });
      }

      // Reset form
      setFormData({
        material: '',
        location: '',
        country: 'Kenya',
        price: '',
        currency: 'KES',
        unit: 'ton',
        change_percent: '0',
        source: 'Admin Entry',
        verified: true
      });
      setShowCreateForm(false);
      setEditingPrice(null);
      refetch();
    } catch (err) {
      console.error('Error saving price:', err);
      alert('Failed to save price. Please try again.');
    }
  };

  const handleEdit = (price: any) => {
    setEditingPrice(price);
    setFormData({
      material: price.material,
      location: price.location,
      country: price.country,
      price: price.price.toString(),
      currency: price.currency,
      unit: price.unit,
      change_percent: (price.change_percent || 0).toString(),
      source: price.source || 'Admin Entry',
      verified: price.verified
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this price record?')) return;

    try {
      await unifiedApi.prices.delete(id);
      refetch();
    } catch (err) {
      console.error('Error deleting price:', err);
      alert('Failed to delete price. Please try again.');
    }
  };

  const handleCSVExport = () => {
    const csvContent = [
      ['Material', 'Location', 'Country', 'Price', 'Currency', 'Unit', 'Change %', 'Source', 'Verified', 'Created At'].join(','),
      ...filteredPrices.map(p =>
        [p.material, p.location, p.country, p.price, p.currency, p.unit, p.change_percent || 0, p.source, p.verified, p.created_at].join(',')
      )
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prices-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\\n');
      const headers = lines[0].split(',');
      
      const imported: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length < 5) continue;

        imported.push({
          material: values[0],
          location: values[1],
          country: values[2],
          price: parseFloat(values[3]),
          currency: values[4],
          unit: values[5] || 'ton',
          change_percent: parseFloat(values[6] || '0'),
          source: values[7] || 'CSV Import',
          verified: true
        });
      }

      try {
        for (const priceData of imported) {
          await unifiedApi.prices.create(priceData);
        }
        alert(`Successfully imported ${imported.length} price records`);
        refetch();
      } catch (err) {
        console.error('Error importing prices:', err);
        alert('Failed to import some prices. Please check the CSV format.');
      }
    };
    reader.readAsText(file);
  };

  const filteredPrices = prices
    .filter(p =>
      searchTerm === '' ||
      p.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(p => selectedCountry === 'all' || p.country === selectedCountry);

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return (
    <div className="p-6">
      <AlertCircle className="h-12 w-12 text-error-500 mb-4" />
      <p className="text-error-600">{error}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Price Management</h1>
          <p className="text-gray-600 mt-1">Manage price data across all markets</p>
        </div>
        <div className="flex gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVImport}
              className="hidden"
            />
            <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              <Upload className="h-4 w-4" />
              <span>Import CSV</span>
            </div>
          </label>
          <button
            onClick={handleCSVExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              setEditingPrice(null);
              setFormData({
                material: '',
                location: '',
                country: 'Kenya',
                price: '',
                currency: 'KES',
                unit: 'ton',
                change_percent: '0',
                source: 'Admin Entry',
                verified: true
              });
              setShowCreateForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add Price</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <DashboardCard>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{prices.length}</p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Verified</p>
              <p className="text-2xl font-bold text-gray-900">
                {prices.filter(p => p.verified).length}
              </p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">
                {prices.filter(p => !p.verified).length}
              </p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Countries</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(prices.map(p => p.country)).size}
              </p>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search materials or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Countries</option>
          {countries.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <DashboardCard>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingPrice ? 'Edit Price' : 'Add New Price'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Material *</label>
                <input
                  type="text"
                  required
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Cement"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Nairobi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {countries.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="850"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="KES">KES</option>
                  <option value="RWF">RWF</option>
                  <option value="UGX">UGX</option>
                  <option value="TZS">TZS</option>
                  <option value="USD">USD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {units.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Change %</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.change_percent}
                  onChange={(e) => setFormData({ ...formData, change_percent: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="2.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Market Survey"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.verified}
                    onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Mark as verified</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingPrice(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                {editingPrice ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </DashboardCard>
      )}

      {/* Prices Table */}
      <DashboardCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Material</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Location</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Country</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Price</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Unit</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Change</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrices.map(price => (
                <tr key={price.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">{price.material}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{price.location}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{price.country}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 font-semibold text-right">
                    {price.price.toLocaleString()} {price.currency}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{price.unit}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-sm font-medium ${
                      (price.change_percent || 0) > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {(price.change_percent || 0) > 0 ? '+' : ''}{price.change_percent || 0}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <StatusBadge variant={price.verified ? 'success' : 'warning'} size="sm">
                      {price.verified ? 'Verified' : 'Pending'}
                    </StatusBadge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(price)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(price.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPrices.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No prices found</p>
            </div>
          )}
        </div>
      </DashboardCard>
    </div>
  );
};

export default AdminPriceManager;


