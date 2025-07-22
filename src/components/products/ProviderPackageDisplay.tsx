import React, { useEffect, useState, useMemo } from 'react';
import { packageService } from '../../services/package.service';
import { bundleService } from '../../services/bundle.service';
import { getProviderColors } from '../../utils/provider-colors';
import { SingleOrderModal } from '../orders/SingleOrderModal';
import { BulkOrderModal } from '../orders/BulkOrderModal';
import { FaSearch, FaBox, FaExclamationCircle } from 'react-icons/fa';
import type { Package, Bundle } from '../../types/package';

export interface ProviderPackageDisplayProps {
  provider: string; // provider code (e.g., 'MTN')
  category?: string; // optional category/tag
  packageId?: string; // optional specific package id
  filters?: Record<string, unknown>; // additional filters for packages
}

export const ProviderPackageDisplay: React.FC<ProviderPackageDisplayProps> = ({
  provider,
  category,
  packageId,
  filters = {},
}) => {
  // State
  const [packages, setPackages] = useState<Package[]>([]);
  const [bundles, setBundles] = useState<Record<string, Bundle[]>>({}); // key: packageId
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(category || 'all');
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showBulkOrderModal, setShowBulkOrderModal] = useState(false);
  const [selectedBulkPackage, setSelectedBulkPackage] = useState<Package | null>(null);

  // Fetch packages based on props
  useEffect(() => {
    setLoading(true);
    setError(null);
    setPackages([]);
    setBundles({});
    const fetch = async () => {
      try {
        let pkgList: Package[] = [];
        if (packageId) {
          // Fetch a single package by id
          const pkg = await packageService.getPackage(packageId);
          if (pkg) pkgList = [pkg];
        } else {
          // Build filters
          const pkgFilters: Record<string, unknown> = { provider, ...filters };
          if (category) pkgFilters.category = category;
          // Fetch all packages for provider/category
          const resp = await packageService.getPackages(pkgFilters);
          pkgList = resp.packages || [];
        }
        setPackages(pkgList);
        // Fetch bundles for each package
        const bundleMap: Record<string, Bundle[]> = {};
        for (const pkg of pkgList) {
          if (pkg._id) {
            const resp = await bundleService.getBundles({ packageId: pkg._id });
            bundleMap[pkg._id] = resp.bundles || [];
          }
        }
        setBundles(bundleMap);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to fetch packages or bundles');
      } finally {
        setLoading(false);
      }
    };
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, category, packageId, JSON.stringify(filters)]);

  // Filtered packages by category (if using dropdown)
  const filteredPackages = useMemo(() => {
    if (category) return packages;
    if (selectedCategory === 'all') return packages;
    return packages.filter(pkg => pkg.category === selectedCategory);
  }, [packages, category, selectedCategory]);

  // Get unique categories from packages (for dropdown)
  const categories = useMemo(() => {
    if (category) return [];
    const cats = Array.from(new Set(packages.map(p => p.category)));
    return ['all', ...cats];
  }, [packages, category]);

  // Provider display (for color, etc.)
  const providerColors = getProviderColors(provider);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
          <span className="ml-3 text-gray-600">Loading packages...</span>
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

  // No packages found
  if (!filteredPackages.length) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <FaBox className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No packages found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No data packages available for this provider.
          </p>
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
            {provider.slice(0, 2)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{provider} Data Packages</h2>
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

          {/* Category Filter: only show if not filtered by category or packageId */}
          {!category && !packageId && categories.length > 1 && (
            <div className="sm:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              >
                {categories.map(cat => (
                  <option key={cat ?? 'unknown'} value={cat ?? ''}>
                    {cat === 'all'
                      ? 'All Categories'
                      : typeof cat === 'string'
                        ? cat.charAt(0).toUpperCase() + cat.slice(1)
                        : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Package and Bundle Cards */}
      <div className="space-y-6">
        {filteredPackages.map(pkg => (
          <div key={pkg._id} className="rounded-lg shadow border border-gray-200 p-4"
            style={{ backgroundColor: providerColors.primary }}
          >
            <div className="flex items-center gap-2 mb-2">
              <FaBox className="text-xl" style={{ color: providerColors.secondary }} />
              <span className="font-semibold text-lg text-white">{pkg.name}</span>
              <button
                className="ml-auto px-3 py-1 rounded bg-white text-sm font-semibold border border-gray-300 hover:bg-gray-100 transition"
                onClick={() => { setSelectedBulkPackage(pkg); setShowBulkOrderModal(true); }}
              >
                Bulk Order
              </button>
            </div>
            <p className="mb-2 text-gray-100 mb-4">{pkg.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {(bundles[pkg._id!] || [])
                .filter(bundle =>
                  (searchTerm === '' ||
                    bundle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (bundle.description?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()))
                )
                .map(bundle => (
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
          provider={provider}
          providerName={provider}
        />
      )}
    </div>
  );
};