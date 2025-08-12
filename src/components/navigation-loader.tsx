// src/components/navigation-loader.tsx
import { useNavigationLoader } from '../hooks/use-navigation-loader';
import { PageLoader } from './page-loader';

interface NavigationLoaderProps {
  children: React.ReactNode;
  delay?: number;
}

/**
 * Component that shows loading indicator during navigation
 */
export const NavigationLoader: React.FC<NavigationLoaderProps> = ({ 
  children, 
  delay = 250 
}) => {
  const isNavigating = useNavigationLoader(delay);

  if (isNavigating) {
    return <PageLoader text="Loading page..." fullScreen={false} />;
  }

  return <>{children}</>;
};
