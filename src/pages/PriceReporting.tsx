import React, { useState } from 'react';
import { 
  TrendingUp, 
  Filter, 
  Download, 
  AlertCircle,
  RefreshCw,
  BarChart3,
  Map
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import PriceChart from '../components/PriceChart';
import StatusBadge from '../components/StatusBadge';
import { priceData, agriculturePriceData, priceChanges } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';

const PriceReporting: React.FC = () => {
  const { currentUser } = useAuth();
  const industry = currentUser?.industry || 'construction';
  
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | '1y'>('3m');
  const [region, setRegion] = useState<string>('All Regions');
  const [reportType, setReportType] = useState<'price' | 'demand' | 'supply'>('price');
  
  // Simulated last updated time
  const lastUpdated = new Date();
  lastUpdated.setHours(lastUpdated.getHours() - 4);

  // Prepare chart data based on industry
  const dataKeys = industry === 'construction' 
    ? [
        { key: 'cement', color: '#1E3A8A', name: 'Cement (per ton)' },
        { key: 'steel', color: '#374151', name: 'Steel (per ton)' },
        { key: 'timber', color: '#047857', name: 'Timber (per cubic meter)' },
        { key: 'sand', color: '#B45309', name: 'Sand (per cubic meter)' }
      ]
    : [
        { key: 'fertilizer', color: '#166534', name: 'Fertilizer (per 50kg)' },
        { key: 'seeds', color: '#B45309', name: 'Seeds (per kg)' },
        { key: 'pesticides', color: '#1E3A8A', name: 'Pesticides (per liter)' },
        { key: 'equipment', color: '#374151', name: 'Equipment (rental per day)' }
      ];
      
  const priceDataToUse = industry === 'construction' ? priceData : agriculturePriceData;
  const priceChangeData = priceChanges[industry];
  
  // Define regions for the filter
  const regions = ['All Regions', 'Kenya', 'Uganda', 'Rwanda', 'Tanzania'];
  
  // Helper function to format date
  const formatDate = (date: Date): string => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Price Reporting</h1>
          <p className="text-gray-500 mt-1">
            Generate and analyze price reports for your industry
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500 flex items-center">
            <RefreshCw size={14} className="mr-1" />
            Updated: {formatDate(lastUpdated)}
          </div>
          <button className="flex items-center gap-1 bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors px-3 py-1.5 rounded-md text-sm font-medium">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <DashboardCard 
            title="Price Analysis" 
            icon={<BarChart3 size={20} />}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setReportType('price')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    reportType === 'price' 
                      ? 'bg-primary-100 text-primary-800' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Price Trends
                </button>
                <button
                  onClick={() => setReportType('demand')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    reportType === 'demand' 
                      ? 'bg-primary-100 text-primary-800' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Demand Analysis
                </button>
                <button
                  onClick={() => setReportType('supply')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    reportType === 'supply' 
                      ? 'bg-primary-100 text-primary-800' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Supply Metrics
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-500">Region:</span>
                </div>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="h-96">
              <PriceChart 
                data={priceDataToUse} 
                dataKeys={dataKeys} 
                height={384}
              />
            </div>
          </DashboardCard>
        </div>
        
        <div>
          <DashboardCard 
            title="Market Insights" 
            icon={<AlertCircle size={20} />}
          >
            <div className="space-y-4 mt-2">
              <div className="bg-primary-50 border border-primary-100 rounded-lg p-4">
                <h3 className="font-medium text-primary-800 mb-2">Key Findings</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>{industry === 'construction' 
                      ? 'Cement prices show a 5.2% increase in urban centers due to increased construction activity.'
                      : 'Fertilizer prices remain stable but availability varies by region.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>{industry === 'construction' 
                      ? 'Steel suppliers offering bulk discounts to counter recent price increases.'
                      : 'Seed prices showing seasonal variations with import constraints.'}
                    </span>
                  </li>
                </ul>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-800 mb-2">Regional Analysis</h3>
                <div className="space-y-3">
                  {regions.filter(r => r !== 'All Regions').map(region => (
                    <div key={region} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{region}</span>
                      <span className="text-sm font-medium text-gray-800">
                        {industry === 'construction' ? '+3.2%' : '-1.5%'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DashboardCard>
          
          <DashboardCard 
            title="Price Alerts" 
            icon={<AlertCircle size={20} />}
            className="mt-6"
          >
            <div className="space-y-4 mt-2">
              <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-warning-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {industry === 'construction' ? 'Cement Price Surge' : 'Fertilizer Availability'}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {industry === 'construction'
                        ? 'Prices have increased 5.2% over the past month, exceeding typical seasonal adjustments.'
                        : 'Availability in rural areas remains inconsistent. Consider securing supplies early.'}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <StatusBadge type="warning" text="MONITORING" />
                      <span className="text-xs text-gray-500">Updated 2 days ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
      
      <DashboardCard 
        title="Historical Analysis" 
        icon={<TrendingUp size={20} />}
      >
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dataKeys.map((item, index) => {
            const material = item.key;
            const changePercent = priceChangeData[material as keyof typeof priceChangeData] || 0;
            const latestPrice = priceDataToUse[priceDataToUse.length - 1][material] || 0;
            
            return (
              <div key={index} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                <h3 className="font-medium text-gray-800 mb-2">{item.name}</h3>
                <div className="text-2xl font-bold text-gray-800">
                  ${latestPrice}
                </div>
                <div className="flex items-center mt-1">
                  <div className={`text-sm font-medium ${changePercent >= 0 ? 'text-error-600' : 'text-success-600'}`}>
                    {changePercent >= 0 ? '+' : ''}{changePercent}%
                  </div>
                  <div className="text-xs text-gray-500 ml-2">
                    vs. previous period
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </DashboardCard>
    </div>
  );
};

export default PriceReporting; 