/**
 * Real-time price updates hook
 * Subscribes to price updates via WebSocket and manages local state
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { websocketService, WebSocketMessage } from '../services/websocket';

export interface PriceUpdate {
  id: string;
  material: string;
  location: string;
  country: string;
  price: number;
  currency: string;
  unit: string;
  change: number; // Percentage change
  changeType: 'increase' | 'decrease' | 'stable';
  timestamp: number;
  source?: string;
}

export interface PriceAlert {
  id: string;
  material: string;
  location: string;
  alertType: 'price_spike' | 'price_drop' | 'volatility';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
}

export interface UseRealtimePricesOptions {
  material?: string;
  location?: string;
  country?: string;
  autoSubscribe?: boolean;
  onPriceUpdate?: (update: PriceUpdate) => void;
  onAlert?: (alert: PriceAlert) => void;
}

export function useRealtimePrices(options: UseRealtimePricesOptions = {}) {
  const {
    material,
    location,
    country,
    autoSubscribe = true,
    onPriceUpdate,
    onAlert,
  } = options;

  const [prices, setPrices] = useState<PriceUpdate[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const priceUpdateRef = useRef<(update: PriceUpdate) => void>();
  const alertRef = useRef<(alert: PriceAlert) => void>();

  // Store callbacks in refs to avoid re-subscriptions
  priceUpdateRef.current = onPriceUpdate;
  alertRef.current = onAlert;

  // Handle price updates
  const handlePriceUpdate = useCallback((message: WebSocketMessage) => {
    const update = message.data as PriceUpdate;
    
    // Apply filters if specified
    if (material && update.material !== material) return;
    if (location && update.location !== location) return;
    if (country && update.country !== country) return;

    setPrices((prev) => {
      // Remove old entry for same material/location
      const filtered = prev.filter(
        (p) => !(p.material === update.material && p.location === update.location)
      );
      // Add new update at the beginning
      return [update, ...filtered].slice(0, 100); // Keep last 100 updates
    });

    setLastUpdate(new Date());
    priceUpdateRef.current?.(update);
  }, [material, location, country]);

  // Handle price alerts
  const handlePriceAlert = useCallback((message: WebSocketMessage) => {
    const alert = message.data as PriceAlert;
    setAlerts((prev) => [alert, ...prev].slice(0, 50)); // Keep last 50 alerts
    alertRef.current?.(alert);
  }, []);

  // Handle connection status
  useEffect(() => {
    const unsubscribeConnected = websocketService.on('connected', () => {
      setIsConnected(true);
    });

    const unsubscribeDisconnected = websocketService.on('disconnected', () => {
      setIsConnected(false);
    });

    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
    };
  }, []);

  // Subscribe to price updates
  useEffect(() => {
    if (!autoSubscribe || !websocketService.isConnected()) return;

    const unsubscribePriceUpdate = websocketService.on('price:update', handlePriceUpdate);
    const unsubscribePriceAlert = websocketService.on('price:alert', handlePriceAlert);

    // Subscribe to specific channel if filters provided
    if (material || location || country) {
      websocketService.subscribe('prices', {
        material,
        location,
        country,
      });
    } else {
      websocketService.subscribe('prices');
    }

    return () => {
      unsubscribePriceUpdate();
      unsubscribePriceAlert();
      websocketService.unsubscribe('prices');
    };
  }, [autoSubscribe, material, location, country, handlePriceUpdate, handlePriceAlert]);

  // Clear old prices (keep only last 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      setPrices((prev) =>
        prev.filter((p) => p.timestamp > fiveMinutesAgo)
      );
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Clear old alerts (keep only last hour)
  useEffect(() => {
    const interval = setInterval(() => {
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      setAlerts((prev) =>
        prev.filter((a) => a.timestamp > oneHourAgo)
      );
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const clearPrices = useCallback(() => {
    setPrices([]);
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return {
    prices,
    alerts,
    isConnected,
    lastUpdate,
    clearPrices,
    clearAlerts,
    subscribe: (params?: { material?: string; location?: string; country?: string }) => {
      websocketService.subscribe('prices', params);
    },
    unsubscribe: () => {
      websocketService.unsubscribe('prices');
    },
  };
}




