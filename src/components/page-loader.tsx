import { Spinner } from '../design-system/components/spinner';

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="flex flex-col items-center space-y-4">
      <Spinner size="lg" color="primary" />
      <span className="text-gray-600 text-base font-medium">Loading...</span>
    </div>
  </div>
);
