// Global data context for caching and state management
import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Data types
export interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export interface DataState {
  cache: Record<string, CacheItem>;
  loading: Record<string, boolean>;
  errors: Record<string, string | null>;
}

// Action types
type DataAction =
  | { type: 'SET_LOADING'; key: string; loading: boolean }
  | { type: 'SET_DATA'; key: string; data: any; ttl?: number }
  | { type: 'SET_ERROR'; key: string; error: string | null }
  | { type: 'CLEAR_CACHE'; key?: string }
  | { type: 'CLEAR_ALL' };

// Reducer
function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.key]: action.loading,
        },
      };

    case 'SET_DATA':
      return {
        ...state,
        cache: {
          ...state.cache,
          [action.key]: {
            data: action.data,
            timestamp: Date.now(),
            ttl: action.ttl || 5 * 60 * 1000, // Default 5 minutes
          },
        },
        errors: {
          ...state.errors,
          [action.key]: null,
        },
      };

    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.key]: action.error,
        },
        loading: {
          ...state.loading,
          [action.key]: false,
        },
      };

    case 'CLEAR_CACHE':
      if (action.key) {
        const { [action.key]: removed, ...rest } = state.cache;
        return {
          ...state,
          cache: rest,
        };
      }
      return {
        ...state,
        cache: {},
      };

    case 'CLEAR_ALL':
      return {
        cache: {},
        loading: {},
        errors: {},
      };

    default:
      return state;
  }
}

// Context
interface DataContextType {
  // Cache management
  getCachedData: <T>(key: string) => T | null;
  setCachedData: <T>(key: string, data: T, ttl?: number) => void;
  isDataValid: (key: string) => boolean;
  clearCache: (key?: string) => void;
  clearAllCache: () => void;

  // Loading states
  isLoading: (key: string) => boolean;
  setLoading: (key: string, loading: boolean) => void;

  // Error states
  getError: (key: string) => string | null;
  setError: (key: string, error: string | null) => void;

  // Data fetching with cache
  fetchData: <T>(
    key: string,
    fetchFn: () => Promise<T>,
    options?: { ttl?: number; forceRefresh?: boolean }
  ) => Promise<T | null>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider component
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, {
    cache: {},
    loading: {},
    errors: {},
  });

  const { isAuthenticated } = useAuth();

  // Check if cached data is still valid
  const isDataValid = useCallback((key: string): boolean => {
    const item = state.cache[key];
    if (!item) return false;
    
    const now = Date.now();
    return (now - item.timestamp) < item.ttl;
  }, [state.cache]);

  // Get cached data
  const getCachedData = useCallback(<T,>(key: string): T | null => {
    const item = state.cache[key];
    if (!item || !isDataValid(key)) {
      return null;
    }
    return item.data as T;
  }, [state.cache, isDataValid]);

  // Set cached data
  const setCachedData = useCallback(<T,>(key: string, data: T, ttl?: number) => {
    dispatch({
      type: 'SET_DATA',
      key,
      data,
      ttl,
    });
  }, []);

  // Clear cache
  const clearCache = useCallback((key?: string) => {
    dispatch({ type: 'CLEAR_CACHE', key });
  }, []);

  // Clear all cache
  const clearAllCache = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  // Loading states
  const isLoading = useCallback((key: string): boolean => {
    return state.loading[key] || false;
  }, [state.loading]);

  const setLoading = useCallback((key: string, loading: boolean) => {
    dispatch({ type: 'SET_LOADING', key, loading });
  }, []);

  // Error states
  const getError = useCallback((key: string): string | null => {
    return state.errors[key] || null;
  }, [state.errors]);

  const setError = useCallback((key: string, error: string | null) => {
    dispatch({ type: 'SET_ERROR', key, error });
  }, []);

  // Fetch data with caching
  const fetchData = useCallback(async <T,>(
    key: string,
    fetchFn: () => Promise<T>,
    options: { ttl?: number; forceRefresh?: boolean } = {}
  ): Promise<T | null> => {
    const { ttl = 5 * 60 * 1000, forceRefresh = false } = options;

    // Return cached data if valid and not forcing refresh
    if (!forceRefresh && isDataValid(key)) {
      return getCachedData<T>(key);
    }

    // Check if already loading
    if (isLoading(key)) {
      return null;
    }

    setLoading(key, true);
    setError(key, null);

    try {
      const data = await fetchFn();
      setCachedData(key, data, ttl);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(key, errorMessage);
      return null;
    } finally {
      setLoading(key, false);
    }
  }, [isDataValid, getCachedData, isLoading, setLoading, setError, setCachedData]);

  // Clear cache when user logs out
  React.useEffect(() => {
    if (!isAuthenticated) {
      clearAllCache();
    }
  }, [isAuthenticated, clearAllCache]);

  const value: DataContextType = {
    getCachedData,
    setCachedData,
    isDataValid,
    clearCache,
    clearAllCache,
    isLoading,
    setLoading,
    getError,
    setError,
    fetchData,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

// Hook to use data context
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Hook for specific data fetching with cache
export function useCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: { ttl?: number; dependencies?: any[] } = {}
) {
  const { fetchData, getCachedData, isLoading, getError } = useData();
  const [data, setData] = React.useState<T | null>(null);

  const { ttl, dependencies = [] } = options;

  React.useEffect(() => {
    const loadData = async () => {
      // Try to get cached data first
      const cachedData = getCachedData<T>(key);
      if (cachedData) {
        setData(cachedData);
        return;
      }

      // Fetch fresh data
      const freshData = await fetchData(key, fetchFn, { ttl });
      if (freshData) {
        setData(freshData);
      }
    };

    loadData();
  }, [key, fetchFn, ttl, ...dependencies]);

  return {
    data,
    loading: isLoading(key),
    error: getError(key),
    refetch: () => fetchData(key, fetchFn, { ttl, forceRefresh: true }),
  };
}
