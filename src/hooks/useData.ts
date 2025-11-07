/**
 * Unified Data Hooks
 * Hooks for all data operations using Supabase
 */

import { useEffect, useState, useCallback } from 'react';
import { unifiedApi } from '../services/unifiedApi';
import { supabaseRealtime } from '../services/supabaseRealtime';
import { useAuth } from '../contexts/AuthContext';

// ============================================
// PRICES
// ============================================

export function usePrices(filters?: {
  material?: string;
  country?: string;
  location?: string;
  limit?: number;
}) {
  const { isAuthenticated } = useAuth();
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const fetchPrices = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Add timeout to prevent indefinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const dataPromise = unifiedApi.prices.get(filters);
      const data = await Promise.race([dataPromise, timeoutPromise]) as any[];
      setPrices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
      setPrices([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, filters?.material, filters?.country, filters?.location, filters?.limit]);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  // Real-time updates - TEMPORARILY DISABLED
  useEffect(() => {
    // Realtime subscriptions disabled to prevent WebSocket errors
    // TODO: Re-enable once WebSocket error handling is improved
    setIsConnected(false);
    
    // if (!isAuthenticated) {
    //   setIsConnected(false);
    //   return;
    // }

    // const unsubscribe = supabaseRealtime.subscribeToPrices(
    //   { material: filters?.material, country: filters?.country },
    //   (update) => {
    //     setPrices((prev) => {
    //       const filtered = prev.filter((p) => p.id !== update.id);
    //       return [update, ...filtered].slice(0, filters?.limit || 100);
    //     });
    //     setIsConnected(true);
    //   }
    // );

    // setIsConnected(true);

    // return () => {
    //   unsubscribe();
    // };
  }, [isAuthenticated, filters?.material, filters?.country]);

  return {
    prices,
    loading,
    error,
    isConnected,
    refetch: fetchPrices,
    createPrice: unifiedApi.prices.create,
  };
}

// ============================================
// SUPPLIERS
// ============================================

export function useSuppliers(filters?: {
  country?: string;
  industry?: string;
  material?: string;
  verified?: boolean;
  search?: string;
  limit?: number;
}) {
  const { isAuthenticated } = useAuth();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const fetchSuppliers = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Add timeout to prevent indefinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const dataPromise = unifiedApi.suppliers.get(filters);
      const data = await Promise.race([dataPromise, timeoutPromise]) as any[];
      setSuppliers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch suppliers');
      setSuppliers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, filters]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // Real-time updates - TEMPORARILY DISABLED
  useEffect(() => {
    // Realtime subscriptions disabled to prevent WebSocket errors
    // TODO: Re-enable once WebSocket error handling is improved
    setIsConnected(false);
    
    // if (!isAuthenticated) {
    //   setIsConnected(false);
    //   return;
    // }

    // const unsubscribe = supabaseRealtime.subscribeToSuppliers(
    //   { country: filters?.country, industry: filters?.industry },
    //   (update) => {
    //     setSuppliers((prev) => {
    //       const filtered = prev.filter((s) => s.id !== update.id);
    //       return [update, ...filtered].slice(0, filters?.limit || 100);
    //     });
    //     setIsConnected(true);
    //   }
    // );

    // setIsConnected(true);

    // return () => {
    //   unsubscribe();
    // };
  }, [isAuthenticated, filters?.country, filters?.industry]);

  return {
    suppliers,
    loading,
    error,
    isConnected,
    refetch: fetchSuppliers,
    getSupplier: unifiedApi.suppliers.getById,
    createSupplier: unifiedApi.suppliers.createSupplier,
    createReview: unifiedApi.suppliers.createReview,
  };
}

// ============================================
// SHIPMENTS
// ============================================

export function useShipments(filters?: {
  tracking_number?: string;
  status?: string;
  limit?: number;
}) {
  const { isAuthenticated } = useAuth();
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const fetchShipments = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Add timeout to prevent indefinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const dataPromise = unifiedApi.logistics.getShipments(filters);
      const data = await Promise.race([dataPromise, timeoutPromise]) as any[];
      setShipments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch shipments');
      setShipments([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, filters?.tracking_number, filters?.status, filters?.limit]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  // Real-time tracking - TEMPORARILY DISABLED
  useEffect(() => {
    // Realtime subscriptions disabled to prevent WebSocket errors
    // TODO: Re-enable once WebSocket error handling is improved
    setIsConnected(false);
    
    // if (!isAuthenticated || !filters?.tracking_number) {
    //   setIsConnected(false);
    //   return;
    // }

    // const unsubscribe = supabaseRealtime.subscribeToShipments(
    //   filters.tracking_number,
    //   (update) => {
    //     setShipments((prev) =>
    //       prev.map((s) => (s.tracking_number === update.tracking_number ? update : s))
    //     );
    //     setIsConnected(true);
    //   }
    // );

    // setIsConnected(true);

    // return () => {
    //   unsubscribe();
    // };
  }, [isAuthenticated, filters?.tracking_number]);

  return {
    shipments,
    loading,
    error,
    isConnected,
    refetch: fetchShipments,
    trackShipment: unifiedApi.logistics.trackShipment,
    createShipment: unifiedApi.logistics.createShipment,
    updateStatus: unifiedApi.logistics.updateShipmentStatus,
  };
}

// ============================================
// DASHBOARD
// ============================================

export function useDashboard() {
  const { authState } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMetrics() {
      if (!authState.user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await unifiedApi.dashboard.getMetrics(authState.user.id);
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }

    loadMetrics();
  }, [authState.user?.id]);

  return {
    metrics,
    loading,
    error,
    refetch: () => {
      if (authState.user) {
        unifiedApi.dashboard.getMetrics(authState.user.id).then(setMetrics);
      }
    },
  };
}

