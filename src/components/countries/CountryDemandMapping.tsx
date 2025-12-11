// Country Demand Mapping Component
// Integrated into country profile intelligence tab
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Map as MapIcon, 
  Filter, 
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Calendar,
  Download,
  RefreshCw,
  Plus,
  Info
} from 'lucide-react';
import { unifiedApi } from '../../services/unifiedApi';
import { useIndustry } from '../../contexts/IndustryContext';

interface DemandMappingProps {
  countryCode: string;
  className?: string;
}

interface DemandPoint {
  id: string;
  region: string;
  material: string;
  demand_quantity: number;
  demand_unit: string;
  trend: 'up' | 'down' | 'stable' | null;
  latitude: number | null;
  longitude: number | null;
  timestamp: string;
  forecast_demand?: number;
  forecast_period?: string;
}

const CountryDemandMapping: React.FC<DemandMappingProps> = ({ countryCode, className = '' }) => {
  const { currentIndustry } = useIndustry();
  const [demandData, setDemandData] = useState<DemandPoint[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [timeRange, setTimeRange] = useState<'current' | 'forecast'>('current');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  useEffect(() => {
    loadDemandData();
  }, [countryCode, currentIndustry, selectedMaterial, selectedRegion, timeRange]);

  const loadDemandData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await unifiedApi.countries.getDemand(countryCode, {
        material: selectedMaterial !== 'all' ? selectedMaterial : undefined,
        region: selectedRegion !== 'all' ? selectedRegion : undefined,
        industry: currentIndustry,
        timeRange
      });
      setDemandData(data as any);
    } catch (err) {
      console.error('Failed to load demand data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load demand data');
    } finally {
      setLoading(false);
    }
  };

  // Get unique materials and regions
  const uniqueMaterials = useMemo(() => {
    return Array.from(new Set(demandData.map(d => d.material))).sort();
  }, [demandData]);

  const uniqueRegions = useMemo(() => {
    return Array.from(new Set(demandData.map(d => d.region))).sort();
  }, [demandData]);

  // Calculate region aggregates
  const regionStats = useMemo(() => {
    const stats: Record<string, { total: number; materials: Set<string>; trends: Record<string, number> }> = {};
    
    demandData.forEach(point => {
      if (!stats[point.region]) {
        stats[point.region] = { total: 0, materials: new Set(), trends: { up: 0, down: 0, stable: 0 } };
      }
      stats[point.region].total += point.demand_quantity;
      stats[point.region].materials.add(point.material);
      if (point.trend) {
        stats[point.region].trends[point.trend] = (stats[point.region].trends[point.trend] || 0) + 1;
      }
    });

    return Object.entries(stats).map(([region, data]) => ({
      region,
      totalDemand: data.total,
      materialCount: data.materials.size,
      dominantTrend: Object.entries(data.trends).sort((a, b) => b[1] - a[1])[0]?.[0] || 'stable'
    }));
  }, [demandData]);

  const getTrendIcon = (trend: string | null) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: string | null) => {
    switch (trend) {
      case 'up': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'down': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <RefreshCw className="animate-spin h-8 w-8 text-gray-400" />
      </div>
    );
  }

  if (error && demandData.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <MapIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Demand Data</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error || 'No demand data available for this country yet.'}
        </p>
        <button
          onClick={() => setShowSubmitForm(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Submit Demand Data
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Demand Mapping</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Visualize regional demand patterns and identify market opportunities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSubmitForm(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Submit Data
          </button>
          <button
            onClick={loadDemandData}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
        </div>
        
        <select
          value={selectedMaterial}
          onChange={(e) => setSelectedMaterial(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
        >
          <option value="all">All Materials</option>
          {uniqueMaterials.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
        >
          <option value="all">All Regions</option>
          {uniqueRegions.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTimeRange('current')}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              timeRange === 'current'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
            }`}
          >
            Current
          </button>
          <button
            onClick={() => setTimeRange('forecast')}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              timeRange === 'forecast'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
            }`}
          >
            Forecast
          </button>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Demand Map</h4>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4" />
            <span>{demandData.length} demand points</span>
          </div>
        </div>
        <div className="h-96 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-center">
            <MapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">Interactive Map</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {demandData.length > 0 
                ? 'Map visualization will show demand heatmap with color-coded regions'
                : 'Add demand data to see map visualization'}
            </p>
          </div>
        </div>
      </div>

      {/* Region Statistics */}
      {regionStats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {regionStats.map((stat) => (
            <div
              key={stat.region}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h5 className="font-semibold text-gray-900 dark:text-white">{stat.region}</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.materialCount} material{stat.materialCount !== 1 ? 's' : ''}
                  </p>
                </div>
                {getTrendIcon(stat.dominantTrend)}
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.totalDemand.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">tons</span>
                </div>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs mt-2 ${getTrendColor(stat.dominantTrend)}`}>
                  {stat.dominantTrend.charAt(0).toUpperCase() + stat.dominantTrend.slice(1)} trend
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Demand Data Table */}
      {demandData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Demand Details</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Region</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Material</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Demand</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Trend</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {demandData.slice(0, 20).map((point) => (
                  <tr key={point.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{point.region}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{point.material}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {point.demand_quantity.toLocaleString()} {point.demand_unit}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-1">
                        {getTrendIcon(point.trend)}
                        <span className={getTrendColor(point.trend).split(' ')[0]}>
                          {point.trend || 'stable'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(point.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {demandData.length > 20 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing 20 of {demandData.length} demand points
              </p>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-primary-800 dark:text-primary-200 mb-1">About Demand Mapping</h4>
            <p className="text-sm text-primary-700 dark:text-primary-300">
              Demand mapping visualizes regional demand patterns for materials and helps identify market opportunities. 
              Submit demand data to contribute to the community database and improve market intelligence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountryDemandMapping;


