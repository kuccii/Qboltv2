import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Search,
  Shield,
  Upload,
  Download
} from 'lucide-react';
import { useSuppliers } from '../hooks/useData';
import { unifiedApi } from '../services/unifiedApi';
import { AdminCard } from '../components/AdminCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminSupplierManager: React.FC = () => {
  const { suppliers, loading, error, refetch } = useSuppliers({ limit: 1000 });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    country: 'Kenya',
    industry: 'construction',
    materials: [''],
    description: '',
    verified: false,
    insurance_active: false,
    rating: '0',
    total_reviews: '0',
    total_orders: '0',
    on_time_delivery_rate: '0',
    phone: '',
    email: '',
    website: ''
  });

  const countries = ['Kenya', 'Rwanda', 'Uganda', 'Tanzania', 'Ethiopia', 'Somalia'];
  const industries = ['construction', 'agriculture'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const supplierData = {
        ...formData,
        materials: formData.materials.filter(m => m.trim() !== ''),
        rating: parseFloat(formData.rating),
        total_reviews: parseInt(formData.total_reviews),
        total_orders: parseInt(formData.total_orders),
        on_time_delivery_rate: parseFloat(formData.on_time_delivery_rate)
      };

      if (editingSupplier) {
        await unifiedApi.suppliers.update(editingSupplier.id, supplierData);
      } else {
        await unifiedApi.suppliers.createSupplier(supplierData);
      }

      setFormData({
        name: '',
        country: 'Kenya',
        industry: 'construction',
        materials: [''],
        description: '',
        verified: false,
        insurance_active: false,
        rating: '0',
        total_reviews: '0',
        total_orders: '0',
        on_time_delivery_rate: '0',
        phone: '',
        email: '',
        website: ''
      });
      setShowCreateForm(false);
      setEditingSupplier(null);
      refetch();
    } catch (err) {
      console.error('Error saving supplier:', err);
      alert('Failed to save supplier. Please try again.');
    }
  };

  const handleEdit = (supplier: any) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      country: supplier.country,
      industry: supplier.industry,
      materials: supplier.materials || [''],
      description: supplier.description || '',
      verified: supplier.verified,
      insurance_active: supplier.insurance_active,
      rating: (supplier.rating || 0).toString(),
      total_reviews: (supplier.total_reviews || 0).toString(),
      total_orders: (supplier.total_orders || 0).toString(),
      on_time_delivery_rate: (supplier.on_time_delivery_rate || 0).toString(),
      phone: supplier.phone || '',
      email: supplier.email || '',
      website: supplier.website || ''
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;

    try {
      await unifiedApi.suppliers.deleteSupplier(id);
      refetch();
    } catch (err) {
      console.error('Error deleting supplier:', err);
      alert('Failed to delete supplier. Please try again.');
    }
  };

  const handleVerify = async (id: string, verified: boolean) => {
    try {
      await unifiedApi.suppliers.update(id, {
        verified: !verified,
        verified_at: !verified ? new Date().toISOString() : null
      });
      refetch();
    } catch (err) {
      console.error('Error updating verification:', err);
      alert('Failed to update verification status.');
    }
  };

  const handleCSVExport = () => {
    const csvContent = [
      ['Name', 'Country', 'Industry', 'Materials', 'Rating', 'Verified', 'Phone', 'Email', 'Website'].join(','),
      ...filteredSuppliers.map(s =>
        [s.name, s.country, s.industry, (s.materials || []).join(';'), s.rating || 0, s.verified, s.phone || '', s.email || '', s.website || ''].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `suppliers-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      
      const imported: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length < 3) continue;

        imported.push({
          name: values[0],
          country: values[1],
          industry: values[2],
          materials: values[3] ? values[3].split(';') : [],
          rating: parseFloat(values[4] || '0'),
          verified: values[5] === 'true',
          phone: values[6] || '',
          email: values[7] || '',
          website: values[8] || ''
        });
      }

      try {
        for (const supplierData of imported) {
          await unifiedApi.suppliers.createSupplier(supplierData);
        }
        alert(`Successfully imported ${imported.length} suppliers`);
        refetch();
      } catch (err) {
        console.error('Error importing suppliers:', err);
        alert('Failed to import some suppliers. Please check the CSV format.');
      }
    };
    reader.readAsText(file);
  };

  const filteredSuppliers = suppliers
    .filter(s =>
      searchTerm === '' ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(s => selectedCountry === 'all' || s.country === selectedCountry)
    .filter(s => selectedIndustry === 'all' || s.industry === selectedIndustry);

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return (
    <div className="p-6">
      <AlertCircle className="h-12 w-12 text-error-500 mb-4" />
      <p className="text-error-600">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Supplier Management</h1>
          <p className="text-gray-400 mt-1">Manage supplier directory and verifications</p>
        </div>
        <div className="flex gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVImport}
              className="hidden"
            />
            <div className="flex items-center gap-2 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 cursor-pointer">
              <Upload className="h-4 w-4" />
              <span>Import CSV</span>
            </div>
          </label>
          <button
            onClick={handleCSVExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              setEditingSupplier(null);
              setFormData({
                name: '',
                country: 'Kenya',
                industry: 'construction',
                materials: [''],
                description: '',
                verified: false,
                insurance_active: false,
                rating: '0',
                total_reviews: '0',
                total_orders: '0',
                on_time_delivery_rate: '0',
                phone: '',
                email: '',
                website: ''
              });
              setShowCreateForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Suppliers</p>
              <p className="text-2xl font-bold text-white">{suppliers.length}</p>
            </div>
          </div>
        </AdminCard>

        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Shield className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Verified</p>
              <p className="text-2xl font-bold text-white">
                {suppliers.filter(s => s.verified).length}
              </p>
            </div>
          </div>
        </AdminCard>

        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-white">
                {suppliers.filter(s => !s.verified).length}
              </p>
            </div>
          </div>
        </AdminCard>

        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Shield className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Insured</p>
              <p className="text-2xl font-bold text-white">
                {suppliers.filter(s => s.insurance_active).length}
              </p>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500"
        >
          <option value="all">All Countries</option>
          {countries.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value)}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500"
        >
          <option value="all">All Industries</option>
          {industries.map(i => (
            <option key={i} value={i}>{i.charAt(0).toUpperCase() + i.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <AdminCard>
          <h2 className="text-lg font-semibold text-white mb-4">
            {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Industry *</label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {industries.map(i => (
                    <option key={i} value={i}>{i.charAt(0).toUpperCase() + i.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Materials (one per line)</label>
                <textarea
                  value={formData.materials.join('\\n')}
                  onChange={(e) => setFormData({ ...formData, materials: e.target.value.split('\\n') })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.verified}
                    onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Verified Supplier</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.insurance_active}
                    onChange={(e) => setFormData({ ...formData, insurance_active: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Has Insurance</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingSupplier(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                {editingSupplier ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </AdminCard>
      )}

      {/* Suppliers Table */}
      <AdminCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Country</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Industry</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-300">Rating</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-300">Status</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map(supplier => (
                <tr key={supplier.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="py-3 px-4 text-sm text-white font-medium">{supplier.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-300">{supplier.country}</td>
                  <td className="py-3 px-4 text-sm text-gray-300 capitalize">{supplier.industry}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-sm font-medium text-white">
                      {(supplier.rating || 0).toFixed(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <StatusBadge variant={supplier.verified ? 'success' : 'warning'} size="sm">
                        {supplier.verified ? 'Verified' : 'Pending'}
                      </StatusBadge>
                      {supplier.insurance_active && (
                        <StatusBadge variant="info" size="sm">Insured</StatusBadge>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleVerify(supplier.id, supplier.verified)}
                        className="p-2 hover:bg-gray-700 rounded-lg"
                        title={supplier.verified ? 'Unverify' : 'Verify'}
                      >
                        <Shield className={`h-4 w-4 ${supplier.verified ? 'text-green-400' : 'text-gray-400'}`} />
                      </button>
                      <button
                        onClick={() => handleEdit(supplier)}
                        className="p-2 hover:bg-gray-700 rounded-lg"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4 text-gray-300" />
                      </button>
                      <button
                        onClick={() => handleDelete(supplier.id)}
                        className="p-2 hover:bg-gray-700 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredSuppliers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No suppliers found</p>
            </div>
          )}
        </div>
      </AdminCard>
        </div>
      </div>
    </div>
  );
};

export default AdminSupplierManager;


