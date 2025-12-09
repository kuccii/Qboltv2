import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Search,
  CreditCard,
  Upload,
  Download
} from 'lucide-react';
import { unifiedApi } from '../services/unifiedApi';
import { AdminCard } from '../components/AdminCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminFinancingManager: React.FC = () => {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProviderType, setSelectedProviderType] = useState('all');
  const [formData, setFormData] = useState({
    provider_name: '',
    provider_type: 'bank' as 'bank' | 'fintech' | 'platform',
    industry: [''],
    countries: [''],
    min_amount: '',
    max_amount: '',
    interest_rate: '',
    term_days: '',
    active: true
  });

  const providerTypes = ['bank', 'fintech', 'platform'];
  const industries = ['construction', 'agriculture'];

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const result = await unifiedApi.financing.getAll({ limit: 1000 });
      setOffers(result.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load financing offers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const filteredIndustry = formData.industry.filter(i => i.trim() !== '');
      const filteredCountries = formData.countries.filter(c => c.trim() !== '');
      
      const offerData: any = {
        provider_name: formData.provider_name,
        provider_type: formData.provider_type,
        active: formData.active,
      };

      // Only include arrays if they have values
      if (filteredIndustry.length > 0) {
        offerData.industry = filteredIndustry;
      }
      if (filteredCountries.length > 0) {
        offerData.countries = filteredCountries;
      }
      
      // Only include numeric fields if they have values
      if (formData.min_amount && formData.min_amount.trim() !== '') {
        offerData.min_amount = parseFloat(formData.min_amount);
      }
      if (formData.max_amount && formData.max_amount.trim() !== '') {
        offerData.max_amount = parseFloat(formData.max_amount);
      }
      if (formData.interest_rate && formData.interest_rate.trim() !== '') {
        offerData.interest_rate = parseFloat(formData.interest_rate);
      }
      if (formData.term_days && formData.term_days.trim() !== '') {
        offerData.term_days = parseInt(formData.term_days);
      }

      if (editingOffer) {
        await unifiedApi.financing.update(editingOffer.id, offerData);
      } else {
        await unifiedApi.financing.create(offerData);
      }

      resetForm();
      loadOffers();
    } catch (err: any) {
      alert(err.message || 'Failed to save financing offer. Please try again.');
    }
  };

  const handleEdit = (offer: any) => {
    setEditingOffer(offer);
    setFormData({
      provider_name: offer.provider_name,
      provider_type: offer.provider_type,
      industry: offer.industry && offer.industry.length > 0 ? offer.industry : [''],
      countries: offer.countries && offer.countries.length > 0 ? offer.countries : [''],
      min_amount: (offer.min_amount || '').toString(),
      max_amount: (offer.max_amount || '').toString(),
      interest_rate: (offer.interest_rate || '').toString(),
      term_days: (offer.term_days || '').toString(),
      active: offer.active !== false
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this financing offer?')) return;

    try {
      await unifiedApi.financing.delete(id);
      loadOffers();
    } catch (err: any) {
      alert(err.message || 'Failed to delete financing offer. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      provider_name: '',
      provider_type: 'bank',
      industry: [''],
      countries: [''],
      min_amount: '',
      max_amount: '',
      interest_rate: '',
      term_days: '',
      active: true
    });
    setShowCreateForm(false);
    setEditingOffer(null);
  };

  const filteredOffers = offers
    .filter(o =>
      searchTerm === '' ||
      o.provider_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(o => selectedProviderType === 'all' || o.provider_type === selectedProviderType);

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return (
    <div className="p-6">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <p className="text-red-600">{error}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Financing Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage financing offers and applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Offers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{offers.length}</p>
            </div>
          </div>
        </AdminCard>

        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {offers.filter(o => o.active).length}
              </p>
            </div>
          </div>
        </AdminCard>

        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Inactive</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {offers.filter(o => !o.active).length}
              </p>
            </div>
          </div>
        </AdminCard>

        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
              <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Provider Types</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Set(offers.map(o => o.provider_type)).size}
              </p>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search offers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={selectedProviderType}
            onChange={(e) => setSelectedProviderType(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Types</option>
            {providerTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Offer</span>
        </button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {editingOffer ? 'Edit Financing Offer' : 'Add New Financing Offer'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Provider Name *</label>
                <input
                  type="text"
                  required
                  value={formData.provider_name}
                  onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Provider Type *</label>
                <select
                  required
                  value={formData.provider_type}
                  onChange={(e) => setFormData({ ...formData, provider_type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {providerTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Amount (USD)</label>
                <input
                  type="number"
                  value={formData.min_amount}
                  onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Amount (USD)</label>
                <input
                  type="number"
                  value={formData.max_amount}
                  onChange={(e) => setFormData({ ...formData, max_amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.interest_rate}
                  onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Term (Days)</label>
                <input
                  type="number"
                  value={formData.term_days}
                  onChange={(e) => setFormData({ ...formData, term_days: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Industries</label>
              {formData.industry.map((ind, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <select
                    value={ind}
                    onChange={(e) => {
                      const newIndustries = [...formData.industry];
                      newIndustries[index] = e.target.value;
                      setFormData({ ...formData, industry: newIndustries });
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select industry</option>
                    {industries.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                  {formData.industry.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newIndustries = formData.industry.filter((_, i) => i !== index);
                        setFormData({ ...formData, industry: newIndustries });
                      }}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, industry: [...formData.industry, ''] })}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                + Add Industry
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Countries</label>
              {formData.countries.map((country, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => {
                      const newCountries = [...formData.countries];
                      newCountries[index] = e.target.value;
                      setFormData({ ...formData, countries: newCountries });
                    }}
                    placeholder="Country name"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  {formData.countries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newCountries = formData.countries.filter((_, i) => i !== index);
                        setFormData({ ...formData, countries: newCountries });
                      }}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, countries: [...formData.countries, ''] })}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                + Add Country
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                {editingOffer ? 'Update' : 'Create'} Offer
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Offers List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount Range</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Interest Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOffers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No financing offers found
                  </td>
                </tr>
              ) : (
                filteredOffers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{offer.provider_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white capitalize">{offer.provider_type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white">
                        ${offer.min_amount?.toLocaleString() || 'N/A'} - ${offer.max_amount?.toLocaleString() || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white">{offer.interest_rate || 'N/A'}%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={offer.active ? 'active' : 'inactive'} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(offer)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(offer.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminFinancingManager;

