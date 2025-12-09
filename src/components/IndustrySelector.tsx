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
      emoji: '🏗️',
      description: 'Build amazing things! Get materials, find suppliers, and manage your projects!',
      icon: Building2,
      color: 'blue',
      bgGradient: 'from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950',
      borderColor: 'border-blue-200 dark:border-blue-800',
      selectedBorder: 'border-blue-500 dark:border-blue-400',
      selectedBg: 'bg-blue-50 dark:bg-blue-950/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/50 dark:to-indigo-900/50',
    },
    agriculture: {
      name: 'Agriculture',
      emoji: '🌾',
      description: 'Grow your farm! Get seeds, tools, and tips to make your crops amazing!',
      icon: Wheat,
      color: 'green',
      bgGradient: 'from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950',
      borderColor: 'border-green-200 dark:border-green-800',
      selectedBorder: 'border-green-500 dark:border-green-400',
      selectedBg: 'bg-green-50 dark:bg-green-950/30',
      iconColor: 'text-green-600 dark:text-green-400',
      iconBg: 'bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/50 dark:to-emerald-900/50',
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
          p-6 sm:p-8 rounded-2xl border-4 transition-all duration-300 transform
          ${isSelected ? `${industryConfig.selectedBorder} ${industryConfig.selectedBg} shadow-2xl scale-105` : `${industryConfig.borderColor} bg-white dark:bg-gray-900 hover:scale-102`}
          hover:shadow-xl
          bg-gradient-to-br ${industryConfig.bgGradient}
        `}
      >
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl border-4 border-white dark:border-gray-800">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
        )}

        {/* Header */}
        <div className="text-center">
          <div className={`w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-4 rounded-3xl ${industryConfig.iconBg} flex items-center justify-center shadow-xl border-4 border-white/50 dark:border-gray-700/50 ${isSelected ? 'ring-4 ring-white dark:ring-gray-700 ring-opacity-50 scale-110' : ''} transition-all`}>
            <span className="text-5xl sm:text-6xl">{industryConfig.emoji}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-3 flex items-center justify-center gap-2">
            <span>{industryConfig.emoji}</span>
            <span>{industryConfig.name}</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-medium px-2">{industryConfig.description}</p>
          <button className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center gap-2 mx-auto">
            <span>Choose This!</span>
            <ArrowRight size={18} />
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

  const handleSelectIndustry = (industry: 'construction' | 'agriculture') => {
    setIndustry(industry);
    setIndustryContext(industry);
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl mb-6 shadow-2xl transform hover:scale-110 transition-transform border-4 border-white/30 dark:border-gray-700/30">
            <span className="text-4xl sm:text-5xl">🚀</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4">
            Welcome to Qivook! 🎉
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 mb-2 font-semibold flex items-center justify-center gap-2">
            <span>🎯</span>
            <span>Pick what you do!</span>
          </p>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4">
            We'll give you special tools and info just for your business! ✨
          </p>
        </div>

        {/* Industry Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
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
