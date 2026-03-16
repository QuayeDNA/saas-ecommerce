/* eslint-disable @typescript-eslint/no-explicit-any */
// =============================================================================
// PublicStore — Customer-facing storefront for browsing & ordering data bundles
// Mobile-first, theme-aware, performance-optimised
// Single-item "Buy Now" flow — no cart — with fee transparency & featured section
// =============================================================================

import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
    Button, Alert, Skeleton,
    Dialog, DialogHeader, DialogBody, DialogFooter, Input,
} from '../../design-system';
import { getProviderColors } from '../../utils/provider-colors';
import storefrontService from '../../services/storefront.service';
import { walletService } from '../../services/wallet-service';
import { useToast } from '../../design-system/components/toast';
import type {
    PublicBundle, PublicStorefront, PublicOrderData,
    PublicOrderResult, StorefrontBranding, TrackedOrder,
} from '../../services/storefront.service';
import {
    FaCircleCheck, FaTriangleExclamation, FaIdCard,
    FaArrowRight, FaArrowLeft, FaPhone, FaEnvelope,
    FaStore, FaChevronDown, FaWifi,
    FaMagnifyingGlass, FaFire, FaBolt, FaTag,
    FaChevronLeft, FaChevronRight, FaBagShopping, FaBoxOpen, FaXmark,
} from 'react-icons/fa6';
import { FaWhatsapp, FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

// =============================================================================
// Types
// =============================================================================

// ─── Paystack Inline Helper ───────────────────────────────────────────────────

async function loadPaystackScript(): Promise<void> {

    if ((window as any).PaystackPop) return;
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://js.paystack.co/v1/inline.js';
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('Failed to load Paystack script'));
        document.head.appendChild(s);
    });
}

// ─── OG Meta Helpers (store-level sharing) ───────────────────────────────────

function setOGMetaTag(property: string, content: string) {
    let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

function updateStorefrontOGTags(storefront: PublicStorefront['storefront'], bundles: PublicBundle[]) {
    const storeTitle = storefront.displayName || storefront.businessName || 'DirectData';
    const storeDesc = storefront.description || 'Instant data bundles from trusted agents';
    const bundleCount = bundles.length;
    const networks = [...new Set(bundles.map(b => b.provider).filter(Boolean))].join(', ') || 'multiple networks';

    const ogTitle = `${storeTitle} | DirectData`;
    const ogDesc = `${storeDesc} · ${bundleCount} bundles available on ${networks}`;
    const imageUrl = storefront.branding?.logoUrl || '/logo-192.svg';

    document.title = ogTitle;
    setOGMetaTag('og:title', ogTitle);
    setOGMetaTag('og:description', ogDesc);
    setOGMetaTag('og:image', imageUrl);
    setOGMetaTag('og:url', window.location.href);
    setOGMetaTag('og:type', 'website');
    setOGMetaTag('twitter:card', 'summary_large_image');
    setOGMetaTag('twitter:title', ogTitle);
    setOGMetaTag('twitter:description', ogDesc);
    setOGMetaTag('twitter:image', imageUrl);
}



function getSystemFooterText(businessName: string): string {
    const FOOTER_TEXTS = [
        "Powered by your go-to data partner.",
        "Fast top-ups, trusted by many.",
        "Your connection, our priority.",
        "Serving data bundles with care.",
        "Bringing you fast, reliable bundles.",
        "Stay connected, stay productive.",
        "Data made simple and affordable.",
        "Quick bundle top-ups, anytime.",
        "Trusted data deals for every network.",
        "Your one-stop data shop.",
        "Powered by great service and fast bundles.",
        "Top-up in seconds, connect for hours.",
        "Hassle-free data purchases every time.",
        "Your data, your way.",
        "Built for speed, designed for you.",
        "Smart bundles, smarter savings.",
        "Connecting Ghana, one bundle at a time.",
        "Reliable data — delivered instantly.",
        "Fast, friendly, and always available.",
        "Your favourite source for mobile bundles.",
    ];
    let hash = 0;
    for (let i = 0; i < businessName.length; i++) {
        hash = (hash * 31 + businessName.charCodeAt(i)) >>> 0;
    }
    return FOOTER_TEXTS[hash % FOOTER_TEXTS.length];
}


/** Single-item order (replaces multi-item cart) */
interface OrderItem {
    bundle: PublicBundle;
    customerPhone: string;
    customerName?: string;   // AFA only
    ghanaCardNumber?: string; // AFA only
}

type OrderStep = 'details' | 'payment' | 'confirmation';

/** Client-side Paystack fee estimate (1.95% inverse formula — same as backend) */
const estimateFee = (base: number, pct = 1.95) => {
    const charge = Math.round((base / (1 - pct / 100)) * 100) / 100;
    const fee = Math.round((charge - base) * 100) / 100;
    return { charge, fee };
};

// minimal shape of a generic payment account description returned by the API
// we can't predict all fields so allow optional ones used in the UI
interface PaymentAccount {
    provider?: string;
    number?: string;
    accountName?: string;
    account_number?: string;
    bank_name?: string;
    [key: string]: unknown;
}

interface ThemeConfig {
    primary: string;
    secondary: string;
    accent: string;
    bg: string;
    text: string;
    gradient: string;
    cardBorder: string;
    heroBg: string;
}

// =============================================================================
// Constants & Theme System
// =============================================================================

const THEMES: Record<string, ThemeConfig> = {
    blue: {
        primary: '#2563EB', secondary: '#1E40AF', accent: '#60A5FA',
        bg: '#EFF6FF', text: '#1E3A5F', gradient: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 50%, #1e3a8a 100%)',
        cardBorder: '#BFDBFE', heroBg: '#EFF6FF',
    },
    green: {
        primary: '#16A34A', secondary: '#15803D', accent: '#4ADE80',
        bg: '#F0FDF4', text: '#14532D', gradient: 'linear-gradient(135deg, #15803D 0%, #166534 50%, #14532d 100%)',
        cardBorder: '#BBF7D0', heroBg: '#F0FDF4',
    },
    purple: {
        primary: '#7C3AED', secondary: '#6D28D9', accent: '#A78BFA',
        bg: '#FAF5FF', text: '#3B0764', gradient: 'linear-gradient(135deg, #6D28D9 0%, #5B21B6 50%, #4c1d95 100%)',
        cardBorder: '#DDD6FE', heroBg: '#FAF5FF',
    },
    orange: {
        primary: '#EA580C', secondary: '#C2410C', accent: '#FB923C',
        bg: '#FFF7ED', text: '#7C2D12', gradient: 'linear-gradient(135deg, #C2410C 0%, #B45309 50%, #92400e 100%)',
        cardBorder: '#FED7AA', heroBg: '#FFF7ED',
    },
    red: {
        primary: '#DC2626', secondary: '#B91C1C', accent: '#F87171',
        bg: '#FEF2F2', text: '#7F1D1D', gradient: 'linear-gradient(135deg, #B91C1C 0%, #991B1B 50%, #7f1d1d 100%)',
        cardBorder: '#FECACA', heroBg: '#FEF2F2',
    },
    teal: {
        primary: '#0D9488', secondary: '#0F766E', accent: '#2DD4BF',
        bg: '#F0FDFA', text: '#134E4A', gradient: 'linear-gradient(135deg, #0F766E 0%, #115E59 50%, #134e4a 100%)',
        cardBorder: '#99F6E4', heroBg: '#F0FDFA',
    },
    indigo: {
        primary: '#4F46E5', secondary: '#4338CA', accent: '#818CF8',
        bg: '#EEF2FF', text: '#312E81', gradient: 'linear-gradient(135deg, #4338CA 0%, #3730A3 50%, #312e81 100%)',
        cardBorder: '#C7D2FE', heroBg: '#EEF2FF',
    },
    rose: {
        primary: '#E11D48', secondary: '#BE123C', accent: '#FB7185',
        bg: '#FFF1F2', text: '#881337', gradient: 'linear-gradient(135deg, #BE123C 0%, #9F1239 50%, #881337 100%)',
        cardBorder: '#FECDD3', heroBg: '#FFF1F2',
    },
};

const DEFAULT_THEME = THEMES.blue;

// placeholders removed – popularity driven exclusively by backend now.

// =============================================================================
// Pure Helpers (no hooks — safe to call anywhere)
// =============================================================================

const fmt = (n: number) => `GH₵ ${n.toFixed(2)}`;

const normalizePhone = (p: string) => {
    const c = p.replace(/\s+/g, '');
    if (c.startsWith('+233')) return '0' + c.slice(4);
    if (c.startsWith('233')) return '0' + c.slice(3);
    return c;
};

const normalizeWhatsappNumber = (value?: string) => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    if (digits.startsWith('233')) return digits;
    if (digits.startsWith('0')) return `233${digits.slice(1)}`;
    return digits;
};

const isValidPhone = (p: string) => /^0\d{9}$/.test(normalizePhone(p));
const fmtValidity = (v: number | string, u: string) =>
    v === 'unlimited' || u === 'unlimited' ? 'Unlimited' : `${v} ${u}`;

const getLogoUrl = (logo?: { url?: string; alt?: string } | string) =>
    !logo ? undefined : typeof logo === 'string' ? logo : logo.url;

// =============================================================================
// Micro-components (memoised for perf)
// =============================================================================

/** Shimmering skeleton that exactly mirrors final card shape */
const BundleCardSkeleton = memo(() => (
    <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
        <div className="h-1 bg-gray-100" />
        <div className="p-4 space-y-3">
            <Skeleton height="1.75rem" width="60%" />
            <Skeleton height="0.9rem" width="80%" />
            <div className="flex gap-2 pt-1">
                <Skeleton height="1.3rem" width="3rem" />
                <Skeleton height="1.3rem" width="4rem" />
            </div>
            <div className="flex justify-between items-center pt-2">
                <Skeleton height="1.5rem" width="5rem" />
                <Skeleton height="2rem" width="4.5rem" />
            </div>
        </div>
    </div>
));

// =============================================================================
// Featured Bundles Section — Trending + Best Value tabs, auto-advancing carousel
// =============================================================================

type FeaturedTab = 'trending' | 'value';


