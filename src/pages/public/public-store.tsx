import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
    storefrontService,
    type PublicStorefront,
    type PublicBundle,
    type PublicOrderData,
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
        if (!customerName.trim()) { alert("Please enter your name"); return; }
        if (!customerPhone.trim()) { alert("Please enter your phone number"); return; }
        if (cart.length === 0) { alert("Your cart is empty"); return; }

        // Validate each item has a phone number
        for (const item of cart) {
            const phone = item.customerPhone || customerPhone;
            if (!phone.trim()) {
                alert(`Please provide a recipient phone number for ${item.bundle.name}`);
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
            alert(message);
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
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
                        <p className="text-gray-600 mb-6">
                            Your order has been placed successfully. The store owner will verify your payment and process your order.
                        </p>
                        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-gray-600">Order Number:</span><span className="font-mono font-bold">{orderResult.orderNumber}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">Total Amount:</span><span className="font-bold">GHS {orderResult.total.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">Status:</span><span className="text-yellow-600 font-medium">Pending Verification</span></div>
                            </div>
                        </div>

                        {/* Payment Instructions */}
                        <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
                            <h3 className="font-semibold text-blue-900 mb-2">Payment Instructions</h3>
                            {activeMethods.map((method, idx) => (
                                <div key={idx} className="mb-3 last:mb-0">
                                    {method.type === "mobile_money" && method.details && (
                                        <div className="text-sm text-blue-800">
                                            <p className="font-medium">Mobile Money:</p>
                                            {(method.details as { accounts?: Array<{ provider: string; number: string; accountName: string }> }).accounts?.map((acc, i) => (
                                                <p key={i} className="ml-2">
                                                    {acc.provider}: {acc.number} ({acc.accountName})
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                    {method.type === "bank_transfer" && method.details && (
                                        <div className="text-sm text-blue-800">
                                            <p className="font-medium">Bank Transfer:</p>
                                            <p className="ml-2">
                                                {(method.details as { bank?: string }).bank}: {(method.details as { account?: string }).account} ({(method.details as { name?: string }).name})
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <p className="text-xs text-blue-700 mt-2">
                                Send GHS {orderResult.total.toFixed(2)} to the details above, then wait for the store owner to verify.
                            </p>
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
        <div className="min-h-screen bg-gray-50">
            {/* Store Header */}
            <div className={`${theme.primary} text-white`}>
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                            <Store className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold">{storefront.displayName}</h1>
                            {storefront.description && (
                                <p className="text-white/80 mt-1">{storefront.description}</p>
                            )}
                        </div>
                        {/* Cart button */}
                        {step === "browse" && cart.length > 0 && (
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
                        )}
                    </div>

                    {/* Contact info */}
                    {storefront.settings?.showContact && storefront.contactInfo && (
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
                    )}
                </div>
            </div>

            {/* Navigation */}
            {step !== "browse" && step !== "confirmation" && (
                <div className="max-w-6xl mx-auto px-4 py-3">
                    <button
                        onClick={() => setStep(step === "checkout" ? "cart" : "browse")}
                        className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {step === "checkout" ? "Back to Cart" : "Continue Shopping"}
                    </button>
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
                                                <label className="block text-sm text-gray-600 mb-1">Recipient Phone Number</label>
                                                <input
                                                    type="tel"
                                                    value={item.customerPhone}
                                                    onChange={(e) => updateCartPhone(item.bundle._id, e.target.value)}
                                                    placeholder="e.g. 0241234567"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                                <p className="text-xs text-gray-400 mt-1">Leave blank to use your phone number</p>
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
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Checkout</h2>

                        <div className="space-y-4">
                            {/* Customer Info */}
                            <div className="bg-white rounded-xl p-5 shadow-sm border">
                                <h3 className="font-semibold text-gray-900 mb-3">Your Information</h3>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                        <input
                                            type="tel"
                                            value={customerPhone}
                                            onChange={(e) => setCustomerPhone(e.target.value)}
                                            placeholder="0241234567"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
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

                            {/* Payment Method */}
                            <div className="bg-white rounded-xl p-5 shadow-sm border">
                                <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
                                <div className="space-y-3">
                                    {activeMethods.map((method, idx) => (
                                        <label
                                            key={idx}
                                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${paymentType === method.type ? `${theme.bg} border-2 ${theme.ring.replace('ring', 'border')}` : "border-gray-200 hover:bg-gray-50"
                                                }`}
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
                                                <p className="font-medium text-gray-900">
                                                    {method.type === "mobile_money" ? "Mobile Money" : "Bank Transfer"}
                                                </p>
                                                {method.type === "mobile_money" && method.details && (
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        {(method.details as { accounts?: Array<{ provider: string; number: string; accountName: string }> }).accounts?.map((acc, i) => (
                                                            <p key={i}>{acc.provider}: {acc.number} ({acc.accountName})</p>
                                                        ))}
                                                    </div>
                                                )}
                                                {method.type === "bank_transfer" && method.details && (
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        <p>{(method.details as { bank?: string }).bank}: {(method.details as { account?: string }).account}</p>
                                                        <p>Name: {(method.details as { name?: string }).name}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                    ))}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Reference / Transaction ID</label>
                                        <input
                                            type="text"
                                            value={paymentReference}
                                            onChange={(e) => setPaymentReference(e.target.value)}
                                            placeholder="Enter your payment reference (optional)"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">
                                            You can add the reference after making payment
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="bg-white rounded-xl p-5 shadow-sm border">
                                <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
                                <div className="divide-y">
                                    {cart.map(item => (
                                        <div key={item.bundle._id} className="py-2 flex justify-between text-sm">
                                            <span>
                                                {item.bundle.name} x{item.quantity}
                                                {item.customerPhone && <span className="text-gray-400 ml-1">({item.customerPhone})</span>}
                                            </span>
                                            <span className="font-medium">GHS {(item.bundle.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                    <div className="py-3 flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span>GHS {cartTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmitOrder}
                                disabled={isSubmitting}
                                className={`w-full ${theme.primary} text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Placing Order...
                                    </>
                                ) : (
                                    `Place Order - GHS ${cartTotal.toFixed(2)}`
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-12 border-t bg-white">
                <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
                    <p>Powered by BryteLinks</p>
                </div>
            </div>

            {/* Bottom padding for floating cart */}
            {step === "browse" && cart.length > 0 && <div className="h-20" />}
        </div>
    );
};
