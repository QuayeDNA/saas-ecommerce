/* eslint-disable @typescript-eslint/no-unused-vars */
import { memo } from "react";
import { FaStore } from "react-icons/fa";
import { getProviderColors } from "../../utils/provider-colors";
import type { PublicBundle, PublicStorefront } from "../../services/storefront.service";
import type { AdBannerProps } from "../ads/ad-banner";
import { getLogoUrl } from "./utils";
import { BundleCard } from "./BundleCard";

// =============================================================================
// BundleSections — grouped bundle rendering + ad insertion
// =============================================================================

interface Provider {
  code: string;
  name: string;
  logo?: { url?: string; alt?: string } | string;
}

interface BundleSectionsProps {
  storeData: PublicStorefront;
  groupedBundles: Map<string, Map<string, PublicBundle[]>>;
  providers: Provider[];
  selectedProvider: string;
  searchTerm: string;
  collapsedPackages: Set<string>;
  togglePackage: (key: string) => void;
  activeOrderBundleId: string | null;
  ordersClosed: boolean;
  openOrderDialog: (b: PublicBundle) => void;
  getProviderLogoUrl: (code: string) => string | undefined;
  EmptyBundlesComponent: React.FC<{ searchTerm: string; onClear: () => void }>;
  PackageHeaderComponent: React.FC<{
    pkgName: string;
    count: number;
    collapsed: boolean;
    onToggle: () => void;
    color: string;
  }>;
  AdBannerComponent: React.FC<AdBannerProps>;
  onClearSearch: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AdBannerPlaceholder: React.FC<AdBannerProps> = ({ adSlot, adFormat }: AdBannerProps) => (
  <div className="rounded-xl border p-3 text-center text-xs" style={{ borderColor: "var(--border-color)", color: "var(--text-tertiary)" }}>
    Ad: {adSlot} ({adFormat})
  </div>
);

export const BundleSections = memo(
  ({
    storeData,
    groupedBundles,
    providers,
    selectedProvider,
    searchTerm,
    collapsedPackages,
    togglePackage,
    activeOrderBundleId,
    ordersClosed,
    openOrderDialog,
    getProviderLogoUrl,
    EmptyBundlesComponent = EmptyBundlesFallback,
    PackageHeaderComponent = PackageHeaderFallback,
    AdBannerComponent = AdBannerPlaceholder,
    onClearSearch,
  }: BundleSectionsProps) => {
    if (groupedBundles.size === 0) {
      return (
        <EmptyBundlesComponent
          searchTerm={searchTerm}
          onClear={onClearSearch}
        />
      );
    }

    const AD_INTERVAL = 8;

    const renderPackageBundles = (
      bundles: PublicBundle[],
      providerLogoUrl?: string,
    ) => {
      const items: React.ReactNode[] = [];
      bundles.forEach((b, idx) => {
        items.push(
          <BundleCard
            key={b._id}
            bundle={b}
            logoUrl={providerLogoUrl ?? (b.provider ? getProviderLogoUrl(b.provider) : undefined)}
            selected={activeOrderBundleId === b._id}
            disabled={ordersClosed}
            onBuy={openOrderDialog}
          />,
        );
        if ((idx + 1) % AD_INTERVAL === 0 && idx + 1 < bundles.length) {
          items.push(
            <div
              key={`ad-${idx}`}
              className="col-span-1 sm:col-span-2 lg:col-span-3"
            >
              <AdBannerComponent adSlot="YOUR_AD_SLOT_ID_C" adFormat="rectangle" />
            </div>,
          );
        }
      });
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items}
        </div>
      );
    };

