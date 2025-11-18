import React, { useState } from 'react';
import { 
  Building2, 
  Wheat, 
  ArrowRight, 
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useIndustry } from '../contexts/IndustryContext';
import { useNavigate } from 'react-router-dom';

interface IndustryCardProps {
  industry: 'construction' | 'agriculture';
  isSelected: boolean;
  onSelect: () => void;
}

const IndustryCard: React.FC<IndustryCardProps> = ({ industry, isSelected, onSelect }) => {
  const isConstruction = industry === 'construction';
  
  const config = {
    construction: {
      name: 'Construction',
      description: 'Building materials, supplier networks, and project management',
      icon: Building2,
      color: 'blue',
      bgGradient: 'from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950',
      borderColor: 'border-blue-200 dark:border-blue-800',
      selectedBorder: 'border-blue-500 dark:border-blue-400',
      selectedBg: 'bg-blue-50 dark:bg-blue-950/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    },
    agriculture: {
      name: 'Agriculture',
      description: 'Farming inputs, seasonal patterns, and agricultural solutions',
      icon: Wheat,
      color: 'green',
      bgGradient: 'from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-950',
      borderColor: 'border-green-200 dark:border-green-800',
      selectedBorder: 'border-green-500 dark:border-green-400',
      selectedBg: 'bg-green-50 dark:bg-green-950/30',
      iconColor: 'text-green-600 dark:text-green-400',
      iconBg: 'bg-green-100 dark:bg-green-900/50',
    }
  };

  const industryConfig = config[industry];
  const Icon = industryConfig.icon;

  return (
    <div 
      className={`
        relative group cursor-pointer transition-all duration-300 transform
        ${isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'}
      `}
      onClick={onSelect}
    >
      <div 
        className={`
          p-8 rounded-2xl border-2 transition-all duration-300
          ${isSelected ? `${industryConfig.selectedBorder} ${industryConfig.selectedBg} shadow-xl` : `${industryConfig.borderColor} bg-white dark:bg-gray-900`}
          hover:shadow-lg
          bg-gradient-to-br ${industryConfig.bgGradient}
        `}
      >
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <div className={`w-20 h-20 mx-auto mb-4 rounded-full ${industryConfig.iconBg} flex items-center justify-center shadow-lg ${isSelected ? 'ring-4 ring-white dark:ring-gray-700 ring-opacity-50' : ''}`}>
            <Icon size={40} className={industryConfig.iconColor} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{industryConfig.name}</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{industryConfig.description}</p>
        </div>
      </div>
    </div>
  );
};

const IndustrySelector: React.FC = () => {
  const { setIndustry } = useAuth();
  const { setIndustry: setIndustryContext } = useIndustry();
  const navigate = useNavigate();

  const handleSelectIndustry = (industry: 'construction' | 'agriculture') => {
    setIndustry(industry);
    setIndustryContext(industry);
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-xl">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Qivook
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            Choose your industry to get started
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            Get industry-specific insights, tools, and solutions tailored to your business needs
          </p>
        </div>

        {/* Industry Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <IndustryCard
            industry="construction"
            isSelected={false}
            onSelect={() => handleSelectIndustry('construction')}
          />
          <IndustryCard
            industry="agriculture"
            isSelected={false}
            onSelect={() => handleSelectIndustry('agriculture')}
          />
        </div>
      </div>
    </div>
  );
};

export default IndustrySelector;
