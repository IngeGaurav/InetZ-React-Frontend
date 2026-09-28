import { useState, useEffect } from 'react';

/**
 * Debounce a rapidly-changing value.
 * Typical use: search inputs that trigger API calls.
 *
 * @param {*} value - The value to debounce
 * @param {number} delay - Milliseconds to wait (default 300ms)
 * @returns The debounced value (only updates after `delay` ms of silence)
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};