// ============================================
// NOTIFICATIONS
// ============================================

export function useNotifications() {
  const { authState } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!authState.user) return;

    try {
      setLoading(true);
      setError(null);
      
      // Add timeout to prevent indefinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const dataPromise = Promise.all([
        unifiedApi.notifications.get({ limit: 50 }),
        unifiedApi.notifications.getUnreadCount(),
      ]);
      const [data, count] = await Promise.race([dataPromise, timeoutPromise]) as [any[], number];
      setNotifications(data);
      setUnreadCount(count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
      setNotifications([]); // Set empty array on error
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [authState.user?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time notifications - TEMPORARILY DISABLED
  useEffect(() => {
    // Realtime subscriptions disabled to prevent WebSocket errors
    // TODO: Re-enable once WebSocket error handling is improved
    // if (!authState.user) return;

    // const unsubscribe = supabaseRealtime.subscribeToNotifications(
    //   (notification) => {
    //     setNotifications((prev) => [notification, ...prev].slice(0, 50));
    //     setUnreadCount((prev) => prev + 1);
    //   }
    // );

    // return () => {
    //   unsubscribe();
    // };
  }, [authState.user?.id]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead: unifiedApi.notifications.markAsRead,
    markAllAsRead: unifiedApi.notifications.markAllAsRead,
  };
}

// ============================================
// RISK ALERTS
// ============================================

export function useRiskAlerts(filters?: {
  severity?: string;
  alert_type?: string;
  resolved?: boolean;
}) {
  const { authState } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add timeout to prevent indefinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const dataPromise = unifiedApi.risk.getAlerts(filters);
      const data = await Promise.race([dataPromise, timeoutPromise]) as any;
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching risk alerts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
      setAlerts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [filters?.severity, filters?.alert_type, filters?.resolved]);

  useEffect(() => {
    let cancelled = false;
    
    const loadData = async () => {
      await fetchAlerts();
      if (cancelled) return;
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [fetchAlerts]);

  // Real-time alerts - TEMPORARILY DISABLED
  useEffect(() => {
    // Realtime subscriptions disabled to prevent WebSocket errors
    // TODO: Re-enable once WebSocket error handling is improved
    // if (!authState.user) return;

    // const unsubscribe = supabaseRealtime.subscribeToRiskAlerts(
    //   (alert) => {
    //     setAlerts((prev) => [alert, ...prev].slice(0, 50));
    //   }
    // );

    // return () => {
    //   unsubscribe();
    // };
  }, [authState.user?.id]);

  return {
    alerts,
    loading,
    error,
    refetch: fetchAlerts,
    createAlert: unifiedApi.risk.createAlert,
    resolveAlert: unifiedApi.risk.resolveAlert,
  };
}

// ============================================
// TRADE OPPORTUNITIES
// ============================================

export function useTradeOpportunities(filters?: {
  opportunity_type?: 'buy' | 'sell' | 'rfq';
  material?: string;
  country?: string;
  status?: string;
}) {
  const { isAuthenticated } = useAuth();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const fetchOpportunities = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Add timeout to prevent indefinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const dataPromise = unifiedApi.opportunities.get(filters);
      const data = await Promise.race([dataPromise, timeoutPromise]) as any[];
      setOpportunities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch opportunities');
      setOpportunities([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, filters]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  // Real-time opportunities - TEMPORARILY DISABLED
  useEffect(() => {
    // Realtime subscriptions disabled to prevent WebSocket errors
    // TODO: Re-enable once WebSocket error handling is improved
    setIsConnected(false);
    
    // if (!isAuthenticated) {
    //   setIsConnected(false);
    //   return;
    // }

    // const unsubscribe = supabaseRealtime.subscribeToTradeOpportunities(
    //   filters,
    //   (update) => {
    //     setOpportunities((prev) => {
    //       const filtered = prev.filter((o) => o.id !== update.id);
    //       return [update, ...filtered].slice(0, 50);
    //     });
    //     setIsConnected(true);
    //   }
    // );

    // setIsConnected(true);

    // return () => {
    //   unsubscribe();
    // };
  }, [isAuthenticated, filters]);

  return {
    opportunities,
    loading,
    error,
    isConnected,
    refetch: fetchOpportunities,
    createOpportunity: unifiedApi.opportunities.create,
  };
}


