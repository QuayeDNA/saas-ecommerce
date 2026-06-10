import { memo } from "react";
import { FaMagnifyingGlass, FaBoxOpen } from "react-icons/fa6";
import type { ThemeConfig } from "./types";
import { getLogoUrl } from "./utils";
import { getProviderColors } from "../../utils/provider-colors";
import type { PublicStorefront } from "../../services/storefront.service";

// =============================================================================
// StoreToolbar — search + "My Orders" button + provider carousel
// =============================================================================

interface Provider {
  code: string;
  name: string;
  logo?: { url?: string; alt?: string } | string;
}

interface StoreToolbarProps {
  theme: ThemeConfig;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedProvider: string;
  onSelectProvider: (code: string) => void;
  providers: Provider[];
  groupedBundles: Map<string, Map<string, unknown[]>>;
  storeData: PublicStorefront | null;
  onOpenTrackDrawer: () => void;
  storeClosed: boolean;
  storeClosedMessage: string;
  storefrontsClosed: boolean;
  storefrontsClosedMessage: string;
  activeAnnouncement: { _id: string; title: string; message: string } | null;
  onDismissAnnouncement: (id: string) => void;
}

export const StoreToolbar = memo(
  ({
    theme,
    searchTerm,
    onSearchChange,
    selectedProvider,
    onSelectProvider,
    providers,
    groupedBundles,
    storeData,
    onOpenTrackDrawer,
    storeClosed,
    storeClosedMessage,
    storefrontsClosed,
    storefrontsClosedMessage,
    activeAnnouncement,
    onDismissAnnouncement,
  }: StoreToolbarProps) => {
    return (
      <div
        className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b shadow-sm"
        style={{ borderColor: "var(--border-color)" }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 space-y-3">
          {activeAnnouncement && (
            <div
              className="rounded-xl border p-3 text-sm flex items-start justify-between gap-3"
              style={{
                color: "var(--color-primary)",
                backgroundColor:
                  "color-mix(in srgb, var(--color-primary) 8%, transparent)",
                borderColor:
                  "color-mix(in srgb, var(--color-primary) 30%, transparent)",
              }}
            >
              <div className="min-w-0">
                <div className="font-semibold">{activeAnnouncement.title}</div>
                <div
                  className="truncate text-xs mt-1"
                  style={{ color: "var(--color-primary)" }}
                >
                  {activeAnnouncement.message}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onDismissAnnouncement(activeAnnouncement._id)}
                className="text-xs font-semibold"
              >
                Dismiss
              </button>
            </div>
          )}
          {storeClosed && (
            <div
              className="rounded-xl border p-3 text-sm"
              style={{
                color: "var(--warning)",
                backgroundColor:
                  "color-mix(in srgb, var(--warning) 8%, transparent)",
                borderColor:
                  "color-mix(in srgb, var(--warning) 30%, transparent)",
              }}
            >
              <strong className="font-semibold">
                Store temporarily closed:
              </strong>{" "}
              {storeClosedMessage}
            </div>
          )}
          {storefrontsClosed && (
            <div
              className="rounded-xl border p-3 text-sm"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--warning) 8%, transparent)",
                borderColor:
                  "color-mix(in srgb, var(--warning) 30%, transparent)",
              }}
            >
              <strong className="font-semibold">
                Storefronts closed by admin:
              </strong>{" "}
              {storefrontsClosedMessage}
            </div>
          )}
          {/* Search + view toggle row */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <FaMagnifyingGlass
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                style={{ color: "var(--text-tertiary)" }}
              />
              <input
                type="search"
                placeholder="Search bundles…"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition"
                style={
                  {
                    backgroundColor: "var(--bg-muted)",
                    borderColor: "var(--border-color)",
                    "--tw-ring-color": theme.primary + "40",
                  } as React.CSSProperties
                }
              />
            </div>
            <button
              onClick={onOpenTrackDrawer}
              title="Track my orders"
              className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-semibold transition whitespace-nowrap"
              style={{
                color: "var(--text-secondary)",
                borderColor: "var(--border-color)",
              }}
            >
              <FaBoxOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">My Orders</span>
            </button>
          </div>

          {/* Provider carousel — only shown when multiple providers */}
          {providers.length > 1 && (
            <div className="-mx-4 px-4">
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 snap-x">
                {/* All */}
                <button
                  onClick={() => onSelectProvider("all")}
                  className="shrink-0 snap-start flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all"
                  style={
                    selectedProvider === "all"
                      ? {
                          borderColor: theme.primary,
                          backgroundColor: theme.primary,
                          color: "#fff",
                        }
                      : {
                          borderColor: "#E5E7EB",
                          backgroundColor: "#fff",
                          color: "#374151",
                        }
                  }
                >
                  All · {storeData?.bundles.length ?? 0}
                </button>
                {providers.map((prov) => {
                  const pc = getProviderColors(prov.code);
                  const isActive = selectedProvider === prov.code;
                  const count = groupedBundles.get(prov.code)
                    ? Array.from(
                        groupedBundles.get(prov.code)!.values(),
                      ).reduce((s, a) => s + a.length, 0)
                    : 0;
                  return (
                    <button
                      key={prov.code}
                      onClick={() => onSelectProvider(prov.code)}
                      className="shrink-0 snap-start flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold border-2 transition-all"
                      style={
                        isActive
                          ? {
                              borderColor: pc.primary,
                              backgroundColor: pc.primary,
                              color: "#fff",
                            }
                          : {
                              borderColor: "#E5E7EB",
                              backgroundColor: "#fff",
                              color: "#374151",
                            }
                      }
                    >
                      {getLogoUrl(prov.logo) ? (
                        <img
                          src={getLogoUrl(prov.logo)}
                          alt={prov.name}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                      ) : (
                        <span
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                          style={{ backgroundColor: pc.primary }}
                        >
                          {prov.name.charAt(0)}
                        </span>
                      )}
                      {prov.name} · {count}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);