    // Prefer structured providers data from backend
    if (Array.isArray(storeData.providers) && storeData.providers.length > 0) {
      return (
        <div className="max-w-7xl mx-auto px-4 py-5 space-y-8">
          {storeData.providers
            .filter(
              (p) => selectedProvider === "all" || p.code === selectedProvider,
            )
            .map((prov) => {
              const pc = getProviderColors(prov.code);
              const filteredPkgs = (prov.packages || [])
                .map((pkg) => ({
                  ...pkg,
                  bundles: (pkg.bundles || []).filter((b) => {
                    if (!searchTerm.trim()) return true;
                    const t = searchTerm.toLowerCase();
                    return (
                      b.name.toLowerCase().includes(t) ||
                      (b.description?.toLowerCase() || "").includes(t)
                    );
                  }),
                }))
                .filter((p) => p.bundles.length > 0);
              if (!filteredPkgs.length) return null;
              const total = filteredPkgs.reduce(
                (s, p) => s + p.bundles.length,
                0,
              );
              return (
                <section key={prov.code}>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow overflow-hidden"
                      style={{ backgroundColor: pc.primary, color: pc.text }}
                    >
                      {getLogoUrl(prov.logo) ? (
                        <img
                          src={getLogoUrl(prov.logo)}
                          alt={prov.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        prov.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h2
                        className="text-base font-black"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {prov.name}
                      </h2>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        {total} bundle{total !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div
                    className="space-y-4 border-l-2 pl-4 ml-1"
                    style={{ borderColor: pc.primary + "25" }}
                  >
                    {filteredPkgs.map((pkg) => {
                      const key = `${prov.code}-${pkg.name}`;
                      const collapsed = collapsedPackages.has(key);
                      return (
                        <div key={key} className="space-y-3">
                          <PackageHeaderComponent
                            pkgName={pkg.name}
                            count={pkg.bundles.length}
                            collapsed={collapsed}
                            onToggle={() => togglePackage(key)}
                            color={pc.primary}
                          />
                          {!collapsed &&
                            renderPackageBundles(
                              pkg.bundles,
                              getLogoUrl(prov.logo),
                            )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
        </div>
      );
    }

    // Fallback: flat groupedBundles
    return (
      <div className="max-w-7xl mx-auto px-4 py-5 space-y-8">
        {Array.from(groupedBundles.entries()).map(([provCode, pkgMap]) => {
          const pc = getProviderColors(provCode);
          const provName =
            providers.find((p) => p.code === provCode)?.name || provCode;
          const total = Array.from(pkgMap.values()).reduce(
            (s, a) => s + a.length,
            0,
          );
          return (
            <section key={provCode}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow"
                  style={{ backgroundColor: pc.primary, color: pc.text }}
                >
                  {provName.charAt(0)}
                </div>
                <div>
                  <h2
                    className="text-base font-black"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {provName}
                  </h2>
                  <p
                    className="text-xs"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {total} bundle{total !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div
                className="space-y-4 border-l-2 pl-4 ml-1"
                style={{ borderColor: pc.primary + "25" }}
              >
                {Array.from(pkgMap.entries()).map(([pkgName, bundles]) => {
                  const key = `${provCode}-${pkgName}`;
                  const collapsed = collapsedPackages.has(key);
                  return (
                    <div key={key} className="space-y-3">
                      <PackageHeaderComponent
                        pkgName={pkgName}
                        count={bundles.length}
                        collapsed={collapsed}
                        onToggle={() => togglePackage(key)}
                        color={pc.primary}
                      />
                      {!collapsed &&
                        renderPackageBundles(
                          bundles,
                          getProviderLogoUrl(provCode),
                        )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    );
  },
);

// Fallback stubs — these are only used when props aren't provided (for backwards compat)
const EmptyBundlesFallback = ({ searchTerm: _searchTerm, onClear: _onClear }: { searchTerm: string; onClear: () => void }) => (
  <div className="py-20 text-center px-4">
    <p className="font-medium" style={{ color: "var(--text-tertiary)" }}>
      No bundles available right now
    </p>
  </div>
);

const PackageHeaderFallback = ({ pkgName, count, collapsed, onToggle, color }: {
  pkgName: string;
  count: number;
  collapsed: boolean;
  onToggle: () => void;
  color: string;
}) => (
  <button
    onClick={onToggle}
    className="w-full flex items-center justify-between p-3 rounded-xl shadow-sm hover:shadow-md transition-all text-left"
    aria-expanded={!collapsed}
  >
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
        style={{ backgroundColor: color }}
      >
        <FaStore className="w-3.5 h-3.5" />
      </div>
      <div>
        <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
          {pkgName}
        </div>
        <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          {count} bundle{count !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  </button>
);
