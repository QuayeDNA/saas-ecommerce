// src/components/route-wrapper.tsx
import { Suspense } from 'react';
import { PageLoader } from './page-loader';

interface RouteWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper component for all routes that provides consistent loading behavior
 * Combines Suspense for lazy loading with navigation loading
 */
export const RouteWrapper: React.FC<RouteWrapperProps> = ({ children }) => {
  return (
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
  );
};
