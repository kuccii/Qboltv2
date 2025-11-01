import React, { useEffect, useMemo, useState } from 'react';
import {
  TrendingUp,
  Calendar,
  Filter as FilterIcon,
  Download,
  AlertCircle,
  RefreshCw,
  BellPlus,
  Shield,
  AlertTriangle,
  TrendingDown
} from 'lucide-react';
import PriceChart from '../components/PriceChart';
import StatusBadge from '../components/StatusBadge';
import { priceData, agriculturePriceData, priceChanges, riskAdjustedPricing } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { useIndustry } from '../contexts/IndustryContext';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AppLayout,
  PageHeader,
  PageLayout,
  SectionLayout,
  DataCard,
  SearchInput,
  SelectInput,
  FilterSidebar,
  ActionMenu,
  RailLayout
} from '../design-system';

const PriceTracking: React.FC = () => {
  const { currentUser } = useAuth();
  const { currentIndustry, industryConfig, getIndustryTerm, getIndustryMaterial } = useIndustry();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | '1y'>(() => (localStorage.getItem('prices.timerange') as any) || '3m');
  const [region, setRegion] = useState<string>(() => localStorage.getItem('prices.region') || 'All Regions');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(() => {
    const saved = localStorage.getItem('prices.materials');
    return saved ? saved.split(',').filter(Boolean) : [];
  });
  const [savedViewName, setSavedViewName] = useState<string>('');
  
  // Simulated last updated time
  const lastUpdated = new Date();
  lastUpdated.setHours(lastUpdated.getHours() - 4);

  // Prepare chart data based on industry
  const dataKeys = currentIndustry === 'construction' 
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
      
  const priceDataToUse = currentIndustry === 'construction' ? priceData : agriculturePriceData;
  const priceChangeData = priceChanges[currentIndustry];
  
  // Define regions for the filter
  const regions = ['All Regions', 'Kenya', 'Uganda', 'Rwanda', 'Tanzania'];

  const allMaterials = useMemo(() => dataKeys.map(d => d.key), [dataKeys]);
  const visibleMaterials = selectedMaterials.length ? selectedMaterials : allMaterials;
  const filteredDataKeys = useMemo(() => dataKeys.filter(d => visibleMaterials.includes(d.key)), [dataKeys, visibleMaterials]);
  
  // Helper function to format date
  const formatDate = (date: Date): string => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
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
  
  // Filter sidebar config
  const filterGroups = [
    {
      id: 'region',
      title: 'Region',
      type: 'radio' as const,
      options: regions.map(r => ({ value: r, label: r }))
    },
    {
      id: 'timeRange',
      title: 'Time Range',
      type: 'radio' as const,
      options: [
        { value: '1m', label: '1 Month' },
        { value: '3m', label: '3 Months' },
        { value: '6m', label: '6 Months' },
        { value: '1y', label: '1 Year' }
      ]
    },
    {
      id: 'materials',
      title: getIndustryTerm('materials'),
      type: 'checkbox' as const,
      options: dataKeys.map(d => ({ value: d.key, label: d.name }))
    }
  ];

  const activeFilters = {
    region: [region],
    timeRange: [timeRange],
    materials: selectedMaterials.length ? selectedMaterials : allMaterials
  };

  const handleFilterChange = (groupId: string, values: string[]) => {
    if (groupId === 'region') setRegion(values[0] || 'All Regions');
    if (groupId === 'timeRange') setTimeRange((values[0] as '1m' | '3m' | '6m' | '1y') || '3m');
    if (groupId === 'materials') setSelectedMaterials(values);
  };

  const handleFilterReset = () => {
    setRegion('All Regions');
    setTimeRange('3m');
    setSelectedMaterials([]);
  };

  // URL sync and persistence
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.set('range', timeRange);
    params.set('region', region);
    params.set('materials', (selectedMaterials.length ? selectedMaterials : allMaterials).join(','));
    navigate({ search: params.toString() }, { replace: true });

    localStorage.setItem('prices.timerange', timeRange);
    localStorage.setItem('prices.region', region);
    localStorage.setItem('prices.materials', selectedMaterials.join(','));
  }, [timeRange, region, selectedMaterials, allMaterials, navigate, location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pRange = params.get('range');
    const pRegion = params.get('region');
    const pMaterials = params.get('materials');
    if (pRange && ['1m','3m','6m','1y'].includes(pRange)) setTimeRange(pRange as any);
    if (pRegion) setRegion(pRegion);
    if (pMaterials) setSelectedMaterials(pMaterials.split(',').filter(Boolean));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMaterial = (key: string) => {
    setSelectedMaterials(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const saveView = () => {
    if (!savedViewName.trim()) return;
    const stored = JSON.parse(localStorage.getItem('prices.views') || '{}');
    stored[savedViewName] = { timeRange, region, materials: selectedMaterials };
    localStorage.setItem('prices.views', JSON.stringify(stored));
    setSavedViewName('');
  };

  const actionMenuItems = [
    {
      id: 'export',
      label: 'Export Prices',
      icon: <Download className="h-4 w-4" />,
      description: 'Download as CSV or PDF',
      onClick: () => console.log('Export prices')
    },
    {
      id: 'refresh',
      label: 'Refresh Data',
      icon: <RefreshCw className="h-4 w-4" />,
      description: 'Reload latest pricing data',
      onClick: () => console.log('Refresh')
    }
  ];
  
  return (
    <AppLayout>
      <PageHeader
        title={`${getIndustryTerm('pricing')} Tracking`}
        subtitle={`Monitor ${getIndustryTerm('materials').toLowerCase()} prices across East Africa`}
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: getIndustryTerm('pricing') }]}
        actions={
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-sm text-gray-500 items-center md:flex">
              <RefreshCw className="h-4 w-4 mr-1" />
              Updated: {formatDate(lastUpdated)}
            </div>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={`Search ${getIndustryTerm('materials').toLowerCase()}...`}
              size="sm"
            />
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <FilterIcon className="h-4 w-4" />
              Filters
            </button>
            <ActionMenu items={actionMenuItems} size="sm" />
          </div>
        }
      />

      <PageLayout maxWidth="full" padding="none">
        <RailLayout
          right={
            <>
              <div className="border border-gray-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-100 mb-2">Sponsored</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">Promote your pricing APIs, analytics services, or supply listings here.</p>
              </div>
              <div className="border border-gray-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-100 mb-2">Insight</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">Set alerts for materials with &gt;5% monthly change to act early.</p>
              </div>
            </>
          }
        >
        <div className="px-6 py-6 space-y-6">
          {/* Controls */}
          <SectionLayout title="Controls" subtitle="Adjust the time range and region">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center space-x-1">
                <TimeRangeButton value="1m" selected={timeRange === '1m'} onClick={() => setTimeRange('1m')} />
                <TimeRangeButton value="3m" selected={timeRange === '3m'} onClick={() => setTimeRange('3m')} />
                <TimeRangeButton value="6m" selected={timeRange === '6m'} onClick={() => setTimeRange('6m')} />
                <TimeRangeButton value="1y" selected={timeRange === '1y'} onClick={() => setTimeRange('1y')} />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <FilterIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Region:</span>
                </div>
                <div className="min-w-[200px]">
                  <SelectInput
                    options={regions.map(r => ({ value: r, label: r }))}
                    value={region}
                    onChange={setRegion}
                  />
                </div>
              </div>
            </div>
          </SectionLayout>

          {/* Chart */}
          <SectionLayout title="Price Trends" subtitle="Historical prices by material" className="">
            <div className="h-96">
              <PriceChart data={priceDataToUse} dataKeys={filteredDataKeys} height={384} />
            </div>
          </SectionLayout>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredDataKeys.map((item, index) => {
              const material = item.key as keyof typeof priceChangeData;
              const changePercent = priceChangeData[material] || 0;
              const latestPrice = (priceDataToUse[priceDataToUse.length - 1] as any)[material] || 0;
              const riskData = riskAdjustedPricing[currentIndustry][material];
              
              return (
                <div key={index} className="border border-gray-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-medium text-gray-800 dark:text-slate-100">{item.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg font-semibold text-gray-900 dark:text-slate-50">${latestPrice}</span>
                        <span className={`text-sm font-medium ${changePercent > 0 ? 'text-red-600' : changePercent < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                          {changePercent > 0 ? '+' : ''}{changePercent}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {changePercent > 0 ? <TrendingUp className="h-4 w-4 text-red-500" /> : changePercent < 0 ? <TrendingDown className="h-4 w-4 text-green-500" /> : null}
                    </div>
                  </div>
                  
                  {/* Risk-Adjusted Pricing */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Risk-Adjusted Price:</span>
                      <span className="font-semibold text-gray-800">${Math.round(latestPrice * (1 + riskData.riskAdjustment / 100))}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3 text-blue-500" />
                        <span className="text-gray-500">Insurance:</span>
                        <span className="font-medium">{riskData.insuranceCoverage}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-orange-500" />
                        <span className="text-gray-500">Volatility:</span>
                        <span className="font-medium">{riskData.marketVolatility}/10</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Supplier Reliability: {riskData.supplierReliability}/10
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Insights */}
          <SectionLayout title="Price Insights" subtitle="Market summary and alerts" actions={
            <div className="flex items-center gap-2">
              <input
                value={savedViewName}
                onChange={(e) => setSavedViewName(e.target.value)}
                placeholder="Save current view"
                className="text-sm px-2 py-1 border rounded"
              />
              <button onClick={saveView} className="px-2 py-1 text-sm border rounded">Save</button>
            </div>
          }>
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4 py-1">
                <h3 className="font-medium text-gray-800 mb-1">Market Summary</h3>
                <p className="text-gray-600">
                  {currentIndustry === 'construction'
                    ? 'Construction material prices continue to trend upward across East Africa, with cement showing the highest volatility. Regional differences are significant, with urban centers experiencing higher price points due to increased demand.'
                    : 'Agricultural input prices show seasonal variations with fertilizer costs stabilizing after recent global supply chain improvements. Seed price fluctuations continue to present challenges for seasonal planning.'}
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-800 mb-3">Price Alerts</h3>
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-800">{currentIndustry === 'construction' ? 'Cement Price Surge' : 'Fertilizer Availability'}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {currentIndustry === 'construction'
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
                      <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-800">Price Forecast</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {currentIndustry === 'construction'
                            ? 'Based on current trends and supplier data, we forecast continued moderate increases in material prices over the next quarter, with possible stabilization by Q4 as new supply comes online.'
                            : 'Seed and pesticide prices are expected to rise slightly (3-5%) in the coming quarter due to import constraints and seasonal demand patterns. Equipment rental rates are forecasted to remain stable.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SectionLayout>
        </div>
        </RailLayout>
      </PageLayout>

      {/* Filter Sidebar */}
      <FilterSidebar
        filters={filterGroups}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onReset={handleFilterReset}
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
      />
    </AppLayout>
  );
};

export default PriceTracking;