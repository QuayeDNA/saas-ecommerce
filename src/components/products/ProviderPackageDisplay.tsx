// src/components/products/ProviderPackageDisplay.tsx
import React, { useEffect, useState } from 'react';
import { usePackage } from '../../hooks/use-package';
import { useProvider } from '../../hooks/use-provider';
import { getProviderColors } from '../../utils/provider-colors';
import { SingleOrderModal } from '../orders/SingleOrderModal';
import { BulkOrderModal } from '../orders/BulkOrderModal';
import { 
  FaSearch,
  FaBox,
  FaExclamationCircle,
  FaFileUpload
} from 'react-icons/fa';

export interface ProviderPackageDisplayProps {
  provider: string; // provider code
}

interface Package {
  _id: string;
  name: string;
  description: string;
  provider: string;
  category: string;
  isActive: boolean;
}

interface Bundle {
  _id: string;
  name: string;
  description: string;
  dataVolume: number;
  dataUnit: string;
  validity: number;
  validityUnit: string;
  price: number;
  currency: string;
  category: string;
  isActive: boolean;
  packageId: {
    _id: string;
    name: string;
    description: string;
  };
  providerId: {
    _id: string;
    name: string;
    logo: {
      url: string;
      alt: string;
    };
  };
}

export const ProviderPackageDisplay: React.FC<ProviderPackageDisplayProps> = ({ provider }) => {
  const { packages, bundles, loading, error, fetchPackages, fetchBundles } = usePackage();
  const { providers, loading: providersLoading } = useProvider();
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
  }, [provider, hasLoaded, providerObj]);

  // Group bundles by package
  const groupedBundles = (packages || []).reduce((acc, pkg) => {
    const packageBundles = (bundles || []).filter(bundle => 
      // Fix: bundle.packageId may be a string or an object, handle both cases
      ((typeof bundle.packageId === 'string' ? bundle.packageId === pkg._id : bundle.packageId && bundle.packageId._id === pkg._id)) &&
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
  if (providersLoading || !providerObj) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading provider info...</span>
        </div>
      </div>
    );
  }

  const providerColors = getProviderColors(providerObj.code);

  if (loading && !hasLoaded) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
            style={{
              backgroundColor: providerColors.background,
              color: providerColors.text
            }}
          >
            {providerObj.code.slice(0, 2)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{providerObj.name} Data Packages</h2>
            <p className="text-gray-600">Browse and order data bundles</p>
          </div>
        </div>
        {/* Removed global Bulk Order button */}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      {/* Content */}
      {Object.keys(groupedBundles).length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center">
            <FaBox className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No packages found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No {providerObj.name} packages are currently available.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.values(groupedBundles).map(({ package: pkg, bundles: packageBundles }) => (
            <div key={pkg._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Package Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                    {pkg.description && (
                      <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {pkg.category}
                    </span>
                    {/* Bulk Order Button for this package */}
                    <button
                      onClick={() => {
                        setSelectedBulkPackage(pkg);
                        setShowBulkOrderModal(true);
                      }}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium"
                    >
                      <FaFileUpload />
                      Bulk Order
                    </button>
                  </div>
                </div>
              </div>

              {/* Bundles Grid */}
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {packageBundles.map((bundle) => (
                    <div
                      key={bundle._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      {/* Bundle Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">{bundle.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">{bundle.description}</p>
                        </div>
                        <div className="ml-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {bundle.category}
                          </span>
                        </div>
                      </div>

                      {/* Bundle Details */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Data:</span>
                          <span className="font-medium text-gray-900">
                            {bundle.dataVolume} {bundle.dataUnit}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Validity:</span>
                          <span className="font-medium text-gray-900">
                            {bundle.validity} {bundle.validityUnit}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-bold text-lg text-green-600">
                            {bundle.currency} {bundle.price}
                          </span>
                        </div>
                      </div>

                      {/* Order Button */}
                      <button 
                        onClick={() => {
                          setSelectedBundle(bundle);
                          setShowOrderModal(true);
                        }}
                        className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Order Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Single Order Modal */}
      {selectedBundle && (
        <SingleOrderModal
          isOpen={showOrderModal}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedBundle(null);
          }}
          onSuccess={() => {
            setShowOrderModal(false);
            setSelectedBundle(null);
          }}
          bundle={selectedBundle}
        />
      )}

      {/* Bulk Order Modal */}
      {selectedBulkPackage && (
        <BulkOrderModal
          isOpen={showBulkOrderModal}
          onClose={() => {
            setShowBulkOrderModal(false);
            setSelectedBulkPackage(null);
          }}
          onSuccess={() => {
            setShowBulkOrderModal(false);
            setSelectedBulkPackage(null);
          }}
          packageId={selectedBulkPackage._id}
          provider={providerObj.code} // for validation
          providerName={providerObj.name} // for display
          providerId={providerObj._id} // for logic
        />
      )}
    </div>
  );
}; 