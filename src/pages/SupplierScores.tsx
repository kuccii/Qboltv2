import React, { useState } from 'react';
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
  Clock
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import SupplierScore from '../components/SupplierScore';
import StatusBadge from '../components/StatusBadge';
import { supplierData } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';

const SupplierScores: React.FC = () => {
  const { currentUser } = useAuth();
  const industry = currentUser?.industry || 'construction';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [selectedTier, setSelectedTier] = useState('all');
  
  // Filter suppliers based on industry and search/filter settings
  const filteredSuppliers = supplierData
    .filter(supplier => supplier.industry === industry)
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
  
  // Get unique materials for this industry
  const uniqueMaterials = Array.from(
    new Set(
      supplierData
        .filter(supplier => supplier.industry === industry)
        .flatMap(supplier => supplier.materials)
    )
  );
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Supplier Scores</h1>
          <p className="text-gray-500 mt-1">
            Evaluate and track supplier reliability and performance
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors px-3 py-1.5 rounded-md text-sm font-medium">
            <Download size={16} />
            Export List
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-card p-5 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-lg border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <span className="text-sm text-gray-500">Filter by:</span>
            </div>
            
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <select
                  value={selectedMaterial}
                  onChange={e => setSelectedMaterial(e.target.value)}
                  className="appearance-none w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Materials</option>
                  {uniqueMaterials.map(material => (
                    <option key={material} value={material}>
                      {material.charAt(0).toUpperCase() + material.slice(1)}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              
              <div className="relative flex-1">
                <select
                  value={selectedTier}
                  onChange={e => setSelectedTier(e.target.value)}
                  className="appearance-none w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Tiers</option>
                  <option value="premium">Premium</option>
                  <option value="standard">Standard</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Materials
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reliability
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Delivery
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSuppliers.length > 0 ? (
                filteredSuppliers.map(supplier => (
                  <tr key={supplier.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                          <div className="text-sm text-gray-500">{supplier.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <SupplierScore score={supplier.score} size="sm" />
                        <div className="ml-2">
                          <div className="text-xs text-gray-500">Quality: {supplier.qualityScore}</div>
                          <div className="text-xs text-gray-500">Delivery: {supplier.deliveryScore}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {supplier.materials.map((material, index) => (
                          <span 
                            key={index} 
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {material}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2.5">
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
                        <span className="ml-2 text-sm text-gray-700">{supplier.reliabilityScore}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar size={14} className="text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600">{formatDate(supplier.lastDelivery)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge 
                        type={supplier.tier === 'premium' ? 'success' : 'info'} 
                        text={supplier.tier.toUpperCase()} 
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 mr-3">Details</button>
                      <button className="text-gray-600 hover:text-gray-900">Contact</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No suppliers match your search criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
              <span className="text-sm text-gray-600">
                {filteredSuppliers.filter(s => s.score >= 80).length} suppliers
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
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
              <span className="text-sm text-gray-600">
                {filteredSuppliers.filter(s => s.score >= 60 && s.score < 80).length} suppliers
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
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
              <span className="text-sm text-gray-600">
                {filteredSuppliers.filter(s => s.score < 60).length} suppliers
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
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
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">Risk Mitigation Recommendations</h3>
            <ul className="space-y-2 text-sm text-gray-600">
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
                <div key={supplier.id} className="flex items-start gap-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <SupplierScore score={supplier.score} />
                  <div>
                    <h3 className="font-medium text-gray-800">{supplier.name}</h3>
                    <p className="text-sm text-gray-600">{supplier.location}</p>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Reliability</span>
                        <div className="font-medium text-gray-800">{supplier.reliabilityScore}%</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Quality</span>
                        <div className="font-medium text-gray-800">{supplier.qualityScore}%</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Delivery</span>
                        <div className="font-medium text-gray-800">{supplier.deliveryScore}%</div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {supplier.materials.map((material, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {material}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            
            <div className="text-center pt-2">
              <button className="text-sm text-primary-600 hover:text-primary-800 font-medium">
                View All Suppliers
              </button>
            </div>
          </div>
        </DashboardCard>
      </div>
      
      <DashboardCard 
        title="Supplier Evaluation Framework" 
        icon={<Users size={20} />}
      >
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-full bg-success-100">
                <CheckCircle size={18} className="text-success-600" />
              </div>
              <h3 className="font-medium text-gray-800">Quality Assessment</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
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
          
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-full bg-primary-100">
                <Clock size={18} className="text-primary-600" />
              </div>
              <h3 className="font-medium text-gray-800">Reliability Metrics</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
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
          
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-full bg-warning-100">
                <AlertCircle size={18} className="text-warning-600" />
              </div>
              <h3 className="font-medium text-gray-800">Risk Factors</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
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
        
        <div className="mt-6 p-4 border-t">
          <p className="text-sm text-gray-600">
            Our scoring system aggregates data from multiple sources including past transaction records, delivery performance, quality inspections, and customer feedback. Scores are updated monthly to ensure they reflect current supplier capabilities and performance trends.
          </p>
        </div>
      </DashboardCard>
    </div>
  );
};

export default SupplierScores;