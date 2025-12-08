import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Shield,
  Star,
  TrendingUp,
  Package,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Award,
  FileText,
  MessageSquare,
  Truck
} from 'lucide-react';
import { useSuppliers } from '../hooks/useData';
import { unifiedApi } from '../services/unifiedApi';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { SupplierReviewsSection } from '../components/SupplierReviewsSection';

interface SupplierDetailProps {}

const SupplierDetail: React.FC<SupplierDetailProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'materials' | 'performance'>('overview');

  useEffect(() => {
    const fetchSupplier = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await unifiedApi.suppliers.getById(id);
        setSupplier(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load supplier');
      } finally {
        setLoading(false);
      }
    };

    fetchSupplier();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-12 w-12 text-error-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Supplier Not Found</h2>
        <p className="text-gray-600 mb-4">{error || 'The supplier you\'re looking for doesn\'t exist.'}</p>
        <button
          onClick={() => navigate('/app/suppliers')}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Back to Directory
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
    { id: 'materials', label: 'Materials', icon: Package },
    { id: 'performance', label: 'Performance', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/app/suppliers')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Directory</span>
          </button>

          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {/* Company Logo/Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
                {supplier.name.charAt(0)}
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{supplier.name}</h1>
                  {supplier.verified && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                      <CheckCircle className="h-4 w-4" />
                      <span>Verified</span>
                    </div>
                  )}
                  {supplier.insurance_active && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      <Shield className="h-4 w-4" />
                      <span>Insured</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{supplier.country}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-900">{supplier.rating?.toFixed(1)}</span>
                    <span className="text-gray-500">({supplier.total_reviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <span className="capitalize">{supplier.industry}</span>
                  </div>
                </div>

                {supplier.description && (
                  <p className="mt-3 text-gray-700 max-w-2xl">{supplier.description}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>Contact</span>
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span>Request Quote</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-1 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'overview' && (
              <>
                {/* Key Metrics */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-600">On-Time Delivery</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{supplier.on_time_delivery_rate?.toFixed(1)}%</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-600">Total Orders</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{supplier.total_orders || 0}</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm text-gray-600">Average Rating</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{supplier.rating?.toFixed(1)}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                        <span className="text-sm text-gray-600">Reviews</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{supplier.total_reviews}</p>
                    </div>
                  </div>
                </div>

                {/* About */}
                {supplier.description && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
                    <p className="text-gray-700 leading-relaxed">{supplier.description}</p>
                  </div>
                )}

                {/* Materials Supplied */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Materials Supplied</h2>
                  <div className="flex flex-wrap gap-2">
                    {supplier.materials?.map((material: string) => (
                      <span
                        key={material}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium capitalize"
                      >
                        {material}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                {supplier.certifications && supplier.certifications.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h2>
                    <div className="space-y-2">
                      {supplier.certifications.map((cert: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'reviews' && (
              <SupplierReviewsSection supplierId={supplier.id} />
            )}

            {activeTab === 'materials' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Material Catalog</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {supplier.materials?.map((material: string) => (
                    <div key={material} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="h-5 w-5 text-primary-600" />
                        <h3 className="font-semibold text-gray-900 capitalize">{material}</h3>
                      </div>
                      <p className="text-sm text-gray-600">Available for purchase</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">On-Time Delivery</span>
                      <span className="text-sm font-semibold text-gray-900">{supplier.on_time_delivery_rate?.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${supplier.on_time_delivery_rate || 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Quality Rating</span>
                      <span className="text-sm font-semibold text-gray-900">{((supplier.rating || 0) * 10).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(supplier.rating || 0) * 10}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-3">
                {supplier.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a href={`tel:${supplier.phone}`} className="text-primary-600 hover:underline">
                      {supplier.phone}
                    </a>
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <a href={`mailto:${supplier.email}`} className="text-primary-600 hover:underline">
                      {supplier.email}
                    </a>
                  </div>
                )}
                {supplier.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Insurance Status */}
            {supplier.insurance_active && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Insured Supplier</h3>
                    <p className="text-sm text-blue-700">
                      This supplier is covered by trade insurance
                      {supplier.insurance_expiry && (
                        <span> until {new Date(supplier.insurance_expiry).toLocaleDateString()}</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Industry</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">{supplier.industry}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Location</span>
                  <span className="text-sm font-medium text-gray-900">{supplier.country}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Verified</span>
                  <span className={`text-sm font-medium ${supplier.verified ? 'text-green-600' : 'text-gray-400'}`}>
                    {supplier.verified ? 'Yes' : 'No'}
                  </span>
                </div>
                {supplier.verified_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Verified On</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(supplier.verified_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDetail;


