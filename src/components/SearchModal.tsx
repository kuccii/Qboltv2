import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, TrendingUp, Users, Map, FileText, Truck, Building2, AlertTriangle, CreditCard, Clock, Filter, ArrowRight } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const {
    query,
    filters,
    results,
    loading,
    error,
    totalResults,
    suggestions,
    recentSearches,
    updateQuery,
    updateFilters,
    search,
    resetSearch,
    clearRecentSearches
  } = useSearch();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          } else if (query.trim()) {
            search(query);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, query, search]);

  const handleResultClick = (result: any) => {
    navigate(result.url);
    onClose();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'supplier':
        return <Building2 size={16} className="text-primary-500" />;
      case 'price':
        return <TrendingUp size={16} className="text-green-500" />;
      case 'logistics':
        return <Truck size={16} className="text-purple-500" />;
      case 'document':
        return <FileText size={16} className="text-orange-500" />;
      case 'agent':
        return <Users size={16} className="text-indigo-500" />;
      default:
        return <Search size={16} className="text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'supplier': return 'Supplier';
      case 'price': return 'Price';
      case 'logistics': return 'Logistics';
      case 'document': return 'Document';
      case 'agent': return 'Agent';
      default: return 'Result';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-start justify-center p-4 pt-16">
        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          {/* Search Input */}
          <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <Search className="text-gray-400 mr-3" size={20} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => updateQuery(e.target.value)}
              placeholder="Search suppliers, prices, logistics, documents..."
              className="flex-1 text-lg bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors mr-2 ${
                showFilters 
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Toggle filters"
            >
              <Filter size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={filters.type?.[0] || ''}
                    onChange={(e) => updateFilters({ type: e.target.value ? [e.target.value] : [] })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">All Types</option>
                    <option value="supplier">Suppliers</option>
                    <option value="price">Prices</option>
                    <option value="logistics">Logistics</option>
                    <option value="document">Documents</option>
                    <option value="agent">Agents</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Region
                  </label>
                  <select
                    value={filters.region?.[0] || ''}
                    onChange={(e) => updateFilters({ region: e.target.value ? [e.target.value] : [] })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">All Regions</option>
                    <option value="Kenya">Kenya</option>
                    <option value="Uganda">Uganda</option>
                    <option value="Rwanda">Rwanda</option>
                    <option value="Tanzania">Tanzania</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Industry
                  </label>
                  <select
                    value={filters.industry?.[0] || ''}
                    onChange={(e) => updateFilters({ industry: e.target.value ? [e.target.value] : [] })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">All Industries</option>
                    <option value="construction">Construction</option>
                    <option value="agriculture">Agriculture</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          <div ref={resultsRef} className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Searching...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="text-red-500 mb-4">
                  <X size={48} className="mx-auto" />
                </div>
                <p className="text-red-600 dark:text-red-400 mb-2">Search failed</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
              </div>
            ) : query.trim() && results.length > 0 ? (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {totalResults} result{totalResults !== 1 ? 's' : ''} found
                  </p>
                  <button
                    onClick={resetSearch}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Clear search
                  </button>
                </div>
                
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className={`w-full flex items-center p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg group transition-colors ${
                        index === selectedIndex ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                      }`}
                    >
                      {getIcon(result.type)}
                      <div className="flex-1 min-w-0 ml-3">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {result.title}
                          </p>
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded-full">
                            {getTypeLabel(result.type)}
                          </span>
                          {result.metadata?.verified && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-xs text-green-600 dark:text-green-400 rounded-full">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {result.subtitle}
                        </p>
                        {result.description && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-1">
                            {result.description}
                          </p>
                        )}
                      </div>
                      <ArrowRight size={16} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                    </button>
                  ))}
                </div>
              </div>
            ) : query.trim() && results.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Search size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>No results found for "{query}"</p>
                <p className="text-sm mt-1">Try different keywords or check your spelling</p>
              </div>
            ) : (
              <div className="p-4">
                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <TrendingUp size={16} />
                      Suggestions
                    </h3>
                    <div className="space-y-1">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => search(suggestion)}
                          className="flex items-center gap-3 w-full p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                        >
                          <Search size={16} className="text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Clock size={16} />
                        Recent Searches
                      </h3>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => search(search)}
                          className="flex items-center gap-3 w-full p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                        >
                          <Clock size={16} className="text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">{search}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Searches */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <TrendingUp size={16} />
                    Popular Searches
                  </h3>
                  <div className="space-y-1">
                    {[
                      'Cement prices Nairobi',
                      'Steel suppliers Kenya',
                      'Logistics routes Uganda',
                      'Agricultural supplies',
                      'Construction materials',
                      'Fertilizer prices',
                      'Equipment rental',
                      'Seed suppliers'
                    ].map((search, index) => (
                      <button
                        key={index}
                        onClick={() => search(search)}
                        className="flex items-center gap-3 w-full p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <TrendingUp size={16} className="text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">{search}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-4">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>Esc Close</span>
              </div>
              <span>Press / to search</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;