import React, { useState } from 'react';
import { 
  TrendingUp, 
  Map, 
  Users, 
  DollarSign, 
  BarChart3, 
  Activity, 
  ShoppingCart, 
  Box,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DashboardCard from '../components/DashboardCard';
import PriceChart from '../components/PriceChart';
import StatusBadge from '../components/StatusBadge';
import { 
  priceData, 
  agriculturePriceData, 
  dashboardMetrics, 
  priceChanges,
  industryDescriptions 
} from '../data/mockData';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'insights'>('overview');
  
  const industry = currentUser?.industry || 'construction';
  const metrics = dashboardMetrics[industry];
  const description = industryDescriptions[industry];
  const priceChangeData = priceChanges[industry];
  const priceChartData = industry === 'construction' ? priceData : agriculturePriceData;
  
  // Prepare chart data based on industry
  const dataKeys = industry === 'construction' 
    ? [
        { key: 'cement', color: '#1E3A8A', name: `Cement (${metrics.unitLabels.cement})` },
        { key: 'steel', color: '#374151', name: `Steel (${metrics.unitLabels.steel})` },
        { key: 'timber', color: '#047857', name: `Timber (${metrics.unitLabels.timber})` },
        { key: 'sand', color: '#B45309', name: `Sand (${metrics.unitLabels.sand})` }
      ]
    : [
        { key: 'fertilizer', color: '#166534', name: `Fertilizer (${metrics.unitLabels.fertilizer})` },
        { key: 'seeds', color: '#B45309', name: `Seeds (${metrics.unitLabels.seeds})` },
        { key: 'pesticides', color: '#1E3A8A', name: `Pesticides (${metrics.unitLabels.pesticides})` },
        { key: 'equipment', color: '#374151', name: `Equipment (${metrics.unitLabels.equipment})` }
      ];

  const renderPriceChange = (name: string, value: number) => {
    const isPositive = value >= 0;
    return (
      <div className="flex items-center justify-between py-2">
        <span className="text-gray-700">{name}</span>
        <span className={`flex items-center ${isPositive ? 'text-error-600' : 'text-success-600'}`}>
          {isPositive ? '+' : ''}{value}% 
          {isPositive 
            ? <TrendingUp size={16} className="ml-1" /> 
            : <TrendingUp size={16} className="ml-1 transform rotate-180" />}
        </span>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-800">{description.title}</h1>
            <span className="text-2xl">{metrics.industryIcon}</span>
          </div>
          <p className="text-gray-500 mt-1">{description.subtitle}</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button 
            className={`px-4 py-2 rounded-md text-sm ${selectedTab === 'overview' 
              ? 'bg-white shadow-sm text-gray-800' 
              : 'text-gray-600'}`}
            onClick={() => setSelectedTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`px-4 py-2 rounded-md text-sm ${selectedTab === 'insights' 
              ? 'bg-white shadow-sm text-gray-800' 
              : 'text-gray-600'}`}
            onClick={() => setSelectedTab('insights')}
          >
            Insights
          </button>
        </div>
      </div>
      
      {selectedTab === 'overview' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard 
              title={description.metrics.transactions}
              icon={<ShoppingCart size={20} />}
            >
              <div className="text-3xl font-bold text-gray-800">{metrics.totalTransactions}</div>
              <div className="mt-1 text-sm text-gray-500">Last 30 days</div>
            </DashboardCard>
            
            <DashboardCard 
              title={description.metrics.orders}
              icon={<DollarSign size={20} />}
            >
              <div className="text-3xl font-bold text-gray-800">${metrics.averageOrderValue}</div>
              <div className="mt-1 text-sm text-gray-500">Average value</div>
            </DashboardCard>
            
            <DashboardCard 
              title={description.metrics.suppliers}
              icon={<Users size={20} />}
            >
              <div className="text-3xl font-bold text-gray-800">{metrics.activeSuppliersCount}</div>
              <div className="mt-1 text-sm text-gray-500">Active network</div>
            </DashboardCard>
            
            <DashboardCard 
              title={description.metrics.volatility}
              icon={<Activity size={20} />}
            >
              <div className="text-3xl font-bold text-gray-800">{metrics.priceVolatility}%</div>
              <div className="mt-1 text-sm text-gray-500">30-day average</div>
            </DashboardCard>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <DashboardCard 
              title="Price Trends" 
              icon={<BarChart3 size={20} />}
              className="lg:col-span-2"
            >
              <PriceChart 
                data={priceChartData} 
                dataKeys={dataKeys} 
                height={250}
              />
            </DashboardCard>
            
            <DashboardCard 
              title="Price Changes" 
              icon={<TrendingUp size={20} />}
            >
              <div className="space-y-1 mt-2">
                {Object.entries(priceChangeData).map(([key, value]) => 
                  renderPriceChange(key.charAt(0).toUpperCase() + key.slice(1), value)
                )}
              </div>
            </DashboardCard>
          </div>
          
          <DashboardCard 
            title="Supply Alerts" 
            icon={<AlertTriangle size={20} />}
          >
            <div className="space-y-4 mt-2">
              {metrics.materialShortages.map((shortage, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="mt-0.5">
                    <AlertTriangle 
                      size={18} 
                      className={shortage.severity === 'high' 
                        ? 'text-error-500' 
                        : shortage.severity === 'medium' 
                          ? 'text-warning-500' 
                          : 'text-gray-400'
                      } 
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-800">{shortage.material} Shortage</h4>
                      <StatusBadge 
                        type={shortage.severity === 'high' 
                          ? 'error' 
                          : shortage.severity === 'medium' 
                            ? 'warning' 
                            : 'info'
                        } 
                        text={shortage.severity.toUpperCase()} 
                      />
                    </div>
                    <p className="text-sm text-gray-600">Region: {shortage.region}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {shortage.severity === 'high' 
                        ? 'Critical shortage affecting prices and availability.' 
                        : shortage.severity === 'medium' 
                          ? 'Moderate supply constraints expected.' 
                          : 'Minor supply issues reported.'
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>
        </>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <DashboardCard 
            title="Market Insights" 
            icon={<BarChart3 size={20} />}
            fullWidth
          >
            <div className="p-4 bg-primary-50 rounded-lg border border-primary-100">
              <h3 className="font-medium text-primary-800 mb-2">Key Takeaways</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-1">•</span>
                  <span>{industry === 'construction' 
                    ? 'Cement prices continue to rise due to increased demand in urban construction projects across Kenya.'
                    : 'Fertilizer prices are stabilizing after recent supply chain disruptions from global markets.'
                  }</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-1">•</span>
                  <span>{industry === 'construction' 
                    ? 'Steel suppliers are offering bulk discounts to counter recent price increases.'
                    : 'Seed prices remain volatile due to seasonal demand fluctuations and import constraints.'
                  }</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-1">•</span>
                  <span>{industry === 'construction' 
                    ? 'New regulations on imported materials expected to impact supply chain in Q4 2023.'
                    : 'New governmental subsidies for small-scale farmers announced in Rwanda and Uganda.'
                  }</span>
                </li>
              </ul>
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium text-gray-800 mb-2">Recommended Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <h4 className="font-medium text-gray-800 mb-1">Procurement Strategy</h4>
                  <p className="text-sm text-gray-600">
                    {industry === 'construction' 
                      ? 'Consider locking in cement prices with suppliers showing stable supply chains.' 
                      : 'Secure fertilizer stocks ahead of the growing season to avoid seasonal price increases.'
                    }
                  </p>
                </div>
                <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <h4 className="font-medium text-gray-800 mb-1">Supplier Relationships</h4>
                  <p className="text-sm text-gray-600">
                    {industry === 'construction' 
                      ? 'Diversify steel suppliers to mitigate risk from volatile market conditions.' 
                      : 'Explore partnerships with local seed producers to reduce import dependency.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </DashboardCard>
          
          <DashboardCard 
            title="Supply Chain Forecast" 
            icon={<Box size={20} />}
            fullWidth
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2">
                <h3 className="font-medium text-gray-800 mb-3">3-Month Outlook</h3>
                <div className="space-y-3">
                  {Object.entries(priceChangeData).map(([key, value], index) => (
                    <div key={index} className="flex flex-col">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </span>
                        <span className="text-sm text-gray-600">
                          Forecast: {value > 0 ? '+' : ''}{(value * 1.5).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        
                        <div 
                          className={`h-2 rounded-full ${value > 5 
                            ? 'bg-error-500' 
                            : value > 0 
                              ? 'bg-warning-500' 
                              : 'bg-success-500'}`}
                          style={{ width: `${Math.min(Math.abs(value * 5), 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-l pl-4">
                <h3 className="font-medium text-gray-800 mb-3">Risk Assessment</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Supply Disruption</span>
                    <StatusBadge type="warning" text="MEDIUM" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Price Volatility</span>
                    <StatusBadge 
                      type={metrics.priceVolatility > 10 ? "error" : "warning"} 
                      text={metrics.priceVolatility > 10 ? "HIGH" : "MEDIUM"} 
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Quality Consistency</span>
                    <StatusBadge type="success" text="LOW" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Regulatory Changes</span>
                    <StatusBadge type="info" text="MONITORING" />
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>
      )}
    </div>
  );
};

export default Dashboard;