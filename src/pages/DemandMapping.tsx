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
  PageHeader,
  PageLayout,
  SectionLayout,
  SelectInput,
  ActionMenu,
  RailLayout,
  Chip
} from '../design-system';
import HeatMapChart from '../components/HeatMapChart';
import { demandData } from '../data/mockData';

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
  const [timeRange, setTimeRange] = useState<'current' | 'forecast' | 'historical'>('current');
  const [selectedMaterial, setSelectedMaterial] = useState('All Materials');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [mapView, setMapView] = useState<'heatmap' | 'points' | 'clusters'>('heatmap');
  const [showFilters, setShowFilters] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [selectedRegionDetails, setSelectedRegionDetails] = useState<RegionDetails | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  
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
  
  // Generate mock demand data with temporal dimension
  const generateDemandData = useMemo(() => {
    const regions = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Kigali', 'Kampala'];
    const materials = currentIndustry === 'construction' 
      ? ['Cement', 'Steel', 'Timber', 'Sand', 'Gravel']
      : ['Fertilizer', 'Seeds', 'Pesticides', 'Feed', 'Machinery'];
    
    const data: DemandPoint[] = [];
    const timePoints = 12; // 12 months of data
    
    for (let t = 0; t < timePoints; t++) {
      regions.forEach(region => {
        materials.forEach(material => {
          const baseDemand = Math.random() * 1000 + 500;
          const seasonalFactor = 1 + 0.3 * Math.sin((t / 12) * 2 * Math.PI);
          const demand = Math.round(baseDemand * seasonalFactor);
          
          data.push({
            id: `${region}-${material}-${t}`,
            region,
            material,
            demand,
            trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
            coordinates: getRegionCoordinates(region),
            timestamp: new Date(2024, t, 1).toISOString()
          });
        });
      });
    }
    
    return data;
  }, [currentIndustry]);

  const getRegionCoordinates = (region: string): [number, number] => {
    const coordinates: Record<string, [number, number]> = {
      'Nairobi': [-1.2921, 36.8219],
      'Mombasa': [-4.0437, 39.6682],
      'Kisumu': [-0.0917, 34.7680],
      'Nakuru': [-0.3070, 36.0800],
      'Eldoret': [0.5143, 35.2698],
      'Kigali': [-1.9441, 30.0619],
      'Kampala': [0.3476, 32.5825]
    };
    return coordinates[region] || [-1.2921, 36.8219];
  };

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

  const materials = currentIndustry === 'construction' 
    ? ['All Materials', 'Cement', 'Steel', 'Timber', 'Sand', 'Gravel', 'Bricks', 'Roofing Materials']
    : ['All Materials', 'Fertilizer', 'Seeds', 'Pesticides', 'Feed', 'Machinery', 'Tools', 'Equipment'];

  const regions = ['All Regions', 'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Kigali', 'Kampala'];

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
            <div className="flex items-center justify-center gap-4">
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
      <PageHeader
        title="Demand Mapping"
        subtitle="Visualize regional demand patterns and identify market opportunities"
        breadcrumbs={[{ label: 'Market Intelligence' }, { label: 'Demand Mapping' }]}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50"
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
                  options={materials.map(m => ({ value: m, label: m }))}
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
                  options={regions.map(r => ({ value: r, label: r }))}
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
              {renderMapView()}
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
                <button className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  PNG
                </button>
                <button className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  CSV
                </button>
                <button className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  PDF
                </button>
              </div>
            </div>
          </div>
        </RailLayout>
      </PageLayout>
    </AppLayout>
  );
};

export default DemandMapping;