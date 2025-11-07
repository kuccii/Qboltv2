/**
 * Real-time logistics tracking hook
 * Subscribes to logistics updates via WebSocket
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { websocketService, WebSocketMessage } from '../services/websocket';

export interface LogisticsUpdate {
  id: string;
  trackingNumber?: string;
  routeId?: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'delayed' | 'cancelled';
  origin: string;
  destination: string;
  currentLocation?: {
    lat: number;
    lng: number;
    address?: string;
  };
  estimatedDelivery?: number; // timestamp
  actualDelivery?: number; // timestamp
  updateType: 'status_change' | 'location_update' | 'delay' | 'delivery';
  timestamp: number;
  message?: string;
}

export interface UseRealtimeLogisticsOptions {
  trackingNumber?: string;
  routeId?: string;
  origin?: string;
  destination?: string;
  autoSubscribe?: boolean;
  onUpdate?: (update: LogisticsUpdate) => void;
}

export function useRealtimeLogistics(options: UseRealtimeLogisticsOptions = {}) {
  const {
    trackingNumber,
    routeId,
    origin,
    destination,
    autoSubscribe = true,
    onUpdate,
  } = options;

  const [updates, setUpdates] = useState<LogisticsUpdate[]>([]);
  const [trackedShipments, setTrackedShipments] = useState<Map<string, LogisticsUpdate>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const updateRef = useRef<(update: LogisticsUpdate) => void>();

  updateRef.current = onUpdate;

  // Handle logistics updates
  const handleLogisticsUpdate = useCallback((message: WebSocketMessage) => {
    const update = message.data as LogisticsUpdate;

    // Apply filters if specified
    if (trackingNumber && update.trackingNumber !== trackingNumber) return;
    if (routeId && update.routeId !== routeId) return;
    if (origin && update.origin !== origin) return;
    if (destination && update.destination !== destination) return;

    // Update tracked shipments map
    if (update.trackingNumber) {
      setTrackedShipments((prev) => {
        const newMap = new Map(prev);
        newMap.set(update.trackingNumber!, update);
        return newMap;
      });
    }

    setUpdates((prev) => {
      // Remove old entry for same shipment/route
      const filtered = prev.filter(
        (u) => u.trackingNumber !== update.trackingNumber && u.routeId !== update.routeId
      );
      // Add new update at the beginning
      return [update, ...filtered].slice(0, 200); // Keep last 200 updates
    });

    setLastUpdate(new Date());
    updateRef.current?.(update);
  }, [trackingNumber, routeId, origin, destination]);

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

  // Subscribe to logistics updates
  useEffect(() => {
    if (!autoSubscribe || !websocketService.isConnected()) return;

    const unsubscribe = websocketService.on('logistics:update', handleLogisticsUpdate);
    const unsubscribeTracking = websocketService.on('logistics:tracking', handleLogisticsUpdate);

    // Subscribe to specific channel if filters provided
    if (trackingNumber || routeId || origin || destination) {
      websocketService.subscribe('logistics', {
        trackingNumber,
        routeId,
        origin,
        destination,
      });
    } else {
      websocketService.subscribe('logistics');
    }

    return () => {
      unsubscribe();
      unsubscribeTracking();
      websocketService.unsubscribe('logistics');
    };
  }, [autoSubscribe, trackingNumber, routeId, origin, destination, handleLogisticsUpdate]);

  // Clear old updates (keep only last 24 hours)
  useEffect(() => {
    const interval = setInterval(() => {
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      setUpdates((prev) =>
        prev.filter((u) => u.timestamp > oneDayAgo)
      );
      
      // Clean up old tracked shipments
      setTrackedShipments((prev) => {
        const newMap = new Map();
        prev.forEach((update, key) => {
          if (update.timestamp > oneDayAgo) {
            newMap.set(key, update);
          }
        });
        return newMap;
      });
    }, 300000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const clearUpdates = useCallback(() => {
    setUpdates([]);
    setTrackedShipments(new Map());
  }, []);

  const trackShipment = useCallback((trackingNumber: string) => {
    websocketService.subscribe('logistics', { trackingNumber });
  }, []);

  const untrackShipment = useCallback((trackingNumber: string) => {
    websocketService.unsubscribe('logistics');
    setTrackedShipments((prev) => {
      const newMap = new Map(prev);
      newMap.delete(trackingNumber);
      return newMap;
    });
  }, []);

  return {
    updates,
    trackedShipments: Array.from(trackedShipments.values()),
    isConnected,
    lastUpdate,
    clearUpdates,
    trackShipment,
    untrackShipment,
    subscribe: (params?: { trackingNumber?: string; routeId?: string; origin?: string; destination?: string }) => {
      websocketService.subscribe('logistics', params);
    },
    unsubscribe: () => {
      websocketService.unsubscribe('logistics');
    },
  };
}




