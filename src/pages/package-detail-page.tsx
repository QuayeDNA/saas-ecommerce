import { useParams } from 'react-router-dom';
import { ProviderPackageDisplay } from '../components/products/ProviderPackageDisplay';

export const PackageDetailPage = () => {
  const { packageId } = useParams<{ packageId: string }>();

  if (!packageId || packageId === "undefined") {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No package specified.</p>
      </div>
    );
  }

  return <ProviderPackageDisplay packageId={packageId} />;
};
