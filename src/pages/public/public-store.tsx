import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
    storefrontService,
    type PublicStorefront,
    type PublicBundle,
    type PublicOrderData,
    type StorefrontBranding,
} from "../../services/storefront.service";
import {
    Store,
    Phone,
    Mail,
    MessageCircle,
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    CheckCircle,
    AlertTriangle,
    Loader2,
    ArrowLeft,
    Wifi,
    Globe,
    Facebook,
    Instagram,
    Twitter,
    ExternalLink,
} from "lucide-react";

// =========================================================================
// Types
// =========================================================================

interface CartItem {
    bundle: PublicBundle;
    quantity: number;
    customerPhone: string;
}

type Step = "browse" | "cart" | "checkout" | "confirmation";

// =========================================================================
// Theme Helpers
// =========================================================================

const THEME_COLORS: Record<string, { primary: string; bg: string; ring: string; text: string; light: string }> = {
    blue: { primary: "bg-blue-600", bg: "bg-blue-50", ring: "ring-blue-500", text: "text-blue-600", light: "bg-blue-100" },
    green: { primary: "bg-green-600", bg: "bg-green-50", ring: "ring-green-500", text: "text-green-600", light: "bg-green-100" },
    purple: { primary: "bg-purple-600", bg: "bg-purple-50", ring: "ring-purple-500", text: "text-purple-600", light: "bg-purple-100" },
    red: { primary: "bg-red-600", bg: "bg-red-50", ring: "ring-red-500", text: "text-red-600", light: "bg-red-100" },
    orange: { primary: "bg-orange-600", bg: "bg-orange-50", ring: "ring-orange-500", text: "text-orange-600", light: "bg-orange-100" },
    teal: { primary: "bg-teal-600", bg: "bg-teal-50", ring: "ring-teal-500", text: "text-teal-600", light: "bg-teal-100" },
    indigo: { primary: "bg-indigo-600", bg: "bg-indigo-50", ring: "ring-indigo-500", text: "text-indigo-600", light: "bg-indigo-100" },
    pink: { primary: "bg-pink-600", bg: "bg-pink-50", ring: "ring-pink-500", text: "text-pink-600", light: "bg-pink-100" },
};

// =========================================================================
// Main Page
// =========================================================================

