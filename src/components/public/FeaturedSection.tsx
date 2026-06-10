import { memo, useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  FaFire,
  FaTag,
  FaChevronLeft,
  FaChevronRight,
  FaWifi,
  FaBagShopping,
} from "react-icons/fa6";
import { getProviderColors } from "../../utils/provider-colors";
import type { PublicBundle } from "../../services/storefront.service";
import type { ThemeConfig } from "./types";
import { fmt, fmtValidity } from "./utils";

// =============================================================================
// Featured Bundles Section — Trending + Best Value tabs, auto-advancing carousel
// =============================================================================

type FeaturedTab = "trending" | "value";

export const FeaturedSection = memo(
  ({
    theme,
    trendingBundles,
    allBundles,
    onSelect,
  }: {
    theme: ThemeConfig;
    trendingBundles: PublicBundle[];
    allBundles: PublicBundle[];
    onSelect: (b: PublicBundle) => void;
  }) => {
    const [tab, setTab] = useState<FeaturedTab>("trending");
    const [activeIdx, setActiveIdx] = useState(0);
    const [paused, setPaused] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const valueBundles = useMemo(() => {
      if (!allBundles.length) return [];
      return [...allBundles]
        .filter((b) => b.dataVolume > 0 && b.price > 0)
        .sort((a, b) => b.dataVolume / b.price - a.dataVolume / a.price)
        .slice(0, 8);
    }, [allBundles]);

    const items =
      tab === "trending"
        ? trendingBundles.length
          ? trendingBundles.slice(0, 8)
          : [...allBundles].sort((a, b) => a.price - b.price).slice(0, 8)
        : valueBundles;

    const count = items.length;

    // Reset index when tab changes
    useEffect(() => {
      setActiveIdx(0);
    }, [tab]);

    const goTo = useCallback(
      (idx: number) => {
        setActiveIdx((idx + count) % count);
      },
      [count],
    );

    // Auto-advance
    useEffect(() => {
      if (count <= 1 || paused) return;
      intervalRef.current = setInterval(() => {
        setActiveIdx((prev) => (prev + 1) % count);
      }, 3500);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }, [count, paused, tab]);

    const RANK_BG = [
      "",
      "linear-gradient(135deg,#F59E0B,#D97706)",
      "linear-gradient(135deg,#9CA3AF,#6B7280)",
      "linear-gradient(135deg,#D97706,#B45309)",
    ];

    if (!trendingBundles.length && !allBundles.length) return null;

    const activeBundle = items[activeIdx];
    const activePc = activeBundle
      ? getProviderColors(activeBundle.provider)
      : null;

    return (
      <div className="pt-4 pb-5 px-4">
        {/* Header + Tabs */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {tab === "trending" ? (
              <FaFire className="w-4 h-4" style={{ color: theme.primary }} />
            ) : (
              <FaTag className="w-4 h-4" style={{ color: theme.primary }} />
            )}
            <h2
              className="text-sm font-black tracking-wide uppercase"
              style={{ color: "var(--text-primary)" }}
            >
              {tab === "trending" ? "Trending Now" : "Best Value"}
            </h2>
          </div>
          <div
            className="flex rounded-xl overflow-hidden border shrink-0"
            style={{ borderColor: "var(--border-color)" }}
          >
            {(["trending", "value"] as FeaturedTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all duration-200"
                style={
                  tab === t
                    ? { backgroundColor: theme.primary, color: "#fff" }
                    : { backgroundColor: "#fff", color: "#6B7280" }
                }
              >
                {t === "trending" ? (
                  <>
                    <FaFire className="w-3 h-3" /> Trending
                  </>
                ) : (
                  <>
                    <FaTag className="w-3 h-3" /> Best Value
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Full-screen single-card carousel */}
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
        >
          {/* Card track — CSS transform slide */}
          <div
            className="overflow-hidden rounded-3xl"
            style={{
              boxShadow: activePc
                ? `0 12px 48px ${activePc.primary}55`
                : "0 8px 32px rgba(0,0,0,0.15)",
            }}
          >
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeIdx * 100}%)` }}
            >
              {items.map((b, idx) => {
                const pc = getProviderColors(b.provider);
                const valuePer =
                  b.dataVolume > 0 && b.price > 0
                    ? (b.dataVolume / b.price).toFixed(1)
                    : null;
                return (
                  <div
                    key={b._id}
                    className="w-full shrink-0 cursor-pointer select-none"
                    onClick={() => onSelect(b)}
                    role="button"
                    tabIndex={idx === activeIdx ? 0 : -1}
                    onKeyDown={(e) => e.key === "Enter" && onSelect(b)}
                    aria-label={`Buy ${b.name} for ${fmt(b.price)}`}
                    style={{
                      background: `linear-gradient(145deg, ${pc.primary}, ${pc.secondary})`,
                    }}
                  >
                    <div
                      className="relative p-6 pb-7 overflow-hidden"
                      style={{ color: "var(--text-inverse)" }}
                    >
                      {/* Decorative blobs */}
                      <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-white/10 pointer-events-none" />
                      <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-black/10 pointer-events-none" />

                      {/* Top row: provider name + rank badge */}
                      <div className="relative flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black uppercase tracking-widest opacity-80">
                            {b.providerName}
                          </span>
                          {tab === "trending" && (
                            <span className="text-[10px] bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 font-bold">
                              🔥 Popular
                            </span>
                          )}
                          {tab === "value" && valuePer && (
                            <span className="text-[10px] bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 font-bold">
                              💰 {valuePer}GB/₵
                            </span>
                          )}
                        </div>
                        {RANK_BG[idx + 1] && (
                          <span
                            className="text-[11px] font-black px-2.5 py-1 rounded-full shadow-lg"
                            style={{
                              background: RANK_BG[idx + 1],
                              color: "#fff",
                            }}
                          >
                            #{idx + 1}
                          </span>
                        )}
                      </div>

                      {/* Data volume — hero */}
                      <div className="relative mb-4">
                        {b.dataVolume > 0 ? (
                          <>
                            <div className="leading-none">
                              <span className="text-7xl font-black tracking-tighter">
                                {b.dataVolume}
                              </span>
                              <span className="text-3xl font-bold ml-2 opacity-80">
                                {b.dataUnit}
                              </span>
                            </div>
                            <div className="text-sm opacity-65 mt-1.5 font-semibold truncate">
                              {b.name}
                            </div>
                          </>
                        ) : (
                          <div className="text-3xl font-black leading-snug">
                            {b.name}
                          </div>
                        )}
                      </div>

                      {/* Validity pill */}
                      <div className="relative inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3.5 py-1.5 text-sm font-semibold mb-6">
                        <FaWifi className="w-3.5 h-3.5 opacity-80" />
                        {fmtValidity(b.validity, b.validityUnit)}
                      </div>

                      {/* Price + CTA */}
                      <div className="relative flex items-center justify-between">
                        <div>
                          <div className="text-xs opacity-55 font-semibold uppercase tracking-wide mb-0.5">
                            Price
                          </div>
                          <div className="text-3xl font-black">
                            {fmt(b.price)}
                          </div>
                        </div>
                        <div
                          className="flex items-center gap-2 rounded-2xl px-5 py-3 shadow-xl hover:shadow-2xl transition-all active:scale-95"
                          style={{ color: pc.primary }}
                        >
                          <FaBagShopping className="w-4 h-4" />
                          <span className="text-sm font-black">Buy Now</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prev / Next overlay arrows */}
          {count > 1 && (
            <>
              <button
                onClick={() => goTo(activeIdx - 1)}
                className="absolute left-0 bottom-0 z-10 w-10 h-10 rounded-tr-2xl bg-black/20 backdrop-blur-sm flex items-center justify-center hover:bg-black/35 transition-all active:scale-95"
                aria-label="Previous bundle"
              >
                <FaChevronLeft className="w-3.5 h-3.5 drop-shadow" />
              </button>
              <button
                onClick={() => goTo(activeIdx + 1)}
                className="absolute right-0 bottom-0 z-10 w-10 h-10 rounded-tl-2xl bg-black/20 backdrop-blur-sm flex items-center justify-center hover:bg-black/35 transition-all active:scale-95"
                aria-label="Next bundle"
              >
                <FaChevronRight className="w-3.5 h-3.5 drop-shadow" />
              </button>
            </>
          )}
        </div>

        {/* Dot indicators + nav row */}
        {count > 1 && (
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              onClick={() => goTo(activeIdx - 1)}
              className="w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all hover:scale-110 active:scale-95"
              style={{
                borderColor: activePc?.primary || theme.primary,
                color: activePc?.primary || theme.primary,
              }}
              aria-label="Previous bundle"
            >
              <FaChevronLeft className="w-2.5 h-2.5" />
            </button>
            <div className="flex items-center gap-1.5">
              {items.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: idx === activeIdx ? "24px" : "7px",
                    height: "7px",
                    backgroundColor:
                      idx === activeIdx
                        ? activePc?.primary || theme.primary
                        : "#D1D5DB",
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() => goTo(activeIdx + 1)}
              className="w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all hover:scale-110 active:scale-95"
              style={{
                borderColor: activePc?.primary || theme.primary,
                color: activePc?.primary || theme.primary,
              }}
              aria-label="Next bundle"
            >
              <FaChevronRight className="w-2.5 h-2.5" />
            </button>
          </div>
        )}
      </div>
    );
  },
);
