import React, { useState } from 'react';
import { 
  Map as MapIcon, 
  Filter, 
  BarChart3, 
  Download, 
  Info
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import HeatMapChart from '../components/HeatMapChart';
import { demandData } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';

const DemandMapping: React.FC = () => {
  const { currentUser } = useAuth();
  const industry = currentUser?.industry || 'construction';
  
  const [timeRange, setTimeRange] = useState<'current' | 'forecast'>('current');
  const [mapCenter, setMapCenter] = useState<[number, number]>([-1.2921, 36.8219]); // Nairobi
  const [mapZoom, setMapZoom] = useState<number>(6);
  
  // Get the appropriate data based on user's industry
  const locationData = demandData[industry];
  
  // Simulated material options based on industry
  const materialOptions = industry === 'construction' 
    ? ['All Materials', 'Cement', 'Steel', 'Timber', 'Sand'] 
    : ['All Materials', 'Fertilizer', 'Seeds', 'Pesticides', 'Equipment'];
  
  const [selectedMaterial, setSelectedMaterial] = useState(materialOptions[0]);
  
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
  
  // Demand scores by region
  const regionalScores = [
    { region: 'Kenya', score: 75, trend: 'up' },
    { region: 'Uganda', score: 68, trend: 'up' },
    { region: 'Rwanda', score: 62, trend: 'stable' },
    { region: 'Tanzania', score: 57, trend: 'down' }
  ];
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Demand Mapping</h1>
          <p className="text-gray-500 mt-1">
            Regional demand patterns for {industry} materials
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors px-3 py-1.5 rounded-md text-sm font-medium">
            <Download size={16} />
            Export Data
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3">
          <DashboardCard 
            title="Demand Heatmap" 
            icon={<MapIcon size={20} />}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setTimeRange('current')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    timeRange === 'current' 
                      ? 'bg-primary-100 text-primary-800' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Current Demand
                </button>
                <button
                  onClick={() => setTimeRange('forecast')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    timeRange === 'forecast' 
                      ? 'bg-primary-100 text-primary-800' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  3-Month Forecast
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-500">Material:</span>
                </div>
                <FilterButton 
                  options={materialOptions} 
                  value={selectedMaterial} 
                  onChange={setSelectedMaterial} 
                />
              </div>
            </div>
            
            <div className="mt-4">
              <HeatMapChart
                center={mapCenter}
                zoom={mapZoom}
                locations={locationData}
                height="450px"
              />
            </div>
            
            <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center">
                <div className="text-xs text-gray-500">Demand Index:</div>
                <div className="flex items-center ml-2">
                  <div className="h-3 w-3 rounded-full bg-opacity-30 mr-1" style={{ backgroundColor: industry === 'construction' ? '#1E3A8A' : '#166534' }}></div>
                  <span className="text-xs">Low</span>
                </div>
                <div className="flex items-center ml-2">
                  <div className="h-3 w-3 rounded-full bg-opacity-50 mr-1" style={{ backgroundColor: industry === 'construction' ? '#1E3A8A' : '#166534' }}></div>
                  <span className="text-xs">Medium</span>
                </div>
                <div className="flex items-center ml-2">
                  <div className="h-3 w-3 rounded-full opacity-70 mr-1" style={{ backgroundColor: industry === 'construction' ? '#1E3A8A' : '#166534' }}></div>
                  <span className="text-xs">High</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 flex items-center">
                <Info size={12} className="mr-1" />
                {timeRange === 'current' 
                  ? 'Showing current demand based on last 30 days of trade activity' 
                  : 'Forecast based on historical patterns and current market signals'}
              </div>
            </div>
          </DashboardCard>
        </div>
        
        <div>
          <DashboardCard 
            title="Regional Scores" 
            icon={<BarChart3 size={20} />}
          >
            <div className="space-y-4 mt-2">
              {regionalScores.map((item, index) => (
                <div key={index} className="border-b pb-3 last:border-0">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-800">{item.region}</h4>
                    <div className="flex items-center">
                      <span className="font-medium">{item.score}</span>
                      {item.trend === 'up' && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="ml-1 text-error-500">
                          <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      {item.trend === 'down' && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="ml-1 text-success-500">
                          <path d="M7 7L17 17M17 17H7M17 17V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      {item.trend === 'stable' && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="ml-1 text-gray-500">
                          <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${item.score}%`,
                        backgroundColor: industry === 'construction' ? '#1E3A8A' : '#166534'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>
          
          <DashboardCard 
            title="Demand Insights" 
            icon={<Info size={20} />}
            className="mt-6"
          >
            <div className="space-y-3 mt-2 text-sm text-gray-700">
              <p>
                {industry === 'construction'
                  ? 'Urban centers continue to drive the highest demand for construction materials, particularly cement and steel.'
                  : 'Rural agricultural regions show increasing demand for fertilizers as the planting season approaches.'}
              </p>
              <div className="border-l-2 border-primary-500 pl-3 py-2">
                <p className="font-medium text-gray-800">Key Takeaway</p>
                <p className="mt-1">
                  {industry === 'construction'
                    ? 'Consider establishing distribution centers in high-demand regions to reduce delivery times and transportation costs.'
                    : 'Focus on regional supply chains to ensure timely availability of agricultural inputs during critical planting periods.'}
                </p>
              </div>
              <p>
                {industry === 'construction'
                  ? 'Regional government infrastructure projects significantly impact demand patterns, with notable increases near planned road and housing developments.'
                  : 'Seasonal rainfall patterns correlate strongly with agricultural input demand, with variations across different regions of East Africa.'}
              </p>
            </div>
          </DashboardCard>
        </div>
      </div>
      
      <DashboardCard 
        title={`${industry === 'construction' ? 'Construction' : 'Agriculture'} Demand Factors`} 
        icon={<BarChart3 size={20} />}
      >
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
            <h3 className="font-medium text-gray-800 mb-2">
              {industry === 'construction' ? 'Urban Development' : 'Growing Seasons'}
            </h3>
            <p className="text-sm text-gray-600">
              {industry === 'construction'
                ? 'Urban expansion and real estate development are primary drivers of construction material demand in major cities.'
                : 'Seasonal planting periods vary across regions, creating staggered demand patterns for agricultural inputs.'}
            </p>
            <div className="mt-3 flex items-center">
              <div className="text-xs text-gray-500">Impact:</div>
              <div className="ml-2 flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div 
                    key={i}
                    className={`h-2 w-2 rounded-full mx-0.5 ${i <= 4 ? 'bg-primary-600' : 'bg-gray-300'}`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
            <h3 className="font-medium text-gray-800 mb-2">
              {industry === 'construction' ? 'Government Projects' : 'Weather Patterns'}
            </h3>
            <p className="text-sm text-gray-600">
              {industry === 'construction'
                ? 'Infrastructure initiatives and public works create significant demand spikes in specific regions.'
                : 'Rainfall and temperature variations influence crop selection and input requirements across different zones.'}
            </p>
            <div className="mt-3 flex items-center">
              <div className="text-xs text-gray-500">Impact:</div>
              <div className="ml-2 flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div 
                    key={i}
                    className={`h-2 w-2 rounded-full mx-0.5 ${i <= 5 ? 'bg-primary-600' : 'bg-gray-300'}`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
            <h3 className="font-medium text-gray-800 mb-2">
              {industry === 'construction' ? 'Private Investment' : 'Market Access'}
            </h3>
            <p className="text-sm text-gray-600">
              {industry === 'construction'
                ? 'Commercial developments and private sector investment influence regional demand fluctuations.'
                : 'Proximity to markets and transportation infrastructure affects input demand and utilization.'}
            </p>
            <div className="mt-3 flex items-center">
              <div className="text-xs text-gray-500">Impact:</div>
              <div className="ml-2 flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div 
                    key={i}
                    className={`h-2 w-2 rounded-full mx-0.5 ${i <= 3 ? 'bg-primary-600' : 'bg-gray-300'}`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
            <h3 className="font-medium text-gray-800 mb-2">
              {industry === 'construction' ? 'Economic Growth' : 'Government Subsidies'}
            </h3>
            <p className="text-sm text-gray-600">
              {industry === 'construction'
                ? 'Regional economic development correlates with increased construction activity and material demand.'
                : 'Agricultural support programs and subsidies influence input affordability and adoption rates.'}
            </p>
            <div className="mt-3 flex items-center">
              <div className="text-xs text-gray-500">Impact:</div>
              <div className="ml-2 flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div 
                    key={i}
                    className={`h-2 w-2 rounded-full mx-0.5 ${i <= 4 ? 'bg-primary-600' : 'bg-gray-300'}`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
};

export default DemandMapping;