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
import { fmt, fmtValidity } from "./utils";

type FeaturedTab = "trending" | "value";

export const FeaturedSection = memo(
  ({
    trendingBundles,
    allBundles,
    onSelect,
    getProviderLogoUrl,
  }: {
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

    return (
      <section className="fs-section">
        <div className="fs-section__inner">
          <div className="fs-section__header">
            <div className="fs-section__title-row">
              {tab === "trending" ? (
                <FaFire className="fs-section__title-icon" />
              ) : (
                <FaTag className="fs-section__title-icon" />
              )}
              <h2 className="fs-section__title">
                {tab === "trending" ? "Trending Now" : "Best Value"}
              </h2>
            </div>
            <div className="fs-section__tabs">
              {(["trending", "value"] as FeaturedTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`fs-section__tab${tab === t ? " fs-section__tab--active" : ""}`}
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
            className="fs-carousel"
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
              className="fs-carousel__viewport"
              role="region"
              aria-roledescription="carousel"
              aria-label="Featured bundles"
              onKeyDown={handleCarouselKeyDown}
            >
              <div
                className="fs-carousel__track"
                style={{ transform: `translateX(-${activeIdx * 100}%)` }}
              >
                {items.map((b, idx) => {
                  const pc = getProviderColors(b.provider);
                  const isAfa = b.provider?.toUpperCase() === "AFA";
                  const isActive = idx === activeIdx;
                  return (
                    <div
                      key={b._id}
                      className="fs-carousel__slide"
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
                      <div className="fs-card">
                        <div className="fs-card__top">
                          <div className="fs-card__provider">
                            <div className="fs-card__logo">
                              {getProviderLogoUrl?.(b.provider || "") ? (
                                <img
                                  src={getProviderLogoUrl(b.provider || "")!}
                                  alt={`${b.providerName || b.provider} logo`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="fs-card__logo-fallback">
                                  {(b.providerName || b.provider || "?").charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="fs-card__provider-info">
                              <div className="fs-card__provider-name">
                                {b.providerName || b.provider}
                              </div>
                              <div className="fs-card__bundle-name">
                                {b.name}
                              </div>
                            </div>
                          </div>
                          {isAfa && b.requiresGhanaCard && (
                            <span className="fs-card__badge">ID</span>
                          )}
                          {!isAfa && RANK_BG[idx + 1] && (
                            <span
                              className="fs-card__rank"
                              style={{ background: RANK_BG[idx + 1] }}
                            >
                              #{idx + 1}
                            </span>
                          )}
                        </div>

                        {b.dataVolume > 0 ? (
                          <div className="fs-card__volume">
                            <span className="fs-card__volume-value">
                              {b.dataVolume}
                            </span>
                            <span className="fs-card__volume-unit">
                              {b.dataUnit}
                            </span>
                          </div>
                        ) : (
                          <div className="fs-card__fallback-name">
                            {b.name}
                          </div>
                        )}

                        <div className="fs-card__tags">
                          <div className="fs-card__tag">
                            <FaWifi className="w-2.5 h-2.5 opacity-80" />
                            {fmtValidity(b.validity, b.validityUnit)}
                          </div>
                          {tab === "value" &&
                            b.dataVolume > 0 &&
                            b.price > 0 && (
                              <div className="fs-card__tag">
                                {(b.dataVolume / b.price).toFixed(1)}GB/₵
                              </div>
                            )}
                        </div>

                        <div className="fs-card__footer">
                          <span className="fs-card__price">
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
            <div className="fs-nav">
              <button
                onClick={() => goTo(activeIdx - 1)}
                className="fs-nav__arrow"
                aria-label="Previous bundle"
              >
                <FaChevronLeft className="w-3 h-3" />
              </button>
              <div className="fs-nav__dots" role="tablist" aria-label="Slides">
                {items.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goTo(idx)}
                    className={`fs-nav__dot${idx === activeIdx ? " fs-nav__dot--active" : ""}`}
                    role="tab"
                    aria-selected={idx === activeIdx}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={() => goTo(activeIdx + 1)}
                className="fs-nav__arrow"
                aria-label="Next bundle"
              >
                <FaChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <style>{`
          .fs-section {
            padding: clamp(12px, 2.5vw, 20px);
          }

          .fs-section__inner {
            max-width: 1280px;
            margin: 0 auto;
            background: color-mix(in srgb, var(--bg-surface, #FFFFFF) 30%, transparent);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            padding: clamp(16px, 3vw, 24px);
          }

          /* ── Header ──────────────────────────────────── */

          .fs-section__header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: clamp(12px, 2vw, 16px);
            gap: 12px;
          }

          .fs-section__title-row {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .fs-section__title-icon {
            width: 16px;
            height: 16px;
            color: #fff;
          }

          .fs-section__title {
            font-size: clamp(13px, 2vw, 15px);
            font-weight: 900;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #fff;
            margin: 0;
          }

          .fs-section__tabs {
            display: flex;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.15);
            flex-shrink: 0;
          }

          .fs-section__tab {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 7px 14px;
            font-size: 12px;
            font-weight: 800;
            border: none;
            cursor: pointer;
            transition: all 200ms ease;
            background: transparent;
            color: rgba(255, 255, 255, 0.6);
            letter-spacing: 0.03em;
          }

          .fs-section__tab--active {
            background: rgba(255, 255, 255, 0.15);
            color: #fff;
          }

          @media (max-width: 420px) {
            .fs-section__header {
              flex-direction: column;
              align-items: stretch;
            }
            .fs-section__tabs {
              align-self: stretch;
            }
            .fs-section__tab {
              flex: 1;
              justify-content: center;
              padding: 7px 10px;
              font-size: 11px;
            }
          }

          /* ── Carousel ────────────────────────────────── */

          .fs-carousel {
            position: relative;
          }

          .fs-carousel__viewport {
            overflow: hidden;
            border-radius: 16px;
          }

          .fs-carousel__track {
            display: flex;
            transition: transform 500ms ease-out;
          }

          .fs-carousel__slide {
            min-width: 100%;
            flex-shrink: 0;
            cursor: pointer;
            user-select: none;
          }

          .fs-card {
            padding: clamp(16px, 3vw, 24px);
            display: flex;
            flex-direction: column;
            gap: clamp(12px, 2vw, 16px);
          }

          .fs-card__top {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
          }

          .fs-card__provider {
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 0;
          }

          .fs-card__logo {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            overflow: hidden;
            background: rgba(255, 255, 255, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .fs-card__logo-fallback {
            font-size: 18px;
            font-weight: 900;
            color: rgba(255, 255, 255, 0.9);
          }

          .fs-card__provider-info {
            min-width: 0;
          }

          .fs-card__provider-name {
            font-size: 13px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            opacity: 0.8;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: #fff;
          }

          .fs-card__bundle-name {
            font-size: 12px;
            opacity: 0.8;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: #fff;
          }

          .fs-card__badge {
            font-size: 10px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 999px;
            padding: 2px 8px;
            font-weight: 700;
            flex-shrink: 0;
          }

          .fs-card__rank {
            font-size: 11px;
            font-weight: 900;
            padding: 4px 10px;
            border-radius: 999px;
            color: #fff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            flex-shrink: 0;
          }

          .fs-card__volume {
            line-height: 1;
          }

          .fs-card__volume-value {
            font-size: clamp(28px, 6vw, 40px);
            font-weight: 900;
            letter-spacing: -0.02em;
            color: #fff;
          }

          .fs-card__volume-unit {
            font-size: clamp(16px, 3vw, 22px);
            font-weight: 700;
            margin-left: 4px;
            opacity: 0.9;
            color: #fff;
          }

          .fs-card__fallback-name {
            font-size: 16px;
            font-weight: 900;
            line-height: 1.3;
            color: #fff;
          }

          .fs-card__tags {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
          }

          .fs-card__tag {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 999px;
            padding: 4px 12px;
            font-size: 11px;
            font-weight: 700;
            color: #fff;
          }

          .fs-card__footer {
            border-top: 1px solid rgba(255, 255, 255, 0.15);
            padding-top: 12px;
          }

          .fs-card__price {
            font-size: clamp(18px, 4vw, 24px);
            font-weight: 900;
            color: #fff;
          }

          /* ── Navigation ──────────────────────────────── */

          .fs-nav {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            margin-top: clamp(12px, 2vw, 16px);
          }

          .fs-nav__arrow {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 2px solid rgba(255, 255, 255, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            background: transparent;
            color: rgba(255, 255, 255, 0.7);
            cursor: pointer;
            transition: all 200ms ease;
          }

          .fs-nav__arrow:hover {
            border-color: #fff;
            color: #fff;
            transform: scale(1.1);
          }

          .fs-nav__arrow:active {
            transform: scale(0.95);
          }

          .fs-nav__dots {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .fs-nav__dot {
            border: none;
            cursor: pointer;
            padding: 0;
            border-radius: 999px;
            transition: all 300ms ease;
            background: rgba(255, 255, 255, 0.3);
            width: 8px;
            height: 8px;
          }

          .fs-nav__dot--active {
            width: 24px;
            background: #fff;
          }

          @media (prefers-reduced-motion: reduce) {
            .fs-carousel__track { transition: none; }
            .fs-section__tab { transition: none; }
            .fs-nav__arrow { transition: none; }
            .fs-nav__dot { transition: none; }
          }
        `}</style>
      </section>
    );
  },
);