export const PublicStorePage: React.FC = () => {
    const { businessName } = useParams<{ businessName: string }>();
    const [storeData, setStoreData] = useState<PublicStorefront | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Cart & checkout state
    const [cart, setCart] = useState<CartItem[]>([]);
    const [step, setStep] = useState<Step>("browse");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);
    const [orderResult, setOrderResult] = useState<{ orderId: string; orderNumber: string; total: number } | null>(null);

    // Checkout form
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [paymentType, setPaymentType] = useState<"mobile_money" | "bank_transfer">("mobile_money");
    const [paymentReference, setPaymentReference] = useState("");

    const theme = THEME_COLORS[storeData?.storefront.settings?.theme || "blue"] || THEME_COLORS.blue;

    const loadStore = useCallback(async () => {
        if (!businessName) return;
        try {
            setIsLoading(true);
            const data = await storefrontService.getPublicStorefront(businessName);
            setStoreData(data);

            // Set default payment type from active methods
            const activeMethods = data.storefront.paymentMethods.filter(pm => pm.isActive);
            if (activeMethods.length > 0) {
                setPaymentType(activeMethods[0].type);
            }
        } catch (err) {
            console.error("Failed to load store:", err);
            setError("Store not found or is currently unavailable.");
        } finally {
            setIsLoading(false);
        }
    }, [businessName]);

    useEffect(() => {
        loadStore();
    }, [loadStore]);

    // =========================================================================
    // Cart Operations
    // =========================================================================

    const addToCart = (bundle: PublicBundle) => {
        setCart(prev => {
            const existing = prev.find(item => item.bundle._id === bundle._id);
            if (existing) {
                return prev.map(item =>
                    item.bundle._id === bundle._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { bundle, quantity: 1, customerPhone: "" }];
        });
    };

    const updateCartQuantity = (bundleId: string, delta: number) => {
        setCart(prev =>
            prev
                .map(item => {
                    if (item.bundle._id === bundleId) {
                        const newQty = item.quantity + delta;
                        return newQty > 0 ? { ...item, quantity: newQty } : item;
                    }
                    return item;
                })
                .filter(item => item.quantity > 0)
        );
    };

    const updateCartPhone = (bundleId: string, phone: string) => {
        setCart(prev =>
            prev.map(item =>
                item.bundle._id === bundleId ? { ...item, customerPhone: phone } : item
            )
        );
    };

    const removeFromCart = (bundleId: string) => {
        setCart(prev => prev.filter(item => item.bundle._id !== bundleId));
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.bundle.price * item.quantity, 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    // =========================================================================
    // Checkout
    // =========================================================================

    const handleSubmitOrder = async () => {
        if (!businessName || !storeData) return;

        // Validation
        setCheckoutError(null);
        if (!customerName.trim()) { setCheckoutError("Please enter your name"); return; }
        if (!customerPhone.trim()) { setCheckoutError("Please enter your phone number"); return; }
        if (cart.length === 0) { setCheckoutError("Your cart is empty"); return; }

        // Validate each item has a phone number
        for (const item of cart) {
            const phone = item.customerPhone || customerPhone;
            if (!phone.trim()) {
                setCheckoutError(`Please provide a recipient phone number for ${item.bundle.name}`);
                return;
            }
        }

        try {
            setIsSubmitting(true);

            const orderData: PublicOrderData = {
                items: cart.map(item => ({
                    bundleId: item.bundle._id,
                    quantity: item.quantity,
                    customerPhone: item.customerPhone || customerPhone,
                })),
                customerInfo: {
                    name: customerName.trim(),
                    phone: customerPhone.trim(),
                    email: customerEmail.trim() || undefined,
                },
                paymentMethod: {
                    type: paymentType,
                    reference: paymentReference.trim() || undefined,
                },
            };

            const result = await storefrontService.createPublicOrder(businessName, orderData);
            setOrderResult(result);
            setStep("confirmation");
            setCart([]);
        } catch (err: unknown) {
            console.error("Order failed:", err);
            const message = err instanceof Object && "response" in err &&
                (err as { response: { data: { message: string } } }).response?.data?.message
                ? (err as { response: { data: { message: string } } }).response.data.message
                : "Failed to place order. Please try again.";
            setCheckoutError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // =========================================================================
    // Render: Loading / Error
    // =========================================================================

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                    <p className="mt-2 text-gray-600">Loading store...</p>
                </div>
            </div>
        );
    }

    if (error || !storeData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md px-4">
                    <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Store Not Found</h1>
                    <p className="text-gray-600 mb-6">
                        {error || "This store doesn't exist or isn't available right now."}
                    </p>
                    <Link to="/" className="text-blue-600 hover:underline">
                        Go to Homepage
                    </Link>
                </div>
            </div>
        );
    }

    const { storefront, bundles } = storeData;
    const activeMethods = storefront.paymentMethods.filter(pm => pm.isActive);
    const branding: StorefrontBranding = storefront.branding || {};
    const layout = branding.layout || "classic";

    // =========================================================================
    // Render: Social Links Helper
    // =========================================================================

    const socialLinks = branding.socialLinks;
    const hasSocialLinks = socialLinks && (socialLinks.facebook || socialLinks.instagram || socialLinks.twitter || socialLinks.tiktok);

    const renderSocialLinks = () => {
        if (!hasSocialLinks) return null;
        return (
            <div className="flex items-center gap-3">
                {socialLinks?.facebook && (
                    <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Facebook">
                        <Facebook className="w-5 h-5" />
                    </a>
                )}
                {socialLinks?.instagram && (
                    <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Instagram">
                        <Instagram className="w-5 h-5" />
                    </a>
                )}
                {socialLinks?.twitter && (
                    <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Twitter">
                        <Twitter className="w-5 h-5" />
                    </a>
                )}
                {socialLinks?.tiktok && (
                    <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="TikTok">
                        <ExternalLink className="w-5 h-5" />
                    </a>
                )}
            </div>
        );
    };

    // =========================================================================
    // Render: Store Header (layout-aware)
    // =========================================================================

    const renderStoreHeader = () => {
        const logoElement = branding.logoUrl ? (
            <img src={branding.logoUrl} alt={storefront.displayName} className="w-14 h-14 rounded-xl object-cover border-2 border-white/30" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling && ((e.target as HTMLImageElement).nextElementSibling as HTMLElement).classList.remove('hidden'); }} />
        ) : null;
        const fallbackIcon = (
            <div className={`w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center ${branding.logoUrl ? 'hidden' : ''}`}>
                <Store className="w-7 h-7" />
            </div>
        );

        const cartButton = step === "browse" && cart.length > 0 && (
            <button
                onClick={() => setStep("cart")}
                className="relative bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
                <ShoppingCart className="w-5 h-5" />
                <span className="font-medium">Cart</span>
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                </span>
            </button>
        );

        const contactBar = storefront.settings?.showContact && storefront.contactInfo && (
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-white/80">
                {storefront.contactInfo.phone && (
                    <a href={`tel:${storefront.contactInfo.phone}`} className="flex items-center gap-1 hover:text-white">
                        <Phone className="w-4 h-4" /> {storefront.contactInfo.phone}
                    </a>
                )}
                {storefront.contactInfo.email && (
                    <a href={`mailto:${storefront.contactInfo.email}`} className="flex items-center gap-1 hover:text-white">
                        <Mail className="w-4 h-4" /> {storefront.contactInfo.email}
                    </a>
                )}
                {storefront.contactInfo.whatsapp && (
                    <a href={`https://wa.me/${storefront.contactInfo.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white">
                        <MessageCircle className="w-4 h-4" /> WhatsApp
                    </a>
                )}
            </div>
        );

        // Modern layout: large banner with overlay
        if (layout === "modern") {
            return (
                <>
                    {/* Banner */}
                    {branding.bannerUrl && branding.showBanner !== false && (
                        <div className="relative h-48 sm:h-64 overflow-hidden">
                            <img src={branding.bannerUrl} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />
                        </div>
                    )}
                    {/* Header overlapping banner */}
                    <div className={`${theme.primary} text-white ${branding.bannerUrl && branding.showBanner !== false ? '-mt-20 relative z-10' : ''}`}>
                        <div className="max-w-6xl mx-auto px-4 py-6">
                            <div className="flex items-center gap-4">
                                {logoElement}
                                {fallbackIcon}
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-2xl sm:text-3xl font-bold truncate">{storefront.displayName}</h1>
                                    {branding.tagline && (
                                        <p className="text-white/90 text-sm sm:text-base mt-0.5 italic">{branding.tagline}</p>
                                    )}
                                    {!branding.tagline && storefront.description && (
                                        <p className="text-white/80 mt-1 text-sm">{storefront.description}</p>
                                    )}
                                </div>
                                {cartButton}
                            </div>
                            {contactBar}
                        </div>
                    </div>
                </>
            );
        }

        // Minimal layout: clean, text-focused
        if (layout === "minimal") {
            return (
                <div className="bg-white border-b">
                    <div className="max-w-6xl mx-auto px-4 py-6">
                        <div className="flex items-center gap-4">
                            {branding.logoUrl && (
                                <img src={branding.logoUrl} alt={storefront.displayName} className="w-10 h-10 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            )}
                            <div className="flex-1 min-w-0">
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{storefront.displayName}</h1>
                                {branding.tagline && (
                                    <p className="text-gray-500 text-sm mt-0.5">{branding.tagline}</p>
                                )}
                            </div>
                            {step === "browse" && cart.length > 0 && (
                                <button
                                    onClick={() => setStep("cart")}
                                    className={`relative ${theme.primary} text-white px-4 py-2 rounded-lg transition-opacity hover:opacity-90 flex items-center gap-2`}
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    <span className="font-medium">Cart</span>
                                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                </button>
                            )}
                        </div>
                        {storefront.settings?.showContact && storefront.contactInfo && (
                            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                                {storefront.contactInfo.phone && (
                                    <a href={`tel:${storefront.contactInfo.phone}`} className="flex items-center gap-1 hover:text-gray-700">
                                        <Phone className="w-4 h-4" /> {storefront.contactInfo.phone}
                                    </a>
                                )}
                                {storefront.contactInfo.email && (
                                    <a href={`mailto:${storefront.contactInfo.email}`} className="flex items-center gap-1 hover:text-gray-700">
                                        <Mail className="w-4 h-4" /> {storefront.contactInfo.email}
                                    </a>
                                )}
                                {storefront.contactInfo.whatsapp && (
                                    <a href={`https://wa.me/${storefront.contactInfo.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-gray-700">
                                        <MessageCircle className="w-4 h-4" /> WhatsApp
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // Classic layout (default): standard colored header
        return (
            <div className={`${theme.primary} text-white`}>
                {/* Banner above header */}
                {branding.bannerUrl && branding.showBanner !== false && (
                    <div className="h-32 sm:h-44 overflow-hidden">
                        <img src={branding.bannerUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="flex items-center gap-4">
                        {logoElement}
                        {fallbackIcon}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl font-bold truncate">{storefront.displayName}</h1>
                            {branding.tagline && (
                                <p className="text-white/90 mt-0.5 italic">{branding.tagline}</p>
                            )}
                            {!branding.tagline && storefront.description && (
                                <p className="text-white/80 mt-1">{storefront.description}</p>
                            )}
                        </div>
                        {cartButton}
                    </div>
                    {contactBar}
                </div>
            </div>
        );
    };

    // =========================================================================
    // Render: Confirmation
    // =========================================================================

    if (step === "confirmation" && orderResult) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-lg mx-auto px-4 py-12">
                    <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
                        <p className="text-gray-600 mb-6">
                            Thank you! Your order has been received and is being reviewed.
                        </p>
                        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-gray-600">Order Number:</span><span className="font-mono font-bold">{orderResult.orderNumber}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">Total Amount:</span><span className="font-bold">GHS {orderResult.total.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">Status:</span><span className="text-yellow-600 font-medium">Pending Verification</span></div>
                            </div>
                        </div>

                        {/* What Happens Next */}
                        <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
                            <h3 className="font-semibold text-blue-900 mb-3">What happens next?</h3>
                            <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                                <li>The store owner will verify your payment</li>
                                <li>Once confirmed, your data bundle(s) will be delivered to the phone number(s) you provided</li>
                                <li>You&apos;ll receive the data on your phone — no further action needed</li>
                            </ol>
                            {storefront.contactInfo?.whatsapp && (
                                <p className="text-sm text-blue-700 mt-3 pt-3 border-t border-blue-200">
                                    Questions? Contact the store on{" "}
                                    <a href={`https://wa.me/${storefront.contactInfo.whatsapp}?text=Hi, I just placed order ${orderResult.orderNumber}`} target="_blank" rel="noopener noreferrer" className="font-medium underline">
                                        WhatsApp
                                    </a>
                                </p>
                            )}
                            {!storefront.contactInfo?.whatsapp && storefront.contactInfo?.phone && (
                                <p className="text-sm text-blue-700 mt-3 pt-3 border-t border-blue-200">
                                    Questions? Call the store at{" "}
                                    <a href={`tel:${storefront.contactInfo.phone}`} className="font-medium underline">
                                        {storefront.contactInfo.phone}
                                    </a>
                                </p>
                            )}
                        </div>

                        <button
                            onClick={() => { setStep("browse"); setOrderResult(null); }}
                            className={`w-full py-3 rounded-lg text-white font-medium ${theme.primary} hover:opacity-90 transition-opacity`}
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================================
    // Render: Store Header
    // =========================================================================

    return (
        <div className={`min-h-screen ${layout === "minimal" ? "bg-white" : "bg-gray-50"}`}>
            {/* Store Header */}
            {renderStoreHeader()}

            {/* Step Progress Indicator */}
            {step !== "browse" && step !== "confirmation" && (
                <div className="max-w-6xl mx-auto px-4 pt-4 pb-2">
                    <div className="flex items-center gap-1 mb-3">
                        <button
                            onClick={() => setStep(step === "checkout" ? "cart" : "browse")}
                            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {step === "checkout" ? "Back to Cart" : "Continue Shopping"}
                        </button>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <div className={`flex items-center gap-1.5 ${step === "cart" || step === "checkout" ? theme.text + " font-semibold" : "text-gray-400"}`}>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === "cart" ? theme.primary + " text-white" : step === "checkout" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                                {step === "checkout" ? "✓" : "1"}
                            </span>
                            Cart
                        </div>
                        <div className="flex-1 h-px bg-gray-200 mx-1" />
                        <div className={`flex items-center gap-1.5 ${step === "checkout" ? theme.text + " font-semibold" : "text-gray-400"}`}>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === "checkout" ? theme.primary + " text-white" : "bg-gray-200 text-gray-500"}`}>2</span>
                            Pay & Checkout
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* ===== BROWSE ===== */}
                {step === "browse" && (
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            Available Bundles ({bundles.length})
                        </h2>
                        {bundles.length === 0 ? (
                            <div className="bg-white rounded-xl p-8 text-center text-gray-500">
                                <Globe className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                                <p>No bundles available at the moment. Please check back later.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {bundles.map(bundle => {
                                    const inCart = cart.find(item => item.bundle._id === bundle._id);
                                    return (
                                        <div key={bundle._id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow overflow-hidden">
                                            <div className={`${theme.light} px-4 py-3 flex items-center justify-between`}>
                                                <span className={`text-xs font-semibold ${theme.text} uppercase`}>{bundle.provider}</span>
                                                {bundle.category && (
                                                    <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded">{bundle.category}</span>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-semibold text-gray-900 mb-1">{bundle.name}</h3>
                                                {bundle.description && (
                                                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">{bundle.description}</p>
                                                )}
                                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                                    <Wifi className="w-4 h-4" />
                                                    <span>{bundle.dataVolume} {bundle.dataUnit}</span>
                                                    <span className="text-gray-300">|</span>
                                                    <span>{bundle.validity} {bundle.validityUnit}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xl font-bold text-gray-900">GHS {bundle.price.toFixed(2)}</span>
                                                    {inCart ? (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => updateCartQuantity(bundle._id, -1)}
                                                                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
                                                            >
                                                                <Minus className="w-4 h-4" />
                                                            </button>
                                                            <span className="font-bold w-6 text-center">{inCart.quantity}</span>
                                                            <button
                                                                onClick={() => updateCartQuantity(bundle._id, 1)}
                                                                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => addToCart(bundle)}
                                                            className={`${theme.primary} text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-1`}
                                                        >
                                                            <ShoppingCart className="w-4 h-4" /> Add
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Floating cart summary */}
                        {cart.length > 0 && (
                            <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
                                <div className="max-w-6xl mx-auto flex items-center justify-between">
                                    <div>
                                        <span className="font-bold text-gray-900">{cartCount} item{cartCount !== 1 ? "s" : ""}</span>
                                        <span className="text-gray-500 mx-2">|</span>
                                        <span className="font-bold text-gray-900">GHS {cartTotal.toFixed(2)}</span>
                                    </div>
                                    <button
                                        onClick={() => setStep("cart")}
                                        className={`${theme.primary} text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity`}
                                    >
                                        View Cart & Checkout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ===== CART ===== */}
                {step === "cart" && (
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Cart</h2>

                        {cart.length === 0 ? (
                            <div className="bg-white rounded-xl p-8 text-center text-gray-500">
                                <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                                <p>Your cart is empty</p>
                                <button
                                    onClick={() => setStep("browse")}
                                    className={`mt-4 ${theme.text} font-medium hover:underline`}
                                >
                                    Browse bundles
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3 mb-6">
                                    {cart.map(item => (
                                        <div key={item.bundle._id} className="bg-white rounded-xl p-4 shadow-sm border">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{item.bundle.name}</h3>
                                                    <p className="text-sm text-gray-500">
                                                        {item.bundle.provider} | {item.bundle.dataVolume} {item.bundle.dataUnit} | {item.bundle.validity} {item.bundle.validityUnit}
                                                    </p>
                                                </div>
                                                <button onClick={() => removeFromCart(item.bundle._id)} className="text-red-400 hover:text-red-600">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="mb-3">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Which number should receive this data bundle?
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={item.customerPhone}
                                                    onChange={(e) => updateCartPhone(item.bundle._id, e.target.value)}
                                                    placeholder="e.g. 0241234567"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                                <p className="text-xs text-gray-400 mt-1">
                                                    The {item.bundle.provider} number that will receive this data. Leave blank to use your phone number at checkout.
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updateCartQuantity(item.bundle._id, -1)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="font-bold w-8 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateCartQuantity(item.bundle._id, 1)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <span className="font-bold text-gray-900">
                                                    GHS {(item.bundle.price * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Cart Summary */}
                                <div className="bg-white rounded-xl p-4 shadow-sm border mb-4">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span>GHS {cartTotal.toFixed(2)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setStep("checkout")}
                                    className={`w-full ${theme.primary} text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity`}
                                >
                                    Proceed to Checkout
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* ===== CHECKOUT ===== */}
                {step === "checkout" && (
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Pay & Checkout</h2>

                        <div className="space-y-4">
                            {/* Step 1: Customer Info */}
                            <div className="bg-white rounded-xl p-5 shadow-sm border">
                                <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                                    <span className={`w-6 h-6 ${theme.primary} text-white rounded-full flex items-center justify-center text-xs font-bold`}>1</span>
                                    Your Information
                                </h3>
                                <p className="text-sm text-gray-500 mb-3 ml-8">We need this to process your order</p>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                        <input
                                            type="text"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            placeholder="John Doe"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Phone Number *</label>
                                        <input
                                            type="tel"
                                            value={customerPhone}
                                            onChange={(e) => setCustomerPhone(e.target.value)}
                                            placeholder="0241234567"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">This is also used as the default recipient number for bundles</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                                        <input
                                            type="email"
                                            value={customerEmail}
                                            onChange={(e) => setCustomerEmail(e.target.value)}
                                            placeholder="john@example.com"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: How to Pay — PROMINENT */}
                            <div className={`rounded-xl p-5 shadow-sm border-2 ${theme.bg} ${theme.ring.replace('ring', 'border')}`}>
                                <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                                    <span className={`w-6 h-6 ${theme.primary} text-white rounded-full flex items-center justify-center text-xs font-bold`}>2</span>
                                    Send Payment
                                </h3>
                                <p className="text-sm text-gray-600 mb-4 ml-8">
                                    Send <span className="font-bold text-gray-900">GHS {cartTotal.toFixed(2)}</span> to one of the payment details below
                                </p>

                                <div className="space-y-3">
                                    {activeMethods.map((method, idx) => (
                                        <label
                                            key={idx}
                                            className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors bg-white ${paymentType === method.type ? `${theme.ring.replace('ring', 'border')} shadow-sm` : "border-gray-200 hover:border-gray-300"}`}
                                        >
                                            <input
                                                type="radio"
                                                name="paymentType"
                                                value={method.type}
                                                checked={paymentType === method.type}
                                                onChange={() => setPaymentType(method.type)}
                                                className="mt-1"
                                            />
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900 mb-2">
                                                    {method.type === "mobile_money" ? "Mobile Money" : "Bank Transfer"}
                                                </p>
                                                {method.type === "mobile_money" && method.details && (
                                                    <div className="space-y-2">
                                                        {(method.details as { accounts?: Array<{ provider: string; number: string; accountName: string }> }).accounts?.map((acc, i) => (
                                                            <div key={i} className={`p-3 rounded-lg ${theme.bg}`}>
                                                                <p className="text-sm font-medium text-gray-900">{acc.provider} Mobile Money</p>
                                                                <p className="text-lg font-bold text-gray-900 font-mono">{acc.number}</p>
                                                                <p className="text-sm text-gray-600">Account Name: {acc.accountName}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {method.type === "bank_transfer" && method.details && (
                                                    <div className={`p-3 rounded-lg ${theme.bg}`}>
                                                        <p className="text-sm font-medium text-gray-900">{(method.details as { bank?: string }).bank}</p>
                                                        <p className="text-lg font-bold text-gray-900 font-mono">{(method.details as { account?: string }).account}</p>
                                                        <p className="text-sm text-gray-600">Account Name: {(method.details as { name?: string }).name}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                {/* How it works */}
                                <div className="mt-4 p-3 bg-white rounded-lg border border-dashed border-gray-300">
                                    <p className="text-sm font-medium text-gray-700 mb-2">How it works:</p>
                                    <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                                        <li>Send <span className="font-semibold">GHS {cartTotal.toFixed(2)}</span> to the payment details above</li>
                                        <li>Enter the transaction reference / ID below</li>
                                        <li>Click &quot;Place Order&quot; to submit your order</li>
                                        <li>The store owner will verify your payment and deliver your bundle(s)</li>
                                    </ol>
                                </div>
                            </div>

                            {/* Step 3: Payment Reference */}
                            <div className="bg-white rounded-xl p-5 shadow-sm border">
                                <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                                    <span className={`w-6 h-6 ${theme.primary} text-white rounded-full flex items-center justify-center text-xs font-bold`}>3</span>
                                    Confirm Payment
                                </h3>
                                <p className="text-sm text-gray-500 mb-3 ml-8">Enter your payment reference so the store owner can verify</p>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Payment Reference / Transaction ID
                                    </label>
                                    <input
                                        type="text"
                                        value={paymentReference}
                                        onChange={(e) => setPaymentReference(e.target.value)}
                                        placeholder="e.g. MoMo transaction ID or bank reference"
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        This helps the store owner find and verify your payment quickly. You can also add it after placing your order.
                                    </p>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="bg-white rounded-xl p-5 shadow-sm border">
                                <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
                                <div className="divide-y">
                                    {cart.map(item => (
                                        <div key={item.bundle._id} className="py-2 flex justify-between text-sm">
                                            <div>
                                                <span className="text-gray-900">{item.bundle.name} x{item.quantity}</span>
                                                <span className="block text-xs text-gray-400">
                                                    {item.bundle.provider} — {item.customerPhone ? `To: ${item.customerPhone}` : "To: your phone number"}
                                                </span>
                                            </div>
                                            <span className="font-medium">GHS {(item.bundle.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                    <div className="py-3 flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span>GHS {cartTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Checkout error */}
                            {checkoutError && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                    <AlertTriangle className="w-4 h-4 shrink-0" />
                                    <span>{checkoutError}</span>
                                </div>
                            )}

                            <button
                                onClick={handleSubmitOrder}
                                disabled={isSubmitting}
                                className={`w-full ${theme.primary} text-white py-3.5 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Placing Order...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Place Order — GHS {cartTotal.toFixed(2)}
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-center text-gray-400">
                                By placing this order, you confirm that you have sent the payment to the store owner.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-12 border-t bg-white">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
                        <p>{branding.footerText || "Powered by BryteLinks"}</p>
                        {renderSocialLinks()}
                    </div>
                </div>
            </div>

            {/* Bottom padding for floating cart */}
            {step === "browse" && cart.length > 0 && <div className="h-20" />}
        </div>
    );
};
