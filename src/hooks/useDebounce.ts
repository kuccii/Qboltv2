import { useState, useEffect } from 'react';

/**
 * Custom hook that debounces a value
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set debouncedValue to value (passed in) after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the timeout if value changes (also on delay change or unmount)
    // This is how we prevent debounced value from updating if value is changed ...
    // .. within the delay period. Timeout gets cleared and restarted.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Only re-call effect if value or delay changes

  return debouncedValue;
}

/**
 * Custom hook that debounces a callback function
 * @param callback - The callback function to debounce
 * @param delay - The delay in milliseconds
 * @param deps - Dependencies array for the callback
 * @returns The debounced callback function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const [debouncedCallback, setDebouncedCallback] = useState<T>(() => callback);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCallback(() => callback);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [callback, delay, ...deps]);

  return debouncedCallback;
}

/**
 * Custom hook that debounces a value with immediate execution option
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @param immediate - Whether to execute immediately on first call
 * @returns The debounced value
 */
export function useDebounceImmediate<T>(
  value: T,
  delay: number,
  immediate: boolean = false
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isFirstRun, setIsFirstRun] = useState(true);

  useEffect(() => {
    if (immediate && isFirstRun) {
      setDebouncedValue(value);
      setIsFirstRun(false);
      return;
    }

    const handler = setTimeout(() => {
      setDebouncedValue(value);
      setIsFirstRun(false);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay, immediate, isFirstRun]);

  return debouncedValue;
}

export default useDebounce;
