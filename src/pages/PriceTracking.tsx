import React, { useState } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Filter, 
  Download, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import PriceChart from '../components/PriceChart';
import StatusBadge from '../components/StatusBadge';
import { priceData, agriculturePriceData, priceChanges } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';

const PriceTracking: React.FC = () => {
  const { currentUser } = useAuth();
  const industry = currentUser?.industry || 'construction';
  
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | '1y'>('3m');
  const [region, setRegion] = useState<string>('All Regions');
  
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
  
  // Filter UI components
  const FilterButton = ({ 
    options, 
    value, 
    onChange 
  }: { 
    options: string[], 
    value: string, 
    onChange: (val: string) => void 
  }) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      >
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
  
  const TimeRangeButton = ({ 
    value, 
    selected, 
    onClick 
  }: { 
    value: '1m' | '3m' | '6m' | '1y', 
    selected: boolean, 
    onClick: () => void 
  }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
        selected 
          ? 'bg-primary-100 text-primary-800' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {value === '1m' ? '1 Month' : value === '3m' ? '3 Months' : value === '6m' ? '6 Months' : '1 Year'}
    </button>
  );
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Price Tracking</h1>
          <p className="text-gray-500 mt-1">
            Monitor material prices across East Africa
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500 flex items-center">
            <RefreshCw size={14} className="mr-1" />
            Updated: {formatDate(lastUpdated)}
          </div>
          <button className="flex items-center gap-1 bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors px-3 py-1.5 rounded-md text-sm font-medium">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-card p-5 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center space-x-1">
            <TimeRangeButton 
              value="1m" 
              selected={timeRange === '1m'} 
              onClick={() => setTimeRange('1m')} 
            />
            <TimeRangeButton 
              value="3m" 
              selected={timeRange === '3m'} 
              onClick={() => setTimeRange('3m')} 
            />
            <TimeRangeButton 
              value="6m" 
              selected={timeRange === '6m'} 
              onClick={() => setTimeRange('6m')} 
            />
            <TimeRangeButton 
              value="1y" 
              selected={timeRange === '1y'} 
              onClick={() => setTimeRange('1y')} 
            />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <span className="text-sm text-gray-500">Filter by:</span>
            </div>
            <FilterButton 
              options={regions} 
              value={region} 
              onChange={setRegion} 
            />
          </div>
        </div>
        
        <div className="h-96">
          <PriceChart 
            data={priceDataToUse} 
            dataKeys={dataKeys} 
            height={384}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dataKeys.map((item, index) => {
          const material = item.key;
          const changePercent = priceChangeData[material as keyof typeof priceChangeData] || 0;
          const latestPrice = priceDataToUse[priceDataToUse.length - 1][material] || 0;
          
          return (
            <DashboardCard 
              key={index}
              title={item.name}
              icon={<TrendingUp size={20} style={{ color: item.color }} />}
            >
              <div className="mt-2">
                <div className="text-3xl font-bold text-gray-800">
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
            </DashboardCard>
          );
        })}
      </div>
      
      <DashboardCard 
        title="Price Insights" 
        icon={<AlertCircle size={20} />}
      >
        <div className="space-y-6 mt-4">
          <div className="border-l-4 border-primary-500 pl-4 py-1">
            <h3 className="font-medium text-gray-800 mb-1">Market Summary</h3>
            <p className="text-gray-600">
              {industry === 'construction' 
                ? 'Construction material prices continue to trend upward across East Africa, with cement showing the highest volatility. Regional differences are significant, with urban centers experiencing higher price points due to increased demand.'
                : 'Agricultural input prices show seasonal variations with fertilizer costs stabilizing after recent global supply chain improvements. Seed price fluctuations continue to present challenges for seasonal planning.'}
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800 mb-3">Price Alerts</h3>
            <div className="space-y-4">
              <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-warning-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {industry === 'construction' ? 'Cement Price Surge' : 'Fertilizer Availability'}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {industry === 'construction'
                        ? 'Cement prices have increased 5.2% over the past month, exceeding the typical seasonal adjustment of 2-3%. This is largely due to increased construction activity in urban centers and ongoing supply chain constraints.'
                        : 'While fertilizer prices have stabilized, availability in rural areas remains inconsistent. Consider securing supplies early for the upcoming planting season to avoid potential shortages.'}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <StatusBadge type="warning" text="MONITORING" />
                      <span className="text-xs text-gray-500">Updated 2 days ago</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Calendar size={20} className="text-gray-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-800">Price Forecast</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {industry === 'construction'
                        ? 'Based on current trends and supplier data, we forecast continued moderate increases in material prices over the next quarter, with possible stabilization by Q4 2023 as new supply comes online.'
                        : 'Seed and pesticide prices are expected to rise slightly (3-5%) in the coming quarter due to import constraints and seasonal demand patterns. Equipment rental rates are forecasted to remain stable.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
};

export default PriceTracking;