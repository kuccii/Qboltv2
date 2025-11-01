import React, { useState } from 'react';
import { 
  Building2, 
  Wheat, 
  ArrowRight, 
  CheckCircle, 
  Hammer, 
  Wrench, 
  Truck,
  Tractor,
  Leaf,
  Droplets,
  TrendingUp,
  Users,
  Shield,
  Clock,
  MapPin,
  BarChart3,
  Package,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useIndustry } from '../contexts/IndustryContext';
import { useNavigate } from 'react-router-dom';

interface IndustryCardProps {
  industry: 'construction' | 'agriculture';
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
}

const IndustryCard: React.FC<IndustryCardProps> = ({ industry, isSelected, onSelect, onPreview }) => {
  const isConstruction = industry === 'construction';
  
  const config = {
    construction: {
      name: 'Construction',
      description: 'Building materials, supplier networks, and project management',
      icon: Building2,
      color: 'blue',
      bgGradient: 'from-blue-50 to-indigo-100',
      borderColor: 'border-blue-200',
      hoverBorder: 'hover:border-blue-400',
      hoverBg: 'hover:bg-blue-50',
      selectedBorder: 'border-blue-500',
      selectedBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      features: [
        'Project Management Integration',
        'Material Cost Tracking',
        'Supplier Performance Analysis',
        'Safety & Compliance Alerts',
        'Equipment Rental Tracking'
      ],
      materials: ['Cement', 'Steel', 'Timber', 'Sand', 'Aggregates'],
      metrics: ['Active Projects', 'Material Orders', 'Supplier Network', 'Price Volatility']
    },
    agriculture: {
      name: 'Agriculture',
      description: 'Farming inputs, seasonal patterns, and agricultural solutions',
      icon: Wheat,
      color: 'green',
      bgGradient: 'from-green-50 to-emerald-100',
      borderColor: 'border-green-200',
      hoverBorder: 'hover:border-green-400',
      hoverBg: 'hover:bg-green-50',
      selectedBorder: 'border-green-500',
      selectedBg: 'bg-green-50',
      iconColor: 'text-green-600',
      features: [
        'Seasonal Planning & Calendar',
        'Crop-Specific Input Tracking',
        'Weather Integration',
        'Harvest Planning',
        'Farm Equipment Management'
      ],
      materials: ['Fertilizer', 'Seeds', 'Pesticides', 'Equipment', 'Irrigation'],
      metrics: ['Active Farms', 'Input Orders', 'Supplier Network', 'Seasonal Variation']
    }
  };

  const industryConfig = config[industry];
  const Icon = industryConfig.icon;

  return (
    <div 
      className={`
        relative group cursor-pointer transition-all duration-300 transform hover:scale-105
        ${isSelected ? 'scale-105 shadow-2xl' : 'hover:shadow-xl'}
      `}
      onClick={onSelect}
    >
      <div 
        className={`
          p-8 rounded-2xl border-2 transition-all duration-300
          ${isSelected ? industryConfig.selectedBorder + ' ' + industryConfig.selectedBg : industryConfig.borderColor}
          ${!isSelected ? industryConfig.hoverBorder + ' ' + industryConfig.hoverBg : ''}
          bg-gradient-to-br ${industryConfig.bgGradient}
        `}
      >
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-white flex items-center justify-center shadow-lg ${isSelected ? 'ring-4 ring-white ring-opacity-50' : ''}`}>
            <Icon size={40} className={industryConfig.iconColor} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{industryConfig.name}</h2>
          <p className="text-gray-600 text-sm leading-relaxed">{industryConfig.description}</p>
        </div>

        {/* Features */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <BarChart3 size={16} className="mr-2" />
            Key Features
          </h3>
          <ul className="space-y-2">
            {industryConfig.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="text-xs text-gray-600 flex items-center">
                <div className="w-1.5 h-1.5 bg-current rounded-full mr-2 opacity-60" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Materials */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Package size={16} className="mr-2" />
            Materials & Inputs
          </h3>
          <div className="flex flex-wrap gap-1">
            {industryConfig.materials.slice(0, 4).map((material, index) => (
              <span 
                key={index}
                className="px-2 py-1 text-xs bg-white bg-opacity-60 rounded-full text-gray-600"
              >
                {material}
              </span>
            ))}
            {industryConfig.materials.length > 4 && (
              <span className="px-2 py-1 text-xs bg-white bg-opacity-60 rounded-full text-gray-500">
                +{industryConfig.materials.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Metrics */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <TrendingUp size={16} className="mr-2" />
            Track & Monitor
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {industryConfig.metrics.map((metric, index) => (
              <div key={index} className="text-xs text-gray-600 bg-white bg-opacity-40 rounded-lg p-2 text-center">
                {metric}
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-white bg-opacity-60 rounded-lg hover:bg-opacity-80 transition-all duration-200 flex items-center justify-center"
          >
            <MapPin size={14} className="mr-2" />
            Preview
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 flex items-center justify-center ${
              isConstruction 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            Select
            <ArrowRight size={14} className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

const IndustrySelector: React.FC = () => {
  const { setIndustry } = useAuth();
  const { setIndustry: setIndustryContext } = useIndustry();
  const navigate = useNavigate();
  const [selectedIndustry, setSelectedIndustry] = useState<'construction' | 'agriculture' | null>(null);
  const [showPreview, setShowPreview] = useState<'construction' | 'agriculture' | null>(null);

  const handleSelectIndustry = (industry: 'construction' | 'agriculture') => {
    setIndustry(industry);
    setIndustryContext(industry);
    navigate('/app');
  };

  const handlePreview = (industry: 'construction' | 'agriculture') => {
    setShowPreview(industry);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-10 rounded-full mb-6">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to Qivook</h1>
          <p className="text-xl text-blue-100 mb-2">Choose your industry to get started</p>
          <p className="text-blue-200">Get industry-specific insights, tools, and solutions tailored to your business needs</p>
        </div>

        {/* Industry Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <IndustryCard
            industry="construction"
            isSelected={selectedIndustry === 'construction'}
            onSelect={() => setSelectedIndustry('construction')}
            onPreview={() => handlePreview('construction')}
          />
          <IndustryCard
            industry="agriculture"
            isSelected={selectedIndustry === 'agriculture'}
            onSelect={() => setSelectedIndustry('agriculture')}
            onPreview={() => handlePreview('agriculture')}
          />
        </div>

        {/* Continue Button */}
        {selectedIndustry && (
          <div className="text-center">
            <button
              onClick={() => handleSelectIndustry(selectedIndustry)}
              className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-xl flex items-center mx-auto"
            >
              Continue with {selectedIndustry === 'construction' ? 'Construction' : 'Agriculture'}
              <ArrowRight className="ml-2" size={20} />
            </button>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {showPreview === 'construction' ? 'Construction' : 'Agriculture'} Preview
                  </h2>
                  <button
                    onClick={() => setShowPreview(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Dashboard Overview</h3>
                      <p className="text-sm text-gray-600">Real-time metrics and insights tailored to your industry</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Price Tracking</h3>
                      <p className="text-sm text-gray-600">Monitor material prices and market trends</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Supplier Network</h3>
                      <p className="text-sm text-gray-600">Find and evaluate suppliers in your industry</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Analytics</h3>
                      <p className="text-sm text-gray-600">Advanced reporting and forecasting tools</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowPreview(null)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setSelectedIndustry(showPreview);
                        setShowPreview(null);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Select This Industry
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndustrySelector;