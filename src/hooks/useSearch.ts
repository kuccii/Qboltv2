import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDebounce } from './useDebounce';

export interface SearchResult {
  id: string;
  type: 'supplier' | 'price' | 'logistics' | 'document' | 'agent';
  title: string;
  subtitle: string;
  description?: string;
  url: string;
  score: number;
  metadata?: Record<string, any>;
}

export interface SearchFilters {
  type?: string[];
  region?: string[];
  industry?: string[];
  verified?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'date' | 'name' | 'score';
  sortOrder?: 'asc' | 'desc';
}

// Mock search data - replace with real API calls
const mockSearchData: SearchResult[] = [
  // Suppliers
  {
    id: 'supplier-1',
    type: 'supplier',
    title: 'Steel Masters Ltd',
    subtitle: 'Construction Materials Supplier',
    description: 'Leading supplier of steel, cement, and construction materials across East Africa',
    url: '/app/supplier-directory',
    score: 0.95,
    metadata: { verified: true, region: 'Kenya', industry: 'construction' }
  },
  {
    id: 'supplier-2',
    type: 'supplier',
    title: 'Green Seeds Co',
    subtitle: 'Agricultural Supplies',
    description: 'Premium seeds, fertilizers, and agricultural equipment',
    url: '/app/supplier-directory',
    score: 0.88,
    metadata: { verified: true, region: 'Uganda', industry: 'agriculture' }
  },
  // Prices
  {
    id: 'price-1',
    type: 'price',
    title: 'Cement Price Update',
    subtitle: 'Nairobi Region - $85/ton',
    description: 'Latest cement prices in Nairobi region showing 5.2% increase',
    url: '/app/prices',
    score: 0.92,
    metadata: { material: 'cement', region: 'Nairobi', change: 5.2 }
  },
  {
    id: 'price-2',
    type: 'price',
    title: 'Steel Price Alert',
    subtitle: 'Mombasa Port - $450/ton',
    description: 'Steel prices at Mombasa port with supply chain disruptions',
    url: '/app/prices',
    score: 0.85,
    metadata: { material: 'steel', region: 'Mombasa', change: -2.1 }
  },
  // Logistics
  {
    id: 'logistics-1',
    type: 'logistics',
    title: 'Nairobi to Kampala Route',
    subtitle: 'Distance: 340km, Duration: 6h',
    description: 'Primary logistics route between Nairobi and Kampala',
    url: '/app/logistics',
    score: 0.78,
    metadata: { from: 'Nairobi', to: 'Kampala', distance: 340 }
  },
  // Documents
  {
    id: 'doc-1',
    type: 'document',
    title: 'Supplier Verification Guidelines',
    subtitle: 'PDF Document',
    description: 'Comprehensive guidelines for supplier verification process',
    url: '/app/documents',
    score: 0.82,
    metadata: { type: 'guideline', format: 'pdf' }
  },
  // Agents
  {
    id: 'agent-1',
    type: 'agent',
    title: 'John Mwangi',
    subtitle: 'Logistics Coordinator',
    description: 'Experienced logistics coordinator specializing in East Africa routes',
    url: '/app/agents',
    score: 0.90,
    metadata: { region: 'Kenya', specialization: 'logistics' }
  }
];

