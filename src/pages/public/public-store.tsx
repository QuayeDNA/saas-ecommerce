/* eslint-disable @typescript-eslint/no-explicit-any */
// =============================================================================
// PublicStore — Customer-facing storefront for browsing & ordering data bundles
// Mobile-first, theme-aware, performance-optimised
// =============================================================================

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
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
    PublicOrderResult, StorefrontBranding,
} from '../../services/storefront.service';
import {
    FaCartShopping, FaPlus, FaTrashCan, FaCircleCheck,
    FaTriangleExclamation, FaIdCard, FaArrowRight, FaArrowLeft,
    FaPhone, FaEnvelope, FaStore, FaGrip, FaList,
    FaChevronDown, FaWifi, FaMagnifyingGlass,
    FaFire, FaBolt,
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



interface CartItem {
    bundle: PublicBundle;
    customerPhone: string;
    customerName?: string;
    ghanaCardNumber?: string;
}

type ViewMode = 'grid' | 'list';
type CheckoutStep = 'review' | 'payment' | 'confirmation';

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

// Placeholder popular bundles (replace with API data when available)
const POPULAR_BUNDLE_PLACEHOLDERS = [
    { label: '1GB', sub: 'Daily · 24hrs', badge: '🔥 Top Pick' },
    { label: '5GB', sub: 'Weekly · 7 days', badge: '⚡ Fast Seller' },
    { label: '10GB', sub: 'Monthly · 30 days', badge: '💎 Best Value' },
    { label: '2GB', sub: 'Night · 12hrs', badge: '🌙 Night Owl' },
    { label: '20GB', sub: 'Monthly · 30 days', badge: '🚀 Power User' },
];

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

const isValidPhone = (p: string) => /^0\d{9}$/.test(normalizePhone(p));
const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
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

/** Compact "in-cart" pill indicator */
const InCartBadge = memo(() => (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
        <FaCircleCheck className="w-2.5 h-2.5" /> In Cart
    </span>
));

/** Animated quantity badge for cart */
const CartCountBadge = memo(({ count }: { count: number }) => (
    <span
        className="absolute -top-2 -right-2 min-w-[20px] h-5 rounded-full text-xs font-bold text-white flex items-center justify-center px-1 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}
    >
        {count > 99 ? '99+' : count}
    </span>
));

// =============================================================================
// Popular Bundles Flashcard Carousel
// =============================================================================

const PopularCarousel = memo(({
    theme,
    bundles,
    onSelect,
}: { theme: ThemeConfig; bundles: PublicBundle[]; onSelect?: (b: PublicBundle) => void }) => {
    // Use real bundles if available, otherwise placeholders
    const items = bundles.length > 0 ? bundles.slice(0, 8) : null;

    return (
        <div className="py-4">
            <div className="flex items-center gap-2 px-4 mb-3">
                <FaFire className="w-4 h-4" style={{ color: theme.primary }} />
                <h2 className="text-sm font-bold text-gray-800 tracking-wide uppercase">Popular Right Now</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto px-4 pb-3 hide-scrollbar snap-x snap-mandatory">
                {items
                    ? items.map((b) => {
                        const pc = getProviderColors(b.provider);
                        return (
                            <div
                                key={b._id}
                                onClick={() => onSelect?.(b)}
                                className="shrink-0 snap-start w-36 rounded-2xl overflow-hidden shadow-md cursor-pointer active:scale-95 transition-transform duration-150"
                                style={{ background: `linear-gradient(145deg, ${pc.primary}ee, ${pc.primary}99)` }}
                            >
                                <div className="p-3 text-white">
                                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">{b.providerName}</div>
                                    <div className="text-2xl font-black mt-1 leading-none">
                                        {b.dataVolume}{b.dataUnit}
                                    </div>
                                    <div className="text-[10px] opacity-80 mt-1">{fmtValidity(b.validity, b.validityUnit)}</div>
                                    <div className="mt-3 flex items-end justify-between">
                                        <span className="text-sm font-extrabold">{fmt(b.price)}</span>
                                    </div>
                                    <div className="mt-2 text-[9px] bg-white/20 rounded-full px-2 py-0.5 inline-block">
                                        🔥 Popular
                                    </div>
                                </div>
                            </div>
                        );
                    })
                    : POPULAR_BUNDLE_PLACEHOLDERS.map((p, i) => (
                        <div
                            key={i}
                            className="shrink-0 snap-start w-36 rounded-2xl overflow-hidden shadow-md"
                            style={{
                                background: `linear-gradient(145deg, ${theme.primary}dd, ${theme.secondary}cc)`,
                                opacity: 0.85,
                            }}
                        >
                            <div className="p-3 text-white">
                                <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Data Bundle</div>
                                <div className="text-2xl font-black mt-1 leading-none">{p.label}</div>
                                <div className="text-[10px] opacity-80 mt-1">{p.sub}</div>
                                <div className="mt-3">
                                    <div className="h-4 bg-white/20 rounded w-16 animate-pulse" />
                                </div>
                                <div className="mt-2 text-[9px] bg-white/20 rounded-full px-2 py-0.5 inline-block">
                                    {p.badge}
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
});

// =============================================================================
// Bundle Card — Grid View
// =============================================================================

const BundleCard = memo(({ bundle, inCart, onAdd }: {
    bundle: PublicBundle; inCart: boolean; onAdd: (b: PublicBundle) => void;
}) => {
    const pc = getProviderColors(bundle.provider);
    const isAfa = bundle.provider?.toUpperCase() === 'AFA';
    const hasData = bundle.dataVolume != null && bundle.dataVolume > 0;

    return (
        <article className="group relative rounded-2xl bg-white border shadow-sm hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col"
            style={{ borderColor: inCart ? pc.primary + '60' : '#F1F5F9' }}
        >
            {/* Top provider accent bar */}
            <div className="h-1 shrink-0" style={{ backgroundColor: pc.primary }} />

            <div className="p-4 flex flex-col flex-1">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                        {hasData && (
                            <div className="text-3xl font-black leading-none tracking-tight"
                                style={{ color: pc.primary }}>
                                {bundle.dataVolume}<span className="text-lg font-bold ml-0.5 opacity-80">{bundle.dataUnit}</span>
                            </div>
                        )}
                        <h3 className="text-sm font-semibold text-gray-800 mt-1 leading-snug line-clamp-2">{bundle.name}</h3>
                    </div>
                    {inCart && (
                        <div className="shrink-0 mt-0.5">
                            <InCartBadge />
                        </div>
                    )}
                </div>

                {/* Validity + AFA badge */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                        {fmtValidity(bundle.validity, bundle.validityUnit)}
                    </span>
                    {isAfa && bundle.requiresGhanaCard && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium flex items-center gap-1">
                            <FaIdCard className="w-2.5 h-2.5" /> Ghana Card
                        </span>
                    )}
                </div>

                {bundle.description && (
                    <p className="text-xs text-gray-400 line-clamp-2 mb-3 flex-1">{bundle.description}</p>
                )}

                {/* Price + CTA */}
                <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-50">
                    <span className="text-lg font-extrabold" style={{ color: pc.primary }}>{fmt(bundle.price)}</span>
                    <button
                        onClick={() => onAdd(bundle)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold text-white transition-all duration-150 active:scale-95 shadow-sm hover:shadow"
                        style={{ backgroundColor: pc.primary }}
                        aria-label={`Add ${bundle.name} to cart`}
                    >
                        <FaPlus className="w-3 h-3" /> Add
                    </button>
                </div>
            </div>
        </article>
    );
});

// =============================================================================
// Bundle Row — List View
// =============================================================================

const BundleRow = memo(({ bundle, inCart, onAdd }: {
    bundle: PublicBundle; inCart: boolean; onAdd: (b: PublicBundle) => void;
}) => {
    const pc = getProviderColors(bundle.provider);
    const hasData = bundle.dataVolume != null && bundle.dataVolume > 0;

    return (
        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border transition-all hover:shadow-sm active:scale-[0.99]"
            style={{ borderColor: inCart ? pc.primary + '50' : '#F1F5F9' }}
        >
            <div className="shrink-0 w-1 h-10 rounded-full" style={{ backgroundColor: pc.primary }} />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    {hasData && (
                        <span className="font-extrabold text-base leading-none" style={{ color: pc.primary }}>
                            {bundle.dataVolume}{bundle.dataUnit}
                        </span>
                    )}
                    <span className="font-semibold text-sm text-gray-800 truncate">{bundle.name}</span>
                    {inCart && <InCartBadge />}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{fmtValidity(bundle.validity, bundle.validityUnit)}</div>
            </div>
            <div className="shrink-0 text-right">
                <div className="font-extrabold text-base" style={{ color: pc.primary }}>{fmt(bundle.price)}</div>
            </div>
            <button
                onClick={() => onAdd(bundle)}
                className="shrink-0 p-2 rounded-xl text-white transition-all active:scale-90"
                style={{ backgroundColor: pc.primary }}
                aria-label={`Add ${bundle.name}`}
            >
                <FaPlus className="w-3.5 h-3.5" />
            </button>
        </div>
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
            <p className="text-gray-400 font-medium">No bundles available right now</p>
        )}
    </div>
));

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
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [collapsedPackages, setCollapsedPackages] = useState<Set<string>>(new Set());

    // ── Cart ─────────────────────────────────────────────────────────────────────
    const [cart, setCart] = useState<CartItem[]>([]);

    // ── Add-to-cart dialog ───────────────────────────────────────────────────────
    const [addBundle, setAddBundle] = useState<PublicBundle | null>(null);
    const [addPhone, setAddPhone] = useState('');
    const [addCustomerName, setAddCustomerName] = useState('');
    const [addGhanaCardNumber, setAddGhanaCardNumber] = useState('');

    // ── Checkout ─────────────────────────────────────────────────────────────────
    const [showCheckout, setShowCheckout] = useState(false);
    const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('review');
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [paymentType, setPaymentType] = useState<'paystack' | 'mobile_money' | 'bank_transfer'>('paystack');
    const [transactionRef, setTransactionRef] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [orderError, setOrderError] = useState<string | null>(null);
    const [orderResult, setOrderResult] = useState<PublicOrderResult | null>(null);
    const [paystackStatus, setPaystackStatus] = useState<'idle' | 'success' | 'failed'>('idle');

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
        if (storeData) document.title = `${storeData.storefront.displayName} | Data Bundles`;
        return () => { document.title = 'DataHub'; };
    }, [storeData]);

    // Paystack popup message listener
    useEffect(() => {
        const handler = (e: MessageEvent) => {
            if (e.origin !== window.location.origin) return;
            const d = e.data || {};
            if (d.type !== 'PAYSTACK_STOREFRONT') return;
            if (orderResult?.paystack?.reference && d.reference && d.reference !== orderResult.paystack.reference) return;
            setPaystackStatus(d.status === 'success' ? 'success' : 'failed');
            if (d.status === 'success') setCheckoutStep('confirmation');
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

    // Top 8 bundles sorted by some heuristic (price asc for now; swap for purchase_count when API provides it)
    const popularBundles = useMemo(() => {
        if (!storeData?.bundles.length) return [];
        return [...storeData.bundles].sort((a, b) => a.price - b.price).slice(0, 8);
    }, [storeData]);

    const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.bundle.price, 0), [cart]);
    const cartCount = cart.length;
    const cartSet = useMemo(() => new Set(cart.map(i => i.bundle._id)), [cart]);

    const requiresEmail = paymentType === 'paystack';
    const isEmailOkay = requiresEmail ? isValidEmail(customerEmail) : (!customerEmail || isValidEmail(customerEmail));
    const canSubmitOrder = Boolean(
        customerName.trim() && isEmailOkay &&
        (paymentType !== 'mobile_money' || transactionRef.trim())
    );

    // ==========================================================================
    // Handlers (stable refs via useCallback)
    // ==========================================================================

    const openAddDialog = useCallback((bundle: PublicBundle) => {
        setAddBundle(bundle);
        setAddPhone('');
        setAddCustomerName('');
        setAddGhanaCardNumber('');
    }, []);

    const closeAddDialog = useCallback(() => setAddBundle(null), []);

    const confirmAddToCart = useCallback(() => {
        if (!addBundle || !isValidPhone(addPhone)) return;
        const isAfa = addBundle.provider?.toUpperCase() === 'AFA';
        if (isAfa && addBundle.requiresGhanaCard && (!addCustomerName.trim() || !addGhanaCardNumber.trim())) return;
        setCart(prev => [...prev, {
            bundle: addBundle,
            customerPhone: normalizePhone(addPhone),
            customerName: isAfa ? addCustomerName : undefined,
            ghanaCardNumber: isAfa ? addGhanaCardNumber : undefined,
        }]);
        setAddBundle(null);
    }, [addBundle, addPhone, addCustomerName, addGhanaCardNumber]);

    const removeFromCart = useCallback((idx: number) => {
        setCart(prev => prev.filter((_, i) => i !== idx));
    }, []);

    const togglePackage = useCallback((key: string) => {
        setCollapsedPackages(prev => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    }, []);

    const openCheckout = useCallback(() => {
        if (!cart.length) return;
        const afaItem = cart.find(i => i.bundle.provider?.toUpperCase() === 'AFA' && i.customerName);
        if (afaItem) setCustomerName(afaItem.customerName || '');
        setCheckoutStep('review');
        setOrderError(null);
        setOrderResult(null);
        setPaystackStatus('idle');
        setShowCheckout(true);
        const methods = storeData?.storefront.paymentMethods || [];
        if (methods.some(m => m.type === 'mobile_money')) setPaymentType('mobile_money');
        else setPaymentType('paystack');
    }, [cart, storeData]);

    const resetCheckout = useCallback(() => {
        setShowCheckout(false);
        setCheckoutStep('review');
        setCustomerName('');
        setCustomerEmail('');
        setTransactionRef('');
        setOrderError(null);
        setOrderResult(null);
        setPaystackStatus('idle');
    }, []);

    const submitOrder = useCallback(async () => {
        if (!businessName || !storeData || !canSubmitOrder) return;
        setSubmitting(true);
        setOrderError(null);
        // keep a popup reference around for fallback only
        let popup: Window | null = null;
        try {
            const afaGhanaCard = cart.find(i =>
                i.bundle.provider?.toUpperCase() === 'AFA' && i.bundle.requiresGhanaCard && i.ghanaCardNumber
            )?.ghanaCardNumber;

            const orderData: PublicOrderData = {
                items: cart.map(i => ({ bundleId: i.bundle._id, quantity: 1, customerPhone: i.customerPhone })),
                customerInfo: {
                    name: customerName.trim(),
                    phone: cart[0]?.customerPhone || '',
                    email: customerEmail.trim() || undefined,
                    ...(afaGhanaCard && { ghanaCardNumber: afaGhanaCard }),
                },
                paymentMethod: {
                    type: paymentType,
                    reference: transactionRef.trim() || undefined,
                },
            };

            const result = await storefrontService.createPublicOrder(businessName, orderData);
            const paystackData = result?.paystack as ({ authorizationUrl?: string; authorization_url?: string; reference?: string; } | undefined);
            const paystackUrl = paystackData?.authorizationUrl || paystackData?.authorization_url;
            const reference = paystackData?.reference;

            setOrderResult(result);
            setCheckoutStep('confirmation');
            setCart([]);

            if (paystackUrl && reference) {
                // attempt inline checkout
                try {
                    await loadPaystackScript();
                    const { publicKey } = await walletService.getPaystackPublicKey();
                    if (!publicKey) throw new Error('Paystack public key not available');

                    const PaystackPop = (window as any).PaystackPop;
                    if (!PaystackPop) throw new Error('Paystack script failed to load');
                    const handler = PaystackPop.setup({
                        key: publicKey,
                        email: customerEmail || undefined,
                        amount: Math.round(cartTotal * 100),
                        currency: 'GHS',
                        ref: reference,
                        onClose: () => {
                            addToast('Payment window closed. No charge was made.', 'info', 4000);
                        },
                        callback: (response: { reference: string }) => {
                            walletService
                                .verifyPaystackReference(response.reference)
                                .then(() => {
                                    setPaystackStatus('success');
                                    addToast('Payment successful! Order is processing.', 'success', 5000);
                                })
                                .catch(() => {
                                    setPaystackStatus('failed');
                                    addToast('Payment received but verification pending.', 'warning', 8000);
                                });
                        },
                    });
                    handler.openIframe();
                } catch {
                    // fallback to new tab if inline fails
                    popup = window.open('', '_blank');
                    if (popup) {
                        try { popup.location.href = paystackUrl; } catch {
                            (popup as any).close();
                            window.open(paystackUrl, '_blank');
                        }
                    } else {
                        window.open(paystackUrl, '_blank');
                    }
                }
            }
        } catch (err) {
            setOrderError(err instanceof Error ? err.message : 'Failed to place order. Please try again.');
            if (popup && !(popup as any).closed) {
                try { (popup as any).close(); } catch { /* */ }
            }
        } finally {
            setSubmitting(false);
        }
    }, [businessName, storeData, canSubmitOrder, cart, customerName, customerEmail, paymentType, transactionRef, cartTotal, addToast]);

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
        if (storeLayout === 'minimal') {
            return (
                <header className="pt-10 pb-6 px-4 text-center" style={{ backgroundColor: theme.heroBg }}>
                    {branding.logoUrl && (
                        <img src={branding.logoUrl} alt={storefront.displayName}
                            className="h-14 w-14 rounded-2xl mx-auto mb-4 object-cover shadow"
                            style={{ border: `2px solid ${theme.primary}40` }}
                        />
                    )}
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">{storefront.displayName}</h1>
                    {branding.tagline && <p className="text-sm text-gray-500 mt-1">{branding.tagline}</p>}
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
                            {branding.logoUrl && (
                                <img src={branding.logoUrl} alt={storefront.displayName}
                                    className="h-14 w-14 rounded-xl object-cover border-2 shadow-md"
                                    style={{ borderColor: theme.primary }}
                                />
                            )}
                            <div>
                                <h1 className="text-2xl font-black" style={{ color: theme.secondary }}>{storefront.displayName}</h1>
                                {branding.tagline && <p className="text-sm" style={{ color: theme.secondary + 'aa' }}>{branding.tagline}</p>}
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
                    {branding.logoUrl && (
                        <img src={branding.logoUrl} alt={storefront.displayName}
                            className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl mx-auto mb-4 object-cover border-2 border-white/30 shadow-xl"
                        />
                    )}
                    <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none">
                        {storefront.displayName}
                    </h1>
                    {branding.tagline && (
                        <p className="mt-3 text-white/70 text-sm sm:text-base max-w-xs mx-auto">{branding.tagline}</p>
                    )}
                    {storefront.description && (
                        <p className="mt-1 text-white/50 text-xs max-w-sm mx-auto">{storefront.description}</p>
                    )}
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
                    <div className="flex rounded-xl border border-gray-200 overflow-hidden shrink-0">
                        {(['grid', 'list'] as ViewMode[]).map(mode => (
                            <button key={mode} onClick={() => setViewMode(mode)}
                                className="p-2.5 transition-colors"
                                style={viewMode === mode ? { backgroundColor: theme.primary, color: '#fff' } : { backgroundColor: '#fff', color: '#6B7280' }}
                                title={`${mode} view`}
                            >
                                {mode === 'grid' ? <FaGrip className="w-4 h-4" /> : <FaList className="w-4 h-4" />}
                            </button>
                        ))}
                    </div>
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

        const renderPackageBundles = (bundles: PublicBundle[]) =>
            viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {bundles.map(b => (
                        <BundleCard key={b._id} bundle={b} inCart={cartSet.has(b._id)} onAdd={openAddDialog} />
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {bundles.map(b => (
                        <BundleRow key={b._id} bundle={b} inCart={cartSet.has(b._id)} onAdd={openAddDialog} />
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
    // Cart Bar (sticky bottom)
    // ==========================================================================

    const renderCartBar = () => {
        if (!cartCount || showCheckout) return null;
        return (
            <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-4 pointer-events-none">
                <div className="max-w-5xl mx-auto pointer-events-auto">
                    <div className="bg-gray-900 rounded-2xl px-4 py-3 flex items-center justify-between gap-4 shadow-2xl border border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: theme.primary }}>
                                    <FaCartShopping className="w-4 h-4 text-white" />
                                </div>
                                <CartCountBadge count={cartCount} />
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">{fmt(cartTotal)}</p>
                                <p className="text-white/50 text-xs">{cartCount} item{cartCount !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                        <button
                            onClick={openCheckout}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95 shadow-lg"
                            style={{ backgroundColor: theme.primary }}
                        >
                            Checkout <FaArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ==========================================================================
    // Add-to-Cart Dialog
    // ==========================================================================

    const renderAddDialog = () => {
        if (!addBundle) return null;
        const pc = getProviderColors(addBundle.provider);
        const isAfa = addBundle.provider?.toUpperCase() === 'AFA';
        const phoneOk = isValidPhone(addPhone);
        const afaOk = !isAfa || (
            addCustomerName.trim() &&
            (!addBundle.requiresGhanaCard || (addGhanaCardNumber.trim() && /^[A-Z]{3}-?\d{9}-?\d$/i.test(addGhanaCardNumber)))
        );
        const canAdd = phoneOk && afaOk;
        const hasData = addBundle.dataVolume != null && addBundle.dataVolume > 0;

        return (
            <Dialog isOpen={!!addBundle} onClose={closeAddDialog} size="sm">
                <DialogHeader>
                    {/* Bundle preview card inside dialog */}
                    <div className="rounded-2xl p-4 -mx-1" style={{ background: `linear-gradient(135deg, ${pc.primary}22, ${pc.primary}10)` }}>
                        <div className="flex items-start justify-between">
                            <div>
                                {hasData && (
                                    <div className="text-3xl font-black leading-none" style={{ color: pc.primary }}>
                                        {addBundle.dataVolume}<span className="text-xl">{addBundle.dataUnit}</span>
                                    </div>
                                )}
                                <h3 className="font-bold text-gray-900 mt-1 text-sm">{addBundle.name}</h3>
                                <div className="flex gap-2 mt-2 flex-wrap">
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-white text-gray-600 border font-medium">
                                        {fmtValidity(addBundle.validity, addBundle.validityUnit)}
                                    </span>
                                </div>
                            </div>
                            <div className="text-2xl font-extrabold" style={{ color: pc.primary }}>{fmt(addBundle.price)}</div>
                        </div>
                    </div>
                </DialogHeader>
                <DialogBody>
                    <div className="space-y-4 pt-1">
                        {isAfa && addBundle.requiresGhanaCard && (
                            <Alert status="warning">
                                <p className="text-sm font-medium">Ghana Card required for this bundle.</p>
                            </Alert>
                        )}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                <FaPhone className="inline w-3 h-3 mr-1.5 opacity-60" />Receiving Phone Number *
                            </label>
                            <Input type="tel" placeholder="0XX XXX XXXX" value={addPhone}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddPhone(e.target.value)} />
                            {addPhone && !phoneOk && (
                                <p className="text-xs text-red-500 mt-1">Enter a valid 10-digit Ghana phone number (e.g. 0244123456)</p>
                            )}
                        </div>
                        {isAfa && (
                            <>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        <FaIdCard className="inline w-3 h-3 mr-1.5 opacity-60" />Full Name *
                                    </label>
                                    <Input placeholder="Recipient's full name" value={addCustomerName}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddCustomerName(e.target.value)} />
                                </div>
                                {addBundle.requiresGhanaCard && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            <FaIdCard className="inline w-3 h-3 mr-1.5 opacity-60" />Ghana Card Number *
                                        </label>
                                        <Input placeholder="GHA-XXXXXXXXX-X" value={addGhanaCardNumber}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddGhanaCardNumber(e.target.value)} />
                                        {addGhanaCardNumber && !/^[A-Z]{3}-?\d{9}-?\d$/i.test(addGhanaCardNumber) && (
                                            <p className="text-xs text-red-500 mt-1">Format: GHA-000000000-0</p>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </DialogBody>
                <DialogFooter>
                    <div className="flex gap-2 w-full">
                        <Button variant="secondary" onClick={closeAddDialog} className="flex-1">Cancel</Button>
                        <button
                            disabled={!canAdd}
                            onClick={confirmAddToCart}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ backgroundColor: pc.primary }}
                        >
                            <FaCartShopping className="w-3.5 h-3.5" /> Add to Cart
                        </button>
                    </div>
                </DialogFooter>
            </Dialog>
        );
    };

    // ==========================================================================
    // Checkout Dialog
    // ==========================================================================

    const renderCheckoutDialog = () => {
        const rawMethods = storefront.paymentMethods || [];
        const paymentMethods = rawMethods.some(m => m.type === 'paystack')
            ? rawMethods
            : [{ type: 'paystack' as const, details: {}, isActive: true }, ...rawMethods];
        const selectedPayment = paymentMethods.find(m => m.type === paymentType) || paymentMethods[0];

        return (
            <Dialog isOpen={showCheckout} onClose={checkoutStep === 'confirmation' ? resetCheckout : () => setShowCheckout(false)} size="lg">

                {/* ── Review ── */}
                {checkoutStep === 'review' && (
                    <>
                        <DialogHeader>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                                    style={{ backgroundColor: theme.primary }}>
                                    <FaCartShopping className="w-3.5 h-3.5" />
                                </div>
                                <h3 className="font-black text-gray-900">Cart Review</h3>
                                <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">
                                    {cartCount} item{cartCount !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </DialogHeader>
                        <DialogBody>
                            <div className="space-y-2">
                                {cart.map((item, idx) => {
                                    const pc = getProviderColors(item.bundle.provider);
                                    return (
                                        <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                            <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: pc.primary }} />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm text-gray-900 truncate">{item.bundle.name}</p>
                                                <p className="text-xs text-gray-400">{item.bundle.providerName} · {item.customerPhone}</p>
                                            </div>
                                            <span className="font-bold text-sm shrink-0" style={{ color: pc.primary }}>{fmt(item.bundle.price)}</span>
                                            <button onClick={() => removeFromCart(idx)}
                                                className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition">
                                                <FaTrashCan className="w-3 h-3" />
                                            </button>
                                        </div>
                                    );
                                })}
                                <div className="flex justify-between items-center pt-3 mt-1 border-t border-gray-100">
                                    <span className="font-semibold text-gray-700">Total</span>
                                    <span className="text-2xl font-black" style={{ color: theme.primary }}>{fmt(cartTotal)}</span>
                                </div>
                            </div>
                        </DialogBody>
                        <DialogFooter>
                            <div className="flex gap-2 w-full">
                                <Button variant="secondary" onClick={() => setShowCheckout(false)} className="flex-1">Keep Shopping</Button>
                                <button
                                    disabled={!cart.length}
                                    onClick={() => setCheckoutStep('payment')}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
                                    style={{ backgroundColor: theme.primary }}
                                >
                                    Proceed <FaArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </DialogFooter>
                    </>
                )}

                {/* ── Payment ── */}
                {checkoutStep === 'payment' && (
                    <>
                        <DialogHeader>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                                    style={{ backgroundColor: theme.primary }}>2</div>
                                <h3 className="font-black text-gray-900">Your Details</h3>
                            </div>
                        </DialogHeader>
                        <DialogBody>
                            <div className="space-y-5">
                                {/* Customer info */}
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Full Name *</label>
                                        <Input placeholder="Your full name" value={customerName}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerName(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                            Email {requiresEmail ? '*' : <span className="normal-case font-normal text-gray-400">(optional)</span>}
                                        </label>
                                        <Input placeholder="you@example.com" type="email" value={customerEmail}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerEmail(e.target.value)} />
                                        {requiresEmail && !customerEmail && (
                                            <p className="text-xs text-rose-500 mt-1">Email required for Paystack payment</p>
                                        )}
                                        {customerEmail && !isValidEmail(customerEmail) && (
                                            <p className="text-xs text-rose-500 mt-1">Invalid email address</p>
                                        )}
                                    </div>
                                </div>

                                {/* Payment method selector */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Payment Method</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {paymentMethods.map(pm => {
                                            const icons: Record<string, string> = { paystack: '⚡', mobile_money: '📱', bank_transfer: '🏦' };
                                            const labels: Record<string, string> = {
                                                paystack: 'Pay with Paystack',
                                                mobile_money: 'Mobile Money',
                                                bank_transfer: 'Bank Transfer',
                                            };
                                            const descs: Record<string, string> = {
                                                paystack: 'Instant online checkout — card, MoMo & more',
                                                mobile_money: 'Send via MoMo, then enter reference below',
                                                bank_transfer: 'Transfer to our bank account',
                                            };
                                            const active = paymentType === pm.type;
                                            return (
                                                <button key={pm.type} onClick={() => setPaymentType(pm.type)}
                                                    className="flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all"
                                                    style={active ? { borderColor: theme.primary, backgroundColor: theme.bg } : { borderColor: '#E5E7EB' }}>
                                                    <span className="text-xl">{icons[pm.type] || '💳'}</span>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-gray-900">{labels[pm.type] || pm.type}</p>
                                                        <p className="text-xs text-gray-400">{descs[pm.type] || ''}</p>
                                                    </div>
                                                    <div className={`w-4 h-4 rounded-full border-2 transition-all ${active ? 'border-current bg-current' : 'border-gray-300'}`}
                                                        style={active ? { borderColor: theme.primary, backgroundColor: theme.primary } : {}} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Payment instructions */}
                                {selectedPayment && selectedPayment.type !== 'paystack' && (
                                    <div className="p-4 rounded-xl border-2 border-dashed space-y-2"
                                        style={{ borderColor: theme.primary + '40', backgroundColor: theme.bg }}>
                                        <h4 className="text-xs font-bold uppercase tracking-wide" style={{ color: theme.secondary }}>
                                            Payment Instructions
                                        </h4>
                                        {Array.isArray(selectedPayment.details?.accounts)
                                            ? selectedPayment.details.accounts.map((acc: PaymentAccount, i: number) => (
                                                <div key={i} className="text-sm space-y-0.5">
                                                    {acc.provider && <div className="flex justify-between"><span className="text-gray-500">Provider</span><span className="font-semibold">{acc.provider}</span></div>}
                                                    {acc.number && <div className="flex justify-between"><span className="text-gray-500">Number</span><span className="font-bold text-lg tracking-wider">{acc.number}</span></div>}
                                                    {acc.accountName && <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-semibold">{acc.accountName}</span></div>}
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
                                            <p className="font-black text-base" style={{ color: theme.secondary }}>Send exactly: {fmt(cartTotal)}</p>
                                        </div>
                                    </div>
                                )}

                                {/* MoMo reference input */}
                                {paymentType === 'mobile_money' && (
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                            Transaction Reference *
                                        </label>
                                        <Input placeholder="Enter your MoMo transaction ID"
                                            value={transactionRef}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTransactionRef(e.target.value)} />
                                        <p className="text-xs text-gray-400 mt-1">Send payment first, then paste the reference here</p>
                                    </div>
                                )}

                                {/* Order total */}
                                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                    <span className="text-sm text-gray-500">{cartCount} item{cartCount !== 1 ? 's' : ''}</span>
                                    <span className="text-xl font-black" style={{ color: theme.primary }}>{fmt(cartTotal)}</span>
                                </div>

                                {orderError && <Alert status="error">{orderError}</Alert>}
                            </div>
                        </DialogBody>
                        <DialogFooter>
                            <div className="flex gap-2 w-full">
                                <Button variant="secondary" onClick={() => setCheckoutStep('review')}>
                                    <FaArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
                                </Button>
                                <button
                                    disabled={!canSubmitOrder || submitting}
                                    onClick={submitOrder}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-50"
                                    style={{ backgroundColor: theme.primary }}
                                >
                                    {submitting ? (
                                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Placing Order…</>
                                    ) : (
                                        <>Place Order · {fmt(cartTotal)}</>
                                    )}
                                </button>
                            </div>
                        </DialogFooter>
                    </>
                )}

                {/* ── Confirmation ── */}
                {checkoutStep === 'confirmation' && orderResult && (
                    <>
                        <DialogHeader>
                            <div className="flex items-center gap-2">
                                <FaCircleCheck className="w-5 h-5 text-emerald-500" />
                                <h3 className="font-black text-gray-900">Order Placed!</h3>
                            </div>
                        </DialogHeader>
                        <DialogBody>
                            <div className="text-center space-y-5 py-2">
                                <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center bg-emerald-50">
                                    <FaCircleCheck className="w-10 h-10 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-xl font-black text-gray-900">Thank you!</p>
                                    <p className="text-sm text-gray-500 mt-1">Order #{orderResult.orderNumber}</p>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Total Paid</span>
                                        <span className="font-black text-lg">{fmt(orderResult.total)}</span>
                                    </div>
                                    {orderResult.paystack?.authorizationUrl ? (
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-start">
                                                <span className="text-sm text-gray-500">Payment</span>
                                                {paystackStatus === 'success' ? (
                                                    <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">✓ Confirmed</span>
                                                ) : paystackStatus === 'failed' ? (
                                                    <span className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-semibold">Failed</span>
                                                ) : (
                                                    <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">Awaiting…</span>
                                                )}
                                            </div>
                                            {paystackStatus !== 'success' && (
                                                <a href={orderResult.paystack.authorizationUrl} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white"
                                                    style={{ backgroundColor: theme.primary }}>
                                                    <FaBolt className="w-3.5 h-3.5" /> Continue to Paystack
                                                </a>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Status</span>
                                            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">Pending Verification</span>
                                        </div>
                                    )}
                                </div>

                                <div className="text-left bg-blue-50 rounded-2xl p-4">
                                    <h4 className="text-xs font-black text-blue-900 uppercase tracking-wide mb-2">What's next?</h4>
                                    <ol className="text-xs text-blue-800 space-y-1.5 list-decimal list-inside">
                                        {orderResult.paystack?.authorizationUrl ? (
                                            <>
                                                <li>Complete payment in the Paystack window.</li>
                                                <li>Your order is auto-processed on confirmation.</li>
                                                <li>Bundles are sent to the numbers you provided.</li>
                                            </>
                                        ) : (
                                            <>
                                                <li>Store owner verifies your payment.</li>
                                                <li>Bundles are processed after verification.</li>
                                                <li>Delivered to the phone numbers you provided.</li>
                                            </>
                                        )}
                                    </ol>
                                </div>

                                {storefront.contactInfo?.whatsapp && (
                                    <a href={`https://wa.me/${storefront.contactInfo.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I just placed order #${orderResult.orderNumber}`)}`}
                                        target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] text-white rounded-xl font-bold text-sm hover:bg-[#20BD5C] transition active:scale-95">
                                        <FaWhatsapp className="w-4 h-4" /> Contact on WhatsApp
                                    </a>
                                )}
                            </div>
                        </DialogBody>
                        <DialogFooter>
                            <button onClick={resetCheckout}
                                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
                                style={{ backgroundColor: theme.primary }}>
                                Done · Shop More
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
        if (!hasSocial && !hasContact && !branding.footerText) return null;

        return (
            <footer className="border-t border-gray-100 bg-gray-50 px-4 py-8"
                style={{ marginBottom: cartCount > 0 && !showCheckout ? '80px' : 0 }}>
                <div className="max-w-5xl mx-auto space-y-4 text-center">
                    {hasSocial && (
                        <div className="flex items-center justify-center gap-5">
                            {social?.facebook && <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition"><FaFacebook className="w-5 h-5" /></a>}
                            {social?.twitter && <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-sky-500 transition"><FaTwitter className="w-5 h-5" /></a>}
                            {social?.instagram && <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-600 transition"><FaInstagram className="w-5 h-5" /></a>}
                        </div>
                    )}
                    {hasContact && (
                        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                            {storefront.contactInfo?.phone && (
                                <a href={`tel:${storefront.contactInfo.phone}`} className="flex items-center gap-1.5 hover:text-gray-800 transition">
                                    <FaPhone className="w-3 h-3" />{storefront.contactInfo.phone}
                                </a>
                            )}
                            {storefront.contactInfo?.whatsapp && (
                                <a href={`https://wa.me/${storefront.contactInfo.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
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
                    {branding.footerText && <p className="text-xs text-gray-400">{branding.footerText}</p>}
                    <p className="text-xs text-gray-300">Powered by DNAStudios</p>
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
        @keyframes cartBounce { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }
        .cart-bounce { animation: cartBounce 0.3s ease; }
      `}</style>

            {renderHeader()}
            {renderToolbar()}

            <main>
                {/* Popular bundles carousel — shown above bundle grid */}
                <div className="max-w-5xl mx-auto">
                    <PopularCarousel theme={theme} bundles={popularBundles} onSelect={openAddDialog} />
                </div>

                {renderBundleSections()}

                {/* Spacer for floating cart bar */}
                {cartCount > 0 && !showCheckout && <div className="h-24" />}
            </main>

            {renderFooter()}
            {renderCartBar()}
            {renderAddDialog()}
            {renderCheckoutDialog()}
        </div>
    );
};

export { PublicStore as PublicStorePage };
export default PublicStore;