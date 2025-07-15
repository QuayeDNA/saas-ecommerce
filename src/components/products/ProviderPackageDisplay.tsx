import React, { useEffect, useState } from 'react';
import { usePackage } from '../../hooks/use-package';
import { useProvider } from '../../hooks/use-provider';
import { getProviderColors } from '../../utils/provider-colors';
import { SingleOrderModal } from '../orders/SingleOrderModal';
import { BulkOrderModal } from '../orders/BulkOrderModal';
import { 
  FaSearch,
  FaBox,
  FaExclamationCircle
} from 'react-icons/fa';
import type { Package, Bundle } from '../../types/package';
export interface ProviderPackageDisplayProps {
  provider: string; // provider code
}

export const ProviderPackageDisplay: React.FC<ProviderPackageDisplayProps> = ({ provider }) => {
  const { packages, bundles, loading, error, fetchPackages, fetchBundles } = usePackage();
  const { providers } = useProvider();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showBulkOrderModal, setShowBulkOrderModal] = useState(false);
  const [selectedBulkPackage, setSelectedBulkPackage] = useState<Package | null>(null);

  // Find the provider object by code
  const providerObj = providers.find(p => p.code === provider);

  useEffect(() => {
    setHasLoaded(false); // Reset when provider changes
  }, [provider]);

  useEffect(() => {
    if (!hasLoaded && providerObj) {
      const loadData = async () => {
        try {
          await Promise.all([
            fetchPackages({ provider: providerObj.code }),
            fetchBundles({ providerId: providerObj._id })
          ]);
        } catch {
          // error is handled in context
        } finally {
          setHasLoaded(true);
        }
      };
      loadData();
    }
  }, [provider, hasLoaded, providerObj, fetchPackages, fetchBundles]);

  // Group bundles by package
  const groupedBundles = (packages || []).reduce((acc, pkg) => {
    if (!pkg._id) {
      return acc;
    }
    const packageBundles = (bundles || []).filter(bundle => 
      (
        typeof bundle.packageId === 'string'
          ? bundle.packageId === pkg._id
          : (bundle.packageId && typeof bundle.packageId === 'object' && '_id' in bundle.packageId && (bundle.packageId as { _id: string })._id === pkg._id)
      ) &&
      bundle.isActive &&
      (selectedCategory === 'all' || bundle.category === selectedCategory) &&
      (searchTerm === '' || 
        bundle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bundle.description?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()))
    );
    
    if (packageBundles.length > 0) {
      acc[pkg._id] = {
        package: pkg,
        bundles: packageBundles
      };
    }
    
    return acc;
  }, {} as Record<string, { package: Package; bundles: Bundle[] }>);

  // Get unique categories from bundles
  const categories = ['all', ...Array.from(new Set((bundles || []).map(b => b.category)))];

  // Use providerObj for display and providerObj._id for logic
  if (!providerObj) {
    return null;
  }

  const providerColors = getProviderColors(providerObj.code);

  if (loading && !hasLoaded) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
          <span className="ml-3 text-gray-600">Loading {providerObj.name} packages...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <FaExclamationCircle className="text-red-600" />
          </div>
          <div>
            <h3 className="font-medium text-red-800">Error Loading Packages</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg border-2 shadow-sm"
            style={{
              backgroundColor: providerColors.primary,
              color: providerColors.text,
              borderColor: providerColors.secondary
            }}
          >
            {providerObj.code.slice(0, 2)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{providerObj.name} Data Packages</h2>
            <p className="text-gray-600">Browse and order data bundles</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-lg border border-gray-200 p-4 bg-white">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search bundles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            >
              {categories.map(category => (
                <option key={category ?? 'unknown'} value={category ?? ''}>
                  {category === 'all'
                    ? 'All Categories'
                    : typeof category === 'string'
                      ? category.charAt(0).toUpperCase() + category.slice(1)
                      : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Package and Bundle Cards */}
      <div className="space-y-6">
        {Object.values(groupedBundles).map(({ package: pkg, bundles }) => (
          <div key={pkg._id} className="rounded-lg shadow border border-gray-200 p-4"
            style={{ backgroundColor: providerColors.primary }}
          >
            <div className="flex items-center gap-2 mb-2">
              <FaBox className="text-xl " style={{ color: providerColors.secondary }} />
              <span className="font-semibold text-lg text-gray-900">{pkg.name}</span>
              <button
                className="ml-auto px-3 py-1 rounded bg-white text-sm font-semibold border border-gray-300 hover:bg-gray-100 transition"
                onClick={() => { setSelectedBulkPackage(pkg); setShowBulkOrderModal(true); }}
              >
                Bulk Order
              </button>
            </div>
            <p className="mb-2 text-gray-700">{pkg.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {bundles.map(bundle => (
                <div key={bundle._id} className="rounded-lg border border-gray-200 p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition bg-white">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-gray-900">{bundle.name}</span>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <span className="px-2 py-1 rounded bg-gray-100 text-gray-800 border" style={{ borderColor: providerColors.primary }}>{bundle.dataVolume}{bundle.dataUnit}</span>
                    <span className="px-2 py-1 rounded bg-gray-100 text-gray-800 border" style={{ borderColor: providerColors.secondary }}>
                      {bundle.validity === 'unlimited' && bundle.validityUnit === 'unlimited'
                        ? 'Unlimited'
                        : `${bundle.validity} ${bundle.validityUnit}`}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">{bundle.price} {bundle.currency}</div>
                  <button
                    className="mt-2 px-4 py-2 rounded-lg font-semibold shadow text-white"
                    style={{ backgroundColor: providerColors.primary, color: providerColors.text }}
                    onClick={() => { setSelectedBundle(bundle); setShowOrderModal(true); }}
                  >
                    Order Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {showOrderModal && selectedBundle && (
        <SingleOrderModal
          bundle={selectedBundle}
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          onSuccess={() => {
            setShowOrderModal(false);
          }}
        />
      )}
      {showBulkOrderModal && selectedBulkPackage && (
        <BulkOrderModal
          isOpen={showBulkOrderModal}
          onClose={() => setShowBulkOrderModal(false)}
          onSuccess={() => setShowBulkOrderModal(false)}
          packageId={selectedBulkPackage._id!}
          provider={providerObj.code}
          providerName={providerObj.name}
          providerId={providerObj._id}
        />
      )}
    </div>
  );
};