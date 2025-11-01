import { useState, useEffect } from 'react';

/**
 * Custom hook for managing localStorage with TypeScript support
 * @param key - The localStorage key
 * @param initialValue - The initial value if no stored value exists
 * @returns A tuple of [storedValue, setValue]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

/**
 * Custom hook for managing localStorage with expiration
 * @param key - The localStorage key
 * @param initialValue - The initial value if no stored value exists
 * @param expirationTime - Time in milliseconds after which the value expires
 * @returns A tuple of [storedValue, setValue, isExpired]
 */
export function useLocalStorageWithExpiration<T>(
  key: string,
  initialValue: T,
  expirationTime: number
): [T, (value: T | ((val: T) => T)) => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsedItem = JSON.parse(item);
        const now = new Date().getTime();
        
        // Check if the item has expired
        if (parsedItem.timestamp && now - parsedItem.timestamp > expirationTime) {
          window.localStorage.removeItem(key);
          return initialValue;
        }
        
        return parsedItem.value;
      }
      return initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const [isExpired, setIsExpired] = useState(false);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      const itemToStore = {
        value: valueToStore,
        timestamp: new Date().getTime()
      };
      
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(itemToStore));
      setIsExpired(false);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Check for expiration on mount and periodically
  useEffect(() => {
    const checkExpiration = () => {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          const parsedItem = JSON.parse(item);
          const now = new Date().getTime();
          
          if (parsedItem.timestamp && now - parsedItem.timestamp > expirationTime) {
            setIsExpired(true);
            window.localStorage.removeItem(key);
            setStoredValue(initialValue);
          }
        }
      } catch (error) {
        console.error(`Error checking expiration for localStorage key "${key}":`, error);
      }
    };

    checkExpiration();
    const interval = setInterval(checkExpiration, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [key, initialValue, expirationTime]);

  return [storedValue, setValue, isExpired];
}

export default useLocalStorage;