const FeaturedSection = memo((
    { theme, trendingBundles, allBundles, onSelect }: {
        theme: ThemeConfig;
        trendingBundles: PublicBundle[];
        allBundles: PublicBundle[];
        onSelect: (b: PublicBundle) => void;
    }
) => {
    const [tab, setTab] = useState<FeaturedTab>('trending');
    const [activeIdx, setActiveIdx] = useState(0);
    const [paused, setPaused] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const valueBundles = useMemo(() => {
        if (!allBundles.length) return [];
        return [...allBundles]
            .filter(b => b.dataVolume > 0 && b.price > 0)
            .sort((a, b) => (b.dataVolume / b.price) - (a.dataVolume / a.price))
            .slice(0, 8);
    }, [allBundles]);

    const items = tab === 'trending'
        ? (trendingBundles.length ? trendingBundles.slice(0, 8) : [...allBundles].sort((a, b) => a.price - b.price).slice(0, 8))
        : valueBundles;

    const count = items.length;

    // Reset index when tab changes
    useEffect(() => { setActiveIdx(0); }, [tab]);

    const goTo = useCallback((idx: number) => {
        setActiveIdx((idx + count) % count);
    }, [count]);

    // Auto-advance
    useEffect(() => {
        if (count <= 1 || paused) return;
        intervalRef.current = setInterval(() => {
            setActiveIdx(prev => (prev + 1) % count);
        }, 3500);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [count, paused, tab]);

    const RANK_BG = [
        '',
        'linear-gradient(135deg,#F59E0B,#D97706)',
        'linear-gradient(135deg,#9CA3AF,#6B7280)',
        'linear-gradient(135deg,#D97706,#B45309)',
    ];

    if (!trendingBundles.length && !allBundles.length) return null;

    const activeBundle = items[activeIdx];
    const activePc = activeBundle ? getProviderColors(activeBundle.provider) : null;

    return (
        <div className="pt-4 pb-5 px-4">
            {/* Header + Tabs */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {tab === 'trending'
                        ? <FaFire className="w-4 h-4" style={{ color: theme.primary }} />
                        : <FaTag className="w-4 h-4" style={{ color: theme.primary }} />
                    }
                    <h2 className="text-sm font-black text-gray-800 tracking-wide uppercase">
                        {tab === 'trending' ? 'Trending Now' : 'Best Value'}
                    </h2>
                </div>
                <div className="flex rounded-xl overflow-hidden border border-gray-200 shrink-0">
                    {(['trending', 'value'] as FeaturedTab[]).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all duration-200"
                            style={tab === t
                                ? { backgroundColor: theme.primary, color: '#fff' }
                                : { backgroundColor: '#fff', color: '#6B7280' }}
                        >
                            {t === 'trending'
                                ? <><FaFire className="w-3 h-3" /> Trending</>
                                : <><FaTag className="w-3 h-3" /> Best Value</>
                            }
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
                    style={{ boxShadow: activePc ? `0 12px 48px ${activePc.primary}55` : '0 8px 32px rgba(0,0,0,0.15)' }}
                >
                    <div
                        className="flex transition-transform duration-500 ease-out"
                        style={{ transform: `translateX(-${activeIdx * 100}%)` }}
                    >
                        {items.map((b, idx) => {
                            const pc = getProviderColors(b.provider);
                            const valuePer = b.dataVolume > 0 && b.price > 0
                                ? (b.dataVolume / b.price).toFixed(1) : null;
                            return (
                                <div
                                    key={b._id}
                                    className="w-full shrink-0 cursor-pointer select-none"
                                    onClick={() => onSelect(b)}
                                    role="button"
                                    tabIndex={idx === activeIdx ? 0 : -1}
                                    onKeyDown={e => e.key === 'Enter' && onSelect(b)}
                                    aria-label={`Buy ${b.name} for ${fmt(b.price)}`}
                                    style={{ background: `linear-gradient(145deg, ${pc.primary}, ${pc.secondary})` }}
                                >
                                    <div className="relative p-6 pb-7 text-white overflow-hidden">
                                        {/* Decorative blobs */}
                                        <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-white/10 pointer-events-none" />
                                        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-black/10 pointer-events-none" />

                                        {/* Top row: provider name + rank badge */}
                                        <div className="relative flex items-center justify-between mb-5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-black uppercase tracking-widest opacity-80">{b.providerName}</span>
                                                {tab === 'trending' && (
                                                    <span className="text-[10px] bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 font-bold">🔥 Popular</span>
                                                )}
                                                {tab === 'value' && valuePer && (
                                                    <span className="text-[10px] bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 font-bold">💰 {valuePer}GB/₵</span>
                                                )}
                                            </div>
                                            {RANK_BG[idx + 1] && (
                                                <span
                                                    className="text-[11px] font-black px-2.5 py-1 rounded-full shadow-lg"
                                                    style={{ background: RANK_BG[idx + 1], color: '#fff' }}
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
                                                        <span className="text-7xl font-black tracking-tighter">{b.dataVolume}</span>
                                                        <span className="text-3xl font-bold ml-2 opacity-80">{b.dataUnit}</span>
                                                    </div>
                                                    <div className="text-sm opacity-65 mt-1.5 font-semibold truncate">{b.name}</div>
                                                </>
                                            ) : (
                                                <div className="text-3xl font-black leading-snug">{b.name}</div>
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
                                                <div className="text-xs opacity-55 font-semibold uppercase tracking-wide mb-0.5">Price</div>
                                                <div className="text-3xl font-black">{fmt(b.price)}</div>
                                            </div>
                                            <div
                                                className="flex items-center gap-2 bg-white rounded-2xl px-5 py-3 shadow-xl hover:shadow-2xl transition-all active:scale-95"
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
                            <FaChevronLeft className="w-3.5 h-3.5 text-white drop-shadow" />
                        </button>
                        <button
                            onClick={() => goTo(activeIdx + 1)}
                            className="absolute right-0 bottom-0 z-10 w-10 h-10 rounded-tl-2xl bg-black/20 backdrop-blur-sm flex items-center justify-center hover:bg-black/35 transition-all active:scale-95"
                            aria-label="Next bundle"
                        >
                            <FaChevronRight className="w-3.5 h-3.5 text-white drop-shadow" />
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
                        style={{ borderColor: activePc?.primary || theme.primary, color: activePc?.primary || theme.primary }}
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
                                    width: idx === activeIdx ? '24px' : '7px',
                                    height: '7px',
                                    backgroundColor: idx === activeIdx ? (activePc?.primary || theme.primary) : '#D1D5DB',
                                }}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                    <button
                        onClick={() => goTo(activeIdx + 1)}
                        className="w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all hover:scale-110 active:scale-95"
                        style={{ borderColor: activePc?.primary || theme.primary, color: activePc?.primary || theme.primary }}
                        aria-label="Next bundle"
                    >
                        <FaChevronRight className="w-2.5 h-2.5" />
                    </button>
                </div>
            )}
        </div>
    );
});
// =============================================================================
// Bundle Card — provider-color gradient, card-only layout
// =============================================================================

const BundleCard = memo(({ bundle, selected, onBuy }: {
    bundle: PublicBundle; selected: boolean; onBuy: (b: PublicBundle) => void;
}) => {
    const pc = getProviderColors(bundle.provider);
    const isAfa = bundle.provider?.toUpperCase() === 'AFA';
    const hasData = bundle.dataVolume != null && bundle.dataVolume > 0;

    return (
        <article
            onClick={() => onBuy(bundle)}
            className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.04] hover:-translate-y-1 active:scale-[0.97] select-none"
            style={{
                background: `linear-gradient(145deg, ${pc.primary}, ${pc.secondary})`,
                boxShadow: selected
                    ? `0 0 0 3px #fff, 0 0 0 5px ${pc.primary}, 0 16px 40px ${pc.primary}55`
                    : `0 6px 20px ${pc.primary}40`,
            }}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onBuy(bundle)}
            aria-label={`Buy ${bundle.name} — ${fmt(bundle.price)}`}
        >
            {/* Top shimmer edge */}
            <div className="absolute inset-x-0 top-0 h-px bg-white/40" />
            {/* Background circle decoration */}
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />

            {/* Selected indicator */}
            {selected && (
                <div className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center">
                    <FaCircleCheck className="w-4 h-4" style={{ color: pc.primary }} />
                </div>
            )}

            <div className="relative p-4 text-white space-y-3">
                {/* Provider + AFA badge */}
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-75">{bundle.providerName}</span>
                    {isAfa && bundle.requiresGhanaCard && (
                        <span className="text-[9px] bg-white/20 rounded-full px-1.5 py-0.5 font-semibold flex items-center gap-0.5">
                            <FaIdCard className="w-2 h-2" /> ID
                        </span>
                    )}
                </div>

                {/* Data volume — hero */}
                <div>
                    {hasData ? (
                        <>
                            <div className="leading-none">
                                <span className="text-4xl font-black tracking-tight">{bundle.dataVolume}</span>
                                <span className="text-xl font-bold ml-1 opacity-80">{bundle.dataUnit}</span>
                            </div>
                            <div className="text-xs opacity-60 mt-0.5 truncate font-medium">{bundle.name}</div>
                        </>
                    ) : (
                        <div className="text-base font-black leading-snug line-clamp-2">{bundle.name}</div>
                    )}
                </div>

                {/* Validity pill */}
                <div className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-2.5 py-1 text-[11px] font-semibold">
                    <FaWifi className="w-2.5 h-2.5 opacity-75" />
                    {fmtValidity(bundle.validity, bundle.validityUnit)}
                </div>

                {/* Bottom: price + buy CTA */}
                <div className="flex items-center justify-between border-t border-white/15 pt-3">
                    <span className="text-xl font-extrabold">{fmt(bundle.price)}</span>
                    <div
                        className="flex items-center gap-1.5 bg-white rounded-xl px-3 py-1.5 text-xs font-black shadow transition-all group-hover:shadow-lg"
                        style={{ color: pc.primary }}
                    >
                        <FaBagShopping className="w-3 h-3" /> Buy
                    </div>
                </div>
            </div>
        </article>
    );
});

// =============================================================================
// Package Section Header (collapsible)
// =============================================================================

const PackageHeader = memo(({ pkgName, count, collapsed, onToggle, color }: {
    pkgName: string; count: number; collapsed: boolean; onToggle: () => void; color: string;
}) => (
    <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-left"
        aria-expanded={!collapsed}
    >
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm"
                style={{ backgroundColor: color }}>
                <FaStore className="w-3.5 h-3.5" />
            </div>
            <div>
                <div className="text-sm font-bold text-gray-900">{pkgName}</div>
                <div className="text-xs text-gray-400">{count} bundle{count !== 1 ? 's' : ''}</div>
            </div>
        </div>
        <div className="text-gray-400 transition-transform duration-200" style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}>
            <FaChevronDown className="w-4 h-4" />
        </div>
    </button>
));

// =============================================================================
// Full Loading Skeleton
// =============================================================================

const StoreSkeleton = memo(({ theme }: { theme: ThemeConfig }) => (
    <div className="min-h-screen bg-gray-50">
        {/* Hero skeleton */}
        <div className="h-48 sm:h-64" style={{ background: theme.gradient, opacity: 0.15 }} />
        <div className="max-w-5xl mx-auto px-4 -mt-8 space-y-6">
            {/* Popular row skeleton */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
                <Skeleton height="1rem" width="160px" className="mb-3" />
                <div className="flex gap-3 overflow-hidden">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="shrink-0 w-36 h-28 rounded-2xl bg-gray-100 animate-pulse" />
                    ))}
                </div>
            </div>
            {/* Bundle cards skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => <BundleCardSkeleton key={i} />)}
            </div>
        </div>
    </div>
));

// =============================================================================
// Error / Empty States
// =============================================================================

const StoreError = memo(({ error, onRetry }: { error: string; onRetry: () => void }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-sm w-full text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
                <FaTriangleExclamation className="w-8 h-8 text-red-400" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-900">Store unavailable</h2>
                <p className="text-sm text-gray-500 mt-2">{error}</p>
            </div>
            <div className="flex gap-3 justify-center">
                <button onClick={onRetry}
                    className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm bg-gray-900 hover:bg-gray-800 transition active:scale-95">
                    Try again
                </button>
                <button onClick={() => window.location.href = '/'}
                    className="px-5 py-2.5 rounded-xl font-semibold text-sm border border-gray-200 hover:bg-gray-50 transition">
                    Go home
                </button>
            </div>
        </div>
    </div>
));

const EmptyBundles = memo(({ searchTerm, onClear }: { searchTerm: string; onClear: () => void }) => (
    <div className="py-20 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <FaWifi className="w-8 h-8 text-gray-300" />
        </div>
        {searchTerm ? (
            <>
                <h3 className="text-lg font-bold text-gray-800">No results for "{searchTerm}"</h3>
                <p className="text-sm text-gray-400 mt-1 mb-4">Try different keywords or clear the search.</p>
                <button onClick={onClear}
                    className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition">
                    Clear search
                </button>
            </>
        ) : (
            <>
                <p className="text-gray-400 font-medium">No bundles available right now</p>
                <p className="text-sm text-gray-500 mt-2">
                    The store owner may not have activated any bundles yet. Check back later or contact them for assistance.
                </p>
            </>
        )}
    </div>
));

// =============================================================================
// Track Order — LocalStorage utilities (24 h TTL, device-scoped per store)
// =============================================================================

const TRACK_TTL = 24 * 60 * 60 * 1000;

interface SavedOrderEntry {
    orderId: string;
    orderNumber: string;
    reference: string;
    bundleName: string;
    provider: string;
    total: number;
    paymentType: string;
    savedAt: number;
    lastStatus: string;
}

function trackStorageKey(biz: string) { return `storefront_orders_${biz}`; }

function loadSavedOrders(biz: string): SavedOrderEntry[] {
    try {
        const raw = localStorage.getItem(trackStorageKey(biz));
        if (!raw) return [];
        const all: SavedOrderEntry[] = JSON.parse(raw);
        const cutoff = Date.now() - TRACK_TTL;
        return all.filter(e => {
            if (e.savedAt < cutoff) return false;
            if (e.lastStatus === 'completed' || e.lastStatus === 'failed') {
                return e.savedAt > Date.now() - 60 * 60 * 1000; // keep 1 h after final state
            }
            return true;
        });
    } catch { return []; }
}

function saveOrderEntry(biz: string, entry: SavedOrderEntry) {
    const existing = loadSavedOrders(biz).filter(e => e.orderId !== entry.orderId);
    try { localStorage.setItem(trackStorageKey(biz), JSON.stringify([entry, ...existing])); } catch { /* quota */ }
}

function updateSavedStatus(biz: string, orderId: string, status: string) {
    const updated = loadSavedOrders(biz).map(e => e.orderId === orderId ? { ...e, lastStatus: status } : e);
    try { localStorage.setItem(trackStorageKey(biz), JSON.stringify(updated)); } catch { /* */ }
}

// =============================================================================
// Status config
// =============================================================================

const ORDER_STATUS_CFG: Record<string, { label: string; bg: string; color: string }> = {
    pending_payment: { label: 'Awaiting Payment', bg: '#FEF3C7', color: '#92400E' },
    pending: { label: 'Pending', bg: '#FEF3C7', color: '#92400E' },
    confirmed: { label: 'Confirmed', bg: '#CCFBF1', color: '#134E4A' },
    processing: { label: 'Processing', bg: '#DBEAFE', color: '#1E3A8A' },
    completed: { label: 'Delivered ✓', bg: '#DCFCE7', color: '#14532D' },
    partially_completed: { label: 'Partial', bg: '#FEF9C3', color: '#713F12' },
    failed: { label: 'Failed', bg: '#FEE2E2', color: '#7F1D1D' },
    cancelled: { label: 'Cancelled', bg: '#F3F4F6', color: '#374151' },
};

// =============================================================================
// TrackOrderDrawer — slide-in from right, shows saved orders + manual lookup
// =============================================================================

interface TrackOrderDrawerProps { businessName: string; theme: ThemeConfig; isOpen: boolean; onClose: () => void; }

const TrackOrderDrawer = memo(({ businessName, theme, isOpen, onClose }: TrackOrderDrawerProps) => {
    const [savedOrders, setSavedOrders] = useState<SavedOrderEntry[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [liveData, setLiveData] = useState<Record<string, TrackedOrder>>({});
    const [manualRef, setManualRef] = useState('');
    const [showManual, setShowManual] = useState(false);
    const [trackResult, setTrackResult] = useState<TrackedOrder | null>(null);
    const [trackError, setTrackError] = useState<string | null>(null);
    const [trackLoading, setTrackLoading] = useState(false);

    useEffect(() => { if (isOpen) setSavedOrders(loadSavedOrders(businessName)); }, [isOpen, businessName]);

    const fetchLiveStatus = useCallback(async (entry: SavedOrderEntry) => {
        try {
            const lookupKey = entry.orderNumber || entry.reference;
            const data = await storefrontService.trackOrder(businessName, lookupKey);
            setLiveData(prev => ({ ...prev, [entry.orderId]: data }));
            if (data.status !== entry.lastStatus) {
                updateSavedStatus(businessName, entry.orderId, data.status);
                setSavedOrders(loadSavedOrders(businessName));
            }
        } catch { /* silent */ }
    }, [businessName]);

    const handleExpand = useCallback((entry: SavedOrderEntry) => {
        const next = expandedId === entry.orderId ? null : entry.orderId;
        setExpandedId(next);
        if (next && !liveData[entry.orderId]) fetchLiveStatus(entry);
    }, [expandedId, liveData, fetchLiveStatus]);

    const handleManualTrack = useCallback(async () => {
        const lookup = manualRef.trim().toUpperCase();
        if (!lookup) return;
        setTrackLoading(true); setTrackError(null); setTrackResult(null);
        try {
            const data = await storefrontService.trackOrder(businessName, lookup);
            setTrackResult(data);
        } catch (err) {
            setTrackError(err instanceof Error ? err.message : 'Order not found');
        } finally { setTrackLoading(false); }
    }, [businessName, manualRef]);

    const fmtDate = (iso: string | null) =>
        !iso ? '—' : new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

    const renderTimeline = (order: TrackedOrder) => (
        <div className="pt-3">
            {order.timeline.map((step, idx) => {
                const isLast = idx === order.timeline.length - 1;
                const dotColor = step.failed ? '#EF4444' : step.done ? '#22C55E' : '#D1D5DB';
                return (
                    <div key={idx} className="flex gap-3">
                        <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full border-2 mt-1 shrink-0"
                                style={{ borderColor: dotColor, backgroundColor: (step.done || step.failed) ? dotColor : 'white' }} />
                            {!isLast && (
                                <div className="w-0.5 flex-1 min-h-[22px] mt-0.5"
                                    style={{ backgroundColor: step.done ? '#22C55E' : '#E5E7EB' }} />
                            )}
                        </div>
                        <div className={`${isLast ? 'pb-1' : 'pb-3'}`}>
                            <p className={`text-sm font-semibold leading-tight ${step.failed ? 'text-red-600' : step.done ? 'text-gray-900' : 'text-gray-400'
                                }`}>{step.event}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {step.at ? fmtDate(step.at) : (step.done ? '' : 'Pending…')}
                            </p>
                        </div>
                    </div>
                );
            })}
            {order.items.length > 0 && (
                <div className="mt-2 pt-3 border-t border-gray-100 space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bundle Details</p>
                    {order.items.map((item, i) => (
                        <div key={i} className="flex items-start justify-between text-xs gap-2">
                            <div className="min-w-0">
                                <span className="font-semibold text-gray-800">{item.bundleName}</span>
                                {item.dataVolume > 0 && <span className="text-gray-400 ml-1">· {item.dataVolume}{item.dataUnit}</span>}
                            </div>
                            <div className="text-right shrink-0">
                                <p className="font-mono text-gray-600">{item.customerPhone}</p>
                                <span className={`text-[10px] font-bold ${item.processingStatus === 'completed' ? 'text-green-600' :
                                    item.processingStatus === 'failed' ? 'text-red-500' :
                                        item.processingStatus === 'processing' ? 'text-blue-500' : 'text-amber-500'
                                    }`}>{item.processingStatus}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderOrderCard = (entry: SavedOrderEntry) => {
        const cfg = ORDER_STATUS_CFG[entry.lastStatus] ?? ORDER_STATUS_CFG.pending;
        const live = liveData[entry.orderId];
        const isExpanded = expandedId === entry.orderId;
        return (
            <div key={entry.orderId} className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
                <button onClick={() => handleExpand(entry)}
                    className="w-full p-4 flex items-start justify-between gap-3 text-left hover:bg-gray-50/50 transition">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold text-gray-600 shrink-0">{entry.orderNumber}</span>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0"
                                style={{ backgroundColor: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800 mt-1 truncate">{entry.bundleName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            GH₵{entry.total.toFixed(2)} · {
                                entry.paymentType === 'paystack' ? '⚡ Paystack' :
                                    entry.paymentType === 'mobile_money' ? '📱 MoMo' : '🏦 Bank'
                            } · {new Date(entry.savedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    <FaChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 shrink-0 mt-1 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
                {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50/50">
                        {live
                            ? renderTimeline(live)
                            : <div className="py-5 flex items-center justify-center gap-2 text-sm text-gray-400">
                                <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                                Loading status…
                            </div>
                        }
                    </div>
                )}
            </div>
        );
    };

    const renderTrackResult = (order: TrackedOrder) => {
        const cfg = ORDER_STATUS_CFG[order.status] ?? ORDER_STATUS_CFG.pending;
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-bold text-gray-600">{order.orderNumber}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                </div>
                {renderTimeline(order)}
            </div>
        );
    };

    // Always render drawer so we can animate open/close smoothly. visibility
    // controlled via CSS transitions on opacity and transform.
    return (
        <div className={`fixed inset-0 z-50 flex justify-end ${isOpen ? '' : 'pointer-events-none'}`} onClick={onClose}>
            <div className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'
                }`} />
            <div className={`relative w-full max-w-md h-full flex flex-col bg-white shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'
                }`} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: theme.primary + '18' }}>
                            <FaBoxOpen className="w-4 h-4" style={{ color: theme.primary }} />
                        </div>
                        <div>
                            <h2 className="font-black text-gray-900 text-base leading-tight">My Orders</h2>
                            <p className="text-[11px] text-gray-400 leading-tight">Track your purchases on this device</p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition">
                        <FaXmark className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Order list */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                    {savedOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                                <FaBoxOpen className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="font-bold text-gray-700">No recent orders</p>
                            <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                                Orders placed on this device appear here for 24 hours.
                            </p>
                            <p className="text-xs text-gray-300 mt-3">Have an order number? Use the lookup below.</p>
                        </div>
                    ) : (
                        savedOrders.map(entry => renderOrderCard(entry))
                    )}
                </div>

                {/* Manual lookup */}
                <div className="border-t border-gray-100 bg-gray-50/60 px-4 py-4 shrink-0 space-y-3">
                    <button
                        onClick={() => { setShowManual(m => !m); setTrackResult(null); setTrackError(null); }}
                        className="flex items-center justify-between w-full text-sm font-bold text-gray-600 hover:text-gray-900 transition">
                        <span>Track by order number</span>
                        <FaChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showManual ? 'rotate-180' : ''}`} />
                    </button>
                    {showManual && (
                        <div className="space-y-2">
                            <input
                                type="text"
                                placeholder="Paste order number (e.g. BAGS-1234)…"
                                value={manualRef}
                                onChange={e => setManualRef(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleManualTrack()}
                                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white placeholder:text-gray-300 focus:outline-none focus:ring-2"
                                style={{ '--tw-ring-color': theme.primary + '50' } as React.CSSProperties}
                            />
                            <button
                                onClick={handleManualTrack}
                                disabled={!manualRef.trim() || trackLoading}
                                className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition active:scale-95 disabled:opacity-40"
                                style={{ backgroundColor: theme.primary }}>
                                {trackLoading ? 'Looking up…' : 'Track Order'}
                            </button>
                            {trackError && <p className="text-xs text-red-500 text-center">{trackError}</p>}
                            {trackResult && renderTrackResult(trackResult)}
                        </div>
                    )}
                    <p className="text-[10px] text-gray-300 text-center">
                        Data stored locally on this device · Clears after 24 hours
                    </p>
                </div>
            </div>
        </div>
    );
});

// =============================================================================
// Main Component
// =============================================================================

const PublicStore: React.FC = () => {
    const { businessName } = useParams<{ businessName: string }>();
    const { addToast } = useToast();

    // ── Data ─────────────────────────────────────────────────────────────────────
    const [storeData, setStoreData] = useState<PublicStorefront | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ── UI ───────────────────────────────────────────────────────────────────────
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProvider, setSelectedProvider] = useState<string>('all');

    const [collapsedPackages, setCollapsedPackages] = useState<Set<string>>(new Set());

    // ── Single-item order ─────────────────────────────────────────────────────────
    const [activeOrder, setActiveOrder] = useState<OrderItem | null>(null);  // bundle being ordered
    const [showOrderDialog, setShowOrderDialog] = useState(false);
    const [orderStep, setOrderStep] = useState<OrderStep>('details');

    // Step 1 — Details
    const [orderPhone, setOrderPhone] = useState('');
    const [orderCustomerName, setOrderCustomerName] = useState('');
    const [orderGhanaCard, setOrderGhanaCard] = useState('');

    // Step 2 — Payment info
    const [customerName, setCustomerName] = useState('');
    // email is sourced from the agent's store profile — not collected from customer
    const [paymentType, setPaymentType] = useState<'paystack' | 'mobile_money' | 'bank_transfer'>('paystack');
    const [transactionRef, setTransactionRef] = useState('');

    // Submission
    const [submitting, setSubmitting] = useState(false);
    const [orderError, setOrderError] = useState<string | null>(null);
    const [orderResult, setOrderResult] = useState<PublicOrderResult | null>(null);
    const [paystackStatus, setPaystackStatus] = useState<'idle' | 'success' | 'failed'>('idle');

    // ── Track order drawer ────────────────────────────────────────────────────
    const [showTrackDrawer, setShowTrackDrawer] = useState(false);

    // ==========================================================================
    // Data fetching
    // ==========================================================================

    const fetchStore = useCallback(async () => {
        if (!businessName) return;
        setLoading(true);
        setError(null);
        try {
            const data = await storefrontService.getPublicStorefront(businessName);
            setStoreData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Store not found');
        } finally {
            setLoading(false);
        }
    }, [businessName]);

    useEffect(() => { fetchStore(); }, [fetchStore]);

    useEffect(() => {
        if (storeData) {
            updateStorefrontOGTags(storeData.storefront, storeData.bundles);
        }
        return () => { document.title = 'DirectData'; };
    }, [storeData]);

    // Paystack popup message listener
    useEffect(() => {
        const handler = (e: MessageEvent) => {
            if (e.origin !== window.location.origin) return;
            const d = e.data || {};
            if (d.type !== 'PAYSTACK_STOREFRONT') return;
            if (orderResult?.paystack?.reference && d.reference && d.reference !== orderResult.paystack.reference) return;
            setPaystackStatus(d.status === 'success' ? 'success' : 'failed');
            if (d.status === 'success') setOrderStep('confirmation');
            else setOrderError(d.message || 'Payment verification failed');
        };
        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, [orderResult]);

    // ==========================================================================
    // Derived state (memoised)
    // ==========================================================================

    const theme = useMemo<ThemeConfig>(() => {
        if (!storeData) return DEFAULT_THEME;
        const b = storeData.storefront.branding;
        if (b?.customColors?.primary) {
            return {
                primary: b.customColors.primary,
                secondary: b.customColors.secondary || b.customColors.primary,
                accent: b.customColors.accent || b.customColors.primary + '40',
                bg: b.customColors.primary + '12',
                text: '#FFFFFF',
                gradient: `linear-gradient(135deg, ${b.customColors.primary}, ${b.customColors.secondary || b.customColors.primary})`,
                cardBorder: b.customColors.primary + '30',
                heroBg: b.customColors.primary + '10',
            };
        }
        const key = storeData.storefront.settings?.theme || 'blue';
        return THEMES[key] || DEFAULT_THEME;
    }, [storeData]);

    const branding: StorefrontBranding = storeData?.storefront.branding || {};
    const storeLayout = branding.layout || 'modern';

    const providers = useMemo(() => {
        if (!storeData) return [];
        if (Array.isArray(storeData.providers) && storeData.providers.length > 0) {
            return storeData.providers.map(p => ({ code: p.code, name: p.name, logo: p.logo }));
        }
        const map = new Map<string, string>();
        for (const b of storeData.bundles) {
            const code = b.provider || 'Unknown';
            if (!map.has(code)) map.set(code, b.providerName || code);
        }
        return Array.from(map.entries()).map(([code, name]) => ({ code, name, logo: undefined }));
    }, [storeData]);

    const groupedBundles = useMemo(() => {
        if (!storeData) return new Map<string, Map<string, PublicBundle[]>>();
        let filtered = storeData.bundles;
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(b =>
                b.name.toLowerCase().includes(term) ||
                (b.description?.toLowerCase() || '').includes(term) ||
                (b.providerName?.toLowerCase() || '').includes(term) ||
                (b.packageName?.toLowerCase() || '').includes(term)
            );
        }
        if (selectedProvider !== 'all') filtered = filtered.filter(b => b.provider === selectedProvider);
        const result = new Map<string, Map<string, PublicBundle[]>>();
        for (const bundle of filtered) {
            const provCode = bundle.provider || 'Unknown';
            if (!result.has(provCode)) result.set(provCode, new Map());
            const pkgName = bundle.packageName || 'General';
            const pkgMap = result.get(provCode)!;
            if (!pkgMap.has(pkgName)) pkgMap.set(pkgName, []);
            pkgMap.get(pkgName)!.push(bundle);
        }
        return result;
    }, [storeData, searchTerm, selectedProvider]);

    // Popular bundles: backend list (most-sold) or cheapest fallback
    const popularBundles = useMemo(() => {
        if (storeData?.popularBundles && storeData.popularBundles.length) {
            return storeData.popularBundles.slice(0, 8);
        }
        if (!storeData?.bundles.length) return [];
        return [...storeData.bundles].sort((a, b) => a.price - b.price).slice(0, 8);
    }, [storeData]);

    // Fee estimate for the currently selected bundle (client-side 1.95% inverse)
    const feeEstimate = useMemo(() => {
        if (!activeOrder) return null;
        if (paymentType !== 'paystack') return null;
        return estimateFee(activeOrder.bundle.price);
    }, [activeOrder, paymentType]);

    // Form validation
    const phoneOk = isValidPhone(orderPhone);
    const isAfaBundle = activeOrder?.bundle.provider?.toUpperCase() === 'AFA';
    const afaOk = !isAfaBundle || (orderCustomerName.trim() &&
        (!activeOrder?.bundle.requiresGhanaCard || (orderGhanaCard.trim() && /^[A-Z]{3}-?\d{9}-?\d$/i.test(orderGhanaCard))));
    const step1Valid = phoneOk && Boolean(afaOk);
    const canSubmitOrder = Boolean(customerName.trim() &&
        (paymentType !== 'mobile_money' || transactionRef.trim()));

    // ==========================================================================
    // Handlers
    // ==========================================================================

    const openOrderDialog = useCallback((bundle: PublicBundle) => {
        setActiveOrder({ bundle, customerPhone: '' });
        setOrderPhone('');
        setOrderCustomerName('');
        setOrderGhanaCard('');
        setCustomerName('');
        setTransactionRef('');
        setOrderError(null);
        setOrderResult(null);
        setPaystackStatus('idle');
        setOrderStep('details');
        // Default payment method — skip paystack if not enabled
        const methods = storeData?.storefront.paymentMethods || [];
        const paystackOk = storeData?.storefront.paystackStorefrontEnabled ?? false;
        const hasMomo = methods.some(m => m.type === 'mobile_money');
        const hasPaystack = methods.some(m => m.type === 'paystack');
        if (hasMomo) {
            setPaymentType('mobile_money');
        } else if (hasPaystack && paystackOk) {
            setPaymentType('paystack');
        } else {
            setPaymentType(methods[0]?.type ?? 'mobile_money');
        }
        setShowOrderDialog(true);
    }, [storeData]);

    const closeOrderDialog = useCallback(() => {
        if (orderStep === 'confirmation') {
            // Allow close at confirmation — reset everything
        }
        setShowOrderDialog(false);
        setActiveOrder(null);
    }, [orderStep]);

    const confirmDetails = useCallback(() => {
        if (!step1Valid || !activeOrder) return;
        const isAfa = activeOrder.bundle.provider?.toUpperCase() === 'AFA';
        setActiveOrder(prev => prev ? {
            ...prev,
            customerPhone: normalizePhone(orderPhone),
            customerName: isAfa ? orderCustomerName : undefined,
            ghanaCardNumber: isAfa ? orderGhanaCard : undefined,
        } : null);
        setOrderStep('payment');
    }, [step1Valid, activeOrder, orderPhone, orderCustomerName, orderGhanaCard]);

    const togglePackage = useCallback((key: string) => {
        setCollapsedPackages(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key); else next.add(key);
            return next;
        });
    }, []);

    const submitOrder = useCallback(async () => {
        if (!businessName || !storeData || !canSubmitOrder || !activeOrder) return;
        setSubmitting(true);
        setOrderError(null);
        try {
            const phone = normalizePhone(orderPhone);
            const isAfa = activeOrder.bundle.provider?.toUpperCase() === 'AFA';
            const orderData: PublicOrderData = {
                items: [{ bundleId: activeOrder.bundle._id, quantity: 1, customerPhone: phone }],
                customerInfo: {
                    // For AFA orders use the recipient's full name entered in step 1.
                    // For all other orders use the buyer's name from the checkout step.
                    name: (isAfa && activeOrder.customerName)
                        ? activeOrder.customerName.trim()
                        : customerName.trim(),
                    phone,
                    email: storeData?.storefront.contactInfo?.email || undefined,
                    ...(activeOrder.ghanaCardNumber && { ghanaCardNumber: activeOrder.ghanaCardNumber }),
                },
                paymentMethod: {
                    type: paymentType,
                    // sanitise reference — alphanum, dashes, underscores only
                    reference: transactionRef.trim().replace(/[^a-zA-Z0-9\-_]/g, '') || undefined,
                },
            };

            const result = await storefrontService.createPublicOrder(businessName, orderData);
            const paystackData = result?.paystack as ({ authorizationUrl?: string; authorization_url?: string; reference?: string; } | undefined);
            const paystackUrl = paystackData?.authorizationUrl || paystackData?.authorization_url;
            const reference = paystackData?.reference;

            setOrderResult(result);
            // Save to device localStorage for order tracking (24 h TTL)
            if (businessName) {
                saveOrderEntry(businessName, {
                    orderId: result.orderId,
                    orderNumber: result.orderNumber,
                    // Use the user-facing order number for tracking (BAGS-XXXX) instead of the payment reference.
                    reference: result.orderNumber || reference || result.orderId,
                    bundleName: activeOrder.bundle.name,
                    provider: activeOrder.bundle.provider || '',
                    total: result.total,
                    paymentType,
                    savedAt: Date.now(),
                    lastStatus: result.status,
                });
            }
            setOrderStep('confirmation');

            if (paystackUrl && reference) {
                try {
                    await loadPaystackScript();
                    const { publicKey } = await walletService.getPaystackPublicKey();
                    if (!publicKey) throw new Error('Paystack public key not available');
                    const PaystackPop = (window as any).PaystackPop;
                    if (!PaystackPop) throw new Error('Paystack script failed to load');
                    const handler = PaystackPop.setup({
                        key: publicKey,
                        email: storeData?.storefront.contactInfo?.email || `store-${businessName || 'unknown'}@brytelink.com`,
                        // customer email not required — agent's registered email receives Paystack receipts
                        amount: Math.round((result.total ?? activeOrder.bundle.price) * 100),
                        currency: 'GHS',
                        ref: reference,
                        onClose: () => {
                            addToast('Payment window closed — no charge was made.', 'info', 4000);
                        },
                        callback: (response: { reference: string }) => {
                            storefrontService
                                .verifyPaystackReference(response.reference)
                                .then(() => {
                                    setPaystackStatus('success');
                                    addToast('Payment confirmed! Your order is processing.', 'success', 5000);
                                })
                                .catch(() => {
                                    setPaystackStatus('failed');
                                    addToast('Payment received but verification is pending.', 'warning', 8000);
                                });
                        },
                    });
                    handler.openIframe();
                } catch (err) {
                    // If the Paystack inline widget can't be opened (e.g. script blocked),
                    // we fail gracefully and let the user retry.
                    console.error('[PublicStore] Paystack inline checkout failed', err);
                    addToast(
                        'Unable to open Paystack checkout. Please try again or use a different browser.',
                        'error',
                        8000
                    );
                }
            }
        } catch (err) {
            const errorData = (err as any)?.response?.data;
            const axiosMsg = errorData?.message;
            const firstFieldError = Array.isArray(errorData?.errors) && errorData.errors.length > 0
                ? errorData.errors[0]?.msg || errorData.errors[0]?.message
                : null;
            setOrderError(
                firstFieldError || axiosMsg || (err instanceof Error ? err.message : 'Failed to place order. Please try again.')
            );
        } finally {
            setSubmitting(false);
        }
    }, [businessName, storeData, canSubmitOrder, activeOrder, orderPhone, customerName, paymentType, transactionRef, addToast]);

    // ==========================================================================
    // Conditional renders
    // ==========================================================================

    if (loading) return <StoreSkeleton theme={DEFAULT_THEME} />;
    if (error || !storeData) return <StoreError error={error ?? 'Store not available'} onRetry={fetchStore} />;

    const { storefront } = storeData;

    // ==========================================================================
    // Header renderers (layout-specific)
    // ==========================================================================

    const renderHeader = () => {
        // System-generated tagline when store has none
        const displayTagline = branding.tagline || (() => {
            const name = storefront.businessName || '';
            let hash = 0;
            for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
            const taglines = [
                "Fast data, great prices — always.",
                "Your trusted data partner in Ghana.",
                "Affordable bundles, delivered instantly.",
                "Stay connected without breaking the bank.",
                "Top-up in seconds. Browse all day.",
                "Ghana's most reliable data deals.",
                "Smart data for smart people.",
                "Always online, always affordable.",
                "Power up your connection today.",
                "Bundle up and save more.",
                "Reliable data at unbeatable prices.",
                "Your go-to stop for data bundles.",
                "Connecting Ghana, one bundle at a time.",
                "Fastest top-ups, happiest customers.",
                "Data deals that make sense.",
                "Browse more, pay less.",
                "Your network. Your savings. Our service.",
                "Quality bundles from a trusted source.",
                "Instant top-up, zero hassle.",
                "Because staying connected matters.",
            ];
            return taglines[hash % taglines.length];
        })();

        // System-generated logo (SVG data-URI) when none is set
        const getSystemLogo = () => {
            const letter = (storefront.displayName || storefront.businessName || 'S').charAt(0).toUpperCase();
            const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' style='stop-color:${theme.primary}'/><stop offset='100%' style='stop-color:${theme.secondary}'/></linearGradient></defs><rect width='200' height='200' rx='40' fill='url(#g)'/><text x='100' y='130' font-family='Arial Black,Arial,sans-serif' font-size='110' font-weight='900' fill='white' text-anchor='middle'>${letter}</text></svg>`;
            return `data:image/svg+xml;base64,${btoa(svg)}`;
        };
        const logoSrc = branding.logoUrl || getSystemLogo();
        const displayDescription = storefront.description
            || `Welcome to ${storefront.displayName}! We offer fast, affordable data bundles from all major networks in Ghana.`;
        if (storeLayout === 'minimal') {
            return (
                <header className="pt-10 pb-6 px-4 text-center" style={{ backgroundColor: theme.heroBg }}>
                    <img src={logoSrc} alt={storefront.displayName}
                        className="h-14 w-14 rounded-2xl mx-auto mb-4 object-cover shadow"
                        style={{ border: `2px solid ${theme.primary}40` }}
                    />
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">{storefront.displayName}</h1>
                    <p className="text-sm text-gray-500 mt-1">{displayTagline}</p>
                </header>
            );
        }

        if (storeLayout === 'classic') {
            return (
                <header>
                    {branding.bannerUrl && branding.showBanner !== false && (
                        <div className="h-36 overflow-hidden">
                            <img src={branding.bannerUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div className="px-4 py-5 border-b-4" style={{ backgroundColor: theme.bg, borderColor: theme.primary }}>
                        <div className="max-w-5xl mx-auto flex items-center gap-4">
                            <img src={logoSrc} alt={storefront.displayName}
                                className="h-14 w-14 rounded-xl object-cover border-2 shadow-md shrink-0"
                                style={{ borderColor: theme.primary }}
                            />
                            <div>
                                <h1 className="text-2xl font-black" style={{ color: theme.secondary }}>{storefront.displayName}</h1>
                                <p className="text-sm" style={{ color: theme.secondary + 'aa' }}>{displayTagline}</p>
                            </div>
                        </div>
                    </div>
                </header>
            );
        }

        // Modern (default) — bold gradient hero
        return (
            <header className="relative overflow-hidden" style={{ background: theme.gradient }}>
                {branding.bannerUrl && branding.showBanner !== false && (
                    <img src={branding.bannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-overlay" />
                )}
                {/* Decorative circles */}
                <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />

                <div className="relative px-4 pt-10 pb-12 sm:pt-16 sm:pb-20 text-center">
                    <img src={logoSrc} alt={storefront.displayName}
                        className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl mx-auto mb-4 object-cover border-2 border-white/30 shadow-xl"
                    />
                    <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none">
                        {storefront.displayName}
                    </h1>
                    <p className="mt-3 text-white/70 text-sm sm:text-base max-w-xs mx-auto">{displayTagline}</p>
                    <p className="mt-1 text-white/50 text-xs max-w-sm mx-auto">{displayDescription}</p>
                </div>
            </header>
        );
    };

    // ==========================================================================
    // Toolbar: Search + View Toggle + Provider Carousel
    // ==========================================================================

    const renderToolbar = () => (
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="max-w-5xl mx-auto px-4 py-3 space-y-3">
                {/* Search + view toggle row */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
                        <input
                            type="search"
                            placeholder="Search bundles…"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition placeholder:text-gray-400"
                            style={{ '--tw-ring-color': theme.primary + '40' } as React.CSSProperties}
                        />
                    </div>
                    <button
                        onClick={() => setShowTrackDrawer(true)}
                        title="Track my orders"
                        className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition whitespace-nowrap"
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
                                onClick={() => setSelectedProvider('all')}
                                className="shrink-0 snap-start flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all"
                                style={selectedProvider === 'all'
                                    ? { borderColor: theme.primary, backgroundColor: theme.primary, color: '#fff' }
                                    : { borderColor: '#E5E7EB', backgroundColor: '#fff', color: '#374151' }}
                            >
                                All · {storeData?.bundles.length ?? 0}
                            </button>
                            {providers.map(prov => {
                                const pc = getProviderColors(prov.code);
                                const isActive = selectedProvider === prov.code;
                                const count = groupedBundles.get(prov.code)
                                    ? Array.from(groupedBundles.get(prov.code)!.values()).reduce((s, a) => s + a.length, 0) : 0;
                                return (
                                    <button
                                        key={prov.code}
                                        onClick={() => setSelectedProvider(prov.code)}
                                        className="shrink-0 snap-start flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold border-2 transition-all"
                                        style={isActive
                                            ? { borderColor: pc.primary, backgroundColor: pc.primary, color: '#fff' }
                                            : { borderColor: '#E5E7EB', backgroundColor: '#fff', color: '#374151' }}
                                    >
                                        {getLogoUrl(prov.logo) ? (
                                            <img src={getLogoUrl(prov.logo)} alt={prov.name} className="w-4 h-4 rounded-full object-cover" />
                                        ) : (
                                            <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                                                style={{ backgroundColor: pc.primary }}>
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

    // ==========================================================================
    // Bundle Sections
    // ==========================================================================

    const renderBundleSections = () => {
        if (groupedBundles.size === 0) {
            return <EmptyBundles searchTerm={searchTerm} onClear={() => { setSearchTerm(''); setSelectedProvider('all'); }} />;
        }

        const renderPackageBundles = (bundles: PublicBundle[]) => (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {bundles.map(b => (
                    <BundleCard key={b._id} bundle={b} selected={activeOrder?.bundle._id === b._id} onBuy={openOrderDialog} />
                ))}
            </div>
        );

        // Prefer structured providers data from backend
        if (Array.isArray(storeData.providers) && storeData.providers.length > 0) {
            return (
                <div className="max-w-5xl mx-auto px-4 py-5 space-y-8">
                    {storeData.providers
                        .filter(p => selectedProvider === 'all' || p.code === selectedProvider)
                        .map(prov => {
                            const pc = getProviderColors(prov.code);
                            const filteredPkgs = (prov.packages || []).map(pkg => ({
                                ...pkg,
                                bundles: (pkg.bundles || []).filter(b => {
                                    if (!searchTerm.trim()) return true;
                                    const t = searchTerm.toLowerCase();
                                    return b.name.toLowerCase().includes(t) || (b.description?.toLowerCase() || '').includes(t);
                                }),
                            })).filter(p => p.bundles.length > 0);
                            if (!filteredPkgs.length) return null;
                            const total = filteredPkgs.reduce((s, p) => s + p.bundles.length, 0);
                            return (
                                <section key={prov.code}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow overflow-hidden"
                                            style={{ backgroundColor: pc.primary, color: pc.text }}>
                                            {getLogoUrl(prov.logo)
                                                ? <img src={getLogoUrl(prov.logo)} alt={prov.name} className="w-full h-full object-cover" />
                                                : prov.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-base font-black text-gray-900">{prov.name}</h2>
                                            <p className="text-xs text-gray-400">{total} bundle{total !== 1 ? 's' : ''}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4 border-l-2 pl-4 ml-1" style={{ borderColor: pc.primary + '25' }}>
                                        {filteredPkgs.map(pkg => {
                                            const key = `${prov.code}-${pkg.name}`;
                                            const collapsed = collapsedPackages.has(key);
                                            return (
                                                <div key={key} className="space-y-3">
                                                    <PackageHeader pkgName={pkg.name} count={pkg.bundles.length}
                                                        collapsed={collapsed} onToggle={() => togglePackage(key)} color={pc.primary} />
                                                    {!collapsed && renderPackageBundles(pkg.bundles)}
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
            <div className="max-w-5xl mx-auto px-4 py-5 space-y-8">
                {Array.from(groupedBundles.entries()).map(([provCode, pkgMap]) => {
                    const pc = getProviderColors(provCode);
                    const provName = providers.find(p => p.code === provCode)?.name || provCode;
                    const total = Array.from(pkgMap.values()).reduce((s, a) => s + a.length, 0);
                    return (
                        <section key={provCode}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow"
                                    style={{ backgroundColor: pc.primary, color: pc.text }}>
                                    {provName.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-gray-900">{provName}</h2>
                                    <p className="text-xs text-gray-400">{total} bundle{total !== 1 ? 's' : ''}</p>
                                </div>
                            </div>
                            <div className="space-y-4 border-l-2 pl-4 ml-1" style={{ borderColor: pc.primary + '25' }}>
                                {Array.from(pkgMap.entries()).map(([pkgName, bundles]) => {
                                    const key = `${provCode}-${pkgName}`;
                                    const collapsed = collapsedPackages.has(key);
                                    return (
                                        <div key={key} className="space-y-3">
                                            <PackageHeader pkgName={pkgName} count={bundles.length}
                                                collapsed={collapsed} onToggle={() => togglePackage(key)} color={pc.primary} />
                                            {!collapsed && renderPackageBundles(bundles)}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    );
                })}
            </div>
        );
    };

    // ==========================================================================
    // Order Dialog — 3-step: details → payment → confirmation
    // ==========================================================================

    const renderOrderDialog = () => {
        if (!activeOrder) return null;
        const bundle = activeOrder.bundle;
        const pc = getProviderColors(bundle.provider);
        const isAfa = bundle.provider?.toUpperCase() === 'AFA';
        const hasData = bundle.dataVolume != null && bundle.dataVolume > 0;
        const rawMethods = storeData?.storefront.paymentMethods || [];
        const paystackStorefrontEnabled = storeData?.storefront.paystackStorefrontEnabled ?? false;
        // Only inject Paystack as a fallback option when Paystack is enabled for storefronts
        const paymentMethods = rawMethods.some(m => m.type === 'paystack')
            ? rawMethods.filter(m => m.type !== 'paystack' || paystackStorefrontEnabled)
            : paystackStorefrontEnabled
                ? [{ type: 'paystack' as const, details: {}, isActive: true }, ...rawMethods]
                : rawMethods;
        const selectedPayment = paymentMethods.find(m => m.type === paymentType) || paymentMethods[0];

        // amount shown to customer (with fee if paystack)
        const displayTotal = orderStep === 'confirmation' && orderResult
            ? (orderResult.total ?? bundle.price)
            : feeEstimate?.charge ?? bundle.price;

        // Step indicator (1-based)
        const stepNum = orderStep === 'details' ? 1 : orderStep === 'payment' ? 2 : 3;

        return (
            <Dialog isOpen={showOrderDialog} onClose={closeOrderDialog} size="md">
                {/* ── Step progress bar ── */}
                <div className="px-5 pt-4 pb-0">
                    <div className="flex items-center gap-1.5 mb-4">
                        {[1, 2, 3].map(n => (
                            <React.Fragment key={n}>
                                <div
                                    className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-black transition-all duration-300"
                                    style={n <= stepNum
                                        ? { backgroundColor: theme.primary, color: '#fff' }
                                        : { backgroundColor: '#F3F4F6', color: '#9CA3AF' }}
                                >
                                    {n < stepNum ? <FaCircleCheck className="w-3.5 h-3.5" /> : n}
                                </div>
                                {n < 3 && (
                                    <div className="flex-1 h-1 rounded-full transition-all duration-300"
                                        style={{ backgroundColor: n < stepNum ? theme.primary : '#E5E7EB' }}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                        <span className="ml-2 text-xs text-gray-400 font-semibold whitespace-nowrap">
                            {orderStep === 'details' ? 'Bundle & Number' : orderStep === 'payment' ? 'Your Details' : 'Order Placed'}
                        </span>
                    </div>
                </div>

                {/* ── STEP 1: Details ── */}
                {orderStep === 'details' && (
                    <>
                        <DialogHeader>
                            {/* Bundle preview */}
                            <div className="rounded-2xl p-4" style={{ background: `linear-gradient(135deg, ${pc.primary}20, ${pc.primary}0a)` }}>
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        {hasData && (
                                            <div className="text-4xl font-black leading-none" style={{ color: pc.primary }}>
                                                {bundle.dataVolume}<span className="text-2xl font-bold ml-1 opacity-80">{bundle.dataUnit}</span>
                                            </div>
                                        )}
                                        <h3 className="font-bold text-gray-900 mt-1">{bundle.name}</h3>
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-white text-gray-600 border font-medium shadow-sm">
                                                {fmtValidity(bundle.validity, bundle.validityUnit)}
                                            </span>
                                            <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                                                style={{ backgroundColor: pc.primary + '20', color: pc.primary }}>
                                                {bundle.providerName}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="text-2xl font-extrabold" style={{ color: pc.primary }}>{fmt(bundle.price)}</div>
                                        {paymentType === 'paystack' && feeEstimate && (
                                            <div className="text-[10px] text-gray-400 mt-0.5">~{fmt(feeEstimate.charge)} w/ fees</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </DialogHeader>

                        <DialogBody>
                            <div className="space-y-4">
                                {isAfa && bundle.requiresGhanaCard && (
                                    <Alert status="warning">
                                        <strong>Ghana Card required</strong> — This bundle needs ID verification.
                                    </Alert>
                                )}

                                {/* Phone number */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                                        <FaPhone className="w-3 h-3 opacity-60" />
                                        Recipient Number *
                                    </label>
                                    <Input
                                        type="tel"
                                        placeholder="e.g. 0244 123 456"
                                        value={orderPhone}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOrderPhone(e.target.value)}
                                        autoComplete="tel"
                                    />
                                    {orderPhone && !phoneOk && (
                                        <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                                            <FaTriangleExclamation className="w-3 h-3" />
                                            Enter a valid 10-digit Ghana number (e.g. 0244123456)
                                        </p>
                                    )}
                                    {phoneOk && (
                                        <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
                                            <FaCircleCheck className="w-3 h-3" /> Looks good!
                                        </p>
                                    )}
                                </div>

                                {/* AFA-specific fields */}
                                {isAfa && (
                                    <>
                                        <div>
                                            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                                                <FaIdCard className="w-3 h-3 opacity-60" /> Recipient Full Name *
                                            </label>
                                            <Input
                                                placeholder="Full name as on Ghana Card"
                                                value={orderCustomerName}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOrderCustomerName(e.target.value)}
                                            />
                                        </div>
                                        {bundle.requiresGhanaCard && (
                                            <div>
                                                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                                                    <FaIdCard className="w-3 h-3 opacity-60" /> Ghana Card Number *
                                                </label>
                                                <Input
                                                    placeholder="GHA-XXXXXXXXX-X"
                                                    value={orderGhanaCard}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOrderGhanaCard(e.target.value)}
                                                />
                                                {orderGhanaCard && !/^[A-Z]{3}-?\d{9}-?\d$/i.test(orderGhanaCard) && (
                                                    <p className="text-xs text-rose-500 mt-1">Format: GHA-000000000-0</p>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Fee estimate note for Paystack */}
                                {feeEstimate && (
                                    <div className="rounded-xl p-3 text-xs space-y-1"
                                        style={{ backgroundColor: theme.bg, borderLeft: `3px solid ${theme.primary}` }}>
                                        <p className="font-bold text-gray-700">Price Breakdown (Paystack)</p>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Bundle price</span><span>{fmt(bundle.price)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Processing fee (~1.95%)</span><span>+{fmt(feeEstimate.fee)}</span>
                                        </div>
                                        <div className="flex justify-between font-black pt-1 border-t border-gray-200" style={{ color: theme.primary }}>
                                            <span>You pay</span><span>{fmt(feeEstimate.charge)}</span>
                                        </div>
                                        <p className="text-gray-400 text-[10px] pt-0.5">Exact amount confirmed at payment. Fee covers Paystack processing.</p>
                                    </div>
                                )}
                            </div>
                        </DialogBody>

                        <DialogFooter>
                            <div className="flex gap-2 w-full">
                                <Button variant="secondary" onClick={closeOrderDialog} className="shrink-0">Cancel</Button>
                                <button
                                    disabled={!step1Valid}
                                    onClick={confirmDetails}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-40"
                                    style={{ backgroundColor: theme.primary }}
                                >
                                    Continue to Payment <FaArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </DialogFooter>
                    </>
                )}

                {/* ── STEP 2: Payment ── */}
                {orderStep === 'payment' && (
                    <>
                        <DialogHeader>
                            <div className="space-y-1">
                                <h3 className="font-black text-gray-900 text-lg">Complete your details</h3>
                                <p className="text-sm text-gray-500">
                                    Ordering <strong>{bundle.name}</strong> → <span className="font-mono">{normalizePhone(orderPhone)}</span>
                                </p>
                            </div>
                        </DialogHeader>
                        <DialogBody>
                            <div className="space-y-5">
                                {/* Customer info */}
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                                            Your Full Name *
                                        </label>
                                        <Input
                                            placeholder="e.g. Kwame Asante"
                                            value={customerName}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerName(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Payment method */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                                        How would you like to pay?
                                    </label>
                                    <div className="space-y-2">
                                        {paymentMethods.map(pm => {
                                            const icons: Record<string, string> = { paystack: '⚡', mobile_money: '📱', bank_transfer: '🏦' };
                                            const labels: Record<string, string> = {
                                                paystack: 'Paystack (Card, MoMo & more)',
                                                mobile_money: 'Mobile Money',
                                                bank_transfer: 'Bank Transfer',
                                            };
                                            const descs: Record<string, string> = {
                                                paystack: 'Instant, secure online checkout — powered by Paystack Ghana',
                                                mobile_money: 'Send via MoMo first, then enter the reference number below',
                                                bank_transfer: 'Transfer to our bank account, then notify the store owner',
                                            };
                                            const active = paymentType === pm.type;
                                            return (
                                                <button key={pm.type} onClick={() => setPaymentType(pm.type)}
                                                    className="w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all"
                                                    style={active ? { borderColor: theme.primary, backgroundColor: theme.bg } : { borderColor: '#E5E7EB', backgroundColor: '#fff' }}>
                                                    <span className="text-2xl shrink-0">{icons[pm.type] || '💳'}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-gray-900">{labels[pm.type] || pm.type}</p>
                                                        <p className="text-xs text-gray-400 leading-snug">{descs[pm.type] || ''}</p>
                                                    </div>
                                                    <div className="w-4 h-4 rounded-full border-2 shrink-0 transition-all"
                                                        style={active ? { borderColor: theme.primary, backgroundColor: theme.primary } : { borderColor: '#D1D5DB' }} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Manual payment account details */}
                                {selectedPayment && selectedPayment.type !== 'paystack' && (
                                    <div className="p-4 rounded-xl border-2 border-dashed space-y-2"
                                        style={{ borderColor: theme.primary + '40', backgroundColor: theme.bg }}>
                                        <h4 className="text-xs font-black uppercase tracking-wide flex items-center gap-1.5" style={{ color: theme.secondary }}>
                                            📋 Payment Instructions
                                        </h4>
                                        {Array.isArray(selectedPayment.details?.accounts)
                                            ? (selectedPayment.details.accounts as PaymentAccount[]).map((acc, i) => (
                                                <div key={i} className="text-sm space-y-1">
                                                    {acc.provider && <div className="flex justify-between"><span className="text-gray-500">Provider</span><span className="font-semibold">{acc.provider}</span></div>}
                                                    {acc.number && <div className="flex justify-between"><span className="text-gray-500">Number</span><span className="font-bold text-lg tracking-wider">{acc.number}</span></div>}
                                                    {acc.accountName && <div className="flex justify-between"><span className="text-gray-500">Account Name</span><span className="font-semibold">{acc.accountName}</span></div>}
                                                </div>
                                            ))
                                            : Object.entries(selectedPayment.details || {}).map(([k, v]) => {
                                                if (v == null || typeof v === 'object') return null;
                                                return (
                                                    <div key={k} className="flex justify-between text-sm">
                                                        <span className="text-gray-500 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                        <span className="font-semibold">{String(v)}</span>
                                                    </div>
                                                );
                                            })
                                        }
                                        <div className="pt-2 border-t border-dashed" style={{ borderColor: theme.primary + '30' }}>
                                            <p className="font-black text-base" style={{ color: theme.secondary }}>
                                                Send exactly: {fmt(bundle.price)}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                ✅ Send the exact amount — do not round up or down
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* MoMo transaction ref input */}
                                {paymentType === 'mobile_money' && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                                            MoMo Transaction Reference *
                                        </label>
                                        <Input
                                            placeholder="e.g. S2304..."
                                            value={transactionRef}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTransactionRef(e.target.value)}
                                        />
                                        <p className="text-xs text-gray-400 mt-1">
                                            💡 Make the payment first, then paste your reference ID here. You'll get it in your MoMo SMS.
                                        </p>
                                    </div>
                                )}

                                {/* Order summary */}
                                <div className="rounded-xl p-3 space-y-1.5"
                                    style={{ backgroundColor: theme.bg }}>
                                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Order Summary</p>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>{bundle.name}</span>
                                        <span>{fmt(bundle.price)}</span>
                                    </div>
                                    {feeEstimate && paymentType === 'paystack' && (
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>Paystack processing fee (~1.95%)</span>
                                            <span>+{fmt(feeEstimate.fee)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-black pt-2 border-t border-gray-200 text-base"
                                        style={{ color: theme.primary }}>
                                        <span>Total to Pay</span>
                                        <span>{fmt(feeEstimate && paymentType === 'paystack' ? feeEstimate.charge : bundle.price)}</span>
                                    </div>
                                </div>

                                {orderError && (
                                    <Alert status="error">
                                        <strong>Order failed:</strong> {orderError}
                                    </Alert>
                                )}
                            </div>
                        </DialogBody>
                        <DialogFooter>
                            <div className="flex gap-2 w-full">
                                <Button variant="secondary" onClick={() => setOrderStep('details')}>
                                    <FaArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
                                </Button>
                                <button
                                    disabled={!canSubmitOrder || submitting}
                                    onClick={submitOrder}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-50"
                                    style={{ backgroundColor: theme.primary }}
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Placing Order…
                                        </>
                                    ) : (
                                        <>
                                            Place Order · {fmt(displayTotal)}
                                            <FaBolt className="w-3.5 h-3.5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </DialogFooter>
                    </>
                )}

                {/* ── STEP 3: Confirmation ── */}
                {orderStep === 'confirmation' && orderResult && (
                    <>
                        <DialogHeader>
                            <div className="flex items-center gap-2">
                                <FaCircleCheck className="w-6 h-6 text-emerald-500" />
                                <h3 className="font-black text-gray-900 text-lg">Order Placed! 🎉</h3>
                            </div>
                        </DialogHeader>
                        <DialogBody>
                            <div className="space-y-5 py-1">
                                {/* Success icon */}
                                <div className="flex flex-col items-center text-center pb-2">
                                    <div className="w-20 h-20 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mb-3">
                                        <FaCircleCheck className="w-10 h-10 text-emerald-500" />
                                    </div>
                                    <p className="text-xl font-black text-gray-900">Thank you!</p>
                                    <p className="text-sm text-gray-500 mt-0.5">Order #{orderResult.orderNumber}</p>
                                    <button
                                        onClick={() => { closeOrderDialog(); setShowTrackDrawer(true); }}
                                        className="text-xs font-bold mt-1.5 underline underline-offset-2"
                                        style={{ color: theme.primary }}
                                    >
                                        Track this order →
                                    </button>
                                </div>

                                {/* Order breakdown */}
                                <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Bundle</span>
                                        <span className="font-semibold">{bundle.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">For number</span>
                                        <span className="font-mono font-semibold">{normalizePhone(orderPhone)}</span>
                                    </div>
                                    {/* Show actual fee breakdown from API response if available */}
                                    {(orderResult as any).subtotal && (orderResult as any).subtotal !== orderResult.total && (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Bundle price</span>
                                                <span>{fmt((orderResult as any).subtotal)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Processing fee</span>
                                                <span>+{fmt(orderResult.total - (orderResult as any).subtotal)}</span>
                                            </div>
                                        </>
                                    )}
                                    <div className="flex justify-between font-black text-lg pt-2 border-t border-gray-200">
                                        <span>Total Charged</span>
                                        <span style={{ color: theme.primary }}>{fmt(orderResult.total)}</span>
                                    </div>
                                </div>

                                {/* Paystack payment status */}
                                {orderResult.paystack?.authorizationUrl ? (
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 font-semibold">Payment Status</span>
                                            {paystackStatus === 'success' ? (
                                                <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-bold">
                                                    ✓ Payment Confirmed
                                                </span>
                                            ) : paystackStatus === 'failed' ? (
                                                <span className="text-xs bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full font-bold">
                                                    ✕ Failed
                                                </span>
                                            ) : (
                                                <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-bold animate-pulse">
                                                    ⏳ Awaiting Payment
                                                </span>
                                            )}
                                        </div>
                                        {paystackStatus !== 'success' && (
                                            <a
                                                href={orderResult.paystack.authorizationUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-white"
                                                style={{ backgroundColor: theme.primary }}
                                            >
                                                <FaBolt className="w-4 h-4" /> Continue to Paystack Payment
                                            </a>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-center p-3 rounded-xl bg-amber-50 border border-amber-200">
                                        <span className="text-sm text-amber-800 font-semibold">Awaiting manual verification</span>
                                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">Pending</span>
                                    </div>
                                )}

                                {/* What's next */}
                                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                                    <h4 className="text-xs font-black text-blue-900 uppercase tracking-wide mb-2.5">What Happens Next</h4>
                                    <ol className="text-xs text-blue-800 space-y-2">
                                        {orderResult.paystack?.authorizationUrl ? (
                                            <>
                                                <li className="flex items-start gap-2">
                                                    <span className="w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-bold shrink-0 mt-0.5">1</span>
                                                    Complete payment in the Paystack window that opened.
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-bold shrink-0 mt-0.5">2</span>
                                                    Your order is automatically processed upon confirmation.
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-bold shrink-0 mt-0.5">3</span>
                                                    Bundle is sent to <strong>{normalizePhone(orderPhone)}</strong> within minutes.
                                                </li>
                                            </>
                                        ) : (
                                            <>
                                                <li className="flex items-start gap-2">
                                                    <span className="w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-bold shrink-0 mt-0.5">1</span>
                                                    The store owner reviews your payment reference.
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-bold shrink-0 mt-0.5">2</span>
                                                    They approve and process the bundle order.
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-bold shrink-0 mt-0.5">3</span>
                                                    Bundle is delivered to <strong>{normalizePhone(orderPhone)}</strong>.
                                                </li>
                                            </>
                                        )}
                                    </ol>
                                </div>

                                {/* WhatsApp contact */}
                                {storeData?.storefront.contactInfo?.whatsapp && (
                                    <a
                                        href={`https://wa.me/${normalizeWhatsappNumber(storeData.storefront.contactInfo.whatsapp)}?text=${encodeURIComponent(`Hi, I just placed order #${orderResult.orderNumber} for ${bundle.name} on ${normalizePhone(orderPhone)}`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#25D366] text-white rounded-xl font-bold text-sm hover:bg-[#20BD5C] transition active:scale-95"
                                    >
                                        <FaWhatsapp className="w-4 h-4" /> Message store on WhatsApp
                                    </a>
                                )}
                            </div>
                        </DialogBody>
                        <DialogFooter>
                            <button
                                onClick={closeOrderDialog}
                                className="w-full py-3 rounded-xl font-bold text-white active:scale-95 transition"
                                style={{ backgroundColor: theme.primary }}
                            >
                                Done — Browse More Bundles
                            </button>
                        </DialogFooter>
                    </>
                )}
            </Dialog>
        );
    };

    // ==========================================================================
    // Footer
    // ==========================================================================

    const renderFooter = () => {
        const social = branding.socialLinks;
        const hasSocial = social && Object.values(social).some(Boolean);
        const hasContact = storefront.contactInfo &&
            (storefront.contactInfo.phone || storefront.contactInfo.email || storefront.contactInfo.whatsapp);

        // If the store has no contact/socials and the footer text is truly empty, hide the footer.
        const footerText = (branding.footerText || '').trim() || getSystemFooterText(storefront.businessName);
        if (!hasSocial && !hasContact && !footerText) return null;

        return (
            <footer className="border-t border-gray-100 bg-gray-50 px-4 py-8">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-3 sm:space-y-0 text-center sm:text-left">
                        {hasSocial && (
                            <div className="flex items-center justify-center sm:justify-start gap-5">
                                {social?.facebook && <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition"><FaFacebook className="w-5 h-5" /></a>}
                                {social?.twitter && <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-sky-500 transition"><FaTwitter className="w-5 h-5" /></a>}
                                {social?.instagram && <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-600 transition"><FaInstagram className="w-5 h-5" /></a>}
                            </div>
                        )}
                        {hasContact && (
                            <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-gray-500">
                                {storefront.contactInfo?.phone && (
                                    <a href={`tel:${storefront.contactInfo.phone}`} className="flex items-center gap-1.5 hover:text-gray-800 transition">
                                        <FaPhone className="w-3 h-3" />{storefront.contactInfo.phone}
                                    </a>
                                )}
                                {storefront.contactInfo?.whatsapp && (
                                    <a href={`https://wa.me/${normalizeWhatsappNumber(storefront.contactInfo.whatsapp)}`} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-[#25D366] hover:text-[#20BD5C] transition font-semibold">
                                        <FaWhatsapp className="w-4 h-4" />WhatsApp
                                    </a>
                                )}
                                {storefront.contactInfo?.email && (
                                    <a href={`mailto:${storefront.contactInfo.email}`} className="flex items-center gap-1.5 hover:text-gray-800 transition">
                                        <FaEnvelope className="w-3 h-3" />{storefront.contactInfo.email}
                                    </a>
                                )}
                            </div>
                        )}
                        <p className="text-xs text-gray-400">
                            {footerText}
                            <span className="mx-2 text-gray-300">|</span>
                            <span className="font-medium text-gray-600">{storefront.businessName}</span>
                        </p>
                    </div>
                    <p className="text-xs text-gray-300 text-center sm:text-right">
                        Made with love by <a href="https://quayedna-portfolio.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">DNA Studios</a>
                    </p>
                </div>
            </footer>
        );
    };

    // ==========================================================================
    // Root render
    // ==========================================================================

    return (
        <div className="min-h-screen bg-gray-50">
            <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

            {renderHeader()}
            {renderToolbar()}

            <main>
                {/* Featured bundles section — Trending + Best Value tabs */}
                {(popularBundles.length > 0 || storeData.bundles.length > 0) && (
                    <div className="max-w-5xl mx-auto">
                        <FeaturedSection
                            theme={theme}
                            trendingBundles={popularBundles}
                            allBundles={storeData.bundles}
                            onSelect={openOrderDialog}
                        />
                    </div>
                )}

                {renderBundleSections()}
            </main>

            {renderFooter()}

            {/* Single-item order dialog */}
            {renderOrderDialog()}

            {/* Track Order Drawer */}
            {businessName && (
                <TrackOrderDrawer
                    businessName={businessName}
                    theme={theme}
                    isOpen={showTrackDrawer}
                    onClose={() => setShowTrackDrawer(false)}
                />
            )}
        </div>
    );
};

export { PublicStore as PublicStorePage };
export default PublicStore;