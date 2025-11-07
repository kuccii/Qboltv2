import React, { useMemo, useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Star, 
  Calendar, 
  AlertCircle, 
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  FileText,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import SupplierScore from '../components/SupplierScore';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../contexts/AuthContext';
import { useIndustry } from '../contexts/IndustryContext';
import { unifiedApi } from '../services/unifiedApi';
import { useSuppliers } from '../hooks/useData';
import { VerificationBadge, InsuranceIndicator } from '../design-system';
import HeaderStrip from '../components/HeaderStrip';
import {
  AppLayout,
  PageLayout,
} from '../design-system';

interface SupplierWithScores {
  id: string;
  name: string;
  location: string;
  country: string;
  industry: string;
  materials: string[];
  tier: 'premium' | 'standard';
  score: number;
  weightedScore: number;
  qualityScore: number;
  deliveryScore: number;
  reliabilityScore: number;
  lastDelivery?: string;
  rating?: number;
  verification?: any;
  insurance?: any;
}

const SupplierScores: React.FC = () => {
  const { currentUser, authState } = useAuth();
  const { currentIndustry, industryConfig, getIndustryTerm } = useIndustry();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [selectedTier, setSelectedTier] = useState('all');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [weights, setWeights] = useState<{ quality: number; delivery: number; reliability: number }>({ quality: 40, delivery: 30, reliability: 30 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const totalWeight = weights.quality + weights.delivery + weights.reliability || 1;
  
  // Fetch suppliers from backend
  const { suppliers: realSuppliers, loading: suppliersLoading, refetch: refetchSuppliers } = useSuppliers({
    country: authState.user?.country,
    industry: currentIndustry,
  });

  // Calculate scores from supplier data
  const suppliersWithScores = useMemo(() => {
    if (!realSuppliers || realSuppliers.length === 0) return [];
    
    return realSuppliers.map((supplier: any) => {
      // Calculate scores from reviews and ratings
      const qualityScore = supplier.quality_rating || supplier.rating || 75;
      const deliveryScore = supplier.delivery_rating || supplier.rating || 75;
      const reliabilityScore = supplier.reliability_rating || supplier.rating || 75;
      
      // Overall score (average)
      const overallScore = Math.round((qualityScore + deliveryScore + reliabilityScore) / 3);
      
      // Determine tier based on score
      const tier = overallScore >= 80 ? 'premium' : 'standard';
      
      return {
        id: supplier.id,
        name: supplier.name,
        location: supplier.location || supplier.city || 'Unknown',
        country: supplier.country,
        industry: supplier.industry,
        materials: supplier.materials || [],
        tier,
        score: overallScore,
        qualityScore,
        deliveryScore,
        reliabilityScore,
        lastDelivery: supplier.last_delivery || supplier.updated_at,
        rating: supplier.rating,
        verification: supplier.verified ? { status: 'verified' } : undefined,
        insurance: supplier.insurance_coverage ? { status: 'active', type: supplier.insurance_type } : undefined,
      };
    });
  }, [realSuppliers]);

  useEffect(() => {
    if (suppliersLoading) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [suppliersLoading]);

  // Filter suppliers based on industry and search/filter settings
  const filteredSuppliers = useMemo(() => {
    return suppliersWithScores
      .filter(supplier => supplier.industry === currentIndustry)
      .filter(supplier => 
        searchTerm === '' || 
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(supplier => 
        selectedMaterial === 'all' || 
        supplier.materials.includes(selectedMaterial)
      )
      .filter(supplier => 
        selectedTier === 'all' || 
        supplier.tier === selectedTier
      );
  }, [suppliersWithScores, currentIndustry, searchTerm, selectedMaterial, selectedTier]);

  const withWeightedScores = useMemo(() => {
    return filteredSuppliers.map(s => {
      const weighted = (
        s.qualityScore * weights.quality +
        s.deliveryScore * weights.delivery +
        s.reliabilityScore * weights.reliability
      ) / totalWeight;
      return { ...s, weightedScore: Math.round(weighted) };
    });
  }, [filteredSuppliers, weights, totalWeight]);
  
  // Get unique materials for this industry
  const uniqueMaterials = useMemo(() => {
    return Array.from(
      new Set(
        suppliersWithScores
          .filter(supplier => supplier.industry === currentIndustry)
          .flatMap(supplier => supplier.materials)
      )
    );
  }, [suppliersWithScores, currentIndustry]);
  
  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  return (
    <AppLayout>
      <HeaderStrip 
        title="Supplier Scores"
        subtitle="Evaluate and track supplier reliability and performance"
        chips={[
          { label: 'Total Suppliers', value: suppliersWithScores.length, variant: 'info' },
          { label: 'Premium', value: suppliersWithScores.filter(s => s.tier === 'premium').length, variant: 'success' },
          { label: 'Verified', value: suppliersWithScores.filter(s => s.verification).length, variant: 'success' },
        ]}
        right={
          <button 
            onClick={() => refetchSuppliers()}
            className="flex items-center gap-1 bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors px-3 py-1.5 rounded-md text-sm font-medium"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        }
      />

      <PageLayout maxWidth="full" padding="none">
        <div className="px-10 md:px-14 lg:px-20 py-8 space-y-8">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
                <span className="text-red-800 dark:text-red-200 font-medium">{error}</span>
              </div>
            </div>
          )}

          {!loading && (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div className="relative w-full md:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search suppliers..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2">
                      <Filter size={16} className="text-gray-500" />
                      <span className="text-sm text-gray-500">Filter by:</span>
                    </div>
                    
                    <div className="flex gap-2 flex-1">
                      <select
                        value={selectedMaterial}
                        onChange={e => setSelectedMaterial(e.target.value)}
                        className="appearance-none w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-3 pr-10 text-sm leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-gray-100"
                      >
                        <option value="all">All Materials</option>
                        {uniqueMaterials.map(material => (
                          <option key={material} value={material}>
                            {material.charAt(0).toUpperCase() + material.slice(1)}
                          </option>
                        ))}
                      </select>
                      
                      <select
                        value={selectedTier}
                        onChange={e => setSelectedTier(e.target.value)}
                        className="appearance-none w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-3 pr-10 text-sm leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-gray-100"
                      >
                        <option value="all">All Tiers</option>
                        <option value="premium">Premium</option>
                        <option value="standard">Standard</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Supplier
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Score
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Materials
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Reliability
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Last Delivery
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Tier
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {withWeightedScores.length > 0 ? (
                        withWeightedScores
                          .sort((a, b) => b.weightedScore - a.weightedScore)
                          .map(supplier => (
                          <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{supplier.name}</div>
                                    {supplier.verification && (
                                      <VerificationBadge 
                                        status={supplier.verification.status}
                                        type="documents"
                                        size="sm"
                                      />
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">{supplier.location}</div>
                                  {supplier.insurance && (
                                    <div className="mt-1">
                                      <InsuranceIndicator 
                                        status={supplier.insurance.status}
                                        type={supplier.insurance.type}
                                        size="sm"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <SupplierScore score={supplier.weightedScore} size="sm" />
                                <div className="ml-2">
                                  <div className="text-xs text-gray-500 dark:text-gray-400">Quality: {supplier.qualityScore}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">Delivery: {supplier.deliveryScore}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-wrap gap-1">
                                {supplier.materials.map((material, index) => (
                                  <span 
                                    key={index} 
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                  >
                                    {material}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                  <div 
                                    className={`h-2.5 rounded-full ${
                                      supplier.reliabilityScore >= 80 
                                        ? 'bg-success-500' 
                                        : supplier.reliabilityScore >= 60 
                                          ? 'bg-warning-500' 
                                          : 'bg-error-500'
                                    }`}
                                    style={{ width: `${supplier.reliabilityScore}%` }}
                                  ></div>
                                </div>
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{supplier.reliabilityScore}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Calendar size={14} className="text-gray-400 mr-1" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">{formatDate(supplier.lastDelivery)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge 
                                type={supplier.tier === 'premium' ? 'success' : 'info'} 
                                text={supplier.tier.toUpperCase()} 
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button 
                                className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3" 
                                onClick={() => setSelectedSupplierId(supplier.id)}
                              >
                                Details
                              </button>
                              <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">Contact</button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                            {loading ? 'Loading suppliers...' : 'No suppliers match your search criteria'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DashboardCard 
                  title="Supplier Risk Assessment" 
                  icon={<AlertCircle size={20} />}
                >
                  <div className="space-y-4 mt-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={18} className="text-success-500" />
                        <span className="text-sm font-medium">Low Risk</span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {filteredSuppliers.filter(s => s.score >= 80).length} suppliers
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-success-500 h-2 rounded-full"
                        style={{ 
                          width: `${filteredSuppliers.length 
                            ? (filteredSuppliers.filter(s => s.score >= 80).length / filteredSuppliers.length) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <Clock size={18} className="text-warning-500" />
                        <span className="text-sm font-medium">Medium Risk</span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {filteredSuppliers.filter(s => s.score >= 60 && s.score < 80).length} suppliers
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-warning-500 h-2 rounded-full"
                        style={{ 
                          width: `${filteredSuppliers.length 
                            ? (filteredSuppliers.filter(s => s.score >= 60 && s.score < 80).length / filteredSuppliers.length) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <XCircle size={18} className="text-error-500" />
                        <span className="text-sm font-medium">High Risk</span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {filteredSuppliers.filter(s => s.score < 60).length} suppliers
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-error-500 h-2 rounded-full"
                        style={{ 
                          width: `${filteredSuppliers.length 
                            ? (filteredSuppliers.filter(s => s.score < 60).length / filteredSuppliers.length) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Risk Mitigation Recommendations</h3>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-start gap-2">
                        <span className="text-primary-500 mt-1">•</span>
                        <span>Diversify your supplier base for critical materials to reduce dependency risks.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary-500 mt-1">•</span>
                        <span>Establish clear performance metrics and regular review sessions with medium-risk suppliers.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary-500 mt-1">•</span>
                        <span>Consider phased transition plans for high-risk suppliers that are critical to your operations.</span>
                      </li>
                    </ul>
                  </div>
                </DashboardCard>
                
                <DashboardCard 
                  title="Top Performing Suppliers" 
                  icon={<Star size={20} />}
                >
                  <div className="space-y-4 mt-3">
                    {filteredSuppliers
                      .sort((a, b) => b.score - a.score)
                      .slice(0, 3)
                      .map(supplier => (
                        <div key={supplier.id} className="flex items-start gap-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                          <SupplierScore score={supplier.score} />
                          <div>
                            <h3 className="font-medium text-gray-800 dark:text-gray-200">{supplier.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{supplier.location}</p>
                            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Reliability</span>
                                <div className="font-medium text-gray-800 dark:text-gray-200">{supplier.reliabilityScore}%</div>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Quality</span>
                                <div className="font-medium text-gray-800 dark:text-gray-200">{supplier.qualityScore}%</div>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Delivery</span>
                                <div className="font-medium text-gray-800 dark:text-gray-200">{supplier.deliveryScore}%</div>
                              </div>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-1">
                              {supplier.materials.map((material, index) => (
                                <span 
                                  key={index} 
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                >
                                  {material}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    
                    {filteredSuppliers.length === 0 && (
                      <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
                        No suppliers found
                      </div>
                    )}
                  </div>
                </DashboardCard>
              </div>

              <DashboardCard 
                title="Supplier Evaluation Framework" 
                icon={<Users size={20} />}
              >
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-full bg-success-100 dark:bg-success-900/30">
                        <CheckCircle size={18} className="text-success-600 dark:text-success-400" />
                      </div>
                      <h3 className="font-medium text-gray-800 dark:text-gray-200">Quality Assessment</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-start gap-2">
                        <span className="text-success-500 mt-1">•</span>
                        <span>Material quality consistency ratings</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-success-500 mt-1">•</span>
                        <span>Defect rate monitoring</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-success-500 mt-1">•</span>
                        <span>Compliance with industry standards</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-success-500 mt-1">•</span>
                        <span>Quality control process assessment</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30">
                        <Clock size={18} className="text-primary-600 dark:text-primary-400" />
                      </div>
                      <h3 className="font-medium text-gray-800 dark:text-gray-200">Reliability Metrics</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-start gap-2">
                        <span className="text-primary-500 mt-1">•</span>
                        <span>On-time delivery performance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary-500 mt-1">•</span>
                        <span>Order fulfillment accuracy</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary-500 mt-1">•</span>
                        <span>Supply consistency during peak demand</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary-500 mt-1">•</span>
                        <span>Communication responsiveness</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-full bg-warning-100 dark:bg-warning-900/30">
                        <AlertCircle size={18} className="text-warning-600 dark:text-warning-400" />
                      </div>
                      <h3 className="font-medium text-gray-800 dark:text-gray-200">Risk Factors</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-start gap-2">
                        <span className="text-warning-500 mt-1">•</span>
                        <span>Financial stability assessment</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-warning-500 mt-1">•</span>
                        <span>Geographic risk exposure</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-warning-500 mt-1">•</span>
                        <span>Supplier dependency analysis</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-warning-500 mt-1">•</span>
                        <span>Regulatory compliance history</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 p-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Our scoring system aggregates data from multiple sources including past transaction records, delivery performance, quality inspections, and customer feedback. Scores are updated monthly to ensure they reflect current supplier capabilities and performance trends.
                  </p>
                </div>
              </DashboardCard>

              {/* Details Drawer */}
              {selectedSupplierId && (
                <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-xl z-30">
                  <div className="max-w-7xl mx-auto px-6 py-4">
                    {withWeightedScores.filter(s => s.id === selectedSupplierId).map(s => (
                      <div key={s.id} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{s.name}</h3>
                            {s.verification && (
                              <VerificationBadge 
                                status={s.verification.status}
                                type="documents"
                                size="sm"
                              />
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{s.location}</p>
                          <div className="mt-3 flex items-center gap-2 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Tier:</span>
                            <StatusBadge type={s.tier === 'premium' ? 'success' : 'info'} text={s.tier.toUpperCase()} />
                          </div>
                          {s.insurance && (
                            <div className="mt-2">
                              <InsuranceIndicator 
                                status={s.insurance.status}
                                type={s.insurance.type}
                                size="sm"
                                showAmount={true}
                              />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Score Breakdown</h4>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <li>Weighted Score: {s.weightedScore}</li>
                            <li>Quality: {s.qualityScore} × {weights.quality}%</li>
                            <li>Delivery: {s.deliveryScore} × {weights.delivery}%</li>
                            <li>Reliability: {s.reliabilityScore} × {weights.reliability}%</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Risk Analysis</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Overall Score:</span>
                              <span className={`font-semibold ${s.score >= 80 ? 'text-success-600' : s.score >= 60 ? 'text-warning-600' : 'text-error-600'}`}>
                                {s.score}/100
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Tier:</span>
                              <span className="font-semibold">{s.tier}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Materials</h4>
                          <div className="flex flex-wrap gap-1">
                            {s.materials.map((m, i) => (
                              <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">{m}</span>
                            ))}
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">Contact</button>
                            <button className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200" onClick={() => setSelectedSupplierId(null)}>Close</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </PageLayout>
    </AppLayout>
  );
};

export default SupplierScores;