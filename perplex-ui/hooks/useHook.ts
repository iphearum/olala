import { useEffect, useState } from 'react';

export const useStorage = (key: string, initialValue: any) => {
  const [data, setData] = useState(() => {
    // Check if localStorage is available
    const isLocalStorageAvailable = typeof window !== 'undefined' && window?.localStorage;

    // Initialize state with value from localStorage, or the initial value if not present or localStorage is not available
    const storedValue = isLocalStorageAvailable ? window?.localStorage.getItem(key) : null;
    return storedValue !=null ? JSON.parse(storedValue) : initialValue;
  });

  useEffect(() => {
    // Check if localStorage is available
    const isLocalStorageAvailable = typeof window !== 'undefined' && window?.localStorage;

    // Update localStorage whenever the data changes, but only if localStorage is available
    if (isLocalStorageAvailable && data !== undefined) {
      window?.localStorage.setItem(key, JSON.stringify(data));
    }
  }, [key, data]);

  return [data, setData];
};