export function useSearch() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [options, setOptions] = useState<SearchOptions>({
    limit: 20,
    offset: 0,
    sortBy: 'relevance',
    sortOrder: 'desc'
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);

  // Debounce search query to avoid excessive API calls
  const debouncedQuery = useDebounce(query, 300);

  // Search function
  const search = useCallback(async (searchQuery: string, searchFilters: SearchFilters, searchOptions: SearchOptions) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setTotalResults(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 200));

      // Filter mock data based on query and filters
      let filteredResults = mockSearchData.filter(item => {
        const matchesQuery = 
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesType = !searchFilters.type || searchFilters.type.length === 0 || 
          searchFilters.type.includes(item.type);

        const matchesRegion = !searchFilters.region || searchFilters.region.length === 0 ||
          (item.metadata?.region && searchFilters.region.includes(item.metadata.region));

        const matchesIndustry = !searchFilters.industry || searchFilters.industry.length === 0 ||
          (item.metadata?.industry && searchFilters.industry.includes(item.metadata.industry));

        const matchesVerified = searchFilters.verified === undefined ||
          (item.metadata?.verified === searchFilters.verified);

        return matchesQuery && matchesType && matchesRegion && matchesIndustry && matchesVerified;
      });

      // Sort results
      filteredResults.sort((a, b) => {
        let comparison = 0;
        
        switch (searchOptions.sortBy) {
          case 'relevance':
            comparison = b.score - a.score;
            break;
          case 'date':
            // Mock date sorting - in real implementation, use actual dates
            comparison = Math.random() - 0.5;
            break;
          case 'name':
            comparison = a.title.localeCompare(b.title);
            break;
          case 'score':
            comparison = b.score - a.score;
            break;
        }

        return searchOptions.sortOrder === 'asc' ? -comparison : comparison;
      });

      // Apply pagination
      const startIndex = searchOptions.offset || 0;
      const endIndex = startIndex + (searchOptions.limit || 20);
      const paginatedResults = filteredResults.slice(startIndex, endIndex);

      setResults(paginatedResults);
      setTotalResults(filteredResults.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger search when query or filters change
  useEffect(() => {
    if (debouncedQuery) {
      search(debouncedQuery, filters, options);
    }
  }, [debouncedQuery, filters, options, search]);

  // Search suggestions based on query
  const suggestions = useMemo(() => {
    if (!query || query.length < 2) return [];

    const commonTerms = [
      'cement prices',
      'steel suppliers',
      'logistics routes',
      'agricultural supplies',
      'construction materials',
      'fertilizer prices',
      'seed suppliers',
      'equipment rental'
    ];

    return commonTerms
      .filter(term => term.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }, [query]);

  // Recent searches from localStorage
  const recentSearches = useMemo(() => {
    try {
      const stored = localStorage.getItem('qivook_recent_searches');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  // Save search to recent searches
  const saveSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;

    try {
      const recent = JSON.parse(localStorage.getItem('qivook_recent_searches') || '[]');
      const updated = [searchQuery, ...recent.filter((s: string) => s !== searchQuery)].slice(0, 10);
      localStorage.setItem('qivook_recent_searches', JSON.stringify(updated));
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    localStorage.removeItem('qivook_recent_searches');
  }, []);

  // Update search query
  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setOptions(prev => ({ ...prev, offset: 0 })); // Reset pagination
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setOptions(prev => ({ ...prev, offset: 0 })); // Reset pagination
  }, []);

  // Update options
  const updateOptions = useCallback((newOptions: Partial<SearchOptions>) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
  }, []);

  // Load more results
  const loadMore = useCallback(() => {
    setOptions(prev => ({
      ...prev,
      offset: (prev.offset || 0) + (prev.limit || 20)
    }));
  }, []);

  // Reset search
  const resetSearch = useCallback(() => {
    setQuery('');
    setFilters({});
    setOptions({
      limit: 20,
      offset: 0,
      sortBy: 'relevance',
      sortOrder: 'desc'
    });
    setResults([]);
    setError(null);
  }, []);

  return {
    // State
    query,
    filters,
    options,
    results,
    loading,
    error,
    totalResults,
    suggestions,
    recentSearches,
    
    // Actions
    updateQuery,
    updateFilters,
    updateOptions,
    search: (q: string) => {
      updateQuery(q);
      saveSearch(q);
    },
    loadMore,
    resetSearch,
    clearRecentSearches,
  };
}

// Hook for search suggestions
export function useSearchSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    
    // Simulate API call for suggestions
    const timer = setTimeout(() => {
      const mockSuggestions = [
        `${query} prices`,
        `${query} suppliers`,
        `${query} logistics`,
        `${query} in Nairobi`,
        `${query} in Kampala`
      ].filter(s => s.toLowerCase().includes(query.toLowerCase()));
      
      setSuggestions(mockSuggestions.slice(0, 5));
      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [query]);

  return { suggestions, loading };
}
