// src/pages/public/store-page.tsx
import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "../../design-system/components/card";
import { Button } from "../../design-system/components/button";
import { Input } from "../../design-system/components/input";
import { Badge } from "../../design-system/components/badge";
import { useToast } from "../../design-system";
import {
  Phone,
  Mail,
  MessageCircle,
  ShoppingCart,
  Package,
  ArrowLeft,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle,
  Smartphone,
  CreditCard,
  Building,
} from "lucide-react";
import { storefrontService } from "../../services/storefront.service";
import type {
  PublicStorefront,
  StorefrontBundle,
  PaymentMethod,
} from "../../services/storefront.service";

// Order status type
type OrderStatus = "idle" | "loading" | "success" | "error";

// Cart item interface
interface CartItem {
  bundle: StorefrontBundle;
  quantity: number;
  recipientPhone: string;
}

// Customer info interface
interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
}

// Payment method icons
const PAYMENT_METHOD_ICONS: Record<string, React.ReactNode> = {
  mobile_money: <Smartphone className="w-5 h-5" />,
  bank_transfer: <Building className="w-5 h-5" />,
  paystack: <CreditCard className="w-5 h-5" />,
};

// Payment method labels
const PAYMENT_METHOD_LABELS: Record<string, string> = {
  mobile_money: "Mobile Money",
  bank_transfer: "Bank Transfer",
  paystack: "Paystack",
};

