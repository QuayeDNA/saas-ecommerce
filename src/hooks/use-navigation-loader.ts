// src/hooks/use-navigation-loader.ts
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to manage navigation loading state
 * Shows loading indicator during route transitions
 */
export const useNavigationLoader = (delay: number = 250) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Skip loading on initial page load
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }

    // Set loading state when location changes
    setIsNavigating(true);

    // Clear loading state after a delay to ensure smooth transition
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [location.pathname, delay, isInitialLoad]);

  return isNavigating;
};
