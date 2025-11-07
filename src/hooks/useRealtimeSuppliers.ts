/**
 * Real-time supplier updates hook
 * Subscribes to supplier updates via WebSocket
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { websocketService, WebSocketMessage } from '../services/websocket';

export interface SupplierUpdate {
  id: string;
  name: string;
  country: string;
  industry: string;
  materials: string[];
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  rating?: number;
  verified: boolean;
  updateType: 'new' | 'updated' | 'status_changed' | 'rating_changed';
  timestamp: number;
  changes?: Record<string, any>;
}

export interface UseRealtimeSuppliersOptions {
  country?: string;
  industry?: string;
  material?: string;
  autoSubscribe?: boolean;
  onSupplierUpdate?: (update: SupplierUpdate) => void;
}

export function useRealtimeSuppliers(options: UseRealtimeSuppliersOptions = {}) {
  const {
    country,
    industry,
    material,
    autoSubscribe = true,
    onSupplierUpdate,
  } = options;

  const [updates, setUpdates] = useState<SupplierUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const updateRef = useRef<(update: SupplierUpdate) => void>();

  updateRef.current = onSupplierUpdate;

  // Handle supplier updates
  const handleSupplierUpdate = useCallback((message: WebSocketMessage) => {
    const update = message.data as SupplierUpdate;

    // Apply filters if specified
    if (country && update.country !== country) return;
    if (industry && update.industry !== industry) return;
    if (material && !update.materials.includes(material)) return;

    setUpdates((prev) => {
      // Remove old entry for same supplier
      const filtered = prev.filter((u) => u.id !== update.id);
      // Add new update at the beginning
      return [update, ...filtered].slice(0, 100); // Keep last 100 updates
    });

    setLastUpdate(new Date());
    updateRef.current?.(update);
  }, [country, industry, material]);

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

  // Subscribe to supplier updates
  useEffect(() => {
    if (!autoSubscribe || !websocketService.isConnected()) return;

    const unsubscribe = websocketService.on('supplier:update', handleSupplierUpdate);

    // Subscribe to specific channel if filters provided
    if (country || industry || material) {
      websocketService.subscribe('suppliers', {
        country,
        industry,
        material,
      });
    } else {
      websocketService.subscribe('suppliers');
    }

    return () => {
      unsubscribe();
      websocketService.unsubscribe('suppliers');
    };
  }, [autoSubscribe, country, industry, material, handleSupplierUpdate]);

  // Clear old updates (keep only last hour)
  useEffect(() => {
    const interval = setInterval(() => {
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      setUpdates((prev) =>
        prev.filter((u) => u.timestamp > oneHourAgo)
      );
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const clearUpdates = useCallback(() => {
    setUpdates([]);
  }, []);

  return {
    updates,
    isConnected,
    lastUpdate,
    clearUpdates,
    subscribe: (params?: { country?: string; industry?: string; material?: string }) => {
      websocketService.subscribe('suppliers', params);
    },
    unsubscribe: () => {
      websocketService.unsubscribe('suppliers');
    },
  };
}