export function PublicStorePage() {
  const { businessName } = useParams<{ businessName: string }>();
  const { showToast } = useToast();

  // Store data state
  const [storefront, setStorefront] = useState<PublicStorefront | null>(null);
  const [bundles, setBundles] = useState<StorefrontBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  // Checkout state
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
    email: "",
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("idle");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Fetch store data
  useEffect(() => {
    const fetchStoreData = async () => {
      if (!businessName) {
        setError("Store not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [storeData, bundleData] = await Promise.all([
          storefrontService.getPublicStorefront(businessName),
          storefrontService.getStorefrontBundles(businessName),
        ]);

        setStorefront(storeData);
        setBundles(bundleData);

        // Set default payment method
        const activePaymentMethods = storeData.paymentMethods.filter(
          (pm) => pm.isActive,
        );
        if (activePaymentMethods.length > 0) {
          setSelectedPaymentMethod(activePaymentMethods[0].type);
        }
      } catch (err) {
        console.error("Failed to load store:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load store. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [businessName]);

  // Get unique categories from bundles
  const categories = useMemo(() => {
    const cats = new Set(bundles.map((b) => b.category));
    return ["all", ...Array.from(cats)];
  }, [bundles]);

  // Filter bundles
  const filteredBundles = useMemo(() => {
    return bundles.filter((bundle) => {
      const matchesSearch =
        bundle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bundle.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || bundle.category === selectedCategory;
      return matchesSearch && matchesCategory && bundle.isActive;
    });
  }, [bundles, searchQuery, selectedCategory]);

  // Cart calculations
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = item.bundle.customPrice ?? item.bundle.price;
      return sum + price * item.quantity;
    }, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Add to cart
  const addToCart = (bundle: StorefrontBundle) => {
    const existingItem = cart.find((item) => item.bundle._id === bundle._id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.bundle._id === bundle._id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCart([...cart, { bundle, quantity: 1, recipientPhone: "" }]);
    }
    showToast(`${bundle.name} added to cart`, "success");
  };

  // Remove from cart
  const removeFromCart = (bundleId: string) => {
    setCart(cart.filter((item) => item.bundle._id !== bundleId));
  };

  // Update cart item
  const updateCartItem = (bundleId: string, updates: Partial<CartItem>) => {
    setCart(
      cart.map((item) =>
        item.bundle._id === bundleId ? { ...item, ...updates } : item,
      ),
    );
  };

  // Handle checkout
  const handleCheckout = async () => {
    // Validate customer info
    if (!customerInfo.name.trim()) {
      showToast("Please enter your name", "error");
      return;
    }
    if (!customerInfo.phone.trim()) {
      showToast("Please enter your phone number", "error");
      return;
    }
    if (!selectedPaymentMethod) {
      showToast("Please select a payment method", "error");
      return;
    }

    // Validate cart items have recipient phones
    const invalidItems = cart.filter((item) => !item.recipientPhone.trim());
    if (invalidItems.length > 0) {
      showToast("Please enter recipient phone numbers for all items", "error");
      return;
    }

    try {
      setOrderStatus("loading");

      // In a real implementation, this would call the API
      // For now, we'll simulate the order creation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate order number
      const mockOrderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
      setOrderNumber(mockOrderNumber);
      setOrderStatus("success");

      // Clear cart
      setCart([]);
    } catch (err) {
      console.error("Checkout failed:", err);
      setOrderStatus("error");
      showToast("Failed to place order. Please try again.", "error");
    }
  };

  // Get selected payment method details
  const getSelectedPaymentMethodDetails = (): PaymentMethod | undefined => {
    return storefront?.paymentMethods.find(
      (pm) => pm.type === selectedPaymentMethod,
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading store...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !storefront) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Store Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error ||
              "The store you're looking for doesn't exist or is unavailable."}
          </p>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Order success state
  if (orderStatus === "success" && orderNumber) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-600 mb-4">Your order number is:</p>
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <span className="text-2xl font-mono font-bold text-primary-600">
              {orderNumber}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Please complete your payment using the selected method. The store
            owner will verify your payment and process your order.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => {
                setOrderStatus("idle");
                setShowCheckout(false);
                setOrderNumber(null);
              }}
              className="w-full"
            >
              Continue Shopping
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Apply theme colors
  const themeStyles = {
    "--store-primary": storefront.theme?.primaryColor || "#3B82F6",
    "--store-secondary": storefront.theme?.secondaryColor || "#64748B",
  } as React.CSSProperties;

  return (
    <div className="min-h-screen bg-gray-50" style={themeStyles}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
                style={{
                  backgroundColor: storefront.theme?.primaryColor || "#3B82F6",
                }}
              >
                {(storefront.displayName || storefront.businessName)
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {storefront.displayName || storefront.businessName}
                </h1>
                {storefront.description && (
                  <p className="text-sm text-gray-600 line-clamp-1">
                    {storefront.description}
                  </p>
                )}
              </div>
            </div>

            {/* Cart Button */}
            <Button
              variant="outline"
              onClick={() => setShowCart(!showCart)}
              className="relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Filter */}
            <div className="mb-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search bundles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={
                      selectedCategory === category ? "primary" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category === "all" ? "All" : category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Bundles Grid */}
            {filteredBundles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBundles.map((bundle) => (
                  <Card
                    key={bundle._id}
                    className="p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {bundle.name}
                          </h3>
                          <Badge variant="solid" size="sm">
                            {bundle.provider}
                          </Badge>
                        </div>
                        {bundle.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {bundle.description}
                          </p>
                        )}
                        <div className="text-sm text-gray-500 mb-3">
                          {bundle.category}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-3 border-t">
                        <div className="font-bold text-lg text-primary-600">
                          GHS {(bundle.customPrice ?? bundle.price).toFixed(2)}
                        </div>
                        <Button size="sm" onClick={() => addToCart(bundle)}>
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No bundles found
                </h3>
                <p className="text-gray-600">
                  {searchQuery
                    ? "Try adjusting your search or filters"
                    : "This store doesn't have any active bundles yet"}
                </p>
              </Card>
            )}
          </div>

          {/* Sidebar - Cart */}
          <div className={`lg:w-80 ${showCart ? "block" : "hidden lg:block"}`}>
            <Card className="p-4 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Your Cart ({cartItemCount})
              </h2>

              {cart.length > 0 ? (
                <>
                  <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item.bundle._id}
                        className="border-b pb-4 last:border-b-0"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {item.bundle.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              GHS{" "}
                              {(
                                item.bundle.customPrice ?? item.bundle.price
                              ).toFixed(2)}{" "}
                              x {item.quantity}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.bundle._id)}
                          >
                            ×
                          </Button>
                        </div>
                        <Input
                          placeholder="Recipient phone (e.g., 0541234567)"
                          value={item.recipientPhone}
                          onChange={(e) =>
                            updateCartItem(item.bundle._id, {
                              recipientPhone: e.target.value,
                            })
                          }
                          className="text-sm"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold mb-4">
                      <span>Total:</span>
                      <span className="text-primary-600">
                        GHS {cartTotal.toFixed(2)}
                      </span>
                    </div>

                    <Button
                      onClick={() => setShowCheckout(true)}
                      className="w-full"
                    >
                      Proceed to Checkout
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Your cart is empty</p>
                </div>
              )}
            </Card>

            {/* Contact Info */}
            {storefront.settings?.contactInfo && (
              <Card className="p-4 mt-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Contact Store
                </h3>
                <div className="space-y-2">
                  {storefront.settings.contactInfo.phone && (
                    <a
                      href={`tel:${storefront.settings.contactInfo.phone}`}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600"
                    >
                      <Phone className="w-4 h-4" />
                      {storefront.settings.contactInfo.phone}
                    </a>
                  )}
                  {storefront.settings.contactInfo.email && (
                    <a
                      href={`mailto:${storefront.settings.contactInfo.email}`}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600"
                    >
                      <Mail className="w-4 h-4" />
                      {storefront.settings.contactInfo.email}
                    </a>
                  )}
                  {storefront.settings.contactInfo.whatsapp && (
                    <a
                      href={`https://wa.me/${storefront.settings.contactInfo.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </a>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Complete Your Order
            </h2>

            <div className="space-y-6">
              {/* Customer Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">
                  Your Information
                </h3>
                <Input
                  placeholder="Your name *"
                  value={customerInfo.name}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, name: e.target.value })
                  }
                />
                <Input
                  placeholder="Your phone number *"
                  value={customerInfo.phone}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, phone: e.target.value })
                  }
                />
                <Input
                  type="email"
                  placeholder="Your email (optional)"
                  value={customerInfo.email}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, email: e.target.value })
                  }
                />
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Payment Method</h3>
                <div className="space-y-2">
                  {storefront.paymentMethods
                    .filter((pm) => pm.isActive)
                    .map((pm) => (
                      <button
                        key={pm.type}
                        onClick={() => setSelectedPaymentMethod(pm.type)}
                        className={`w-full p-4 border rounded-lg text-left transition-colors ${
                          selectedPaymentMethod === pm.type
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {PAYMENT_METHOD_ICONS[pm.type]}
                          <div>
                            <p className="font-medium">
                              {PAYMENT_METHOD_LABELS[pm.type]}
                            </p>
                            {pm.type === "mobile_money" && pm.mobileMoney && (
                              <p className="text-sm text-gray-600">
                                {pm.mobileMoney.network} -{" "}
                                {pm.mobileMoney.accountName}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                </div>

                {/* Payment Instructions */}
                {selectedPaymentMethod && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Payment Instructions
                    </h4>
                    <p className="text-sm text-blue-800">
                      {getSelectedPaymentMethodDetails()?.instructions ||
                        "Please send payment to the account details above and save your transaction ID."}
                    </p>
                    {selectedPaymentMethod === "mobile_money" && (
                      <div className="mt-3 p-3 bg-white rounded-lg">
                        <p className="text-sm font-medium text-gray-900">
                          Send GHS {cartTotal.toFixed(2)} to:
                        </p>
                        <p className="text-lg font-bold text-gray-900 mt-1">
                          {
                            getSelectedPaymentMethodDetails()?.mobileMoney
                              ?.accountNumber
                          }
                        </p>
                        <p className="text-sm text-gray-600">
                          {
                            getSelectedPaymentMethodDetails()?.mobileMoney
                              ?.network
                          }{" "}
                          -{" "}
                          {
                            getSelectedPaymentMethodDetails()?.mobileMoney
                              ?.accountName
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary-600">
                    GHS {cartTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCheckout(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCheckout}
                  disabled={orderStatus === "loading"}
                  className="flex-1"
                >
                  {orderStatus === "loading" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>
            Powered by{" "}
            <Link to="/" className="text-primary-600 hover:underline">
              BryteLinks
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default PublicStorePage;
