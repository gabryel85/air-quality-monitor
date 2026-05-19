import { useEffect, useState } from 'react';

/**
 * Returns `value` delayed by `delay` ms. Resets the timer on every change,
 * so the debounced value only updates when the source has been stable.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebounced(value);
    }, delay);
    return () => {
      window.clearTimeout(id);
    };
  }, [value, delay]);

  return debounced;
}
