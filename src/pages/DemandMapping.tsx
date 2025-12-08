import React, { useState, useEffect, useMemo } from 'react';
import { 
  Map as MapIcon, 
  Filter, 
  BarChart3, 
  Download, 
  Info,
  TrendingUp,
  TrendingDown,
  MapPin,
  Calendar,
  Globe,
  Layers,
  Eye,
  EyeOff,
  RefreshCw,
  Settings,
  ChevronDown,
  Search,
  X,
  Play,
  Pause,
  Maximize2,
  Share2,
  Bookmark
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useIndustry } from '../contexts/IndustryContext';
import {
  AppLayout,
  PageLayout,
  SectionLayout,
  SelectInput,
  ActionMenu,
  RailLayout,
  Chip
} from '../design-system';
import HeatMapChart from '../components/HeatMapChart';
// Removed mock data import - using real data from API
import { unifiedApi } from '../services/unifiedApi';
import HeaderStrip from '../components/HeaderStrip';
import {
  getEastAfricaExportPotential,
  getEastAfricaTradeData,
  convertExportPotentialToDemand,
  convertTradeDataToDemand
} from '../services/itcDataService';

interface DemandPoint {
  id: string;
  region: string;
  material: string;
  demand: number;
  trend: 'up' | 'down' | 'stable';
  coordinates: [number, number];
  timestamp: string;
}

interface RegionDetails {
  name: string;
  demand: number;
  growth: number;
  materials: string[];
  suppliers: number;
}

