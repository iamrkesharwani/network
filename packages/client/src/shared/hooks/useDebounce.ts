import { useState, useEffect } from 'react';

export function useDebouce<T>(value: T, delay: number): T {
  const [debouceValue, setDebouceValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouceValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouceValue;
}
