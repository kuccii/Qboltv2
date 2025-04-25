import React, { useState } from 'react';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Activity,
  Download
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../contexts/AuthContext';

const RiskMitigation: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all');

  // Mock data for risk assessment
  const riskData = [
    {
      id: 1,
      category: 'Market Volatility',
      riskLevel: 'high',
      impact: 'High',
      probability: 'Medium',
      mitigation: 'Diversify suppliers and maintain buffer stock',
      trend: 'up',
      trendValue: 15
    },
    {
      id: 2,
      category: 'Supply Chain',
      riskLevel: 'medium',
      impact: 'Medium',
      probability: 'High',
      mitigation: 'Establish backup suppliers and improve logistics',
      trend: 'down',
      trendValue: 8
    },
    {
      id: 3,
      category: 'Regulatory',
      riskLevel: 'low',
      impact: 'Low',
      probability: 'Low',
      mitigation: 'Regular compliance audits and legal consultation',
      trend: 'stable',
      trendValue: 0
    }
  ];

  const regions = ['all', 'Nairobi', 'Mombasa', 'Kisumu', 'Eldoret'];
  const riskLevels = ['all', 'high', 'medium', 'low'];

  const filteredRisks = riskData.filter(risk => {
    const regionMatch = selectedRegion === 'all' || risk.category.includes(selectedRegion);
    const riskLevelMatch = selectedRiskLevel === 'all' || risk.riskLevel === selectedRiskLevel;
    return regionMatch && riskLevelMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Risk Mitigation</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <Download size={20} />
          <span>Export Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="High Risk Items"
          value="3"
          icon={AlertTriangle}
          trend="up"
          trendValue={15}
          color="error"
        />
        <DashboardCard
          title="Active Mitigations"
          value="8"
          icon={Shield}
          trend="down"
          trendValue={5}
          color="success"
        />
        <DashboardCard
          title="Risk Score"
          value="65%"
          icon={Activity}
          trend="down"
          trendValue={8}
          color="warning"
        />
        <DashboardCard
          title="Compliance Rate"
          value="92%"
          icon={Shield}
          trend="up"
          trendValue={3}
          color="success"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Region</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {regions.map(region => (
                <option key={region} value={region}>
                  {region.charAt(0).toUpperCase() + region.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Risk Level</label>
            <select
              value={selectedRiskLevel}
              onChange={(e) => setSelectedRiskLevel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {riskLevels.map(level => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredRisks.map(risk => (
            <div key={risk.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{risk.category}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={risk.riskLevel} />
                    <span className="text-sm text-gray-500">
                      Impact: {risk.impact} | Probability: {risk.probability}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {risk.trend === 'up' ? (
                    <TrendingUp className="text-error-600" size={20} />
                  ) : risk.trend === 'down' ? (
                    <TrendingDown className="text-success-600" size={20} />
                  ) : null}
                  <span className={`text-sm ${risk.trend === 'up' ? 'text-error-600' : 'text-success-600'}`}>
                    {risk.trendValue}%
                  </span>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                <span className="font-medium">Mitigation Strategy:</span> {risk.mitigation}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard
          title="Risk Assessment"
          icon={Activity}
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Market Volatility</span>
              <div className="w-48 h-2 bg-gray-200 rounded-full">
                <div className="h-full bg-error-600 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Supply Chain</span>
              <div className="w-48 h-2 bg-gray-200 rounded-full">
                <div className="h-full bg-warning-600 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Regulatory Compliance</span>
              <div className="w-48 h-2 bg-gray-200 rounded-full">
                <div className="h-full bg-success-600 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard
          title="Mitigation Progress"
          icon={Shield}
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Strategy Implementation</span>
              <span className="text-sm font-medium text-success-600">85%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Training Completion</span>
              <span className="text-sm font-medium text-success-600">92%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">System Updates</span>
              <span className="text-sm font-medium text-warning-600">65%</span>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default RiskMitigation; 