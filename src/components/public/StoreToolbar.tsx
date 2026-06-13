import { memo } from "react";
import { FaMagnifyingGlass, FaBoxOpen } from "react-icons/fa6";
import type { ThemeConfig } from "./types";
import { getLogoUrl } from "./utils";
import { getProviderColors } from "../../utils/provider-colors";
import type { PublicStorefront } from "../../services/storefront.service";

// =============================================================================
// StoreToolbar — search · provider filter · My Orders
// Colours driven entirely by CSS vars (set in PublicStore) + theme.primary.
// No hardcoded dark/light hex values — works in both light and dark contexts.
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
        className="sticky top-0 z-20 backdrop-blur-md"
        style={{
          backgroundColor: "color-mix(in srgb, var(--bg-surface) 85%, transparent)",
          borderBottom: "1px solid var(--border-color)",
          boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 space-y-3">

          {/* ── Announcements & status banners ───────────────────────────────── */}

          {activeAnnouncement && (
            <div
              className="rounded-xl p-3 text-sm flex items-start justify-between gap-3"
              style={{
                backgroundColor: `${theme.primary}12`,
                border: `1px solid ${theme.primary}30`,
              }}
            >
              <div className="min-w-0">
                <div className="font-semibold" style={{ color: theme.primary }}>
                  {activeAnnouncement.title}
                </div>
                <div
                  className="truncate text-xs mt-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {activeAnnouncement.message}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onDismissAnnouncement(activeAnnouncement._id)}
                className="text-xs font-semibold shrink-0 transition-opacity hover:opacity-70"
                style={{ color: theme.primary }}
              >
                Dismiss
              </button>
            </div>
          )}

          {storeClosed && (
            <div
              className="rounded-xl p-3 text-sm"
              style={{
                backgroundColor: "color-mix(in srgb, var(--warning) 10%, transparent)",
                border: "1px solid color-mix(in srgb, var(--warning) 30%, transparent)",
                color: "var(--text-primary)",
              }}
            >
              <strong
                className="font-semibold"
                style={{ color: "var(--warning)" }}
              >
                Store temporarily closed:
              </strong>{" "}
              {storeClosedMessage}
            </div>
          )}

          {storefrontsClosed && (
            <div
              className="rounded-xl p-3 text-sm"
              style={{
                backgroundColor: "color-mix(in srgb, var(--warning) 10%, transparent)",
                border: "1px solid color-mix(in srgb, var(--warning) 30%, transparent)",
                color: "var(--text-primary)",
              }}
            >
              <strong
                className="font-semibold"
                style={{ color: "var(--warning)" }}
              >
                Storefronts closed by admin:
              </strong>{" "}
              {storefrontsClosedMessage}
            </div>
          )}

          {/* ── Search + My Orders row ────────────────────────────────────────── */}
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
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm transition"
                style={{
                  backgroundColor: "var(--bg-muted)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = theme.primary;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.primary}20`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-color)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            <button
              onClick={onOpenTrackDrawer}
              title="Track my orders"
              className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition"
              style={{
                backgroundColor: "var(--bg-muted)",
                border: "1px solid var(--border-color)",
                color: "var(--text-secondary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = theme.primary;
                e.currentTarget.style.color = theme.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-color)";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              <FaBoxOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">My Orders</span>
            </button>
          </div>

          {/* ── Provider carousel ────────────────────────────────────────────── */}
          {providers.length > 1 && (
            <div className="-mx-4 px-4">
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 snap-x">

                {/* All */}
                <button
                  onClick={() => onSelectProvider("all")}
                  className="shrink-0 snap-start flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all"
                  style={
                    selectedProvider === "all"
                      ? {
                          backgroundColor: theme.primary,
                          border: `2px solid ${theme.primary}`,
                          color: "#fff",
                        }
                      : {
                          backgroundColor: "var(--bg-muted)",
                          border: "2px solid var(--border-color)",
                          color: "var(--text-secondary)",
                        }
                  }
                >
                  All · {storeData?.bundles.length ?? 0}
                </button>

                {providers.map((prov) => {
                  const pc = getProviderColors(prov.code);
                  const isActive = selectedProvider === prov.code;
                  const count = groupedBundles.get(prov.code)
                    ? Array.from(groupedBundles.get(prov.code)!.values()).reduce(
                        (s, a) => s + a.length,
                        0,
                      )
                    : 0;
                  const logoUrl = getLogoUrl(prov.logo);

                  return (
                    <button
                      key={prov.code}
                      onClick={() => onSelectProvider(prov.code)}
                      className="shrink-0 snap-start flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold transition-all"
                      style={
                        isActive
                          ? {
                              backgroundColor: pc.primary,
                              border: `2px solid ${pc.primary}`,
                              color: "#fff",
                            }
                          : {
                              backgroundColor: "var(--bg-muted)",
                              border: "2px solid var(--border-color)",
                              color: "var(--text-secondary)",
                            }
                      }
                    >
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={prov.name}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                      ) : (
                        <span
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
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