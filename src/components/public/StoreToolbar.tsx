import { memo, useEffect, useRef, useState } from "react";
import { FaMagnifyingGlass, FaBoxOpen, FaXmark } from "react-icons/fa6";
import type { ThemeConfig } from "./types";
import { getLogoUrl } from "./utils";
import { getProviderColors } from "../../utils/provider-colors";
import type { PublicStorefront } from "../../services/storefront.service";

// =============================================================================
// StoreToolbar — search · provider filter · My Orders
// Transparent until scrolled; glassmorphic frost background appears on stick.
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
    const [isStuck, setIsStuck] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const [announcementExpanded, setAnnouncementExpanded] = useState(false);

    useEffect(() => {
      const sentinel = sentinelRef.current;
      if (!sentinel) return;

      const observer = new IntersectionObserver(
        ([entry]) => setIsStuck(!entry.isIntersecting),
        { threshold: [0] },
      );

      observer.observe(sentinel);
      return () => observer.disconnect();
    }, []);

    return (
      <>
        <div ref={sentinelRef} className="h-px pointer-events-none" />
        <div
          className={`sticky top-0 z-20 store-toolbar${isStuck ? " store-toolbar--stuck" : ""}`}
        >
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-3">

            {/* ── Announcements & status banners ───────────────────────────────── */}

            {activeAnnouncement && (
              <div
                className="rounded-xl p-3 text-sm cursor-pointer select-none"
                style={{
                  backgroundColor: `color-mix(in srgb, ${theme.primary} 88%, white)`,
                  border: `1px solid ${theme.primary}50`,
                  color: "#fff",
                }}
                onClick={() => setAnnouncementExpanded((prev) => !prev)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setAnnouncementExpanded((prev) => !prev);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-expanded={announcementExpanded}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="font-semibold text-xs uppercase tracking-wider text-white/90">
                    {activeAnnouncement.title}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismissAnnouncement(activeAnnouncement._id);
                    }}
                    className="shrink-0 transition-opacity hover:opacity-70 p-0.5 text-white/80"
                    aria-label="Dismiss announcement"
                  >
                    <FaXmark className="w-4 h-4" />
                  </button>
                </div>
                <div
                  className="mt-1.5 text-xs text-white/85 transition-all overflow-hidden"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: announcementExpanded ? "unset" : 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {activeAnnouncement.message}
                </div>
              </div>
            )}

            {storeClosed && (
              <div
                className="rounded-xl p-3 text-sm"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--warning) 25%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--warning) 45%, transparent)",
                  color: "#fff",
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
                  backgroundColor: "color-mix(in srgb, var(--warning) 25%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--warning) 45%, transparent)",
                  color: "#fff",
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
                  style={{ color: isStuck ? "var(--text-secondary)" : "rgba(255,255,255,0.55)" }}
                />
                <input
                  type="search"
                  placeholder="Search bundles…"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm transition"
                  style={{
                    backgroundColor: isStuck ? "var(--bg-muted)" : "rgba(255,255,255,0.08)",
                    border: isStuck ? "1px solid var(--border-color)" : "1px solid rgba(255,255,255,0.25)",
                    color: isStuck ? "var(--text-primary)" : "#fff",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.primary;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.primary}20`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = isStuck ? "var(--border-color)" : "rgba(255,255,255,0.25)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              <button
                onClick={onOpenTrackDrawer}
                title="Track my orders"
                className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition"
                style={{
                  backgroundColor: isStuck ? "var(--bg-muted)" : "transparent",
                  border: isStuck ? "1px solid var(--border-color)" : "1px solid rgba(255,255,255,0.25)",
                  color: isStuck ? "var(--text-primary)" : "#fff",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = theme.primary;
                  e.currentTarget.style.color = isStuck ? theme.primary : "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isStuck ? "var(--border-color)" : "rgba(255,255,255,0.25)";
                  e.currentTarget.style.color = isStuck ? "var(--text-primary)" : "#fff";
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
                            backgroundColor: isStuck ? "var(--bg-muted)" : "transparent",
                            border: isStuck ? "2px solid var(--border-color)" : "2px solid rgba(255,255,255,0.25)",
                            color: isStuck ? "var(--text-primary)" : "#fff",
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
                                backgroundColor: isStuck ? "var(--bg-muted)" : "transparent",
                                border: isStuck ? "2px solid var(--border-color)" : "2px solid rgba(255,255,255,0.25)",
                                color: isStuck ? "var(--text-primary)" : "#fff",
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

        <style>{`
          .store-toolbar {
            background: rgba(0, 0, 0, 0.25);
            -webkit-backdrop-filter: blur(8px);
            backdrop-filter: blur(8px);
            transition: background 350ms ease,
                        border-color 350ms ease,
                        box-shadow 350ms ease;
          }

          .store-toolbar input::placeholder {
            color: rgba(255, 255, 255, 0.45);
          }

          .store-toolbar--stuck input::placeholder {
            color: var(--text-tertiary, #94A3B8);
          }

          .store-toolbar--stuck {
            background: var(--bg-surface, #FFFFFF);
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
            border-bottom: 1px solid var(--border-color, #E2E8F0);
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          }

          @media (prefers-reduced-motion: reduce) {
            .store-toolbar { transition: none !important; }
          }
        `}</style>
      </>
    );
  },
);
