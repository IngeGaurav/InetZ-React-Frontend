import { useState, useCallback } from 'react';
import { storage } from '@/utils/storageUtils';

/**
 * useState-compatible hook backed by localStorage.
 * Keeps React state and localStorage in sync automatically.
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => storage.get(key, initialValue));

  const setValue = useCallback(
    (value) => {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      storage.set(key, valueToStore);
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    setStoredValue(initialValue);
    storage.remove(key);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};
