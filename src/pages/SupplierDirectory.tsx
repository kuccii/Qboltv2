import React, { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Filter as FilterIcon,
  Download,
  MapPin,
  Phone,
  Mail,
  Star,
  CheckCircle,
  AlertCircle,
  Truck,
  Map as MapIcon,
  List as ListIcon,
  Grid as GridIcon,
  X,
  Plus
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';
// Removed mock data import - using real data from API
import { useAuth } from '../contexts/AuthContext';
import { useIndustry } from '../contexts/IndustryContext';
import { unifiedApi } from '../services/unifiedApi';
import {
  AppLayout,
  PageLayout,
  SectionLayout,
  SearchInput,
  FilterSidebar,
  ActionMenu,
  RailLayout,
  ComparisonTray,
  Chip,
  ChipGroup,
  VerificationBadge,
  InsuranceIndicator
} from '../design-system';
import { useLocation, useNavigate } from 'react-router-dom';

const SupplierDirectory: React.FC = () => {
  const { currentUser } = useAuth();
  const { currentIndustry, industryConfig, getIndustryTerm } = useIndustry();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [verification, setVerification] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [savedViews, setSavedViews] = useState<string[]>([]);
  const [countrySuppliers, setCountrySuppliers] = useState<any[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(true);
  const [suppliersError, setSuppliersError] = useState<string | null>(null);

  // Available countries from country profiles
  const availableCountries: { code: string; name: string }[] = [
    { code: 'RW', name: 'Rwanda' },
    { code: 'KE', name: 'Kenya' },
    { code: 'UG', name: 'Uganda' },
    { code: 'TZ', name: 'Tanzania' },
    { code: 'ET', name: 'Ethiopia' },
  ];

  // Fetch suppliers from country profiles
  useEffect(() => {
    const fetchCountrySuppliers = async () => {
      try {
        setSuppliersLoading(true);
        setSuppliersError(null);

        // Determine which countries to fetch
        const countriesToFetch = selectedCountry === 'all' 
          ? availableCountries.map(c => c.code)
          : [selectedCountry];

        // Fetch suppliers from all selected countries
        const supplierPromises = countriesToFetch.map(countryCode =>
          unifiedApi.countries.getSuppliers(countryCode, {
            verified: verification.includes('verified') ? true : undefined,
            search: searchTerm || undefined
          }).catch(err => {
            console.warn(`Failed to fetch suppliers for ${countryCode}:`, err);
            return []; // Return empty array on error
          })
        );

        const allSuppliersArrays = await Promise.all(supplierPromises);
        const allSuppliers = allSuppliersArrays.flat();

        // Transform country suppliers to match SupplierDirectory format
        const transformedSuppliers = allSuppliers.map((s: any) => ({
          id: s.id,
          name: s.name,
          location: s.location,
          region: s.region || s.location,
          country: s.country_code,
          rating: s.rating || 0,
          reliability: 0, // Not available in country_suppliers
          deliveryTime: '5-7 days', // Default
          materials: s.materials || [],
          verified: s.verified || false,
          insurance: false, // Not available in country_suppliers
          industry: s.category || currentIndustry, // Use category as industry
          phone: s.phone,
          email: s.email,
          website: s.website,
          description: s.description,
          category: s.category,
          services: s.services || [],
          certifications: s.certifications || []
        }));

        setCountrySuppliers(transformedSuppliers);
      } catch (err) {
        console.error('Failed to fetch country suppliers:', err);
        setSuppliersError(err instanceof Error ? err.message : 'Failed to fetch suppliers');
        setCountrySuppliers([]);
      } finally {
        setSuppliersLoading(false);
      }
    };

    fetchCountrySuppliers();
  }, [selectedCountry, verification, searchTerm, currentIndustry]);

  // Use country suppliers from API
  const suppliersToUse = countrySuppliers;
  
  // Filter suppliers based on industry and search/filter settings
  const filteredSuppliers = suppliersToUse
    .filter(supplier => {
      // For country suppliers, filter by category matching industry
      if (countrySuppliers.length > 0) {
        const categoryMap: Record<string, string[]> = {
          'construction': ['construction', 'laboratory', 'storage'],
          'agriculture': ['agriculture', 'food', 'storage']
        };
        const allowedCategories = categoryMap[currentIndustry] || [];
        return allowedCategories.includes((supplier as any).category) || supplier.industry === currentIndustry;
      }
      return supplier.industry === currentIndustry;
    })
    .filter(supplier => 
      searchTerm === '' || 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(supplier => 
      selectedMaterial === 'all' || 
      supplier.materials.includes(selectedMaterial)
    )
    .filter(supplier => {
      if (selectedRegion === 'all') return true;
      // Match by region or country
      return supplier.region === selectedRegion || 
             (supplier as any).country === selectedRegion ||
             supplier.location === selectedRegion;
    })
    .filter(supplier => {
      if (verification.length === 0) return true;
      if (verification.includes('verified')) return supplier.verified === true;
      return true;
    })
    .filter(supplier => (supplier.rating || 0) >= minRating);
  
  // Get unique materials and regions for this industry
  const uniqueMaterials = Array.from(
    new Set(
      suppliersToUse
        .filter(supplier => {
          if (countrySuppliers.length > 0) {
            const categoryMap: Record<string, string[]> = {
              'construction': ['construction', 'laboratory', 'storage'],
              'agriculture': ['agriculture', 'food', 'storage']
            };
            const allowedCategories = categoryMap[currentIndustry] || [];
            return allowedCategories.includes((supplier as any).category) || supplier.industry === currentIndustry;
          }
          return supplier.industry === currentIndustry;
        })
        .flatMap(supplier => supplier.materials)
    )
  );
  
  const uniqueRegions = Array.from(
    new Set(
      suppliersToUse
        .filter(supplier => {
          if (countrySuppliers.length > 0) {
            const categoryMap: Record<string, string[]> = {
              'construction': ['construction', 'laboratory', 'storage'],
              'agriculture': ['agriculture', 'food', 'storage']
            };
            const allowedCategories = categoryMap[currentIndustry] || [];
            return allowedCategories.includes((supplier as any).category) || supplier.industry === currentIndustry;
          }
          return supplier.industry === currentIndustry;
        })
        .map(supplier => supplier.region || (supplier as any).country || supplier.location)
        .filter(Boolean)
    )
  );

  // URL sync (read)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    const mat = params.get('material');
    const reg = params.get('region');
    const ver = params.get('verification');
    const rate = params.get('minRating');
    const cmp = params.get('compare');
    const view = params.get('view');
    if (q) setSearchTerm(q);
    if (mat) setSelectedMaterial(mat);
    if (reg) setSelectedRegion(reg);
    if (ver) setVerification(ver.split(',').filter(Boolean));
    if (rate && !Number.isNaN(Number(rate))) setMinRating(Number(rate));
    if (cmp) setCompareIds(cmp.split(',').filter(Boolean));
    if (view === 'map' || view === 'list') setViewMode(view);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // URL sync (write)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (searchTerm) params.set('q', searchTerm); else params.delete('q');
    params.set('material', selectedMaterial);
    params.set('region', selectedRegion);
    if (verification.length) params.set('verification', verification.join(',')); else params.delete('verification');
    if (minRating > 0) params.set('minRating', String(minRating)); else params.delete('minRating');
    if (compareIds.length) params.set('compare', compareIds.join(',')); else params.delete('compare');
    params.set('view', viewMode);
    navigate({ search: params.toString() }, { replace: true });
  }, [searchTerm, selectedMaterial, selectedRegion, verification, minRating, compareIds, viewMode, navigate, location.search]);

  const toggleCompare = (id: string) => {
    setCompareIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Comparison tray items
  const comparisonItems = useMemo(() => {
    return compareIds.map(id => {
      const supplier = suppliersToUse.find(s => s.id === id);
      if (!supplier) return null;
      return {
        id: supplier.id,
        name: supplier.name,
        type: 'supplier' as const,
        data: supplier,
        image: (supplier as any).logo
      };
    }).filter(Boolean);
  }, [compareIds, suppliersToUse]);

  const handleCompare = () => {
    // Navigate to comparison page or open comparison modal
    console.log('Comparing suppliers:', compareIds);
  };

  const handleRemoveFromCompare = (id: string) => {
    setCompareIds(prev => prev.filter(x => x !== id));
  };

  const handleClearCompare = () => {
    setCompareIds([]);
  };

  const filterGroups = [
    {
      id: 'material',
      label: getIndustryTerm('materials'),
      type: 'radio' as const,
      options: [
        { value: 'all', label: 'All Materials' },
        ...uniqueMaterials.map(m => ({ 
          value: m, 
          label: m,
          count: countrySuppliers.filter(s => s.materials.includes(m) && s.industry === currentIndustry).length
        }))
      ],
      value: selectedMaterial,
      onChange: (value: string | string[]) => setSelectedMaterial(Array.isArray(value) ? value[0] : value)
    },
    {
      id: 'country',
      label: 'Country',
      type: 'radio' as const,
      options: [
        { value: 'all', label: 'All Countries' },
        ...availableCountries.map(c => ({ 
          value: c.code, 
          label: c.name,
          count: suppliersToUse.filter(s => (s as any).country === c.code).length
        }))
      ],
      value: selectedCountry,
      onChange: (value: string | string[]) => setSelectedCountry(Array.isArray(value) ? value[0] : value)
    },
    {
      id: 'region',
      label: 'Region',
      type: 'radio' as const,
      options: [
        { value: 'all', label: 'All Regions' },
        ...uniqueRegions.map(r => ({ 
          value: r, 
          label: r,
          count: suppliersToUse.filter(s => {
            const region = s.region || (s as any).country || s.location;
            return region === r;
          }).length
        }))
      ],
      value: selectedRegion,
      onChange: (value: string | string[]) => setSelectedRegion(Array.isArray(value) ? value[0] : value)
    },
    {
      id: 'verification',
      label: 'Verification Status',
      type: 'checkbox' as const,
      options: [
        { 
          value: 'verified', 
          label: 'Verified',
          count: countrySuppliers.filter(s => (s as any).verification?.status === 'verified' && s.industry === currentIndustry).length
        },
        { 
          value: 'pending', 
          label: 'Pending',
          count: countrySuppliers.filter(s => (s as any).verification?.status === 'pending' && s.industry === currentIndustry).length
        },
        { 
          value: 'rejected', 
          label: 'Rejected',
          count: countrySuppliers.filter(s => (s as any).verification?.status === 'rejected' && s.industry === currentIndustry).length
        }
      ],
      value: verification,
      onChange: (value: string | string[]) => setVerification(Array.isArray(value) ? value : [value])
    },
    {
      id: 'insurance',
      label: 'Insurance Status',
      type: 'checkbox' as const,
      options: [
        { 
          value: 'active', 
          label: 'Insured',
          count: countrySuppliers.filter(s => (s as any).insurance?.status === 'active' && s.industry === currentIndustry).length
        },
        { 
          value: 'inactive', 
          label: 'Not Insured',
          count: countrySuppliers.filter(s => (s as any).insurance?.status === 'inactive' && s.industry === currentIndustry).length
        },
        { 
          value: 'expired', 
          label: 'Expired',
          count: countrySuppliers.filter(s => (s as any).insurance?.status === 'expired' && s.industry === currentIndustry).length
        }
      ],
      value: [],
      onChange: (value: string | string[]) => {} // Add insurance filter state if needed
    },
    {
      id: 'rating',
      label: 'Minimum Rating',
      type: 'radio' as const,
      options: [
        { value: '0', label: 'Any Rating' },
        { value: '3', label: '3+ Stars' },
        { value: '4', label: '4+ Stars' },
        { value: '5', label: '5 Stars Only' }
      ],
      value: String(minRating),
      onChange: (value: string | string[]) => setMinRating(Number(Array.isArray(value) ? value[0] : value))
    }
  ];

  const activeFilters = {
    material: [selectedMaterial],
    region: [selectedRegion],
    verification,
    rating: [String(minRating)]
  };

  const handleFilterChange = (groupId: string, values: string[]) => {
    if (groupId === 'material') setSelectedMaterial(values[0] || 'all');
    if (groupId === 'region') setSelectedRegion(values[0] || 'all');
    if (groupId === 'verification') setVerification(values);
    if (groupId === 'rating') setMinRating(Number(values[0] || '0'));
  };

  const handleFilterReset = () => {
    setSelectedMaterial('all');
    setSelectedRegion('all');
    setVerification([]);
    setMinRating(0);
  };
  
  return (
    <AppLayout>
      {/* Playful Header */}
      <div className="bg-gradient-to-r from-primary-600 to-indigo-600 text-white px-4 sm:px-6 lg:px-8 py-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 mb-2">
                <span>🏢</span>
                {getIndustryTerm('suppliers')} Directory!
              </h1>
              <p className="text-primary-100 flex items-center gap-2">
                <span>🔍</span>
                Find and connect with awesome {getIndustryTerm('suppliers').toLowerCase()}!
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div className="bg-white/20 px-3 py-1 rounded-lg border border-white/30">
                  <span className="text-sm font-bold">Total: {suppliersToUse.length}</span>
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-lg border border-white/30">
                  <span className="text-sm font-bold">Showing: {filteredSuppliers.length}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <SearchInput 
                value={searchTerm} 
                onChange={setSearchTerm} 
                placeholder={`Search ${getIndustryTerm('suppliers').toLowerCase()}...`} 
                size="sm" 
              />
              <div className="flex items-center bg-white/20 rounded-lg border border-white/30 overflow-hidden">
                <button onClick={() => setViewMode('list')} className={`px-3 py-2 text-sm flex items-center gap-1 ${viewMode === 'list' ? 'bg-white/30 text-white font-bold' : 'text-white/80 hover:bg-white/10'}`}>
                  <ListIcon className="h-4 w-4" />
                  List
                </button>
                <button onClick={() => setViewMode('grid')} className={`px-3 py-2 text-sm flex items-center gap-1 border-l border-white/30 ${viewMode === 'grid' ? 'bg-white/30 text-white font-bold' : 'text-white/80 hover:bg-white/10'}`}>
                  <GridIcon className="h-4 w-4" />
                  Grid
                </button>
                <button onClick={() => setViewMode('map')} className={`px-3 py-2 text-sm flex items-center gap-1 border-l border-white/30 ${viewMode === 'map' ? 'bg-white/30 text-white font-bold' : 'text-white/80 hover:bg-white/10'}`}>
                  <MapIcon className="h-4 w-4" />
                  Map
                </button>
              </div>
              <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-3 py-2 text-sm font-bold bg-white/20 text-white rounded-lg border border-white/30 hover:bg-white/30 transition-all">
                <FilterIcon className="h-4 w-4" />
                Filters
                {(selectedMaterial !== 'all' || selectedRegion !== 'all' || verification.length > 0 || minRating > 0) && (
                  <span className="px-2 py-0.5 text-xs bg-yellow-400 text-yellow-900 rounded-full font-bold">Active</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <PageLayout maxWidth="full" padding="none">
        {/* Filter Sidebar */}
        <FilterSidebar
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          filters={filterGroups}
          onClearAll={handleFilterReset}
        />

        {/* Active Filters Display */}
        {(selectedMaterial !== 'all' || selectedRegion !== 'all' || verification.length > 0 || minRating > 0) && (
          <div className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active filters:</span>
              {selectedMaterial !== 'all' && (
                <Chip
                  label={`Material: ${selectedMaterial}`}
                  value="material"
                  onRemove={() => setSelectedMaterial('all')}
                  removable
                  size="sm"
                />
              )}
              {selectedRegion !== 'all' && (
                <Chip
                  label={`Region: ${selectedRegion}`}
                  value="region"
                  onRemove={() => setSelectedRegion('all')}
                  removable
                  size="sm"
                />
              )}
              {verification.length > 0 && (
                <Chip
                  label="Verified Only"
                  value="verified"
                  onRemove={() => setVerification([])}
                  removable
                  size="sm"
                />
              )}
              {minRating > 0 && (
                <Chip
                  label={`Rating: ${minRating}+`}
                  value="rating"
                  onRemove={() => setMinRating(0)}
                  removable
                  size="sm"
                />
              )}
            </div>
          </div>
        )}

        <RailLayout
          right={
            <>
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Saved Filters</h3>
                <p className="text-xs text-gray-500">Coming soon: save and reuse your filter sets.</p>
              </div>
            </>
          }
        >
          <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6" id="supplier-filters">
            <SectionLayout title="Filters" subtitle={`Narrow your search by ${getIndustryTerm('materials').toLowerCase()}, region, verification and rating`}>
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <FilterIcon className="h-4 w-4" />
                  Quick filters
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">{getIndustryTerm('materials')}</label>
                  <select value={selectedMaterial} onChange={e => setSelectedMaterial(e.target.value)} className="text-sm border rounded px-2 py-1">
                    <option value="all">All</option>
                    {uniqueMaterials.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Country</label>
                  <select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)} className="text-sm border rounded px-2 py-1">
                    <option value="all">All</option>
                    {availableCountries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Region</label>
                  <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)} className="text-sm border rounded px-2 py-1">
                    <option value="all">All</option>
                    {uniqueRegions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Min Rating</label>
                  <select value={minRating} onChange={e => setMinRating(Number(e.target.value))} className="text-sm border rounded px-2 py-1">
                    <option value={0}>Any</option>
                    <option value={3}>3+</option>
                    <option value={4}>4+</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Verified</label>
                  <input type="checkbox" checked={verification.includes('verified')} onChange={(e) => setVerification(e.target.checked ? ['verified'] : [])} />
                </div>
              </div>
            </SectionLayout>

            {viewMode === 'map' ? (
              <SectionLayout title="Map View" subtitle="Suppliers by region">
                <div className="h-80 border border-dashed rounded-lg flex items-center justify-center text-gray-500">
                  Map placeholder (integrate map provider)
                </div>
              </SectionLayout>
            ) : null}

            {suppliersLoading ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                Loading suppliers from country profiles...
              </div>
            ) : suppliersError ? (
              <div className="col-span-full text-center py-8 text-red-500">
                Error loading suppliers: {suppliersError}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSuppliers.length > 0 ? (
                  filteredSuppliers.map(supplier => (
                  <div 
                    key={supplier.id} 
                    className="bg-gradient-to-br from-white to-primary-50/30 dark:from-gray-800 dark:to-primary-900/20 rounded-xl shadow-lg border-2 border-primary-200 dark:border-primary-700 p-5 hover:shadow-xl hover:border-primary-400 dark:hover:border-primary-600 transition-all transform hover:scale-[1.02]"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                            <span>🏢</span>
                            {supplier.name}
                          </h3>
                          {/* Verification Badge */}
                          {(supplier as any).verification && (
                            <div className="flex items-center text-green-600 dark:text-green-400 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 px-2 py-1 rounded-lg border-2 border-green-300 dark:border-green-700">
                              <CheckCircle className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1 mb-2">
                          <MapPin size={14} className="mr-1 text-purple-600 dark:text-purple-400" />
                          <span className="font-medium">{supplier.location}</span>
                        </div>
                        {/* Insurance Indicator */}
                        {(supplier as any).insurance && (
                          <div className="mt-2">
                            <InsuranceIndicator 
                              status={(supplier as any).insurance.status}
                              type={(supplier as any).insurance.type}
                              coverageAmount={(supplier as any).insurance.coverageAmount}
                              currency={(supplier as any).insurance.currency}
                              expiryDate={(supplier as any).insurance.expiryDate}
                              size="sm"
                              showAmount={true}
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-800/40 px-2 py-1 rounded-lg border-2 border-yellow-300 dark:border-yellow-700">
                          <Star size={16} className="text-yellow-600 dark:text-yellow-400 fill-yellow-500" />
                          <span className="text-sm font-bold text-yellow-700 dark:text-yellow-400">{supplier.rating}</span>
                        </div>
                        <label className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 cursor-pointer">
                          <input type="checkbox" checked={compareIds.includes(String(supplier.id))} onChange={() => toggleCompare(String(supplier.id))} className="rounded" />
                          Compare
                        </label>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {supplier.materials.map((material, index) => (
                          <span 
                            key={index} 
                            className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/40 text-primary-800 dark:text-primary-200 border-2 border-primary-300 dark:border-primary-700"
                          >
                            {material}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        {(supplier as any).avgDeliveryTime && (
                          <div className="flex items-center gap-1 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded-lg border border-purple-200 dark:border-purple-700">
                            <span>🚚</span>
                            <span className="font-semibold text-purple-700 dark:text-purple-300">{(supplier as any).avgDeliveryTime} days</span>
                          </div>
                        )}
                        {(supplier as any).reliabilityScore && (
                          <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-lg border border-green-200 dark:border-green-700">
                            <span>✅</span>
                            <span className="font-semibold text-green-700 dark:text-green-300">{(supplier as any).reliabilityScore}% Reliable</span>
                          </div>
                        )}
                        {(supplier as any).riskScore && (
                          <div className="flex items-center gap-1 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-lg border border-red-200 dark:border-red-700">
                            <span>⚠️</span>
                            <span className="font-semibold text-red-700 dark:text-red-300">Risk: {(supplier as any).riskScore}/10</span>
                          </div>
                        )}
                      </div>
                      
                      {(supplier as any).transactionHistory && (
                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg">
                          <span>📊</span> {((supplier as any).transactionHistory)} transactions completed
                        </div>
                      )}
                      
                      <div className="pt-2 space-y-2">
                        {(supplier as any).phone && (
                          <div className="flex items-center gap-2 text-sm bg-primary-50 dark:bg-primary-900/30 px-3 py-2 rounded-lg border border-primary-200 dark:border-primary-700">
                            <span>📞</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{(supplier as any).phone}</span>
                          </div>
                        )}
                        {(supplier as any).email && (
                          <div className="flex items-center gap-2 text-sm bg-green-50 dark:bg-green-900/30 px-3 py-2 rounded-lg border border-green-200 dark:border-green-700">
                            <span>✉️</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{(supplier as any).email}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="pt-2 grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => navigate(`/app/suppliers/${supplier.id}`)}
                          className="py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105 text-sm font-bold shadow-md"
                        >
                          <span>💬</span> Contact
                        </button>
                        <button 
                          onClick={() => navigate(`/app/suppliers/${supplier.id}`)}
                          className="py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105 text-sm font-bold shadow-md"
                        >
                          <span>👁️</span> View
                        </button>
                      </div>
                    </div>
                  </div>
                ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      No suppliers match your search criteria
                    </div>
                  )}
                </div>
              )}
          </div>
        </RailLayout>
      </PageLayout>

      {/* Filter Sidebar (non-modal placeholder to keep API consistent) */}
      <FilterSidebar
        filters={filterGroups}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onReset={handleFilterReset}
        isOpen={false}
        onClose={() => {}}
      />

      {/* Compare Tray */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30">
          <div className="px-4 py-2 border rounded-full bg-white shadow flex items-center gap-3">
            <span className="text-sm text-gray-700">{compareIds.length} selected</span>
            <button className="text-sm px-3 py-1 border rounded-full">Compare</button>
            <button className="text-sm px-3 py-1" onClick={() => setCompareIds([])}>Clear</button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 px-3 sm:px-4 md:px-6 pb-6 sm:pb-10">
        <DashboardCard 
          title="Supplier Verification" 
          icon={<CheckCircle size={20} />}
        >
          <div className="space-y-4 mt-2">
            <div className="bg-primary-50 border border-primary-100 rounded-lg p-4">
              <h3 className="font-medium text-primary-800 mb-2">Verification Process</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-success-500 mt-0.5" />
                  <span>Business registration verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-success-500 mt-0.5" />
                  <span>Trade history validation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-success-500 mt-0.5" />
                  <span>Quality certification checks</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-success-500 mt-0.5" />
                  <span>Customer feedback analysis</span>
                </li>
              </ul>
            </div>
          </div>
        </DashboardCard>
        
        <DashboardCard 
          title="Supplier Insights" 
          icon={<AlertCircle size={20} />}
        >
          <div className="space-y-4 mt-2">
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-warning-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-800">Regional Availability</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {currentIndustry === 'construction'
                      ? 'Cement suppliers are concentrated in urban centers, while timber suppliers are more prevalent in rural areas.'
                      : 'Fertilizer suppliers show good coverage across all regions, with specialized equipment suppliers primarily in major cities.'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-800 mb-2">Supplier Distribution</h3>
              <div className="space-y-3">
                {uniqueRegions.map(region => (
                  <div key={region} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{region}</span>
                    <span className="text-sm font-medium text-gray-800">
                      {countrySuppliers.filter(s => s.region === region && s.industry === currentIndustry).length} suppliers
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Comparison Tray */}
      <ComparisonTray
        items={comparisonItems}
        onRemove={handleRemoveFromCompare}
        onClear={handleClearCompare}
        onCompare={handleCompare}
        maxItems={5}
      />
    </AppLayout>
  );
};

export default SupplierDirectory; 