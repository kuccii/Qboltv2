import { useState, useEffect, useCallback, useRef } from 'react';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetch: Date | null;
}

export interface ApiOptions {
  /** Whether to fetch data immediately on mount */
  immediate?: boolean;
  /** Cache duration in milliseconds */
  cacheDuration?: number;
  /** Whether to refetch on window focus */
  refetchOnFocus?: boolean;
  /** Whether to refetch on network reconnect */
  refetchOnReconnect?: boolean;
  /** Custom error handler */
  onError?: (error: Error) => void;
  /** Custom success handler */
  onSuccess?: (data: any) => void;
}

/**
 * Hook for API data fetching with caching and error handling
 */
export function useApi<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = [],
  options: ApiOptions = {}
) {
  const {
    immediate = true,
    cacheDuration = 5 * 60 * 1000, // 5 minutes
    refetchOnFocus = false,
    refetchOnReconnect = false,
    onError,
    onSuccess
  } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    lastFetch: null
  });

  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (force = false) => {
    const cacheKey = JSON.stringify(dependencies);
    const cached = cacheRef.current.get(cacheKey);
    
    // Check cache first
    if (!force && cached && Date.now() - cached.timestamp < cacheDuration) {
      setState(prev => ({
        ...prev,
        data: cached.data,
        loading: false,
        error: null
      }));
      return cached.data;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await fetchFn();
      
      // Cache the result
      cacheRef.current.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      setState({
        data,
        loading: false,
        error: null,
        lastFetch: new Date()
      });

      onSuccess?.(data);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      onError?.(error as Error);
      throw error;
    }
  }, [fetchFn, dependencies, cacheDuration, onError, onSuccess]);

  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Fetch on mount if immediate is true
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnFocus) return;

    const handleFocus = () => {
      fetchData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnFocus, fetchData]);

  // Refetch on network reconnect
  useEffect(() => {
    if (!refetchOnReconnect) return;

    const handleOnline = () => {
      fetchData();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [refetchOnReconnect, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    refetch,
    clearCache,
    clearError
  };
}

/**
 * Hook for paginated data fetching
 */
export function usePaginatedApi<T>(
  fetchFn: (page: number, pageSize: number) => Promise<{ data: T[]; total: number; hasMore: boolean }>,
  pageSize: number = 20,
  options: ApiOptions = {}
) {
  const [page, setPage] = useState(1);
  const [allData, setAllData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchPage = useCallback(async (pageNum: number) => {
    return fetchFn(pageNum, pageSize);
  }, [fetchFn, pageSize]);

  const { data, loading, error, refetch } = useApi(
    () => fetchPage(page),
    [page],
    options
  );

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    const nextPage = page + 1;
    setPage(nextPage);
  }, [page, loading, hasMore]);

  const reset = useCallback(() => {
    setPage(1);
    setAllData([]);
    setHasMore(true);
    setTotal(0);
  }, []);

  // Update accumulated data when new page loads
  useEffect(() => {
    if (data) {
      if (page === 1) {
        setAllData(data.data);
      } else {
        setAllData(prev => [...prev, ...data.data]);
      }
      setHasMore(data.hasMore);
      setTotal(data.total);
    }
  }, [data, page]);

  return {
    data: allData,
    loading,
    error,
    hasMore,
    total,
    page,
    loadMore,
    reset,
    refetch
  };
}

/**
 * Hook for infinite scroll pagination
 */
export function useInfiniteScroll<T>(
  fetchFn: (page: number) => Promise<T[]>,
  options: ApiOptions = {}
) {
  const [page, setPage] = useState(1);
  const [allData, setAllData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const fetchPage = useCallback(async (pageNum: number) => {
    const data = await fetchFn(pageNum);
    return { data, hasMore: data.length > 0 };
  }, [fetchFn]);

  const { data: pageData, loading, error } = useApi(
    () => fetchPage(page),
    [page],
    options
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  const reset = useCallback(() => {
    setPage(1);
    setAllData([]);
    setHasMore(true);
  }, []);

  // Update accumulated data
  useEffect(() => {
    if (pageData) {
      if (page === 1) {
        setAllData(pageData.data);
      } else {
        setAllData(prev => [...prev, ...pageData.data]);
      }
      setHasMore(pageData.hasMore);
    }
  }, [pageData, page]);

  return {
    data: allData,
    loading,
    error,
    hasMore,
    loadMore,
    reset
  };
}

/**
 * Hook for debounced search
 */
export function useSearchApi<T>(
  searchFn: (query: string) => Promise<T[]>,
  delay: number = 300,
  options: ApiOptions = {}
) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => clearTimeout(timer);
  }, [query, delay]);

  const { data, loading, error } = useApi(
    () => searchFn(debouncedQuery),
    [debouncedQuery],
    {
      ...options,
      immediate: debouncedQuery.length > 0
    }
  );

  return {
    query,
    setQuery,
    results: data || [],
    loading,
    error
  };
}