import { useCallback, useMemo, useState, useEffect } from 'react';

export interface SavedView {
  id: string;
  name: string;
  filters: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  viewMode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ViewPreferences {
  defaultFilters: Record<string, any>;
  defaultSort: { field: string; order: 'asc' | 'desc' };
  defaultViewMode: string;
  autoSave: boolean;
}

/**
 * Hook for managing saved views and preferences
 */
export function useSavedViews(
  pageKey: string,
  defaultPreferences: ViewPreferences
) {
  const storageKey = `qivook.views.${pageKey}`;
  const prefsKey = `qivook.prefs.${pageKey}`;

  // Load saved views from localStorage
  const savedViews = useMemo(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return [];
      
      const views = JSON.parse(stored);
      return views.map((view: any) => ({
        ...view,
        createdAt: new Date(view.createdAt),
        updatedAt: new Date(view.updatedAt)
      }));
    } catch {
      return [];
    }
  }, [storageKey]);

  // Load preferences from localStorage
  const preferences = useMemo(() => {
    try {
      const stored = localStorage.getItem(prefsKey);
      if (!stored) return defaultPreferences;
      
      return { ...defaultPreferences, ...JSON.parse(stored) };
    } catch {
      return defaultPreferences;
    }
  }, [prefsKey, defaultPreferences]);

  const saveView = useCallback((view: Omit<SavedView, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newView: SavedView = {
        ...view,
        id: `view_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedViews = [...savedViews, newView];
      localStorage.setItem(storageKey, JSON.stringify(updatedViews));
      
      return newView;
    } catch (error) {
      console.error('Failed to save view:', error);
      throw error;
    }
  }, [savedViews, storageKey]);

  const updateView = useCallback((id: string, updates: Partial<SavedView>) => {
    try {
      const updatedViews = savedViews.map(view => 
        view.id === id 
          ? { ...view, ...updates, updatedAt: new Date() }
          : view
      );
      
      localStorage.setItem(storageKey, JSON.stringify(updatedViews));
      return updatedViews.find(view => view.id === id);
    } catch (error) {
      console.error('Failed to update view:', error);
      throw error;
    }
  }, [savedViews, storageKey]);

  const deleteView = useCallback((id: string) => {
    try {
      const updatedViews = savedViews.filter(view => view.id !== id);
      localStorage.setItem(storageKey, JSON.stringify(updatedViews));
    } catch (error) {
      console.error('Failed to delete view:', error);
      throw error;
    }
  }, [savedViews, storageKey]);

  const loadView = useCallback((id: string) => {
    return savedViews.find(view => view.id === id);
  }, [savedViews]);

  const savePreferences = useCallback((prefs: Partial<ViewPreferences>) => {
    try {
      const updatedPrefs = { ...preferences, ...prefs };
      localStorage.setItem(prefsKey, JSON.stringify(updatedPrefs));
    } catch (error) {
      console.error('Failed to save preferences:', error);
      throw error;
    }
  }, [preferences, prefsKey]);

  const exportViews = useCallback(() => {
    try {
      const data = {
        views: savedViews,
        preferences,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `qivook-views-${pageKey}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export views:', error);
      throw error;
    }
  }, [savedViews, preferences, pageKey]);

  const importViews = useCallback((file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          
          if (data.version !== '1.0') {
            throw new Error('Unsupported file format');
          }
          
          // Merge imported views with existing ones
          const importedViews = data.views.map((view: any) => ({
            ...view,
            id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(view.createdAt),
            updatedAt: new Date(view.updatedAt)
          }));
          
          const updatedViews = [...savedViews, ...importedViews];
          localStorage.setItem(storageKey, JSON.stringify(updatedViews));
          
          // Update preferences if provided
          if (data.preferences) {
            localStorage.setItem(prefsKey, JSON.stringify(data.preferences));
          }
          
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }, [savedViews, storageKey, prefsKey]);

  return {
    savedViews,
    preferences,
    saveView,
    updateView,
    deleteView,
    loadView,
    savePreferences,
    exportViews,
    importViews
  };
}

/**
 * Hook for managing filter state with persistence
 */
export function useFilterState<T extends Record<string, any>>(
  pageKey: string,
  defaultFilters: T,
  options: {
    persist?: boolean;
    debounceMs?: number;
  } = {}
) {
  const { persist = true, debounceMs = 300 } = options;
  const storageKey = `qivook.filters.${pageKey}`;
  
  const [filters, setFilters] = useState<T>(() => {
    if (!persist) return defaultFilters;
    
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return defaultFilters;
      
      return { ...defaultFilters, ...JSON.parse(stored) };
    } catch {
      return defaultFilters;
    }
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  // Debounce filters
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [filters, debounceMs]);

  // Persist filters
  useEffect(() => {
    if (persist) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(filters));
      } catch (error) {
        console.warn('Failed to persist filters:', error);
      }
    }
  }, [filters, persist, storageKey]);

  const updateFilter = useCallback((key: keyof T, value: T[keyof T]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateFilters = useCallback((updates: Partial<T>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, [defaultFilters]);

  const clearFilters = useCallback(() => {
    const cleared = Object.keys(defaultFilters).reduce((acc, key) => {
      acc[key as keyof T] = defaultFilters[key as keyof T];
      return acc;
    }, {} as T);
    setFilters(cleared);
  }, [defaultFilters]);

  return {
    filters,
    debouncedFilters,
    updateFilter,
    updateFilters,
    resetFilters,
    clearFilters
  };
}

/**
 * Utility for creating filter chips
 */
export function createFilterChips<T extends Record<string, any>>(
  filters: T,
  labels: Record<keyof T, string>,
  onRemove: (key: keyof T) => void
) {
  return Object.entries(filters)
    .filter(([_, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim() !== '';
      return value !== null && value !== undefined;
    })
    .map(([key, value]) => ({
      key: key as keyof T,
      label: labels[key as keyof T],
      value: Array.isArray(value) ? value.join(', ') : String(value),
      onRemove: () => onRemove(key as keyof T)
    }));
}
