import React, { useState } from 'react';
import { 
  Building2, 
  Wheat, 
  Check, 
  ChevronDown,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useIndustry } from '../contexts/IndustryContext';

interface IndustrySwitcherProps {
  className?: string;
}

const IndustrySwitcher: React.FC<IndustrySwitcherProps> = ({ className = '' }) => {
  const { currentIndustry, industryConfig, switchIndustry } = useIndustry();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const industries = [
    {
      id: 'construction',
      name: 'Construction',
      description: 'Building materials & projects',
      icon: Building2,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      borderColor: 'border-primary-200'
    },
    {
      id: 'agriculture',
      name: 'Agriculture',
      description: 'Farming inputs & operations',
      icon: Wheat,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  ];

  const currentIndustryData = industries.find(i => i.id === currentIndustry);

  const handleSwitch = async (industryId: 'construction' | 'agriculture') => {
    if (industryId === currentIndustry) return;
    
    setIsSwitching(true);
    try {
      await switchIndustry(industryId);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to switch industry:', error);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-full"
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          currentIndustry === 'construction' ? 'bg-primary-50 text-primary-600' : 'bg-green-50 text-green-600'
        }`}>
          {currentIndustry === 'construction' ? <Building2 size={16} /> : <Wheat size={16} />}
        </div>
        <div className="flex-1 text-left">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {industryConfig.displayName}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {currentIndustry === 'construction' ? 'Building materials & projects' : 'Farming inputs & operations'}
          </div>
        </div>
        <ChevronDown 
          size={16} 
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2">
              Switch Industry
            </div>
            {industries.map((industry) => {
              const Icon = industry.icon;
              const isCurrent = industry.id === currentIndustry;
              
              return (
                <button
                  key={industry.id}
                  onClick={() => handleSwitch(industry.id as 'construction' | 'agriculture')}
                  disabled={isCurrent || isSwitching}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isCurrent 
                      ? 'bg-gray-100 dark:bg-gray-700 cursor-default' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  } ${isSwitching ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${industry.bgColor}`}>
                    <Icon className={`w-4 h-4 ${industry.color}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {industry.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {industry.description}
                    </div>
                  </div>
                  {isCurrent && (
                    <Check size={16} className="text-green-600" />
                  )}
                  {isSwitching && !isCurrent && (
                    <RefreshCw size={16} className="text-gray-400 animate-spin" />
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Switching industries will reset your current view and preferences
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndustrySwitcher;
