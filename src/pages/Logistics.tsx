import React, { useState, useEffect, useMemo } from 'react';
import { 
  Truck, 
  Map, 
  Clock, 
  AlertTriangle, 
  Download,
  Filter,
  Search,
  BarChart3,
  Calendar,
  Route,
  DollarSign,
  Fuel,
  Package,
  Navigation,
  Plus,
  Save,
  Calculator,
  MapPin,
  ArrowRight,
  CheckCircle,
  Info
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';
import { logisticsData, LogisticsItem } from '../data/mockData';
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
import { useLocalStorage } from '../hooks/useLocalStorage';

type Status = 'normal' | 'delayed' | 'high-risk';
type TransportMode = 'truck' | 'rail' | 'air' | 'sea';

interface RoutePlan {
  id: string;
  origin: string;
  destination: string;
  distance: number;
  duration: number;
  cost: number;
  mode: TransportMode;
  cargo: string;
  weight: number;
  createdAt: string;
}

interface CostBreakdown {
  fuel: number;
  tolls: number;
  driver: number;
  maintenance: number;
  insurance: number;
  total: number;
}

const Logistics: React.FC = () => {
  const { currentUser } = useAuth();
  const { currentIndustry, industryConfig, getIndustryTerm } = useIndustry();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'planner' | 'calculator' | 'routes'>('overview');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<Status | 'all'>('all');
  
  // Route Planner State
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [transportMode, setTransportMode] = useState<TransportMode>('truck');
  const [cargo, setCargo] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [savedRoutes, setSavedRoutes] = useLocalStorage<RoutePlan[]>('saved-routes', []);

  // Rwanda corridor presets
  const rwandaCorridors = [
    {
      id: 'mombasa-kigali',
      name: 'Mombasa-Kigali Corridor',
      origin: 'Mombasa Port',
      destination: 'Kigali',
      distance: 1200,
      duration: 48,
      cost: 2500,
      mode: 'truck' as TransportMode,
      description: 'Primary trade route for imports from Mombasa to Rwanda',
      customs: ['Malaba', 'Katuna'],
      fuelStops: ['Nairobi', 'Nakuru', 'Eldoret', 'Malaba', 'Kigali']
    },
    {
      id: 'dar-kigali',
      name: 'Dar-Kigali Corridor', 
      origin: 'Dar es Salaam Port',
      destination: 'Kigali',
      distance: 900,
      duration: 36,
      cost: 2200,
      mode: 'truck' as TransportMode,
      description: 'Alternative route through Tanzania',
      customs: ['Rusumo'],
      fuelStops: ['Dar es Salaam', 'Dodoma', 'Mwanza', 'Rusumo', 'Kigali']
    },
    {
      id: 'kampala-kigali',
      name: 'Kampala-Kigali Corridor',
      origin: 'Kampala',
      destination: 'Kigali', 
      distance: 350,
      duration: 8,
      cost: 800,
      mode: 'truck' as TransportMode,
      description: 'Short regional route between capitals',
      customs: ['Katuna'],
      fuelStops: ['Kampala', 'Katuna', 'Kigali']
    }
  ];
  
  // Cost Calculator State
  const [distance, setDistance] = useState<string>('');
  const [fuelPrice, setFuelPrice] = useState<string>('1.2');
  const [vehicleType, setVehicleType] = useState<string>('truck');
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null);
  
  // Rwanda Corridor Presets
  const rwandaPresets = rwandaCorridors;

  const cities = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Kigali', 'Kampala', 'Dar es Salaam', 'Arusha', 'Dodoma'];
  
  // Filter logistics data
  const filteredLogistics = logisticsData
    .filter((item: LogisticsItem) => item.industry === currentIndustry)
    .filter((item: LogisticsItem) => 
      searchTerm === '' || 
      item.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((item: LogisticsItem) => 
      selectedRegion === 'all' || 
      item.region === selectedRegion
    )
    .filter((item: LogisticsItem) => 
      selectedStatus === 'all' || 
      item.status === selectedStatus
    );

  const uniqueRegions = Array.from(
    new Set(
      logisticsData
        .filter((item: LogisticsItem) => item.industry === currentIndustry)
        .map((item: LogisticsItem) => item.region)
    )
  );

  // Calculate route cost
  const calculateCost = useMemo(() => {
    if (!distance || !fuelPrice) return null;
    
    const dist = parseFloat(distance);
    const fuel = parseFloat(fuelPrice);
    
    if (isNaN(dist) || isNaN(fuel)) return null;
    
    // Cost calculation based on vehicle type and distance
    const fuelConsumption = vehicleType === 'truck' ? 0.35 : 0.25; // liters per km
    const fuelCost = dist * fuelConsumption * fuel;
    const tolls = dist * 0.05; // $0.05 per km
    const driverCost = Math.ceil(dist / 500) * 50; // $50 per 500km
    const maintenance = dist * 0.08; // $0.08 per km
    const insurance = dist * 0.02; // $0.02 per km
    
    const total = fuelCost + tolls + driverCost + maintenance + insurance;
    
    return {
      fuel: fuelCost,
      tolls,
      driver: driverCost,
      maintenance,
      insurance,
      total
    };
  }, [distance, fuelPrice, vehicleType]);

  useEffect(() => {
    setCostBreakdown(calculateCost);
  }, [calculateCost]);

  const handleSaveRoute = () => {
    if (!origin || !destination || !distance || !cargo) return;
    
    const newRoute: RoutePlan = {
      id: `route-${Date.now()}`,
      origin,
      destination,
      distance: parseFloat(distance),
      duration: Math.ceil(parseFloat(distance) / 60), // Assume 60km/h average
      cost: costBreakdown?.total || 0,
      mode: transportMode,
      cargo,
      weight: parseFloat(weight) || 0,
      createdAt: new Date().toISOString()
    };
    
    setSavedRoutes(prev => [...prev, newRoute]);
    
    // Clear form
    setOrigin('');
    setDestination('');
    setCargo('');
    setWeight('');
    setDistance('');
  };

  const handlePresetRoute = (preset: typeof rwandaCorridors[0]) => {
    setOrigin(preset.origin);
    setDestination(preset.destination);
    setDistance(preset.distance.toString());
    setDuration(preset.duration.toString());
    setCost(preset.cost.toString());
    setTransportMode(preset.mode);
    setActiveTab('calculator');
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DashboardCard
          title="Active Routes"
          value={filteredLogistics.length.toString()}
          change={{ type: 'increase', value: 12, period: 'vs last month' }}
          icon={<Truck className="h-5 w-5 text-blue-600" />}
        />
        <DashboardCard
          title="On-Time Delivery"
          value="94%"
          change={{ type: 'increase', value: 2, period: 'vs last month' }}
          icon={<Clock className="h-5 w-5 text-green-600" />}
        />
        <DashboardCard
          title="Cost per KM"
          value="$0.85"
          change={{ type: 'decrease', value: 5, period: 'vs last month' }}
          icon={<DollarSign className="h-5 w-5 text-orange-600" />}
        />
        <DashboardCard
          title="Risk Alerts"
          value="3"
          change={{ type: 'decrease', value: 1, period: 'vs last week' }}
          icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
        />
      </div>

      {/* Recent Routes */}
      <SectionLayout title="Recent Routes" subtitle="Latest logistics activities">
        <div className="space-y-3">
          {filteredLogistics.slice(0, 5).map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="flex items-center space-x-3">
                <Truck className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{item.route}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{item.description}</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <StatusBadge status={item.status} />
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {item.duration} hours
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionLayout>
    </div>
  );

  const renderRoutePlanner = () => (
    <div className="space-y-6">
      <SectionLayout title="Route Planner" subtitle="Plan and optimize your logistics routes">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Route Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Origin
              </label>
              <SelectInput
                value={origin}
                onChange={setOrigin}
                options={cities.map(city => ({ value: city, label: city }))}
                placeholder="Select origin city"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Destination
              </label>
              <SelectInput
                value={destination}
                onChange={setDestination}
                options={cities.map(city => ({ value: city, label: city }))}
                placeholder="Select destination city"
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Transport Mode
                </label>
                <SelectInput
                  value={transportMode}
                  onChange={setTransportMode}
                  options={[
                    { value: 'truck', label: 'Truck' },
                    { value: 'rail', label: 'Rail' },
                    { value: 'air', label: 'Air' },
                    { value: 'sea', label: 'Sea' }
                  ]}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cargo Type
                </label>
                <input
                  type="text"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  placeholder="e.g., Cement, Steel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Weight (tons)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Enter weight"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <button
              onClick={handleSaveRoute}
              disabled={!origin || !destination || !cargo}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              Save Route Plan
            </button>
          </div>

          {/* Rwanda Corridor Presets */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Rwanda Corridor Presets</h3>
            <div className="space-y-3">
              {rwandaPresets.map((preset, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{preset.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {preset.distance}km • {preset.duration}h • ${preset.cost}
                      </div>
                    </div>
                    <button
                      onClick={() => handlePresetRoute(preset)}
                      className="px-3 py-1 text-sm font-medium text-primary-600 bg-primary-100 rounded-md hover:bg-primary-200"
                    >
                      Use Route
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {preset.description}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      Customs: {preset.customs.join(', ')}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Fuel Stops: {preset.fuelStops.length}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionLayout>
    </div>
  );

  const renderCostCalculator = () => (
    <div className="space-y-6">
      <SectionLayout title="Cost Calculator" subtitle="Calculate logistics costs for your routes">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Parameters */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Distance (km)
              </label>
              <input
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="Enter distance"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fuel Price ($/L)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={fuelPrice}
                  onChange={(e) => setFuelPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vehicle Type
                </label>
                <SelectInput
                  value={vehicleType}
                  onChange={setVehicleType}
                  options={[
                    { value: 'truck', label: 'Truck' },
                    { value: 'van', label: 'Van' },
                    { value: 'pickup', label: 'Pickup' }
                  ]}
                  className="w-full"
                />
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">Cost Factors</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Calculations include fuel, tolls, driver costs, maintenance, and insurance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Cost Breakdown</h3>
            {costBreakdown ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Fuel Cost</span>
                  <span className="font-medium">${costBreakdown.fuel.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tolls</span>
                  <span className="font-medium">${costBreakdown.tolls.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Driver Cost</span>
                  <span className="font-medium">${costBreakdown.driver.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Maintenance</span>
                  <span className="font-medium">${costBreakdown.maintenance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Insurance</span>
                  <span className="font-medium">${costBreakdown.insurance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                  <span className="text-lg font-semibold text-primary-800 dark:text-primary-200">Total Cost</span>
                  <span className="text-xl font-bold text-primary-800 dark:text-primary-200">
                    ${costBreakdown.total.toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Enter distance and fuel price to calculate costs
              </div>
            )}
          </div>
        </div>
      </SectionLayout>
    </div>
  );

  const renderSavedRoutes = () => (
    <div className="space-y-6">
      <SectionLayout title="Saved Routes" subtitle="Your saved route plans">
        {savedRoutes.length > 0 ? (
          <div className="space-y-3">
            {savedRoutes.map((route) => (
              <div key={route.id} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Route className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {route.origin} → {route.destination}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {route.cargo} • {route.weight} tons • {route.mode}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {route.distance}km • {route.duration}h
                    </div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      ${route.cost.toFixed(2)}
                    </div>
                    <button className="text-primary-600 hover:text-primary-700">
                      <Navigation className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No saved routes yet. Use the Route Planner to create your first route.
          </div>
        )}
      </SectionLayout>
    </div>
  );

  return (
    <AppLayout>
      <PageHeader
        title="Logistics Planning"
        subtitle="Plan routes, calculate costs, and optimize your supply chain"
        breadcrumbs={[{ label: 'Supply Chain' }, { label: 'Logistics' }]}
        actions={
          <div className="flex items-center gap-3">
            <ActionMenu
              items={[
                { id: 'export', label: 'Export Routes', icon: <Download className="h-4 w-4" />, onClick: () => console.log('Export') },
                { id: 'import', label: 'Import Routes', icon: <Plus className="h-4 w-4" />, onClick: () => console.log('Import') }
              ]}
              size="sm"
            />
          </div>
        }
      />

      <PageLayout maxWidth="full" padding="none">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="px-6">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'planner', label: 'Route Planner', icon: Route },
                { id: 'calculator', label: 'Cost Calculator', icon: Calculator },
                { id: 'routes', label: 'Saved Routes', icon: Save }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'planner' && renderRoutePlanner()}
          {activeTab === 'calculator' && renderCostCalculator()}
          {activeTab === 'routes' && renderSavedRoutes()}
        </div>
      </PageLayout>
    </AppLayout>
  );
};

export default Logistics;