// Custom hooks for price-related data
import { useApi, usePaginatedApi, useMutation, useRealtimeData } from './useApi';
import { priceApi } from '../services/api';

export interface PriceData {
  id: string;
  material: string;
  location: string;
  price: number;
  unit: string;
  timestamp: string;
  source: string;
  verified: boolean;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
}

export interface PriceHistory {
  date: string;
  price: number;
  volume?: number;
  source?: string;
}

export interface PriceAlert {
  id: string;
  material: string;
  location: string;
  currentPrice: number;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  createdAt: string;
}

// Hook for getting current prices
export function usePrices(params?: {
  material?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useApi(() => priceApi.getPrices(params), {
    dependencies: [params?.material, params?.location, params?.startDate, params?.endDate],
  });
}

// Hook for getting price history
export function usePriceHistory(material: string, location: string, period: string = '30d') {
  return useApi(() => priceApi.getPriceHistory(material, location, period), {
    dependencies: [material, location, period],
  });
}

// Hook for submitting price reports
export function usePriceReportSubmission() {
  return useMutation(priceApi.submitPriceReport, {
    onSuccess: (data) => {
      console.log('Price report submitted successfully:', data);
    },
    onError: (error) => {
      console.error('Failed to submit price report:', error);
    },
  });
}

// Hook for getting price alerts
export function usePriceAlerts() {
  return useApi(() => priceApi.getPriceAlerts());
}

// Hook for real-time price updates
export function useRealtimePrices(material: string, location: string, interval: number = 30000) {
  return useRealtimeData(
    () => priceApi.getPriceHistory(material, location, '1d'),
    interval,
    {
      dependencies: [material, location],
    }
  );
}

// Hook for price data with pagination
export function usePaginatedPrices(params?: {
  material?: string;
  location?: string;
  search?: string;
  pageSize?: number;
}) {
  return usePaginatedApi(
    (page, limit) => priceApi.getPrices({ ...params, limit, offset: (page - 1) * limit }),
    {
      pageSize: params?.pageSize || 20,
      dependencies: [params?.material, params?.location, params?.search],
    }
  );
}

