import React from 'react';
import { Building2, Wheat } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const IndustrySelector: React.FC = () => {
  const { setIndustry } = useAuth();
  const navigate = useNavigate();

  const handleSelectIndustry = (industry: 'construction' | 'agriculture') => {
    setIndustry(industry);
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-800 to-primary-950 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-8">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">Welcome to Qivook</h1>
        <p className="text-gray-600 text-center mb-8">Choose your industry to get started</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => handleSelectIndustry('construction')}
            className="flex flex-col items-center p-8 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
          >
            <Building2 size={48} className="text-primary-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Construction</h2>
            <p className="text-gray-600 text-center">
              Monitor construction materials, supplier networks, and project financing
            </p>
          </button>

          <button
            onClick={() => handleSelectIndustry('agriculture')}
            className="flex flex-col items-center p-8 border-2 border-gray-200 rounded-lg hover:border-secondary-500 hover:bg-secondary-50 transition-all"
          >
            <Wheat size={48} className="text-secondary-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Agriculture</h2>
            <p className="text-gray-600 text-center">
              Track agricultural inputs, seasonal patterns, and farming solutions
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IndustrySelector;