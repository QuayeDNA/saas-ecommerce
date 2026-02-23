// =============================================================================
// Public Storefront — Customer-facing store for browsing & ordering data bundles
// =============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
    Card, CardBody,
    Button, Badge, Alert, Skeleton,
    Dialog, DialogHeader, DialogBody, DialogFooter,
    Input,
} from '../../design-system';
import { getProviderColors } from '../../utils/provider-colors';
import storefrontService from '../../services/storefront.service';
import type {
    PublicBundle, PublicStorefront, PublicOrderData, PublicOrderResult, StorefrontBranding,
} from '../../services/storefront.service';
import {
    FaCartShopping, FaPlus, FaTrashCan,
    FaCircleCheck, FaTriangleExclamation, FaIdCard,
    FaArrowRight, FaArrowLeft, FaPhone, FaEnvelope,
    FaStore, FaGrip, FaList, FaChevronDown, FaChevronUp,
    FaWifi, FaMagnifyingGlass,
} from 'react-icons/fa6';
import { FaWhatsapp, FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

// =============================================================================
// Types
// =============================================================================

interface CartItem {
    bundle: PublicBundle;
    customerPhone: string;
    // AFA-specific fields
    customerName?: string;
    ghanaCardNumber?: string;
}

type ViewMode = 'grid' | 'list';
type CheckoutStep = 'review' | 'payment' | 'confirmation';

// =============================================================================
// Constants
// =============================================================================

const THEME_COLORS: Record<string, { primary: string; secondary: string; accent: string; bg: string; text: string }> = {
    blue: { primary: '#3B82F6', secondary: '#1E40AF', accent: '#93C5FD', bg: '#EFF6FF', text: '#1E3A5F' },
    green: { primary: '#22C55E', secondary: '#15803D', accent: '#86EFAC', bg: '#F0FDF4', text: '#14532D' },
    purple: { primary: '#8B5CF6', secondary: '#6D28D9', accent: '#C4B5FD', bg: '#FAF5FF', text: '#3B0764' },
    orange: { primary: '#F97316', secondary: '#C2410C', accent: '#FDBA74', bg: '#FFF7ED', text: '#7C2D12' },
    red: { primary: '#EF4444', secondary: '#B91C1C', accent: '#FCA5A5', bg: '#FEF2F2', text: '#7F1D1D' },
    teal: { primary: '#14B8A6', secondary: '#0D9488', accent: '#5EEAD4', bg: '#F0FDFA', text: '#134E4A' },
    indigo: { primary: '#6366F1', secondary: '#4338CA', accent: '#A5B4FC', bg: '#EEF2FF', text: '#312E81' },
    rose: { primary: '#F43F5E', secondary: '#BE123C', accent: '#FDA4AF', bg: '#FFF1F2', text: '#881337' },
};

const DEFAULT_THEME = THEME_COLORS.blue;

// =============================================================================
// Helpers
// =============================================================================

const formatPrice = (amount: number) => `GH₵ ${amount.toFixed(2)}`;

const normalizePhone = (phone: string) => {
    const cleaned = phone.replace(/\s+/g, '');
    if (cleaned.startsWith('+233')) return '0' + cleaned.slice(4);
    if (cleaned.startsWith('233')) return '0' + cleaned.slice(3);
    return cleaned;
};

const isValidPhone = (phone: string) => /^0\d{9}$/.test(normalizePhone(phone));

const formatValidity = (validity: number | string, unit: string) => {
    if (validity === 'unlimited' || unit === 'unlimited') return 'Unlimited';
    return `${validity} ${unit}`;
};

// =============================================================================
// Component
// =============================================================================

const PublicStore: React.FC = () => {
    const { businessName } = useParams<{ businessName: string }>();

    // ---- Data state ----
    const [storeData, setStoreData] = useState<PublicStorefront | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ---- UI state ----
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProvider, setSelectedProvider] = useState<string>('all');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [collapsedPackages, setCollapsedPackages] = useState<Set<string>>(new Set());

    // ---- Cart state ----
    const [cart, setCart] = useState<CartItem[]>([]);

    // ---- Add-to-cart dialog ----
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [addBundle, setAddBundle] = useState<PublicBundle | null>(null);
    const [addPhone, setAddPhone] = useState('');
    // AFA-specific fields
    const [addCustomerName, setAddCustomerName] = useState('');
    const [addGhanaCardNumber, setAddGhanaCardNumber] = useState('');

    // ---- Checkout dialog ----
    const [showCheckout, setShowCheckout] = useState(false);
    const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('review');
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [paymentType, setPaymentType] = useState<'paystack' | 'mobile_money' | 'bank_transfer'>('paystack');
    // Reference for manual Mobile Money payments (transaction/transfer ID)
    const [transactionRef, setTransactionRef] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [orderError, setOrderError] = useState<string | null>(null);
    const [orderResult, setOrderResult] = useState<PublicOrderResult | null>(null);
    // Paystack popup -> opener status (used to update confirmation UI when Paystack redirects back)
    const [paystackCallbackStatus, setPaystackCallbackStatus] = useState<'idle' | 'success' | 'failed'>('idle');

    // ==========================================================================
    // Effects
    // ==========================================================================

    const fetchStore = React.useCallback(async () => {
        if (!businessName) return;
        setLoading(true);
        setError(null);
        try {
            const data = await storefrontService.getPublicStorefront(businessName);
            setStoreData(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Store not found');
            setStoreData(null);
        } finally {
            setLoading(false);
        }
    }, [businessName]);

    useEffect(() => {
        fetchStore();
    }, [fetchStore]);

    // Page title
    useEffect(() => {
        if (storeData) {
            document.title = `${storeData.storefront.displayName} | Data Bundles`;
        }
        return () => { document.title = 'DataHub'; };
    }, [storeData]);

    // ==========================================================================
    // Computed
    // ==========================================================================

    const theme = useMemo(() => {
        if (!storeData) return DEFAULT_THEME;
        const b = storeData.storefront.branding;
        if (b?.customColors?.primary) {
            return {
                primary: b.customColors.primary,
                secondary: b.customColors.secondary || b.customColors.primary,
                accent: b.customColors.accent || b.customColors.primary + '40',
                bg: b.customColors.primary + '10',
                text: '#FFFFFF',
            };
        }
        const key = storeData.storefront.settings?.theme || 'blue';
        return THEME_COLORS[key] || DEFAULT_THEME;
    }, [storeData]);

    const branding: StorefrontBranding = storeData?.storefront.branding || {};
    const storeLayout = branding.layout || 'modern';

    // Unique providers (prefer grouped `storeData.providers` returned by the backend)
    // logo shape comes from the shared `Provider` type (object with `url` + `alt`) or a string URL
    const providers = useMemo<Array<{ code: string; name: string; logo?: { url?: string; alt?: string } | string }>>(() => {
        if (!storeData) return [];
        if (Array.isArray(storeData.providers) && storeData.providers.length > 0) {
            return storeData.providers.map(p => ({ code: p.code, name: p.name, logo: p.logo }));
        }

        // fallback — derive from flat bundles list
        const map = new Map<string, string>();
        for (const b of storeData.bundles) {
            const code = b.provider || 'Unknown';
            if (!map.has(code)) map.set(code, b.providerName || code);
        }
        return Array.from(map.entries()).map(([code, name]) => ({ code, name }));
    }, [storeData]);

    // Helper: normalize logo value (object or string) to a URL string or undefined
    const getLogoUrl = (logo?: { url?: string; alt?: string } | string) => {
        if (!logo) return undefined;
        return typeof logo === 'string' ? logo : logo.url;
    };

    // Grouped bundles: provider → package → bundles[]
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

        if (selectedProvider !== 'all') {
            filtered = filtered.filter(b => b.provider === selectedProvider);
        }

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

    // Cart computed
    const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.bundle.price, 0), [cart]);
    const cartCount = cart.length;

    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Email is only required for Paystack payments (backend enforces this as well)
    const requiresEmail = paymentType === 'paystack';
    const isEmailOkay = !requiresEmail ? true : isValidEmail(customerEmail);

    const canSubmitOrder = Boolean(
        customerName.trim() &&
        isEmailOkay &&
        (paymentType !== 'mobile_money' || transactionRef.trim().length > 0)
    );

    // ==========================================================================
    // Handlers
    // ==========================================================================

    const addToCart = (bundle: PublicBundle, phone: string, customerName?: string, ghanaCardNumber?: string) => {
        const normalized = normalizePhone(phone);
        setCart(prev => [...prev, {
            bundle,
            customerPhone: normalized,
            customerName,
            ghanaCardNumber
        }]);
    };

    // Listen for messages from Paystack popup callback (storefront flow)
    React.useEffect(() => {
        const handler = (event: MessageEvent) => {
            try {
                if (event.origin !== window.location.origin) return;
                const data = event.data || {};
                if (!data || data.type !== 'PAYSTACK_STOREFRONT') return;

                // If we have an orderResult with a reference, ensure it matches
                if (orderResult?.paystack?.reference && data.reference && data.reference !== orderResult.paystack.reference) return;

                setPaystackCallbackStatus(data.status === 'success' ? 'success' : 'failed');
                if (data.status === 'success') {
                    // show confirmation UI
                    setCheckoutStep('confirmation');
                } else {
                    setOrderError(data.message || 'Payment verification failed');
                }
            } catch (err) {
                /* ignore */
            }
        };
        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, [orderResult]);

    const removeFromCart = (index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const togglePackage = (key: string) => {
        setCollapsedPackages(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key); else next.add(key);
            return next;
        });
    };

    // Add-to-cart dialog
    const openAddDialog = (bundle: PublicBundle) => {
        setAddBundle(bundle);
        setAddPhone('');
        setAddCustomerName('');
        setAddGhanaCardNumber('');
        setShowAddDialog(true);
    };

    const confirmAddToCart = () => {
        if (!addBundle || !isValidPhone(addPhone)) return;

        // For AFA bundles, validate required fields
        const isAfa = addBundle.provider?.toUpperCase() === 'AFA';
        if (isAfa && addBundle.requiresGhanaCard) {
            if (!addCustomerName.trim()) return;
            if (!addGhanaCardNumber.trim()) return;
        }

        addToCart(addBundle, addPhone, isAfa ? addCustomerName : undefined, isAfa ? addGhanaCardNumber : undefined);
        setShowAddDialog(false);
        setAddBundle(null);
    };

    // Checkout
    const openCheckout = () => {
        if (cart.length === 0) return;

        // Pre-fill customer info from AFA items (if all items have same customer)
        const afaItems = cart.filter(item => item.bundle.provider?.toUpperCase() === 'AFA' && item.customerName);
        if (afaItems.length > 0) {
            const firstAfaItem = afaItems[0];
            const allSameCustomer = afaItems.every(item =>
                item.customerName === firstAfaItem.customerName &&
                item.customerPhone === firstAfaItem.customerPhone
            );

            if (allSameCustomer) {
                setCustomerName(firstAfaItem.customerName || '');
            }
        }

        setCheckoutStep('review');
        setOrderError(null);
        setOrderResult(null);
        setShowCheckout(true);
        const methods = (storeData?.storefront.paymentMethods || []).filter(m => m.type === 'mobile_money');
        if (methods.length > 0) setPaymentType('mobile_money');
    };

    const submitOrder = async () => {
        if (!businessName || !storeData || !canSubmitOrder) return;
        setSubmitting(true);
        setOrderError(null);
        // Open a blank popup synchronously so navigation to Paystack won't be blocked by popup blockers
        const popup = window.open("", "_blank");

        try {
            // Get Ghana Card number from AFA items (use the first one if multiple)
            const afaGhanaCard = cart.find(item =>
                item.bundle.provider?.toUpperCase() === 'AFA' &&
                item.bundle.requiresGhanaCard &&
                item.ghanaCardNumber
            )?.ghanaCardNumber;

            const orderData: PublicOrderData = {
                items: cart.map(item => ({
                    bundleId: item.bundle._id,
                    quantity: 1,
                    customerPhone: item.customerPhone,
                })),
                customerInfo: {
                    name: customerName.trim(),
                    phone: cart[0]?.customerPhone || '',
                    email: customerEmail.trim() || undefined,
                    ...(afaGhanaCard && { ghanaCardNumber: afaGhanaCard }),
                },
                // include payment method so backend validation succeeds
                paymentMethod: {
                    type: paymentType as 'paystack' | 'mobile_money' | 'bank_transfer',
                    // include reference for mobile_money (if provided)
                    reference: transactionRef.trim() || undefined,
                },
            };

            const result = await storefrontService.createPublicOrder(businessName, orderData);

            // If backend returned Paystack init data, navigate the popup to Paystack checkout
            const paystackUrl = result?.paystack?.authorizationUrl || (result?.paystack as unknown as { authorization_url?: string })?.authorization_url;
            if (paystackUrl) {
                try {
                    popup!.location.href = paystackUrl;
                } catch {
                    // Fallback when assigning href on cross-origin popup fails
                    popup?.close();
                    window.open(paystackUrl, "_blank");
                }
            } else {
                // Close the blank popup if it is not needed
                try { if (popup && !popup.closed) popup.close(); } catch { /* ignore */ }
            }

            setOrderResult(result);
            setCheckoutStep('confirmation');
            setCart([]);
        } catch (err: unknown) {
            setOrderError(err instanceof Error ? err.message : 'Failed to place order. Please try again.');
            try { if (popup && !popup.closed) popup.close(); } catch { /* ignore */ }
        } finally {
            setSubmitting(false);
        }
    };

    const resetCheckout = () => {
        setShowCheckout(false);
        setCheckoutStep('review');
        setCustomerName('');
        setCustomerEmail('');
        setTransactionRef('');
        setOrderError(null);
        setOrderResult(null);
        setPaystackCallbackStatus('idle');
    };

    // ==========================================================================
    // Loading / Error
    // ==========================================================================

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pb-safe">
                <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
                    {/* Header skeleton */}
                    <div className="rounded-2xl p-6" style={{ background: `linear-gradient(135deg, ${DEFAULT_THEME.primary}, ${DEFAULT_THEME.secondary})` }}>
                        <div className="max-w-4xl mx-auto text-center">
                            <Skeleton variant="circular" width={80} height={80} />
                            <div className="mt-4">
                                <Skeleton height="1.75rem" width="360px" />
                                <Skeleton height="1rem" width="280px" className="mt-3" />
                            </div>
                        </div>
                    </div>

                    {/* Providers skeleton */}
                    <div>
                        <Skeleton height="1rem" width="160px" />
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="p-3 bg-white rounded-2xl shadow-sm">
                                    <Skeleton variant="circular" width={48} height={48} />
                                    <Skeleton height="0.75rem" width="70%" className="mt-3" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Search + products skeleton */}
                    <div>
                        <Skeleton height="2.5rem" width="100%" />
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Card key={i}>
                                    <CardBody className="p-4">
                                        <div className="flex gap-3">
                                            <Skeleton variant="rectangular" width={96} height={80} />
                                            <div className="flex-1">
                                                <Skeleton height="1rem" width="70%" />
                                                <Skeleton height="0.75rem" width="50%" className="mt-2" />
                                                <div className="mt-4 flex items-end justify-between">
                                                    <Skeleton height="1.25rem" width="90px" />
                                                    <Skeleton height="2rem" width="80px" />
                                                </div>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !storeData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                <Card className="max-w-lg w-full">
                    <CardBody className="text-center py-10 space-y-4">
                        <FaTriangleExclamation className="mx-auto h-12 w-12 text-red-400" />
                        <h2 className="text-lg font-semibold text-gray-900">Couldn’t load this store</h2>
                        <p className="text-sm text-gray-500">{error ?? 'The storefront is not available.'}</p>
                        <div className="flex items-center justify-center gap-3 pt-2">
                            <Button onClick={() => fetchStore()} size="md">Retry</Button>
                            <Button variant="ghost" onClick={() => window.location.href = '/'}>Back to home</Button>
                        </div>
                    </CardBody>
                </Card>
            </div>
        );
    }

    const { storefront } = storeData;

    // ==========================================================================
    // Render: Store Header
    // ==========================================================================

    const renderHeader = () => {
        const showBanner = branding.showBanner !== false && branding.bannerUrl;

        if (storeLayout === 'minimal') {
            return (
                <header className="py-8 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        {branding.logoUrl && (
                            <img
                                src={branding.logoUrl}
                                alt={storefront.displayName}
                                className="h-16 w-16 rounded-full mx-auto mb-4 object-cover border-2 shadow-sm"
                                style={{ borderColor: theme.primary }}
                            />
                        )}
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{storefront.displayName}</h1>
                        {branding.tagline && <p className="mt-2 text-gray-500">{branding.tagline}</p>}
                        {storefront.description && <p className="mt-1 text-sm text-gray-400">{storefront.description}</p>}
                    </div>
                </header>
            );
        }

        if (storeLayout === 'classic') {
            return (
                <header>
                    {showBanner && (
                        <div className="w-full h-40 sm:h-56 overflow-hidden">
                            <img src={branding.bannerUrl} alt="Store banner" className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div className="px-4 py-6" style={{ backgroundColor: theme.bg }}>
                        <div className="max-w-5xl mx-auto flex items-center gap-4">
                            {branding.logoUrl && (
                                <img
                                    src={branding.logoUrl}
                                    alt={storefront.displayName}
                                    className="h-14 w-14 rounded-xl object-cover border-2 shadow"
                                    style={{ borderColor: theme.primary }}
                                />
                            )}
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: theme.secondary }}>
                                    {storefront.displayName}
                                </h1>
                                {branding.tagline && <p className="text-sm text-gray-600">{branding.tagline}</p>}
                            </div>
                        </div>
                    </div>
                </header>
            );
        }

        // Modern (default)
        return (
            <header
                className="relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
            >
                {showBanner && (
                    <img src={branding.bannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                )}
                <div className="relative px-4 py-10 sm:py-16 text-center">
                    {branding.logoUrl && (
                        <img
                            src={branding.logoUrl}
                            alt={storefront.displayName}
                            className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl mx-auto mb-4 object-cover border-2 border-white/30 shadow-lg"
                        />
                    )}
                    <h1 className="text-2xl sm:text-4xl font-bold text-white drop-shadow-sm">
                        {storefront.displayName}
                    </h1>
                    {branding.tagline && <p className="mt-2 text-white/80 text-sm sm:text-base">{branding.tagline}</p>}
                    {storefront.description && (
                        <p className="mt-1 text-white/60 text-sm max-w-lg mx-auto">{storefront.description}</p>
                    )}
                </div>
            </header>
        );
    };

    // ==========================================================================
    // Render: Toolbar (Search + Layout Toggle + Provider Tabs)
    // ==========================================================================

    const renderToolbar = () => (
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
            <div className="max-w-5xl mx-auto space-y-3">
                {/* Search + View Toggle */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search bundles..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition"
                        />
                    </div>
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden shrink-0">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2.5 transition ${viewMode === 'grid' ? 'text-white' : 'text-gray-500 bg-white hover:bg-gray-50'}`}
                            style={viewMode === 'grid' ? { backgroundColor: theme.primary } : undefined}
                            title="Grid view"
                        >
                            <FaGrip className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2.5 transition ${viewMode === 'list' ? 'text-white' : 'text-gray-500 bg-white hover:bg-gray-50'}`}
                            style={viewMode === 'list' ? { backgroundColor: theme.primary } : undefined}
                            title="List view"
                        >
                            <FaList className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Provider selector (visual carousel cards) */}
                {providers.length > 1 && (
                    <div className="-mx-4 px-4">
                        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-3 snap-x snap-mandatory">
                            {/* All providers card */}
                            <button
                                onClick={() => setSelectedProvider('all')}
                                className={`shrink-0 w-36 sm:w-44 flex-none p-3 rounded-2xl border transition transform-gpu ${selectedProvider === 'all' ? 'scale-105 shadow-lg' : 'bg-white hover:shadow-sm'}`}
                                style={selectedProvider === 'all' ? { borderColor: theme.primary } : undefined}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100 text-sm font-bold text-gray-700">All</div>
                                    <div className="text-left">
                                        <div className="text-sm font-semibold text-gray-900">All Providers</div>
                                        <div className="text-xs text-gray-500">{storeData?.bundles?.length ?? 0} bundles</div>
                                    </div>
                                </div>
                            </button>

                            {providers.map((prov) => {
                                const pc = getProviderColors(prov.code);
                                const isActive = selectedProvider === prov.code;
                                const provMap = groupedBundles.get(prov.code);
                                const count = provMap ? Array.from(provMap.values()).reduce((s, arr) => s + arr.length, 0) : 0;

                                return (
                                    <button
                                        key={prov.code}
                                        onClick={() => setSelectedProvider(prov.code)}
                                        className={`shrink-0 w-36 sm:w-44 flex-none p-3 rounded-2xl transition transform-gpu text-left ${isActive ? 'scale-105 shadow-lg' : 'bg-white hover:shadow-sm'}`}
                                        style={isActive ? { border: `1px solid ${pc.primary}`, backgroundColor: pc.primary + '08' } : undefined}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center font-bold text-white" style={{ backgroundColor: pc.primary }}>
                                                {getLogoUrl(prov.logo) ? (
                                                    <img src={getLogoUrl(prov.logo)} alt={prov.logo && typeof prov.logo === 'object' ? prov.logo.alt || prov.name : prov.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-sm">{prov.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900">{prov.name}</div>
                                                <div className="text-xs text-gray-500">{count} bundles</div>
                                            </div>
                                        </div>
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
    // Render: Bundle Card (Grid View)
    // ==========================================================================

    const renderBundleCard = (bundle: PublicBundle) => {
        const pc = getProviderColors(bundle.provider);
        const isAfa = bundle.provider?.toUpperCase() === 'AFA';
        const inCart = cart.some(i => i.bundle._id === bundle._id);
        const hasData = bundle.dataVolume != null && bundle.dataVolume > 0;

        return (
            <Card key={bundle._id} variant="elevated" className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
                {/* Top accent */}
                <div className="h-1" style={{ backgroundColor: pc.primary }} />
                <CardBody className="p-4">
                    <div className="flex flex-col h-full">
                        {/* Highlight: data volume + title */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-start gap-3">
                                <div className="flex flex-col items-start">
                                    {hasData ? (
                                        <div className="text-2xl font-extrabold" style={{ color: pc.primary }}>{bundle.dataVolume}{bundle.dataUnit}</div>
                                    ) : null}
                                    <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mt-1">{bundle.name}</h3>
                                    {bundle.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{bundle.description}</p>}
                                </div>
                            </div>

                            {inCart && <Badge colorScheme="success" size="xs" variant="solid">In Cart</Badge>}
                        </div>

                        {/* Data / validity badges (compact) */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {hasData && (
                                <Badge colorScheme="info" size="xs">
                                    {bundle.dataVolume} {bundle.dataUnit}
                                </Badge>
                            )}
                            <Badge colorScheme="gray" size="xs">
                                {formatValidity(bundle.validity, bundle.validityUnit)}
                            </Badge>
                            {isAfa && bundle.requiresGhanaCard && (
                                <Badge colorScheme="warning" size="xs" variant="outline">
                                    <FaIdCard className="inline w-3 h-3 mr-1" />Ghana Card
                                </Badge>
                            )}
                        </div>

                        {/* Description */}
                        {bundle.description && (
                            <p className="text-xs text-gray-500 mb-3 line-clamp-2">{bundle.description}</p>
                        )}

                        {/* Price + Add button */}
                        <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-100">
                            <span className="text-lg font-bold" style={{ color: pc.primary }}>
                                {formatPrice(bundle.price)}
                            </span>
                            <Button
                                size="sm"
                                className="font-medium"
                                style={{ backgroundColor: pc.primary, color: pc.text }}
                                onClick={() => openAddDialog(bundle)}
                            >
                                <FaPlus className="w-3 h-3 mr-1" /> Add
                            </Button>
                        </div>
                    </div>
                </CardBody>
            </Card>
        );
    };

    // ==========================================================================
    // Render: Bundle Row (List View)
    // ==========================================================================

    const renderBundleRow = (bundle: PublicBundle) => {
        const pc = getProviderColors(bundle.provider);
        const isAfa = bundle.provider?.toUpperCase() === 'AFA';
        const inCart = cart.some(i => i.bundle._id === bundle._id);
        const hasData = bundle.dataVolume != null && bundle.dataVolume > 0;

        return (
            <div
                key={bundle._id}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all"
            >
                {/* Accent bar */}
                <div className="shrink-0 w-1.5 h-12 rounded-full" style={{ backgroundColor: pc.primary }} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 text-sm truncate">{bundle.name}</span>
                        {inCart && <Badge colorScheme="success" size="xs" variant="solid">In Cart</Badge>}
                        {isAfa && bundle.requiresGhanaCard && (
                            <Badge colorScheme="warning" size="xs" variant="outline">
                                <FaIdCard className="inline w-3 h-3 mr-0.5" />GH Card
                            </Badge>
                        )}
                    </div>
                    <div className="flex gap-2 mt-1">
                        {hasData && (
                            <span className="text-xs text-gray-500">{bundle.dataVolume} {bundle.dataUnit}</span>
                        )}
                        {hasData && <span className="text-xs text-gray-400">•</span>}
                        <span className="text-xs text-gray-500">{formatValidity(bundle.validity, bundle.validityUnit)}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 mt-3">
                    <div className="flex-1">
                        <div className="text-lg font-extrabold" style={{ color: pc.primary }}>{formatPrice(bundle.price)}</div>
                        <div className="text-xs text-gray-400">{bundle.packageName || bundle.category || 'General'}</div>
                    </div>

                    <div className="flex gap-2 items-center">
                        <Button size="md" style={{ backgroundColor: pc.primary, color: pc.text }} onClick={() => openAddDialog(bundle)}>
                            Buy
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openAddDialog(bundle)} aria-label="Add to cart">
                            <FaPlus className="w-3 h-3" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    // ==========================================================================
    // Render: Bundle Sections (Provider → Package → Bundles)
    // ==========================================================================

    const renderBundleSections = () => {
        if (groupedBundles.size === 0) {
            // If there was a search query, show a helpful empty-search UI
            if (searchTerm.trim()) {
                return (
                    <div className="max-w-5xl mx-auto px-4 py-16 text-center">
                        <FaMagnifyingGlass className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                        <h3 className="text-lg font-semibold text-gray-900">No results for “{searchTerm}”</h3>
                        <p className="text-sm text-gray-500 mt-2">Try different keywords or clear the search to see all bundles.</p>
                        <div className="mt-4 flex items-center justify-center gap-3">
                            <Button onClick={() => setSearchTerm('')}>Clear search</Button>
                            <Button variant="outline" onClick={() => setSelectedProvider('all')}>Show all providers</Button>
                        </div>
                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Suggestions: show top bundles or provider cards */}
                            {providers.slice(0, 3).map(p => (
                                <Card key={p.code} className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: getProviderColors(p.code).primary }}>
                                            {getLogoUrl(p.logo) ? <img src={getLogoUrl(p.logo)} alt={p.logo && typeof p.logo === 'object' ? p.logo.alt || p.name : p.name} className="w-full h-full object-cover rounded-lg" /> : p.name.charAt(0)}
                                        </div>
                                        <div className="text-left">
                                            <div className="text-sm font-semibold">{p.name}</div>
                                            <div className="text-xs text-gray-400">View packages</div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                );
            }

            return (
                <div className="max-w-5xl mx-auto px-4 py-16 text-center">
                    <FaWifi className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No bundles found</p>
                    {searchTerm && <p className="text-sm text-gray-400 mt-1">Try a different search term</p>}
                </div>
            );
        }

        // Prefer backend-provided providers/packages structure when available
        if (Array.isArray(storeData.providers) && storeData.providers.length > 0) {
            return (
                <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
                    {storeData.providers
                        .filter(p => selectedProvider === 'all' ? true : p.code === selectedProvider)
                        .map((prov) => {
                            const pc = getProviderColors(prov.code);

                            // filter packages/bundles by search term
                            const filteredPackages = (prov.packages || []).map(pkg => ({
                                ...pkg,
                                bundles: (pkg.bundles || []).filter(b => {
                                    if (!searchTerm.trim()) return true;
                                    const term = searchTerm.toLowerCase();
                                    return (
                                        b.name.toLowerCase().includes(term) ||
                                        (b.description?.toLowerCase() || '').includes(term) ||
                                        (b.providerName?.toLowerCase() || '').includes(term) ||
                                        (b.packageName?.toLowerCase() || '').includes(term)
                                    );
                                })
                            })).filter(p => (p.bundles || []).length > 0);

                            const totalBundles = filteredPackages.reduce((s, pkg) => s + (pkg.bundles?.length || 0), 0);
                            if (totalBundles === 0) return null;

                            return (
                                <section key={prov.code}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm" style={{ backgroundColor: pc.primary, color: pc.text }}>
                                            {getLogoUrl(prov.logo) ? (
                                                <img src={getLogoUrl(prov.logo)} alt={prov.logo && typeof prov.logo === 'object' ? prov.logo.alt || prov.name : prov.name} className="w-full h-full object-cover rounded-xl" />
                                            ) : (
                                                prov.name.charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900">{prov.name}</h2>
                                            <p className="text-xs text-gray-500">{totalBundles} bundle{totalBundles !== 1 ? 's' : ''} available</p>
                                        </div>
                                    </div>

                                    <div className="space-y-5 ml-2 border-l-2 pl-4" style={{ borderColor: pc.primary + '30' }}>
                                        {filteredPackages.map((pkg) => {
                                            const pkgKey = `${prov.code}-${pkg.name}`;
                                            const isCollapsed = collapsedPackages.has(pkgKey);

                                            return (
                                                <div key={pkgKey}>
                                                    <div className="mb-3">
                                                        <div
                                                            onClick={() => togglePackage(pkgKey)}
                                                            className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md transition"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: pc.primary }}>
                                                                    <FaStore className="w-4 h-4" />
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-semibold text-gray-900">{pkg.name}</div>
                                                                    <div className="text-xs text-gray-500">{pkg.bundles.length} bundle{pkg.bundles.length !== 1 ? 's' : ''}</div>
                                                                </div>
                                                            </div>
                                                            <div className="text-gray-400">
                                                                {isCollapsed ? <FaChevronDown className="w-4 h-4" /> : <FaChevronUp className="w-4 h-4" />}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {!isCollapsed && (
                                                        viewMode === 'grid' ? (
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                {pkg.bundles.map(renderBundleCard)}
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                {pkg.bundles.map(renderBundleRow)}
                                                            </div>
                                                        )
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

        // fallback to groupedBundles (derived from flat bundles)
        return (
            <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
                {Array.from(groupedBundles.entries()).map(([provCode, pkgMap]) => {
                    const pc = getProviderColors(provCode);
                    const provName = providers.find(p => p.code === provCode)?.name || provCode;
                    const totalBundles = Array.from(pkgMap.values()).reduce((sum, arr) => sum + arr.length, 0);

                    return (
                        <section key={provCode}>
                            {/* Provider header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm"
                                    style={{ backgroundColor: pc.primary, color: pc.text }}
                                >
                                    {provName.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">{provName}</h2>
                                    <p className="text-xs text-gray-500">{totalBundles} bundle{totalBundles !== 1 ? 's' : ''} available</p>
                                </div>
                            </div>

                            {/* Package groups */}
                            <div className="space-y-5 ml-2 border-l-2 pl-4" style={{ borderColor: pc.primary + '30' }}>
                                {Array.from(pkgMap.entries()).map(([pkgName, pkgBundles]) => {
                                    const pkgKey = `${provCode}-${pkgName}`;
                                    const isCollapsed = collapsedPackages.has(pkgKey);

                                    return (
                                        <div key={pkgKey}>
                                            {/* Package sub-header */}
                                            <div className="mb-3">
                                                <div
                                                    onClick={() => togglePackage(pkgKey)}
                                                    className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md transition"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: pc.primary }}>
                                                            <FaStore className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-semibold text-gray-900">{pkgName}</div>
                                                            <div className="text-xs text-gray-500">{pkgBundles.length} bundle{pkgBundles.length !== 1 ? 's' : ''}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-gray-400">
                                                        {isCollapsed ? <FaChevronDown className="w-4 h-4" /> : <FaChevronUp className="w-4 h-4" />}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bundle grid or list */}
                                            {!isCollapsed && (
                                                viewMode === 'grid' ? (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {pkgBundles.map(renderBundleCard)}
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {pkgBundles.map(renderBundleRow)}
                                                    </div>
                                                )
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
    };

    // ==========================================================================
    // Render: Cart Floating Bar
    // ==========================================================================

    const renderCartBar = () => {
        if (cart.length === 0 || showCheckout) return null;

        return (
            <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <FaCartShopping className="w-6 h-6" style={{ color: theme.primary }} />
                            <span
                                className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center"
                                style={{ backgroundColor: theme.secondary }}
                            >
                                {cartCount}
                            </span>
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">{formatPrice(cartTotal)}</p>
                            <p className="text-xs text-gray-500">{cartCount} item{cartCount !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <Button
                        size="md"
                        className="font-semibold px-6"
                        style={{ backgroundColor: theme.primary, color: '#FFFFFF' }}
                        onClick={openCheckout}
                        rightIcon={<FaArrowRight className="w-4 h-4" />}
                    >
                        Checkout
                    </Button>
                </div>
            </div>
        );
    };

    // ==========================================================================
    // Render: Add-to-Cart Dialog
    // ==========================================================================

    const renderAddDialog = () => {
        if (!addBundle) return null;
        const pc = getProviderColors(addBundle.provider);
        const isAfa = addBundle.provider?.toUpperCase() === 'AFA';
        const phoneValid = isValidPhone(addPhone);
        const afaValid = !isAfa || (
            addCustomerName.trim() &&
            (!addBundle.requiresGhanaCard || (
                addGhanaCardNumber.trim() &&
                /^[A-Z]{3}-?\d{9}-?\d$/i.test(addGhanaCardNumber)
            ))
        );
        const canAddToCart = phoneValid && afaValid;
        const hasData = addBundle.dataVolume != null && addBundle.dataVolume > 0;

        return (
            <Dialog isOpen={showAddDialog} onClose={() => setShowAddDialog(false)} size="sm">
                <DialogHeader>
                    <h3 className="text-lg font-bold text-gray-900">Add to Cart</h3>
                </DialogHeader>
                <DialogBody>
                    <div className="space-y-4">
                        {/* Bundle info card */}
                        <div className="p-4 rounded-xl" style={{ backgroundColor: pc.background }}>
                            <h4 className="font-semibold text-gray-900">{addBundle.name}</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {hasData && (
                                    <Badge colorScheme="info" size="xs">{addBundle.dataVolume} {addBundle.dataUnit}</Badge>
                                )}
                                <Badge colorScheme="gray" size="xs">
                                    {formatValidity(addBundle.validity, addBundle.validityUnit)}
                                </Badge>
                            </div>
                            {addBundle.description && (
                                <p className="text-sm text-gray-600 mt-2">{addBundle.description}</p>
                            )}
                            <p className="mt-3 text-lg font-bold" style={{ color: pc.primary }}>
                                {formatPrice(addBundle.price)}
                            </p>
                        </div>

                        {/* AFA notice */}
                        {isAfa && addBundle.requiresGhanaCard && (
                            <Alert status="warning" title="Ghana Card Required">
                                <p className="text-sm">This bundle requires a Ghana Card registered number.</p>
                                {addBundle.afaRequirements && addBundle.afaRequirements.length > 0 && (
                                    <ul className="text-sm mt-1 list-disc list-inside">
                                        {addBundle.afaRequirements.map((req, i) => <li key={i}>{req}</li>)}
                                    </ul>
                                )}
                            </Alert>
                        )}

                        {/* Phone number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                <FaPhone className="inline w-3 h-3 mr-1.5 text-gray-400" />
                                Receiving Phone Number
                            </label>
                            <Input
                                type="tel"
                                placeholder="0XX XXX XXXX"
                                value={addPhone}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddPhone(e.target.value)}
                            />
                            {addPhone && !phoneValid && (
                                <p className="text-xs text-red-500 mt-1">Enter a valid 10-digit Ghana phone number</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">The number that will receive this data bundle</p>
                        </div>

                        {/* AFA Customer Information */}
                        {isAfa && (
                            <>
                                {/* Customer Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        <FaIdCard className="inline w-3 h-3 mr-1.5 text-gray-400" />
                                        Full Name *
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="Enter recipient's full name"
                                        value={addCustomerName}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddCustomerName(e.target.value)}
                                    />
                                    {addBundle.requiresGhanaCard && !addCustomerName.trim() && (
                                        <p className="text-xs text-red-500 mt-1">Full name is required for AFA registration</p>
                                    )}
                                </div>

                                {/* Ghana Card Number */}
                                {addBundle.requiresGhanaCard && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            <FaIdCard className="inline w-3 h-3 mr-1.5 text-gray-400" />
                                            Ghana Card Number *
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="GHA-XXXXXXXXX-X"
                                            value={addGhanaCardNumber}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddGhanaCardNumber(e.target.value)}
                                        />
                                        {!addGhanaCardNumber.trim() && (
                                            <p className="text-xs text-red-500 mt-1">Ghana Card number is required</p>
                                        )}
                                        {addGhanaCardNumber && !/^[A-Z]{3}-?\d{9}-?\d$/i.test(addGhanaCardNumber) && (
                                            <p className="text-xs text-red-500 mt-1">Format: GHA-XXXXXXXXX-X (9 digits in middle, 1 at end)</p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1">Must be registered with NIA for AFA services</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </DialogBody>
                <DialogFooter>
                    <div className="flex gap-2 w-full">
                        <Button variant="secondary" onClick={() => setShowAddDialog(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 font-semibold"
                            disabled={!canAddToCart}
                            style={{ backgroundColor: canAddToCart ? pc.primary : '#9CA3AF', color: '#FFFFFF' }}
                            onClick={confirmAddToCart}
                        >
                            <FaCartShopping className="w-4 h-4 mr-1.5" /> Add to Cart
                        </Button>
                    </div>
                </DialogFooter>
            </Dialog>
        );
    };

    // ==========================================================================
    // Render: Checkout Dialog
    // ==========================================================================

    const renderCheckoutDialog = () => {
        // Always surface a Paystack option for public checkout (platform routing)
        const rawPaymentMethods = storefront.paymentMethods || [];
        const paymentMethods = (() => {
            const copy = [...rawPaymentMethods];
            if (!copy.some(pm => pm.type === 'paystack')) {
                // synthetic Paystack option (no merchant config required for platform routing)
                copy.unshift({ type: 'paystack', details: {}, isActive: true } as { type: 'paystack'; details: Record<string, unknown>; isActive: boolean });
            }
            return copy;
        })();

        const selectedPayment = paymentMethods.find(pm => pm.type === paymentType) || paymentMethods[0];

        return (
            <Dialog
                isOpen={showCheckout}
                onClose={checkoutStep === 'confirmation' ? resetCheckout : () => setShowCheckout(false)}
                size="lg"
            >
                {/* ---- Step: Cart Review ---- */}
                {checkoutStep === 'review' && (
                    <>
                        <DialogHeader>
                            <div className="flex items-center gap-2">
                                <FaCartShopping className="w-5 h-5" style={{ color: theme.primary }} />
                                <h3 className="text-lg font-bold text-gray-900">Your Cart</h3>
                                <Badge colorScheme="gray" size="sm">{cartCount} item{cartCount !== 1 ? 's' : ''}</Badge>
                            </div>
                        </DialogHeader>
                        <DialogBody>
                            {cart.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">Your cart is empty</p>
                            ) : (
                                <div className="space-y-3">
                                    {cart.map((item, idx) => {
                                        const pc = getProviderColors(item.bundle.provider);
                                        return (
                                            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                                                <div className="w-1.5 h-12 rounded-full shrink-0" style={{ backgroundColor: pc.primary }} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm text-gray-900 truncate">{item.bundle.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {item.bundle.providerName} &bull; {item.customerPhone}
                                                    </p>
                                                </div>
                                                <span className="shrink-0 font-bold text-sm min-w-[70px] text-right" style={{ color: pc.primary }}>
                                                    {formatPrice(item.bundle.price)}
                                                </span>
                                                <button
                                                    onClick={() => removeFromCart(idx)}
                                                    className="shrink-0 p-1.5 text-red-400 hover:text-red-600 transition rounded-lg hover:bg-red-50"
                                                >
                                                    <FaTrashCan className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        );
                                    })}

                                    {/* Total */}
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                        <span className="font-semibold text-gray-900">Total</span>
                                        <span className="text-xl font-bold" style={{ color: theme.primary }}>
                                            {formatPrice(cartTotal)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </DialogBody>
                        <DialogFooter>
                            <div className="flex gap-2 w-full">
                                <Button variant="secondary" onClick={() => setShowCheckout(false)} className="flex-1">
                                    Continue Shopping
                                </Button>
                                <Button
                                    className="flex-1 font-semibold"
                                    disabled={cart.length === 0}
                                    style={{ backgroundColor: cart.length > 0 ? theme.primary : '#9CA3AF', color: '#FFFFFF' }}
                                    onClick={() => setCheckoutStep('payment')}
                                    rightIcon={<FaArrowRight className="w-4 h-4" />}
                                >
                                    Proceed to Payment
                                </Button>
                            </div>
                        </DialogFooter>
                    </>
                )}

                {/* ---- Step: Details & Payment ---- */}
                {checkoutStep === 'payment' && (
                    <>
                        <DialogHeader>
                            <div className="flex items-center gap-2">
                                <span
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                    style={{ backgroundColor: theme.primary }}
                                >
                                    2
                                </span>
                                <h3 className="text-lg font-bold text-gray-900">Details &amp; Payment</h3>
                            </div>
                        </DialogHeader>
                        <DialogBody>
                            <div className="space-y-5">
                                {/* Customer info */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-800 text-sm">Your Information</h4>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                                        <Input
                                            placeholder="Enter your full name"
                                            value={customerName}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerName(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            Email {paymentType === 'paystack' ? <span className="">*</span> : <span className="text-xs text-gray-400 font-normal ml-1">(optional)</span>}
                                        </label>
                                        <Input
                                            placeholder="you@example.com"
                                            value={customerEmail}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerEmail(e.target.value)}
                                            type="email"
                                        />

                                        {/* Show required hint when Paystack is selected, otherwise validate only when non-empty */}
                                        {paymentType === 'paystack' && customerEmail.trim() === '' && (
                                            <p className="text-xs text-rose-600 mt-1">Email is required for Paystack payments</p>
                                        )}
                                        {!isValidEmail(customerEmail) && customerEmail.trim() !== '' && (
                                            <p className="text-xs text-rose-600 mt-1">Please enter a valid email address</p>
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400 mt-0.5">We only collect your name and email here; email is required only for Paystack checkout. Recipient phone numbers are provided per item for delivery.</p>
                                    </div>
                                </div>

                                {/* Payment method */}
                                {paymentMethods.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-gray-800 text-sm">Payment Method</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {paymentMethods.map(pm => (
                                                <button
                                                    key={pm.type}
                                                    onClick={() => setPaymentType(pm.type)}
                                                    className={`p-3 rounded-xl border-2 text-left transition ${paymentType === pm.type ? 'shadow-sm' : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    style={paymentType === pm.type ? { borderColor: theme.primary, backgroundColor: theme.bg } : undefined}
                                                >
                                                    <p className="font-medium text-sm text-gray-900">
                                                        {pm.type === 'paystack' ? '⚡ Pay with Paystack' : pm.type === 'mobile_money' ? '📱 Mobile Money' : '🏦 Bank Transfer'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {pm.type === 'paystack' ? 'Online checkout via Paystack (recommended)' : pm.type === 'mobile_money' ? 'Pay via MoMo or mobile wallet' : 'Pay via bank transfer'}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Payment details */}
                                {selectedPayment && (
                                    <div
                                        className="p-4 rounded-xl border-2 border-dashed"
                                        style={{ borderColor: theme.primary + '40', backgroundColor: theme.bg }}
                                    >
                                        <h4 className="font-semibold text-sm mb-2" style={{ color: theme.secondary }}>
                                            📋 Payment Instructions
                                        </h4>
                                        <div className="space-y-1.5 text-sm">
                                            {/* Mobile Money: details.accounts is an array of {provider, number, accountName} */}
                                            {selectedPayment.type === 'paystack' ? (
                                                <div className="text-sm text-gray-700">You will be redirected to Paystack to complete payment. Payment confirmation is automatic.</div>
                                            ) : Array.isArray(selectedPayment.details?.accounts)
                                                ? selectedPayment.details.accounts.map((acc: { provider?: string; number?: string; accountName?: string }, i: number) => (
                                                    <div key={i} className={`${i > 0 ? 'pt-2 mt-2 border-t border-gray-200' : ''}`}>
                                                        {acc.provider && (
                                                            <div className="flex justify-between gap-2">
                                                                <span className="text-gray-500">Provider</span>
                                                                <span className="font-medium text-gray-900">{acc.provider}</span>
                                                            </div>
                                                        )}
                                                        {acc.number && (
                                                            <div className="flex justify-between gap-2">
                                                                <span className="text-gray-500">Number</span>
                                                                <span className="font-medium text-gray-900">{acc.number}</span>
                                                            </div>
                                                        )}
                                                        {acc.accountName && (
                                                            <div className="flex justify-between gap-2">
                                                                <span className="text-gray-500">Account Name</span>
                                                                <span className="font-medium text-gray-900">{acc.accountName}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                                : /* Bank Transfer or flat details: render key/value pairs */
                                                Object.entries(selectedPayment.details).map(([key, val]) => {
                                                    if (val == null || typeof val === 'object') return null;
                                                    return (
                                                        <div key={key} className="flex justify-between gap-2">
                                                            <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                            <span className="font-medium text-gray-900 text-right">{String(val)}</span>
                                                        </div>
                                                    );
                                                })
                                            }
                                        </div>
                                        <div className="mt-3 p-2.5 bg-white rounded-lg">
                                            <p className="text-sm font-bold text-gray-900">Amount to send: {formatPrice(cartTotal)}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Transaction reference — REQUIRED for manual Mobile Money only */}
                                {paymentType === 'mobile_money' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-800 mb-1.5">
                                            <FaTriangleExclamation className="inline w-3.5 h-3.5 mr-1 text-amber-500" />
                                            Transaction Reference / ID *
                                        </label>
                                        <Input
                                            placeholder="Enter your payment reference or transaction ID"
                                            value={transactionRef}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTransactionRef(e.target.value)}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Send payment first, then enter the reference here. This is required to place your order.
                                        </p>
                                    </div>
                                )}

                                {/* Order summary line */}
                                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                    <span className="text-sm text-gray-500">{cartCount} item{cartCount !== 1 ? 's' : ''}</span>
                                    <span className="text-xl font-bold" style={{ color: theme.primary }}>
                                        {formatPrice(cartTotal)}
                                    </span>
                                </div>

                                {/* Error */}
                                {orderError && (
                                    <Alert status="error" title="Order Failed">
                                        {orderError}
                                    </Alert>
                                )}
                            </div>
                        </DialogBody>
                        <DialogFooter>
                            <div className="flex gap-2 w-full">
                                <Button
                                    variant="secondary"
                                    onClick={() => setCheckoutStep('review')}
                                    leftIcon={<FaArrowLeft className="w-4 h-4" />}
                                >
                                    Back
                                </Button>
                                <Button
                                    className="flex-1 font-semibold"
                                    disabled={!canSubmitOrder || submitting}
                                    isLoading={submitting}
                                    loadingText="Placing Order..."
                                    style={{
                                        backgroundColor: canSubmitOrder && !submitting ? theme.primary : '#9CA3AF',
                                        color: '#FFFFFF',
                                    }}
                                    onClick={submitOrder}
                                >
                                    Place Order — {formatPrice(cartTotal)}
                                </Button>
                            </div>
                        </DialogFooter>
                    </>
                )}

                {/* ---- Step: Confirmation ---- */}
                {checkoutStep === 'confirmation' && orderResult && (
                    <>
                        <DialogHeader>
                            <div className="flex items-center gap-2">
                                <FaCircleCheck className="w-5 h-5 text-green-500" />
                                <h3 className="text-lg font-bold text-gray-900">Order Placed!</h3>
                            </div>
                        </DialogHeader>
                        <DialogBody>
                            <div className="text-center py-4 space-y-5">
                                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-green-100">
                                    <FaCircleCheck className="w-8 h-8 text-green-600" />
                                </div>

                                <div>
                                    <p className="text-lg font-bold text-gray-900">Thank you for your order!</p>
                                    <p className="text-sm text-gray-500 mt-1">Order #{orderResult.orderNumber}</p>
                                </div>

                                <Card variant="flat" className="text-left">
                                    <CardBody>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Total</span>
                                                <span className="font-bold">{formatPrice(orderResult.total)}</span>
                                            </div>

                                            {orderResult.paystack?.authorizationUrl ? (
                                                <div className="flex justify-between items-center gap-3">
                                                    <div>
                                                        <span className="text-gray-500">Status</span>
                                                        <div className="mt-1">
                                                            {paystackCallbackStatus === 'success' ? (
                                                                <Badge colorScheme="success" size="xs">Payment received</Badge>
                                                            ) : paystackCallbackStatus === 'failed' ? (
                                                                <Badge colorScheme="error" size="xs">Payment failed</Badge>
                                                            ) : (
                                                                <Badge colorScheme="info" size="xs">Awaiting Payment</Badge>
                                                            )}
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {paystackCallbackStatus === 'success'
                                                                    ? 'Payment confirmed — your order will be processed.'
                                                                    : paystackCallbackStatus === 'failed'
                                                                        ? 'Payment failed or verification pending.'
                                                                        : 'Complete payment in the Paystack checkout that opened.'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        {paystackCallbackStatus === 'success' ? (
                                                            <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
                                                                Refresh
                                                            </Button>
                                                        ) : (
                                                            <a
                                                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm"
                                                                href={orderResult.paystack.authorizationUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                Continue to Paystack
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Status</span>
                                                    <Badge colorScheme="warning" size="xs">Pending Verification</Badge>
                                                </div>
                                            )}
                                        </div>
                                    </CardBody>
                                </Card>

                                {/* What happens next */}
                                <div className="text-left p-4 bg-blue-50 rounded-xl">
                                    <h4 className="font-semibold text-blue-900 text-sm mb-2">What happens next?</h4>
                                    <ol className="text-xs text-blue-800 space-y-1.5 list-decimal list-inside">
                                        {orderResult.paystack?.authorizationUrl ? (
                                            <>
                                                <li>You will complete payment on Paystack.</li>
                                                <li>Payment confirmation is automatic — your order will be processed as soon as we receive confirmation.</li>
                                                <li>You&apos;ll receive the bundles on the phone numbers provided.</li>
                                            </>
                                        ) : (
                                            <>
                                                <li>The store owner will verify your payment.</li>
                                                <li>Your data bundles will be processed automatically after verification.</li>
                                                <li>You&apos;ll receive the bundles on the phone numbers provided.</li>
                                            </>
                                        )}
                                    </ol>
                                </div>

                                {/* WhatsApp contact */}
                                {storefront.contactInfo?.whatsapp && (
                                    <a
                                        href={`https://wa.me/${storefront.contactInfo.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I just placed order #${orderResult.orderNumber}`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-xl font-medium text-sm hover:bg-green-600 transition shadow-sm"
                                    >
                                        <FaWhatsapp className="w-5 h-5" /> Contact on WhatsApp
                                    </a>
                                )}
                            </div>
                        </DialogBody>
                        <DialogFooter>
                            <Button
                                variant="primary"
                                fullWidth
                                style={{ backgroundColor: theme.primary, color: '#FFFFFF' }}
                                onClick={resetCheckout}
                            >
                                Done
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </Dialog>
        );
    };

    // ==========================================================================
    // Render: Footer
    // ==========================================================================

    const renderFooter = () => {
        const social = branding.socialLinks;
        const hasSocial = social && Object.values(social).some(v => v);
        const hasContact = storefront.contactInfo &&
            (storefront.contactInfo.phone || storefront.contactInfo.email || storefront.contactInfo.whatsapp);

        if (!hasSocial && !hasContact && !branding.footerText) return null;

        return (
            <footer
                className="border-t border-gray-100 bg-gray-50 px-4 py-8"
                style={{ marginBottom: cart.length > 0 && !showCheckout ? '72px' : 0 }}
            >
                <div className="max-w-5xl mx-auto space-y-4 text-center">
                    {/* Social links */}
                    {hasSocial && (
                        <div className="flex items-center justify-center gap-4">
                            {social?.facebook && (
                                <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition">
                                    <FaFacebook className="w-5 h-5" />
                                </a>
                            )}
                            {social?.twitter && (
                                <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-sky-500 transition">
                                    <FaTwitter className="w-5 h-5" />
                                </a>
                            )}
                            {social?.instagram && (
                                <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-600 transition">
                                    <FaInstagram className="w-5 h-5" />
                                </a>
                            )}
                            {social?.tiktok && (
                                <a href={social.tiktok} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 transition text-sm font-bold">
                                    TikTok
                                </a>
                            )}
                        </div>
                    )}

                    {/* Contact info */}
                    {hasContact && (
                        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
                            {storefront.contactInfo?.phone && (
                                <a href={`tel:${storefront.contactInfo.phone}`} className="flex items-center gap-1.5 hover:text-gray-700 transition">
                                    <FaPhone className="w-3 h-3" /> {storefront.contactInfo.phone}
                                </a>
                            )}
                            {storefront.contactInfo?.whatsapp && (
                                <a
                                    href={`https://wa.me/${storefront.contactInfo.whatsapp.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-green-600 hover:text-green-700 transition"
                                >
                                    <FaWhatsapp className="w-3.5 h-3.5" /> WhatsApp
                                </a>
                            )}
                            {storefront.contactInfo?.email && (
                                <a href={`mailto:${storefront.contactInfo.email}`} className="flex items-center gap-1.5 hover:text-gray-700 transition">
                                    <FaEnvelope className="w-3 h-3" /> {storefront.contactInfo.email}
                                </a>
                            )}
                        </div>
                    )}

                    {/* Footer text */}
                    {branding.footerText && (
                        <p className="text-xs text-gray-400">{branding.footerText}</p>
                    )}

                    <p className="text-xs text-gray-300">Powered by DNAStudios</p>
                </div>
            </footer>
        );
    };

    // ==========================================================================
    // Main Render
    // ==========================================================================

    return (
        <div className="min-h-screen bg-gray-50 pb-safe">
            {renderHeader()}
            {renderToolbar()}
            {renderBundleSections()}

            {/* Spacer for cart bar */}
            {cart.length > 0 && !showCheckout && <div className="h-20" />}

            {renderFooter()}
            {renderCartBar()}
            {renderAddDialog()}
            {renderCheckoutDialog()}
        </div>
    );
};

export { PublicStore as PublicStorePage };
export default PublicStore;