const DemandMapping: React.FC = () => {
  const { authState } = useAuth();
  const { currentIndustry, industryConfig, getIndustryTerm } = useIndustry();
  const currentUser = authState.user;
  
  // State management
  const [selectedTab, setSelectedTab] = useState<'demand' | 'itc-export' | 'trade-data'>('demand');
  const [timeRange, setTimeRange] = useState<'current' | 'forecast' | 'historical'>('current');
  const [selectedMaterial, setSelectedMaterial] = useState('All Materials');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [mapView, setMapView] = useState<'heatmap' | 'points' | 'clusters'>('heatmap');
  const [showFilters, setShowFilters] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [selectedRegionDetails, setSelectedRegionDetails] = useState<RegionDetails | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  
  // Fetch real demand data from Supabase
  const [realDemandData, setRealDemandData] = useState<any[]>([]);
  const [demandLoading, setDemandLoading] = useState(true);
  const [itcData, setItcData] = useState<any[]>([]);
  const [showItcData, setShowItcData] = useState(true);

  useEffect(() => {
    const fetchDemandData = async () => {
      try {
        setDemandLoading(true);
        // Fetch demand data from all East African countries
        const countries = ['RW', 'KE', 'UG', 'TZ', 'ET'];
        const demandPromises = countries.map(countryCode =>
          unifiedApi.countries.getDemand(countryCode, {
            region: selectedRegion !== 'All Regions' ? selectedRegion : undefined,
            material: selectedMaterial !== 'All Materials' ? selectedMaterial : undefined,
            industry: currentIndustry,
            timeRange: timeRange === 'current' ? undefined : timeRange
          }).catch(err => {
            console.warn(`Failed to fetch demand for ${countryCode}:`, err);
            return []; // Return empty array on error
          })
        );
        
        const allDemandArrays = await Promise.all(demandPromises);
        const allDemand = allDemandArrays.flat();

        // Fetch ITC data (Export Potential Map & Trade Map)
        if (showItcData) {
          try {
            const material = selectedMaterial !== 'All Materials' ? selectedMaterial : undefined;
            
            // Fetch both export potential and trade data
            const [exportPotential, tradeData] = await Promise.all([
              getEastAfricaExportPotential(countries, material),
              getEastAfricaTradeData(countries, material)
            ]);

            // Convert ITC data to demand format
            const exportPotentialDemand = convertExportPotentialToDemand(exportPotential);
            const tradeDataDemand = convertTradeDataToDemand(tradeData);
            
            setItcData([...exportPotentialDemand, ...tradeDataDemand]);
          } catch (itcError) {
            console.warn('Failed to fetch ITC data:', itcError);
            setItcData([]);
          }
        }
        setRealDemandData(allDemand);
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Failed to fetch demand data:', err);
        setRealDemandData([]);
      } finally {
        setDemandLoading(false);
      }
    };
    fetchDemandData();
  }, [selectedRegion, selectedMaterial, currentIndustry, timeRange, showItcData]);

  const handleRefresh = async () => {
    try {
      setDemandLoading(true);
      const countries = ['RW', 'KE', 'UG', 'TZ', 'ET'];
      const demandPromises = countries.map(countryCode =>
        unifiedApi.countries.getDemand(countryCode, {
          region: selectedRegion !== 'All Regions' ? selectedRegion : undefined,
          material: selectedMaterial !== 'All Materials' ? selectedMaterial : undefined,
          industry: currentIndustry,
          timeRange: timeRange === 'current' ? undefined : timeRange
        }).catch(err => {
          console.warn(`Failed to fetch demand for ${countryCode}:`, err);
          return [];
        })
      );
      
      const allDemandArrays = await Promise.all(demandPromises);
      const allDemand = allDemandArrays.flat();
      setRealDemandData(allDemand);

      // Refresh ITC data
      if (showItcData) {
        try {
          const material = selectedMaterial !== 'All Materials' ? selectedMaterial : undefined;
          const [exportPotential, tradeData] = await Promise.all([
            getEastAfricaExportPotential(countries, material),
            getEastAfricaTradeData(countries, material)
          ]);
          const exportPotentialDemand = convertExportPotentialToDemand(exportPotential);
          const tradeDataDemand = convertTradeDataToDemand(tradeData);
          setItcData([...exportPotentialDemand, ...tradeDataDemand]);
        } catch (itcError) {
          console.warn('Failed to refresh ITC data:', itcError);
        }
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to refresh demand data:', err);
    } finally {
      setDemandLoading(false);
    }
  };
  
  // Map state
  const [mapCenter, setMapCenter] = useState<[number, number]>([-1.2921, 36.8219]); // Nairobi
  const [mapZoom, setMapZoom] = useState<number>(6);
  
  // Temporal animation controls
  const timeSteps = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTimeIndex(prev => (prev + 1) % timeSteps.length);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeSteps.length]);

  const getRegionCoordinates = (region: string): [number, number] => {
    const coordinates: Record<string, [number, number]> = {
      'Nairobi': [-1.2921, 36.8219],
      'Mombasa': [-4.0437, 39.6682],
      'Kisumu': [-0.0917, 34.7680],
      'Nakuru': [-0.3070, 36.0800],
      'Eldoret': [0.5143, 35.2698],
      'Kigali': [-1.9441, 30.0619],
      'Kampala': [0.3476, 32.5825],
      'Dar es Salaam': [-6.7924, 39.2083],
      'Addis Ababa': [9.1450, 38.7667],
      'RW': [-1.9441, 30.0619], // Rwanda
      'KE': [-1.2921, 36.8219], // Kenya
      'UG': [0.3476, 32.5825], // Uganda
      'TZ': [-6.7924, 39.2083], // Tanzania
      'ET': [9.1450, 38.7667], // Ethiopia
    };
    return coordinates[region] || [-1.2921, 36.8219];
  };
  
  // Generate demand data - Use real data from database
  const generateDemandData = useMemo(() => {
    const data: DemandPoint[] = [];
    
    // Add real demand data
    if (realDemandData.length > 0) {
      realDemandData.forEach((item: any) => {
        data.push({
          id: item.id || `${item.country_code}-${item.region}-${item.material}-${item.timestamp}`,
          region: item.region || item.country_code,
          material: item.material,
          demand: item.demand_quantity || item.forecast_demand || 0,
          trend: (item.trend || 'stable') as 'up' | 'down' | 'stable',
          coordinates: item.coordinates ? JSON.parse(item.coordinates) : getRegionCoordinates(item.region || item.country_code),
          timestamp: item.timestamp || item.created_at
        });
      });
    }
    
    // Add ITC data if enabled
    if (showItcData && itcData.length > 0) {
      itcData.forEach((item: any) => {
        data.push({
          id: item.id,
          region: item.region,
          material: item.material,
          demand: item.demand,
          trend: item.trend,
          coordinates: item.coordinates,
          timestamp: item.timestamp
        });
      });
    }
    
    if (data.length > 0) {
      return data;
    }

    // No fallback - return empty array if no data
    return [];
  }, [realDemandData, itcData, showItcData, currentIndustry]);

  // Filter data based on current selections
  const filteredData = useMemo(() => {
    let data = generateDemandData;
    
    if (selectedMaterial !== 'All Materials') {
      data = data.filter(point => point.material === selectedMaterial);
    }
    
    if (selectedRegion !== 'All Regions') {
      data = data.filter(point => point.region === selectedRegion);
    }
    
    // Filter by time range
    const currentTime = currentTimeIndex;
    data = data.filter(point => {
      const pointTime = parseInt(point.id.split('-')[2]);
      return pointTime === currentTime;
    });
    
    return data;
  }, [generateDemandData, selectedMaterial, selectedRegion, currentTimeIndex]);

  // Calculate region details
  const regionDetails = useMemo(() => {
    const regions: Record<string, RegionDetails> = {};
    
    filteredData.forEach(point => {
      if (!regions[point.region]) {
        regions[point.region] = {
          name: point.region,
          demand: 0,
          growth: 0,
          materials: [],
          suppliers: Math.floor(Math.random() * 50) + 10
        };
      }
      
      regions[point.region].demand += point.demand;
      if (!regions[point.region].materials.includes(point.material)) {
        regions[point.region].materials.push(point.material);
      }
    });
    
    return Object.values(regions);
  }, [filteredData]);

  // Time animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTimeIndex(prev => (prev + 1) % 12);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  const allMaterials = currentIndustry === 'construction' 
    ? ['All Materials', 'Cement', 'Steel', 'Timber', 'Sand', 'Gravel', 'Bricks', 'Roofing Materials']
    : ['All Materials', 'Fertilizer', 'Seeds', 'Pesticides', 'Feed', 'Machinery', 'Tools', 'Equipment'];

  const allRegions = ['All Regions', 'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Kigali', 'Kampala', 'Dar es Salaam', 'Addis Ababa'];

  // Helper function to get ITC country code
  const getITCCountryCode = (countryCode: string): number => {
    const itcCodes: Record<string, number> = {
      'RW': 646, // Rwanda
      'KE': 404, // Kenya
      'UG': 800, // Uganda
      'TZ': 834, // Tanzania
      'ET': 231, // Ethiopia
    };
    return itcCodes[countryCode.toUpperCase()] || 646; // Default to Rwanda
  };

  const renderMapView = () => (
    <div className="space-y-4">
      {/* Map Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md">
            <button
              onClick={() => setMapView('heatmap')}
              className={`px-3 py-2 text-sm ${
                mapView === 'heatmap' 
                  ? 'bg-primary-100 text-primary-700 border-primary-300' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Heatmap
            </button>
            <button
              onClick={() => setMapView('points')}
              className={`px-3 py-2 text-sm border-l ${
                mapView === 'points' 
                  ? 'bg-primary-100 text-primary-700 border-primary-300' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Points
            </button>
            <button
              onClick={() => setMapView('clusters')}
              className={`px-3 py-2 text-sm border-l rounded-r-md ${
                mapView === 'clusters' 
                  ? 'bg-primary-100 text-primary-700 border-primary-300' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Clusters
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? 'Pause' : 'Play'} Animation
          </button>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Month {currentTimeIndex + 1}/12
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-96 border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
        {/* Map Placeholder - In a real app, integrate with Mapbox, Google Maps, or Leaflet */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Interactive Demand Map
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Map visualization showing demand patterns across regions
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">High Demand</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Medium Demand</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Low Demand</span>
              </div>
              {showItcData && itcData.length > 0 && (
                <>
                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-3 w-3 text-blue-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      ITC Data ({itcData.length} points)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Info className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      Sources: Export Potential Map & Trade Map
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Demand Points Overlay */}
        {mapView === 'points' && (
          <div className="absolute inset-0">
            {filteredData.map((point, index) => (
              <div
                key={index}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{
                  left: `${50 + (point.coordinates[1] - 36.8219) * 100}%`,
                  top: `${50 + (point.coordinates[0] + 1.2921) * 100}%`
                }}
                onClick={() => setSelectedRegionDetails({
                  name: point.region,
                  demand: point.demand,
                  growth: Math.random() * 20 - 10,
                  materials: [point.material],
                  suppliers: Math.floor(Math.random() * 50) + 10
                })}
              >
                <div className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                  point.demand > 800 ? 'bg-red-500' : 
                  point.demand > 600 ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-4">
          <span>View: {mapView}</span>
          <span>Points: {filteredData.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <Maximize2 className="h-4 w-4" />
          </button>
          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <Share2 className="h-4 w-4" />
          </button>
          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <Bookmark className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderRegionDetails = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Region Details</h3>
      
      {selectedRegionDetails ? (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              {selectedRegionDetails.name}
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Total Demand:</span>
                <span className="ml-2 font-medium">{selectedRegionDetails.demand.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Growth:</span>
                <span className={`ml-2 font-medium ${
                  selectedRegionDetails.growth > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {selectedRegionDetails.growth > 0 ? '+' : ''}{selectedRegionDetails.growth.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Suppliers:</span>
                <span className="ml-2 font-medium">{selectedRegionDetails.suppliers}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Materials:</span>
                <span className="ml-2 font-medium">{selectedRegionDetails.materials.length}</span>
              </div>
            </div>
          </div>

          <div>
            <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Materials</h5>
            <div className="flex flex-wrap gap-2">
              {selectedRegionDetails.materials.map((material, index) => (
                <Chip key={index} label={material} size="sm" />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Click on a region to view details
        </div>
      )}
    </div>
  );

  const renderTemporalTrends = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Temporal Trends</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {regionDetails.map((region, index) => (
          <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">{region.name}</h4>
              <div className="flex items-center gap-1">
                {region.growth > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  region.growth > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {region.growth > 0 ? '+' : ''}{region.growth.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Demand: {region.demand.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {region.materials.length} materials • {region.suppliers} suppliers
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AppLayout>
      <HeaderStrip 
        title="Demand Mapping for East Africa"
        subtitle="Visualize regional demand patterns and identify market opportunities across East Africa"
        chips={[
          { label: 'Regions', value: regionDetails.length, variant: 'info' },
          { label: 'Data Points', value: filteredData.length, variant: 'info' },
        ]}
        right={
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={demandLoading}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${demandLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowItcData(!showItcData)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                showItcData
                  ? 'bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300'
              }`}
              title="Toggle ITC (Export Potential Map & Trade Map) data"
            >
              <Globe className="h-4 w-4" />
              ITC Data {showItcData ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
            <ActionMenu
              items={[
                { id: 'export', label: 'Export Snapshot', icon: <Download className="h-4 w-4" />, onClick: () => console.log('Export') },
                { id: 'share', label: 'Share Map', icon: <Share2 className="h-4 w-4" />, onClick: () => console.log('Share') }
              ]}
              size="sm"
            />
          </div>
        }
      />
      
      <PageLayout maxWidth="full" padding="none">
        <div className="px-10 md:px-14 lg:px-20 py-8 space-y-8">
          {/* Tab Navigation */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setSelectedTab('demand')}
                className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                  selectedTab === 'demand'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <MapIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Demand Map</span>
                </div>
              </button>
              <button
                onClick={() => setSelectedTab('itc-export')}
                className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                  selectedTab === 'itc-export'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  ITC Export Map
                </div>
              </button>
              <button
                onClick={() => setSelectedTab('trade-data')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  selectedTab === 'trade-data'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Trade Data
                </div>
              </button>
            </div>

            <div className="p-6">
              {/* Tab Content */}
              {selectedTab === 'demand' && (
                <RailLayout
                  right={
                    <div className="space-y-6">
                      {renderRegionDetails()}
                      {renderTemporalTrends()}
                    </div>
                  }
                >
                  <div className="space-y-6">
                    {/* Filters */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Material
                </label>
                <SelectInput
                  value={selectedMaterial}
                  onChange={setSelectedMaterial}
                  options={allMaterials.map(m => ({ value: m, label: m }))}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Region
                </label>
                <SelectInput
                  value={selectedRegion}
                  onChange={setSelectedRegion}
                  options={allRegions.map(r => ({ value: r, label: r }))}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time Range
                </label>
                <SelectInput
                  value={timeRange}
                  onChange={setTimeRange}
                  options={[
                    { value: 'current', label: 'Current' },
                    { value: 'forecast', label: 'Forecast' },
                    { value: 'historical', label: 'Historical' }
                  ]}
                  className="w-full"
                />
              </div>
            </div>

            {/* Map View */}
            <SectionLayout title="Demand Map" subtitle="Interactive visualization of regional demand patterns">
              {demandLoading ? (
                <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Loading demand data...</p>
                  </div>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <MapIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">No demand data available for the selected filters</p>
                    <button
                      onClick={handleRefresh}
                      className="mt-4 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                      Refresh Data
                    </button>
                  </div>
                </div>
              ) : (
                renderMapView()
              )}
            </SectionLayout>

                    {/* Export Options */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Export Snapshot</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Download current view as image or data
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                          PNG
                        </button>
                        <button className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                          CSV
                        </button>
                        <button className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                          PDF
                        </button>
                      </div>
                    </div>
                  </div>
                </RailLayout>
              )}

              {selectedTab === 'itc-export' && (
                <div className="space-y-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      ITC Export Potential Map
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Interactive export potential analysis from the International Trade Centre (ITC). 
                      Explore export opportunities for East African countries.
                    </p>
                  </div>

                  {/* Country Selector for ITC Map */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Exporter Country
                      </label>
                      <SelectInput
                        value={selectedRegion}
                        onChange={setSelectedRegion}
                        options={[
                          { value: 'RW', label: 'Rwanda' },
                          { value: 'KE', label: 'Kenya' },
                          { value: 'UG', label: 'Uganda' },
                          { value: 'TZ', label: 'Tanzania' },
                          { value: 'ET', label: 'Ethiopia' }
                        ]}
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Data source: ITC Export Potential Map
                      </span>
                    </div>
                  </div>

                  {/* Embedded ITC Export Potential Map */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="h-[800px] w-full">
                      <iframe
                        src={`https://exportpotential.intracen.org/en/products/analyze?fromMarker=i&exporter=${getITCCountryCode(selectedRegion)}&toMarker=w&market=w&whatMarker=k`}
                        className="w-full h-full border-0"
                        title="ITC Export Potential Map"
                        allow="fullscreen"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Info Banner */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          About ITC Export Potential Map
                        </h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                          The ITC Export Potential Map helps identify export opportunities by analyzing market size, 
                          growth potential, and competition. This interactive tool is provided by the International Trade Centre.
                        </p>
                        <a
                          href="https://exportpotential.intracen.org/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 underline"
                        >
                          Visit ITC Export Potential Map →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'trade-data' && (
                <div className="space-y-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Trade Data Analysis
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Import and export trade statistics from ITC Trade Map for East African countries.
                    </p>
                  </div>

                  {/* Trade Data Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {['RW', 'KE', 'UG', 'TZ', 'ET'].map((country) => (
                      <div
                        key={country}
                        className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            {country === 'RW' ? 'Rwanda' : 
                             country === 'KE' ? 'Kenya' :
                             country === 'UG' ? 'Uganda' :
                             country === 'TZ' ? 'Tanzania' : 'Ethiopia'}
                          </h4>
                          <Globe className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                          Trade data from ITC Trade Map
                        </p>
                        <a
                          href={`https://www.trademap.org/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline"
                        >
                          View on Trade Map →
                        </a>
                      </div>
                    ))}
                  </div>

                  {/* Embedded Trade Map Link */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        ITC Trade Map
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Access comprehensive trade statistics, import/export values, volumes, growth rates, 
                        and market shares for East African countries.
                      </p>
                      <a
                        href="https://www.trademap.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <Globe className="h-4 w-4" />
                        Open ITC Trade Map
                      </a>
                    </div>
                  </div>

                  {/* Info Banner */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          About ITC Trade Map
                        </h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                          ITC Trade Map provides monthly, quarterly, and yearly trade data for 220 countries 
                          and territories and 5,300 products. Access detailed import/export statistics, 
                          market shares, and growth rates.
                        </p>
                        <a
                          href="https://www.trademap.org/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 underline"
                        >
                          Visit ITC Trade Map →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </PageLayout>
    </AppLayout>
  );
};

export default DemandMapping;