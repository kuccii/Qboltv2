import { useEffect, useRef, useState, useCallback } from 'react';

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  componentCount: number;
  lastRender: Date;
}

export interface PerformanceOptions {
  /** Whether to track memory usage */
  trackMemory?: boolean;
  /** Whether to track component count */
  trackComponents?: boolean;
  /** Sampling rate (0-1) */
  samplingRate?: number;
  /** Maximum number of samples to keep */
  maxSamples?: number;
}

/**
 * Hook for monitoring component performance
 */
export function usePerformanceMonitor(
  componentName: string,
  options: PerformanceOptions = {}
) {
  const {
    trackMemory = false,
    trackComponents = false,
    samplingRate = 0.1,
    maxSamples = 100
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const renderStartRef = useRef<number>(0);
  const componentCountRef = useRef<number>(0);

  const recordRender = useCallback(() => {
    // Only sample based on sampling rate
    if (Math.random() > samplingRate) return;

    const renderTime = performance.now() - renderStartRef.current;
    const memoryUsage = trackMemory && 'memory' in performance 
      ? (performance as any).memory?.usedJSHeapSize 
      : undefined;

    const newMetric: PerformanceMetrics = {
      renderTime,
      memoryUsage,
      componentCount: componentCountRef.current,
      lastRender: new Date()
    };

    setMetrics(prev => {
      const updated = [...prev, newMetric];
      return updated.slice(-maxSamples);
    });
  }, [samplingRate, trackMemory, maxSamples]);

  // Track render start
  useEffect(() => {
    renderStartRef.current = performance.now();
    recordRender();
  });

  // Track component count
  useEffect(() => {
    if (trackComponents) {
      componentCountRef.current += 1;
    }
  }, [trackComponents]);

  const getAverageRenderTime = useCallback(() => {
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, metric) => sum + metric.renderTime, 0) / metrics.length;
  }, [metrics]);

  const getSlowRenders = useCallback((threshold: number = 16) => {
    return metrics.filter(metric => metric.renderTime > threshold);
  }, [metrics]);

  const clearMetrics = useCallback(() => {
    setMetrics([]);
  }, []);

  return {
    metrics,
    getAverageRenderTime,
    getSlowRenders,
    clearMetrics
  };
}

/**
 * Hook for monitoring API performance
 */
export function useApiPerformanceMonitor() {
  const [apiMetrics, setApiMetrics] = useState<Map<string, {
    count: number;
    totalTime: number;
    averageTime: number;
    errors: number;
    lastCall: Date;
  }>>(new Map());

  const recordApiCall = useCallback((
    endpoint: string,
    duration: number,
    success: boolean
  ) => {
    setApiMetrics(prev => {
      const current = prev.get(endpoint) || {
        count: 0,
        totalTime: 0,
        averageTime: 0,
        errors: 0,
        lastCall: new Date()
      };

      const updated = {
        count: current.count + 1,
        totalTime: current.totalTime + duration,
        averageTime: (current.totalTime + duration) / (current.count + 1),
        errors: success ? current.errors : current.errors + 1,
        lastCall: new Date()
      };

      const newMap = new Map(prev);
      newMap.set(endpoint, updated);
      return newMap;
    });
  }, []);

  const getSlowEndpoints = useCallback((threshold: number = 1000) => {
    return Array.from(apiMetrics.entries())
      .filter(([_, metrics]) => metrics.averageTime > threshold)
      .map(([endpoint, metrics]) => ({ endpoint, ...metrics }));
  }, [apiMetrics]);

  const getErrorRate = useCallback((endpoint?: string) => {
    if (endpoint) {
      const metrics = apiMetrics.get(endpoint);
      if (!metrics) return 0;
      return metrics.errors / metrics.count;
    }

    const totalErrors = Array.from(apiMetrics.values())
      .reduce((sum, metrics) => sum + metrics.errors, 0);
    const totalCalls = Array.from(apiMetrics.values())
      .reduce((sum, metrics) => sum + metrics.count, 0);

    return totalCalls > 0 ? totalErrors / totalCalls : 0;
  }, [apiMetrics]);

  const clearMetrics = useCallback(() => {
    setApiMetrics(new Map());
  }, []);

  return {
    apiMetrics,
    recordApiCall,
    getSlowEndpoints,
    getErrorRate,
    clearMetrics
  };
}

/**
 * Hook for monitoring bundle size and loading performance
 */
export function useBundlePerformanceMonitor() {
  const [bundleMetrics, setBundleMetrics] = useState<{
    bundleSize: number;
    loadTime: number;
    parseTime: number;
    resources: Array<{
      name: string;
      size: number;
      loadTime: number;
    }>;
  } | null>(null);

  useEffect(() => {
    const measureBundlePerformance = () => {
      if ('performance' in window && 'getEntriesByType' in performance) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

        const bundleSize = resources
          .filter(resource => resource.name.includes('.js') || resource.name.includes('.css'))
          .reduce((total, resource) => total + (resource.transferSize || 0), 0);

        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        const parseTime = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;

        const resourceMetrics = resources
          .filter(resource => resource.transferSize && resource.transferSize > 0)
          .map(resource => ({
            name: resource.name.split('/').pop() || resource.name,
            size: resource.transferSize || 0,
            loadTime: resource.responseEnd - resource.requestStart
          }))
          .sort((a, b) => b.size - a.size)
          .slice(0, 10); // Top 10 largest resources

        setBundleMetrics({
          bundleSize,
          loadTime,
          parseTime,
          resources: resourceMetrics
        });
      }
    };

    // Measure after page load
    if (document.readyState === 'complete') {
      measureBundlePerformance();
    } else {
      window.addEventListener('load', measureBundlePerformance);
      return () => window.removeEventListener('load', measureBundlePerformance);
    }
  }, []);

  return bundleMetrics;
}

/**
 * Utility for creating performance reports
 */
export function createPerformanceReport(
  componentMetrics: PerformanceMetrics[],
  apiMetrics: Map<string, any>,
  bundleMetrics: any
) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalRenders: componentMetrics.length,
      averageRenderTime: componentMetrics.length > 0 
        ? componentMetrics.reduce((sum, m) => sum + m.renderTime, 0) / componentMetrics.length 
        : 0,
      slowRenders: componentMetrics.filter(m => m.renderTime > 16).length,
      apiCalls: Array.from(apiMetrics.values()).reduce((sum, m) => sum + m.count, 0),
      bundleSize: bundleMetrics?.bundleSize || 0
    },
    details: {
      componentMetrics,
      apiMetrics: Object.fromEntries(apiMetrics),
      bundleMetrics
    }
  };

  return report;
}
