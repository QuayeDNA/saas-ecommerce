import { Spinner } from '../design-system/components/spinner';

interface PageLoaderProps {
  text?: string;
  fullScreen?: boolean;
}

export const PageLoader: React.FC<PageLoaderProps> = ({ 
  text = "Loading...", 
  fullScreen = true 
}) => (
  <div className={`${
    fullScreen 
      ? 'min-h-screen' 
      : 'min-h-[400px]'
    } flex items-center justify-center bg-white`}>
    <div className="flex flex-col items-center space-y-4">
      <Spinner size="lg" color="primary" />
      <span className="text-gray-600 text-base font-medium">{text}</span>
    </div>
  </div>
);
