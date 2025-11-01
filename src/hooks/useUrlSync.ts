import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Hook for synchronizing state with URL query parameters
 * @param initialState - Initial state object
 * @param options - Configuration options
 */
export function useUrlSync<T extends Record<string, any>>(
  initialState: T,
  options: {
    /** Whether to update URL when state changes */
    updateUrl?: boolean;
    /** Whether to update state when URL changes */
    updateState?: boolean;
    /** Custom serialization function */
    serialize?: (state: T) => Record<string, string>;
    /** Custom deserialization function */
    deserialize?: (params: URLSearchParams) => T;
  } = {}
) {
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState<T>(() => {
    if (options.updateState !== false) {
      return deserializeFromUrl(initialState, new URLSearchParams(location.search), options.deserialize);
    }
    return initialState;
  });

  const serializeToUrl = useCallback((state: T): Record<string, string> => {
    if (options.serialize) {
      return options.serialize(state);
    }
    
    const result: Record<string, string> = {};
    Object.entries(state).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          result[key] = value.join(',');
        } else if (typeof value === 'object') {
          result[key] = JSON.stringify(value);
        } else {
          result[key] = String(value);
        }
      }
    });
    return result;
  }, [options.serialize]);

  const deserializeFromUrl = useCallback((initialState: T, params: URLSearchParams, customDeserialize?: (params: URLSearchParams) => T): T => {
    if (customDeserialize) {
      return customDeserialize(params);
    }

    const result = { ...initialState };
    params.forEach((value, key) => {
      if (key in initialState) {
        const initialValue = initialState[key];
        
        if (Array.isArray(initialValue)) {
          result[key as keyof T] = value.split(',').filter(Boolean) as T[keyof T];
        } else if (typeof initialValue === 'object' && initialValue !== null) {
          try {
            result[key as keyof T] = JSON.parse(value) as T[keyof T];
          } catch {
            // Keep initial value if parsing fails
          }
        } else if (typeof initialValue === 'number') {
          const numValue = Number(value);
          if (!isNaN(numValue)) {
            result[key as keyof T] = numValue as T[keyof T];
          }
        } else if (typeof initialValue === 'boolean') {
          result[key as keyof T] = (value === 'true') as T[keyof T];
        } else {
          result[key as keyof T] = value as T[keyof T];
        }
      }
    });
    return result;
  }, []);

  // Update URL when state changes
  useEffect(() => {
    if (options.updateUrl !== false) {
      const serialized = serializeToUrl(state);
      const newParams = new URLSearchParams();
      
      Object.entries(serialized).forEach(([key, value]) => {
        newParams.set(key, value);
      });

      const newSearch = newParams.toString();
      if (newSearch !== location.search.slice(1)) {
        navigate({ search: newSearch }, { replace: true });
      }
    }
  }, [state, serializeToUrl, navigate, location.search, options.updateUrl]);

  // Update state when URL changes
  useEffect(() => {
    if (options.updateState !== false) {
      const newState = deserializeFromUrl(initialState, new URLSearchParams(location.search), options.deserialize);
      setState(newState);
    }
  }, [location.search, initialState, deserializeFromUrl, options.updateState, options.deserialize]);

  const updateState = useCallback((updates: Partial<T>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetState = useCallback(() => {
    setState(initialState);
  }, [initialState]);

  return {
    state,
    setState,
    updateState,
    resetState
  };
}

/**
 * Hook for managing saved views/preferences
 * @param key - localStorage key
 * @param defaultValue - Default value
 * @param ttl - Time to live in milliseconds (optional)
 */
export function useSavedView<T>(
  key: string,
  defaultValue: T,
  ttl?: number
): [T, (value: T) => void, boolean] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return defaultValue;

      if (ttl) {
        const parsed = JSON.parse(stored);
        if (parsed.expiry && Date.now() > parsed.expiry) {
          localStorage.removeItem(key);
          return defaultValue;
        }
        return parsed.value;
      }

      return JSON.parse(stored);
    } catch {
      return defaultValue;
    }
  });

  const setSavedValue = useCallback((newValue: T) => {
    setValue(newValue);
    
    try {
      if (ttl) {
        const item = {
          value: newValue,
          expiry: Date.now() + ttl
        };
        localStorage.setItem(key, JSON.stringify(item));
      } else {
        localStorage.setItem(key, JSON.stringify(newValue));
      }
    } catch (error) {
      console.warn(`Failed to save to localStorage: ${error}`);
    }
  }, [key, ttl]);

  const isExpired = useCallback(() => {
    if (!ttl) return false;
    
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return true;
      
      const parsed = JSON.parse(stored);
      return parsed.expiry && Date.now() > parsed.expiry;
    } catch {
      return true;
    }
  }, [key, ttl]);

  return [value, setSavedValue, isExpired()];
}

/**
 * Utility for creating URL-friendly parameter names
 */
export function createUrlParamName(baseName: string, prefix?: string): string {
  return prefix ? `${prefix}.${baseName}` : baseName;
}

/**
 * Utility for parsing comma-separated values from URL
 */
export function parseCommaSeparated(value: string): string[] {
  return value.split(',').filter(Boolean);
}

/**
 * Utility for creating comma-separated values for URL
 */
export function createCommaSeparated(values: string[]): string {
  return values.filter(Boolean).join(',');
}
