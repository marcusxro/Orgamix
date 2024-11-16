import { useState, useEffect } from 'react';
import useStore from '../../../Zustand/UseStore';

function useLocalStorage(key: string, initialValue: any) {
  const { setIsHidden } = useStore();  // Using Zustand to update the store

  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get the stored value from localStorage, or return the initial value if not set
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading localStorage', error);
      return initialValue;
    }
  });

  const setValue = (value: any) => {
    try {
      // Set the state value
      setStoredValue(value);
      
      // Update Zustand store if needed
      if (key === 'sidebarVisible') {  // Example: Only update Zustand if the key matches
        setIsHidden(value);
      }

      // Store the new value in localStorage
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item));
      }
    };

    // Listen for changes in localStorage across tabs
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue];
}

export default useLocalStorage;
