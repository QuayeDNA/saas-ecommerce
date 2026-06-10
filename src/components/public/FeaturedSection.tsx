import { memo, useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  FaFire,
  FaTag,
  FaChevronLeft,
  FaChevronRight,
  FaWifi,
} from "react-icons/fa6";
import { getProviderColors } from "../../utils/provider-colors";
import type { PublicBundle } from "../../services/storefront.service";
import type { ThemeConfig } from "./types";
import { fmt, fmtValidity } from "./utils";

type FeaturedTab = "trending" | "value";

export const FeaturedSection = memo(
  ({
    theme,
    trendingBundles,
    allBundles,
    onSelect,
    getProviderLogoUrl,
  }: {
    theme: ThemeConfig;
    trendingBundles: PublicBundle[];
    allBundles: PublicBundle[];
    onSelect: (b: PublicBundle) => void;
    getProviderLogoUrl?: (code: string) => string | undefined;
  }) => {
    const [tab, setTab] = useState<FeaturedTab>("trending");
    const [activeIdx, setActiveIdx] = useState(0);
    const [paused, setPaused] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const carouselRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef(0);
    const touchDeltaX = useRef(0);

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

    useEffect(() => {
      setActiveIdx(0);
    }, [tab]);

    const goTo = useCallback(
      (idx: number) => {
        setActiveIdx((idx + count) % count);
      },
      [count],
    );

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

    const handleCarouselKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          goTo(activeIdx - 1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          goTo(activeIdx + 1);
        }
      },
      [activeIdx, goTo],
    );

    if (!trendingBundles.length && !allBundles.length) return null;

    const activeBundle = items[activeIdx];
    const activePc = activeBundle
      ? getProviderColors(activeBundle.provider)
      : null;

    return (
      <section className="pt-4 pb-5 px-4">
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

        <div
          ref={carouselRef}
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={(e) => {
            setPaused(true);
            touchStartX.current = e.changedTouches[0].screenX;
            touchDeltaX.current = 0;
          }}
          onTouchMove={(e) => {
            touchDeltaX.current = e.changedTouches[0].screenX - touchStartX.current;
          }}
          onTouchEnd={() => {
            setPaused(false);
            if (Math.abs(touchDeltaX.current) > 50) {
              goTo(touchDeltaX.current > 0 ? activeIdx - 1 : activeIdx + 1);
            }
          }}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div
            className="overflow-hidden rounded-2xl"
            style={{
              boxShadow: `0 6px 20px ${(activePc?.primary || theme.primary)}40`,
            }}
            role="region"
            aria-roledescription="carousel"
            aria-label="Featured bundles"
            onKeyDown={handleCarouselKeyDown}
          >
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeIdx * 100}%)` }}
            >
              {items.map((b, idx) => {
                const pc = getProviderColors(b.provider);
                const isAfa = b.provider?.toUpperCase() === "AFA";
                const isActive = idx === activeIdx;
                return (
                  <div
                    key={b._id}
                    className="w-full shrink-0 cursor-pointer select-none relative"
                    onClick={() => onSelect(b)}
                    role="button"
                    tabIndex={isActive ? 0 : -1}
                    onKeyDown={(e) => e.key === "Enter" && onSelect(b)}
                    aria-label={`Buy ${b.name} for ${fmt(b.price)}`}
                    aria-hidden={!isActive}
                    style={{
                      backgroundColor: pc.primary,
                      color: pc.text,
                      border: `1px solid ${pc.secondary}44`,
                    }}
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-white/30 pointer-events-none" />

                    <div className="relative p-4 space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0">
                            {getProviderLogoUrl?.(b.provider || "") ? (
                              <img
                                src={getProviderLogoUrl(b.provider || "")!}
                                alt={`${b.providerName || b.provider} logo`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-lg font-black text-white/90">
                                {(b.providerName || b.provider || "?").charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-black uppercase tracking-[0.2em] opacity-80 truncate">
                              {b.providerName || b.provider}
                            </div>
                            <div className="text-xs opacity-80 truncate">
                              {b.name}
                            </div>
                          </div>
                        </div>
                        {isAfa && b.requiresGhanaCard && (
                          <span className="text-[9px] bg-white/20 rounded-full px-1.5 py-0.5 font-semibold shrink-0">
                            ID
                          </span>
                        )}
                        {!isAfa && RANK_BG[idx + 1] && (
                          <span
                            className="text-[10px] font-black px-2 py-1 rounded-full shadow-lg shrink-0"
                            style={{
                              background: RANK_BG[idx + 1],
                              color: "#fff",
                            }}
                          >
                            #{idx + 1}
                          </span>
                        )}
                      </div>

                      {b.dataVolume > 0 ? (
                        <div className="leading-none">
                          <span className="text-4xl font-black tracking-tight">
                            {b.dataVolume}
                          </span>
                          <span className="text-xl font-bold ml-1 opacity-90">
                            {b.dataUnit}
                          </span>
                        </div>
                      ) : (
                        <div className="text-base font-black leading-snug">
                          {b.name}
                        </div>
                      )}

                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-2.5 py-1 text-[11px] font-semibold">
                          <FaWifi className="w-2.5 h-2.5 opacity-80" />
                          {fmtValidity(b.validity, b.validityUnit)}
                        </div>
                        {tab === "value" &&
                          b.dataVolume > 0 &&
                          b.price > 0 && (
                            <div className="inline-flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-1 text-[11px] font-semibold">
                              💰 {(b.dataVolume / b.price).toFixed(1)}GB/₵
                            </div>
                          )}
                      </div>

                      <div className="flex items-center border-t border-white/15 pt-3">
                        <span className="text-xl font-extrabold">
                          {fmt(b.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {count > 1 && (
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              onClick={() => goTo(activeIdx - 1)}
              className="w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                borderColor: activePc?.primary || theme.primary,
                color: activePc?.primary || theme.primary,
              }}
              aria-label="Previous bundle"
            >
              <FaChevronLeft className="w-3 h-3" />
            </button>
            <div className="flex items-center gap-1.5" role="tablist" aria-label="Slides">
              {items.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className="rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{
                    width: idx === activeIdx ? "24px" : "8px",
                    height: "8px",
                    backgroundColor:
                      idx === activeIdx
                        ? activePc?.primary || theme.primary
                        : "#D1D5DB",
                  }}
                  role="tab"
                  aria-selected={idx === activeIdx}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() => goTo(activeIdx + 1)}
              className="w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                borderColor: activePc?.primary || theme.primary,
                color: activePc?.primary || theme.primary,
              }}
              aria-label="Next bundle"
            >
              <FaChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </section>
    );
  },
);
