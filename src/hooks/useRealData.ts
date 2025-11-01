import { useState, useEffect, useCallback } from 'react';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const API_TIMEOUT = 10000; // 10 seconds

// Types for API responses
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface PriceData {
  id: string;
  material: string;
  price: number;
  currency: string;
  unit: string;
  region: string;
  supplier: string;
  timestamp: string;
  change: number;
  changePercent: number;
}

export interface SupplierData {
  id: string;
  name: string;
  industry: string;
  location: string;
  region: string;
  materials: string[];
  score: number;
  verified: boolean;
  lastUpdated: string;
  contact: {
    email: string;
    phone: string;
    website?: string;
  };
}

export interface LogisticsData {
  id: string;
  route: string;
  from: string;
  to: string;
  distance: number;
  duration: number;
  cost: number;
  carrier: string;
  status: 'active' | 'inactive' | 'maintenance';
  lastUpdated: string;
}

// Custom hook for API calls with error handling and loading states
export function useApi<T>(
  endpoint: string,
  options: RequestInit = {},
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<T> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'API request failed');
      }

      setData(result.data);
      setLastFetched(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error(`API Error (${endpoint}):`, err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, ...dependencies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastFetched,
    refetch,
  };
}

// Specific hooks for different data types
export function usePrices(region?: string, material?: string) {
  const endpoint = `/prices${region ? `?region=${region}` : ''}${material ? `&material=${material}` : ''}`;
  return useApi<PriceData[]>(endpoint, {}, [region, material]);
}

export function useSuppliers(industry?: string, region?: string) {
  const endpoint = `/suppliers${industry ? `?industry=${industry}` : ''}${region ? `&region=${region}` : ''}`;
  return useApi<SupplierData[]>(endpoint, {}, [industry, region]);
}

export function useLogistics(route?: string) {
  const endpoint = `/logistics${route ? `?route=${route}` : ''}`;
  return useApi<LogisticsData[]>(endpoint, {}, [route]);
}

// Hook for real-time data updates
export function useRealtimeData<T>(
  endpoint: string,
  interval: number = 30000 // 30 seconds default
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        if (response.ok) {
          const result: ApiResponse<T> = await response.json();
          if (result.success) {
            setData(result.data);
            setIsConnected(true);
            setError(null);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Connection failed');
        setIsConnected(false);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling
    intervalId = setInterval(fetchData, interval);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [endpoint, interval]);

  return {
    data,
    loading,
    error,
    isConnected,
  };
}

// Hook for data mutations (POST, PUT, DELETE)
export function useMutation<T, P = any>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST'
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const mutate = useCallback(async (payload?: P) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload ? JSON.stringify(payload) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<T> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Mutation failed');
      }

      setData(result.data);
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, method]);

  return {
    mutate,
    loading,
    error,
    data,
  };
}

// Utility function to check if we're in development mode
export const isDevelopment = import.meta.env.DEV;

// Fallback to mock data when API is not available
export function useApiWithFallback<T>(
  apiHook: () => { data: T | null; loading: boolean; error: string | null },
  mockData: T
) {
  const apiResult = apiHook();
  
  // In development or when API fails, use mock data
  if (isDevelopment || apiResult.error) {
    return {
      ...apiResult,
      data: apiResult.data || mockData,
      error: null, // Don't show error in dev mode
    };
  }
  
  return apiResult;
}