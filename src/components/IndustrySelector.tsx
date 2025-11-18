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
  AlertTriangle,
  Sparkles,
  Zap,
  Target,
  Award,
  Globe
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
      tagline: 'Build the Future',
      description: 'Comprehensive solutions for building materials, supplier networks, and project management',
      icon: Building2,
      color: 'blue',
      primaryColor: 'blue-600',
      secondaryColor: 'indigo-600',
      bgGradient: 'from-blue-50 via-indigo-50 to-purple-50',
      darkBgGradient: 'from-blue-950 via-indigo-950 to-purple-950',
      borderColor: 'border-blue-200',
      darkBorderColor: 'border-blue-800',
      hoverBorder: 'hover:border-blue-400 dark:hover:border-blue-600',
      hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-950/50',
      selectedBorder: 'border-blue-500 dark:border-blue-400',
      selectedBg: 'bg-blue-50 dark:bg-blue-950/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50',
      buttonBg: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
      features: [
        { icon: BarChart3, text: 'Project Management Integration' },
        { icon: TrendingUp, text: 'Material Cost Tracking' },
        { icon: Users, text: 'Supplier Performance Analysis' },
        { icon: Shield, text: 'Safety & Compliance Alerts' },
        { icon: Truck, text: 'Equipment Rental Tracking' }
      ],
      materials: ['Cement', 'Steel', 'Timber', 'Sand', 'Aggregates', 'Bricks'],
      metrics: [
        { label: 'Active Projects', value: '1,200+' },
        { label: 'Material Orders', value: '5.4K' },
        { label: 'Supplier Network', value: '850+' },
        { label: 'Price Volatility', value: 'Low' }
      ],
      stats: [
        { icon: Target, label: 'Projects Tracked', value: '12K+' },
        { icon: Award, label: 'Verified Suppliers', value: '850+' },
        { icon: Zap, label: 'Avg. Response Time', value: '<2hrs' }
      ]
    },
    agriculture: {
      name: 'Agriculture',
      tagline: 'Grow with Confidence',
      description: 'Complete farming solutions with seasonal planning, input tracking, and agricultural intelligence',
      icon: Wheat,
      color: 'green',
      primaryColor: 'green-600',
      secondaryColor: 'emerald-600',
      bgGradient: 'from-green-50 via-emerald-50 to-teal-50',
      darkBgGradient: 'from-green-950 via-emerald-950 to-teal-950',
      borderColor: 'border-green-200',
      darkBorderColor: 'border-green-800',
      hoverBorder: 'hover:border-green-400 dark:hover:border-green-600',
      hoverBg: 'hover:bg-green-50 dark:hover:bg-green-950/50',
      selectedBorder: 'border-green-500 dark:border-green-400',
      selectedBg: 'bg-green-50 dark:bg-green-950/30',
      iconColor: 'text-green-600 dark:text-green-400',
      iconBg: 'bg-green-100 dark:bg-green-900/50',
      buttonBg: 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600',
      features: [
        { icon: Clock, text: 'Seasonal Planning & Calendar' },
        { icon: Package, text: 'Crop-Specific Input Tracking' },
        { icon: Globe, text: 'Weather Integration' },
        { icon: Target, text: 'Harvest Planning' },
        { icon: Tractor, text: 'Farm Equipment Management' }
      ],
      materials: ['Fertilizer', 'Seeds', 'Pesticides', 'Equipment', 'Irrigation', 'Feed'],
      metrics: [
        { label: 'Active Farms', value: '2,400+' },
        { label: 'Input Orders', value: '8.2K' },
        { label: 'Supplier Network', value: '620+' },
        { label: 'Seasonal Variation', value: 'Tracked' }
      ],
      stats: [
        { icon: Target, label: 'Farms Managed', value: '24K+' },
        { icon: Award, label: 'Verified Suppliers', value: '620+' },
        { icon: Zap, label: 'Avg. Delivery Time', value: '<24hrs' }
      ]
    }
  };

  const industryConfig = config[industry];
  const Icon = industryConfig.icon;

  return (
    <div 
      className={`
        relative group cursor-pointer transition-all duration-500 transform
        ${isSelected ? 'scale-[1.02] z-10' : 'hover:scale-[1.01]'}
      `}
      onClick={onSelect}
    >
      {/* Glow effect when selected */}
      {isSelected && (
        <div className={`absolute -inset-1 rounded-3xl opacity-20 blur-xl transition-opacity duration-500 ${
          isConstruction 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600' 
            : 'bg-gradient-to-r from-green-600 to-emerald-600'
        }`}></div>
      )}
      
      <div 
        className={`
          relative p-8 rounded-3xl border-2 transition-all duration-500 backdrop-blur-sm
          ${isSelected ? `${industryConfig.selectedBorder} ${industryConfig.selectedBg} shadow-2xl` : `${industryConfig.borderColor} dark:${industryConfig.darkBorderColor} bg-white/80 dark:bg-gray-900/80`}
          ${!isSelected ? `${industryConfig.hoverBorder} ${industryConfig.hoverBg}` : ''}
          bg-gradient-to-br ${industryConfig.bgGradient} dark:${industryConfig.darkBgGradient}
        `}
      >
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute -top-3 -right-3 w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-xl border-2 border-gray-200 dark:border-gray-700 animate-bounce">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className={`
            w-24 h-24 mx-auto mb-5 rounded-2xl ${industryConfig.iconBg} flex items-center justify-center shadow-lg
            ${isSelected ? 'ring-4 ring-white dark:ring-gray-700 ring-opacity-50 scale-110' : ''}
            transition-all duration-500
          `}>
            <Icon size={48} className={industryConfig.iconColor} />
          </div>
          <div className="mb-2">
            <span className={`text-xs font-semibold uppercase tracking-wider ${industryConfig.iconColor} opacity-70`}>
              {industryConfig.tagline}
            </span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{industryConfig.name}</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed max-w-sm mx-auto">{industryConfig.description}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {industryConfig.stats.map((stat, index) => {
            const StatIcon = stat.icon;
            return (
              <div 
                key={index}
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-3 text-center border border-gray-200 dark:border-gray-700"
              >
                <StatIcon size={20} className={`${industryConfig.iconColor} mx-auto mb-1`} />
                <div className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Features */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
            <Sparkles size={16} className={`mr-2 ${industryConfig.iconColor}`} />
            Key Features
          </h3>
          <ul className="space-y-2.5">
            {industryConfig.features.slice(0, 4).map((feature, index) => {
              const FeatureIcon = feature.icon;
              return (
                <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-center group/item">
                  <div className={`w-8 h-8 rounded-lg ${industryConfig.iconBg} flex items-center justify-center mr-3 group-hover/item:scale-110 transition-transform`}>
                    <FeatureIcon size={16} className={industryConfig.iconColor} />
                  </div>
                  <span className="flex-1">{feature.text}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Materials */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <Package size={16} className={`mr-2 ${industryConfig.iconColor}`} />
            Materials & Inputs
          </h3>
          <div className="flex flex-wrap gap-2">
            {industryConfig.materials.slice(0, 5).map((material, index) => (
              <span 
                key={index}
                className="px-3 py-1.5 text-xs font-medium bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              >
                {material}
              </span>
            ))}
            {industryConfig.materials.length > 5 && (
              <span className="px-3 py-1.5 text-xs font-medium bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                +{industryConfig.materials.length - 5} more
              </span>
            )}
          </div>
        </div>

        {/* Metrics */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <TrendingUp size={16} className={`mr-2 ${industryConfig.iconColor}`} />
            Track & Monitor
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {industryConfig.metrics.map((metric, index) => (
              <div key={index} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{metric.label}</div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">{metric.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-200 flex items-center justify-center group"
          >
            <MapPin size={16} className="mr-2 group-hover:scale-110 transition-transform" />
            Preview
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className={`flex-1 px-4 py-3 text-sm font-semibold text-white rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg ${industryConfig.buttonBg} group`}
          >
            Select
            <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-200/20 dark:bg-indigo-900/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-200/10 dark:bg-purple-900/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-xl transform hover:scale-110 transition-transform duration-300">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 bg-clip-text">
            Welcome to Qivook
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-3 font-medium">
            Choose your industry to get started
          </p>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Get industry-specific insights, tools, and solutions tailored to your business needs. 
            Join thousands of companies already using Qivook to optimize their operations.
          </p>
        </div>

        {/* Industry Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
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
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={() => handleSelectIndustry(selectedIndustry)}
              className="group px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-lg rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/50 flex items-center mx-auto"
            >
              Continue with {selectedIndustry === 'construction' ? 'Construction' : 'Agriculture'}
              <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" size={22} />
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              You can change your industry anytime from settings
            </p>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {showPreview === 'construction' ? 'Construction' : 'Agriculture'} Industry Preview
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                      Explore what you'll get with this industry selection
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPreview(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-8 overflow-y-auto max-h-[calc(85vh-120px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-4">
                      <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">Dashboard Overview</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Real-time metrics and insights tailored to your industry with customizable widgets and analytics</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl p-6 border border-green-200 dark:border-green-800">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center mb-4">
                      <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">Price Tracking</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Monitor material prices, market trends, and get alerts for price changes in real-time</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center mb-4">
                      <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">Supplier Network</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Find and evaluate verified suppliers in your industry with ratings, reviews, and performance metrics</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-2xl p-6 border border-orange-200 dark:border-orange-800">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-xl flex items-center justify-center mb-4">
                      <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">Advanced Analytics</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Advanced reporting, forecasting tools, and data-driven insights to optimize your operations</p>
                  </div>
                </div>
                
                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setShowPreview(null)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setSelectedIndustry(showPreview);
                      setShowPreview(null);
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold transition-all shadow-lg"
                  >
                    Select This Industry
                  </button>
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
