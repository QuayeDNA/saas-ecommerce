/* eslint-disable @typescript-eslint/no-explicit-any */
// =============================================================================
// PublicStore — Customer-facing storefront for browsing & ordering data bundles
// Mobile-first, theme-aware, performance-optimised
// Single-item "Buy Now" flow — no cart — with fee transparency & featured section
// =============================================================================

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
} from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  Skeleton,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "../../design-system";
import { getPaystackEmail } from "../../utils/paystack-email";
import storefrontService from "../../services/storefront.service";
import { useToast } from "../../design-system/components/toast";
import { useSiteStatus } from "../../contexts/site-status-context";
import { usePublicAnnouncements } from "../../hooks/usePublicAnnouncements";
import type {
  PublicBundle,
  PublicStorefront,
  PublicOrderData,
  PublicOrderResult,
  StorefrontBranding,
} from "../../services/storefront.service";
import {
  FaTriangleExclamation,
  FaStore,
  FaChevronDown,
  FaWifi,
} from "react-icons/fa6";
import { StorefrontEntryMarker } from "../../contexts/storefront-session-context";
import AdBanner from "../../components/ads/ad-banner";

// ─── Extracted components ────────────────────────────────────────────────────
import {
  buildBrandTheme,
  DEFAULT_THEME,
  type ThemeConfig,
  type OrderItem,
  type OrderStep,
  normalizePhone,
  isValidPhone,
  estimateFee,
  getLogoUrl,
  loadPaystackScript,
  updateStorefrontOGTags,
  saveOrderEntry,
} from "../../components/public";

import { FeaturedSection } from "../../components/public/FeaturedSection";
import { TrackOrderDrawer } from "../../components/public/TrackOrderDrawer";
import { StoreHeader } from "../../components/public/StoreHeader";
import { StoreToolbar } from "../../components/public/StoreToolbar";
import { BundleSections } from "../../components/public/BundleSections";
import { StoreFooter } from "../../components/public/StoreFooter";
import { OrderDialog } from "../../components/public/OrderDialog";

// =============================================================================
// Micro-components (kept inline — small, called once)
// =============================================================================

/** Shimmering skeleton that exactly mirrors final card shape */
const BundleCardSkeletonInline = memo(() => (
  <div
    className="rounded-2xl overflow-hidden border shadow-sm"
    style={{
      borderColor: "var(--border-color)",
      backgroundColor: "var(--bg-surface)",
    }}
  >
    <div className="h-1" style={{ backgroundColor: "var(--bg-muted)" }} />
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

const StoreSkeleton = memo(({ theme }: { theme: ThemeConfig }) => (
  <div className="min-h-screen" style={{ backgroundColor: "var(--bg-muted)" }}>
    {/* Hero skeleton */}
    <div
      className="min-h-[280px] sm:min-h-[340px]"
      style={{ background: theme.gradient, opacity: 0.15 }}
    />
    <div className="max-w-7xl mx-auto px-4 -mt-8 space-y-6">
      {/* Popular row skeleton */}
      <div
        className="rounded-2xl p-4 shadow-sm"
        style={{ backgroundColor: "var(--bg-surface)" }}
      >
        <Skeleton height="1rem" width="160px" className="mb-3" />
        <div className="flex gap-3 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="shrink-0 w-36 h-28 rounded-2xl animate-pulse"
              style={{ backgroundColor: "var(--bg-muted)" }}
            />
          ))}
        </div>
      </div>
      {/* Bundle cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <BundleCardSkeletonInline key={i} />
        ))}
      </div>
    </div>
  </div>
));

const StoreError = memo(
  ({ error, onRetry }: { error: string; onRetry: () => void }) => (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: "var(--bg-muted)" }}
    >
      <div className="max-w-sm w-full text-center space-y-5">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
          style={{
            backgroundColor: "color-mix(in srgb, var(--error) 8%, transparent)",
          }}
        >
          <FaTriangleExclamation
            className="w-8 h-8"
            style={{ color: "var(--error)" }}
          />
        </div>
        <div>
          <h2
            className="text-xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Store unavailable
          </h2>
          <p
            className="text-sm mt-2"
            style={{ color: "var(--text-secondary)" }}
          >
            {error}
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onRetry}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm transition active:scale-95"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--text-primary) 92%, transparent)",
              color: "var(--text-inverse)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                "color-mix(in srgb, var(--text-primary) 75%, transparent)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                "color-mix(in srgb, var(--text-primary) 92%, transparent)";
            }}
          >
            Try again
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm border transition"
            style={{
              backgroundColor: "var(--bg-muted)",
              borderColor: "var(--border-color)",
            }}
          >
            Go home
          </button>
        </div>
      </div>
    </div>
  ),
);

const EmptyBundles = memo(
  ({ searchTerm, onClear }: { searchTerm: string; onClear: () => void }) => (
    <div className="py-20 text-center px-4">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: "var(--bg-muted)" }}
      >
        <FaWifi className="w-8 h-8" style={{ color: "var(--text-tertiary)" }} />
      </div>
      {searchTerm ? (
        <>
          <h3
            className="text-lg font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            No results for "{searchTerm}"
          </h3>
          <p
            className="text-sm mt-1 mb-4"
            style={{ color: "var(--text-tertiary)" }}
          >
            Try different keywords or clear the search.
          </p>
          <button
            onClick={onClear}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--text-primary) 92%, transparent)",
              color: "var(--text-inverse)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                "color-mix(in srgb, var(--text-primary) 75%, transparent)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                "color-mix(in srgb, var(--text-primary) 92%, transparent)";
            }}
          >
            Clear search
          </button>
        </>
      ) : (
        <>
          <p className="font-medium" style={{ color: "var(--text-tertiary)" }}>
            No bundles available right now
          </p>
          <p
            className="text-sm mt-2"
            style={{ color: "var(--text-secondary)" }}
          >
            The store owner may not have activated any bundles yet. Check back
            later or contact them for assistance.
          </p>
        </>
      )}
    </div>
  ),
);

const PackageHeader = memo(
  ({
    pkgName,
    count,
    collapsed,
    onToggle,
    color,
  }: {
    pkgName: string;
    count: number;
    collapsed: boolean;
    onToggle: () => void;
    color: string;
  }) => (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-3 rounded-xl shadow-sm hover:shadow-md transition-all text-left"
      aria-expanded={!collapsed}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
          style={{ backgroundColor: color }}
        >
          <FaStore className="w-3.5 h-3.5" />
        </div>
        <div>
          <div
            className="text-sm font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {pkgName}
          </div>
          <div
            className="text-xs"
            style={{ color: "var(--text-tertiary)" }}
          >
            {count} bundle{count !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
      <FaChevronDown
        className={`w-4 h-4 transition-transform duration-200 ${collapsed ? "" : "rotate-180"}`}
        style={{ color: "var(--text-tertiary)" }}
      />
    </button>
  ),
);

// =============================================================================
// Main Component
// =============================================================================

const PublicStore: React.FC = () => {
  const { businessName } = useParams<{ businessName: string }>();
  const { addToast } = useToast();
  const { siteStatus } = useSiteStatus();

  const storeClosed = siteStatus?.isSiteOpen === false;
  const storeClosedMessage =
    siteStatus?.customMessage ||
    "The site is currently closed for maintenance. Orders are temporarily disabled.";
  const storefrontsOpen = siteStatus?.storefrontsOpen ?? true;
  const storefrontsClosedMessage =
    siteStatus?.storefrontsClosedMessage ||
    "Storefronts are temporarily closed by the admin. Please check back later.";
  const storefrontsClosed = !storefrontsOpen;
  const ordersClosed = storeClosed || storefrontsClosed;

  // ── Data ─────────────────────────────────────────────────────────────────────
  const [storeData, setStoreData] = useState<PublicStorefront | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── UI ───────────────────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");

  const [collapsedPackages, setCollapsedPackages] = useState<Set<string>>(
    new Set(),
  );

  // ── Single-item order ─────────────────────────────────────────────────────────
  const [activeOrder, setActiveOrder] = useState<OrderItem | null>(null); // bundle being ordered
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [orderStep, setOrderStep] = useState<OrderStep>("details");

  // Step 1 — Details
  const [orderPhone, setOrderPhone] = useState("");
  const [orderCustomerName, setOrderCustomerName] = useState("");
  const [orderGhanaCard, setOrderGhanaCard] = useState("");

  // Step 2 — Payment info
  const [customerName, setCustomerName] = useState("");
  // email is sourced from the agent's store profile — not collected from customer
  const [paymentType, setPaymentType] = useState<
    "paystack" | "mobile_money" | "bank_transfer"
  >("paystack");
  const [transactionRef, setTransactionRef] = useState("");

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<PublicOrderResult | null>(
    null,
  );
  const [paystackStatus, setPaystackStatus] = useState<
    "idle" | "success" | "failed"
  >("idle");

  // ── Track order drawer ────────────────────────────────────────────────────
  const [showTrackDrawer, setShowTrackDrawer] = useState(false);

  // ── Public announcements (for storefront customers) ─────────────────────────
  const viewedKey = businessName
    ? `public_announcements_viewed_${businessName}`
    : "";
  const dismissedKey = businessName
    ? `public_announcements_dismissed_${businessName}`
    : "";
  const { active: activeAnnouncements, dismiss: dismissAnnouncement } =
    usePublicAnnouncements({
      businessName: businessName || "",
      viewedKey,
      dismissedKey,
    });

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
      updateStorefrontOGTags(data.storefront, data.bundles);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load store data",
      );
    } finally {
      setLoading(false);
    }
  }, [businessName]);

  useEffect(() => {
    fetchStore();
  }, [fetchStore]);

  // ── Paystack postMessage listener ──────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data && e.data.type === "paystack_success") {
        setPaystackStatus("success");
        addToast("Payment confirmed!", "success");
      }
      if (e.data && e.data.type === "paystack_failed") {
        setPaystackStatus("failed");
        addToast("Payment was not completed.", "error");
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [addToast]);

  // ==========================================================================
  // Derived / Memoised state
  // ==========================================================================

  const theme: ThemeConfig = useMemo(() => {
    if (!storeData) return DEFAULT_THEME;
    const brandColor = storeData.storefront.branding?.customColors?.primary;
    return buildBrandTheme(brandColor);
  }, [storeData]);

  const providers = useMemo(() => {
    if (!storeData) return [];
    if (Array.isArray(storeData.providers) && storeData.providers.length > 0) {
      return storeData.providers.map((p) => ({
        code: p.code,
        name: p.name,
        logo: p.logo,
      }));
    }
    const map = new Map<string, { code: string; name: string; logo: undefined }>();
    storeData.bundles.forEach((b) => {
      if (b.provider && !map.has(b.provider)) {
        map.set(b.provider, {
          code: b.provider,
          name: b.providerName || b.provider,
          logo: undefined,
        });
      }
    });
    return Array.from(map.values());
  }, [storeData]);

  const groupedBundles = useMemo(() => {
    if (!storeData) return new Map<string, Map<string, PublicBundle[]>>();
    const grouped = new Map<string, Map<string, PublicBundle[]>>();
    const t = searchTerm.toLowerCase();
    storeData.bundles.forEach((b) => {
      const prov = b.provider || "unknown";
      const pkg = b.packageName || "Default";
      if (!grouped.has(prov)) grouped.set(prov, new Map());
      if (!grouped.get(prov)!.has(pkg)) grouped.get(prov)!.set(pkg, []);
      if (
        (selectedProvider === "all" || prov === selectedProvider) &&
        (!t ||
          b.name.toLowerCase().includes(t) ||
          (b.description?.toLowerCase() || "").includes(t))
      ) {
        grouped.get(prov)!.get(pkg)!.push(b);
      }
    });
    return grouped;
  }, [storeData, searchTerm, selectedProvider]);

  const popularBundles = useMemo(() => {
    if (!storeData) return [];
    if (
      storeData.popularBundles &&
      Array.isArray(storeData.popularBundles) &&
      storeData.popularBundles.length > 0
    ) {
      return storeData.popularBundles;
    }
    return [...storeData.bundles].sort((a, b) => a.price - b.price).slice(0, 8);
  }, [storeData]);

  // ── Fee estimate ──────────────────────────────────────────────────────────────
  const feeEstimate = useMemo(() => {
    if (!activeOrder) return null;
    if (paymentType !== "paystack") return null;
    return estimateFee(activeOrder.bundle.price);
  }, [activeOrder, paymentType]);

  // ── Form validation ───────────────────────────────────────────────────────────
  const phoneOk = isValidPhone(orderPhone);
  const afaValid =
    activeOrder?.bundle.provider?.toUpperCase() !== "AFA" ||
    !activeOrder?.bundle.requiresGhanaCard ||
    (orderCustomerName.trim().length > 2 &&
      /^[A-Z]{3}-?\d{9}-?\d$/i.test(orderGhanaCard));
  const step1Valid = phoneOk && afaValid;
  const canSubmitOrder =
    step1Valid &&
    customerName.trim().length > 1 &&
    (paymentType !== "mobile_money" || transactionRef.trim().length > 0);

  // ==========================================================================
  // Handlers
  // ==========================================================================

  const openOrderDialog = useCallback(
    (bundle: PublicBundle) => {
      if (ordersClosed) {
        addToast(
          "Orders are currently closed. Please check back later.",
          "warning",
        );
        return;
      }
      setActiveOrder({ bundle, customerPhone: "" });
      setShowOrderDialog(true);
      setOrderStep("details");
      setOrderPhone("");
      setOrderCustomerName("");
      setOrderGhanaCard("");
      setCustomerName("");
      setPaymentType("paystack");
      setTransactionRef("");
      setOrderError(null);
      setOrderResult(null);
      setPaystackStatus("idle");
    },
    [ordersClosed, addToast],
  );

  const closeOrderDialog = useCallback(() => {
    setShowOrderDialog(false);
    setActiveOrder(null);
    setOrderStep("details");
  }, []);

  const confirmDetails = useCallback(() => {
    if (!activeOrder) return;
    setActiveOrder((prev) =>
      prev ? { ...prev, customerPhone: orderPhone } : null,
    );
    setOrderStep("payment");
  }, [activeOrder, orderPhone]);

  const openPaystackInline = useCallback(
    async (_reference: string, _amountGhs: number, accessCode: string) => {
      try {
        setPaystackStatus("idle");
        await loadPaystackScript();
        const PaystackPopCtor = (window as any).PaystackPop;
        if (!PaystackPopCtor) throw new Error("Paystack script failed to load");

        if (!accessCode) throw new Error("Missing Paystack access code");

        const onSuccess = (response: { reference: string }) => {
          storefrontService
            .verifyPaystackReference(response.reference)
            .then(() => {
              setPaystackStatus("success");
              setOrderStep("confirmation");
              addToast(
                "Payment confirmed! Your order is processing.",
                "success",
                5000,
              );
            })
            .catch(() => {
              setPaystackStatus("failed");
              addToast(
                "Payment received but verification is pending.",
                "warning",
                8000,
              );
            });
        };

        const onClose = () => {
          addToast(
            "Payment window closed — no charge was made.",
            "info",
            4000,
          );
        };

        const popup = new PaystackPopCtor();
        popup.resumeTransaction(accessCode, { onSuccess, onCancel: onClose });
      } catch (err) {
        console.error("[PublicStore] Paystack inline checkout failed", err);
        addToast(
          "Unable to open Paystack checkout. Please try again or use a different browser.",
          "error",
          8000,
        );
      }
    },
    [addToast],
  );

  const submitOrder = useCallback(async () => {
    if (!businessName || !storeData || !canSubmitOrder || !activeOrder) return;
    setSubmitting(true);
    setOrderError(null);
    try {
      const phone = normalizePhone(orderPhone);
      const isAfa = activeOrder.bundle.provider?.toUpperCase() === "AFA";
      const orderData: PublicOrderData = {
        items: [
          {
            bundleId: activeOrder.bundle._id,
            quantity: 1,
            customerPhone: phone,
          },
        ],
        customerInfo: {
          // For AFA orders use the recipient's full name entered in step 1.
          // For all other orders use the buyer's name from the checkout step.
          name:
            isAfa && activeOrder.customerName
              ? activeOrder.customerName.trim()
              : customerName.trim(),
          phone,
          email: getPaystackEmail(phone),
          ...(activeOrder.ghanaCardNumber && {
            ghanaCardNumber: activeOrder.ghanaCardNumber,
          }),
        },
        paymentMethod: {
          type: paymentType,
          // sanitise reference — alphanum, dashes, underscores only
          reference:
            transactionRef.trim().replace(/[^a-zA-Z0-9\-_]/g, "") || undefined,
        },
      };
      const result = await storefrontService.createPublicOrder(
        businessName,
        orderData,
      );
      const paystackData = result?.paystack as
        | {
            authorizationUrl?: string;
            authorization_url?: string;
            reference?: string;
          }
        | undefined;
      const paystackUrl =
        paystackData?.authorizationUrl || paystackData?.authorization_url;
      const reference = paystackData?.reference;
      const accessCode = (result?.paystack as any)?.accessCode || "";

      setOrderResult(result);
      // Save to device localStorage for order tracking (24 h TTL)
      if (businessName) {
        saveOrderEntry(businessName, {
          orderId: result.orderId,
          orderNumber: result.orderNumber,
          // Use the user-facing order number for tracking (BAGS-XXXX) instead of the payment reference.
          reference: result.orderNumber || reference || result.orderId,
          bundleName: activeOrder.bundle.name,
          provider: activeOrder.bundle.provider || "",
          total: result.total,
          paymentType,
          savedAt: Date.now(),
          lastStatus: result.status,
        });
      }
      setOrderStep("confirmation");

      if (paystackUrl && reference) {
        await openPaystackInline(
          reference,
          result.total ?? activeOrder.bundle.price,
          accessCode,
        );
      }
    } catch (err) {
      const errorData = (err as any)?.response?.data;
      const axiosMsg = errorData?.message;
      const firstFieldError =
        Array.isArray(errorData?.errors) && errorData.errors.length > 0
          ? errorData.errors[0]?.msg || errorData.errors[0]?.message
          : null;
      setOrderError(
        firstFieldError ||
          axiosMsg ||
          (err instanceof Error
            ? err.message
            : "Order failed. Please try again."),
      );
      addToast(
        firstFieldError ||
          axiosMsg ||
          (err instanceof Error
            ? err.message
            : "Order failed. Please try again."),
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  }, [activeOrder, businessName, orderPhone, customerName, paymentType, transactionRef, storeData, addToast, openPaystackInline]);

  const togglePackage = useCallback((key: string) => {
    setCollapsedPackages((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const getProviderLogoUrl = useCallback((code: string) => {
    const prov = providers.find((p) => p.code === code);
    return prov ? getLogoUrl(prov.logo) : undefined;
  }, [providers]);

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <div
      className="min-h-screen storefront-root"
      style={{ backgroundColor: "var(--bg-muted)" }}
    >
      {(() => {
        if (loading) return <StoreSkeleton theme={theme} />;
        if (error || !storeData)
          return (
            <StoreError error={error || "Store not found"} onRetry={fetchStore} />
          );

        const { storefront, bundles } = storeData;
        const branding: StorefrontBranding = storefront.branding || {};
        const storeLayout = branding.layout || "modern";

        return (
          <>
      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@1,400,500,700,800&f[]=satoshi@1,300,400,500,700&display=swap');

        .storefront-root {
          --text-primary: #0F172A;
          --text-secondary: #475569;
          --text-tertiary: #94A3B8;
          --text-inverse: #FFFFFF;
          --bg-muted: #F8FAFC;
          --bg-surface: #FFFFFF;
          --border-color: #E2E8F0;
          --color-primary: ${theme.primary};
          --error: #EF4444;
          --warning: #F59E0B;
          --success: #10B981;
          --font-family: 'Satoshi', 'Sora', sans-serif;
        }

        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 18px var(--glow-color, #2563EB); }
          50% { box-shadow: 0 0 36px var(--glow-color, #2563EB); }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes drift {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(20px, -15px) rotate(3deg); }
          50% { transform: translate(-10px, 10px) rotate(-2deg); }
          75% { transform: translate(15px, 5px) rotate(1deg); }
        }
        @keyframes ken-burns {
          0% { transform: scale(1); }
          100% { transform: scale(1.08); }
        }
        @keyframes fade-slide-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-glow-pulse { animation: glow-pulse 3s ease-in-out infinite; }
        .animate-gradient { background-size: 200% 200%; animation: gradient-shift 12s ease infinite; }
        .animate-drift { animation: drift 20s ease-in-out infinite; }
        .animate-ken-burns { animation: ken-burns 10s ease-out forwards; }
        .animate-fade-slide-up { animation: fade-slide-up 0.7s ease-out both; }
        .animate-fade-in { animation: fade-in 0.6s ease-out both; }

        @media (prefers-reduced-motion: reduce) {
          .animate-float, .animate-glow-pulse, .animate-gradient,
          .animate-drift, .animate-ken-burns, .animate-fade-slide-up,
          .animate-fade-in { animation: none !important; }
        }
      `}</style>

      {/* SECURITY: marks this browser session as storefront-only so that
           system routes (/login, /register, etc.) are blocked for this tab */}
      {businessName && <StorefrontEntryMarker businessName={businessName} />}

      {storefrontsClosed && (
        <Dialog
          isOpen={true}
          onClose={() => {}}
          size="sm"
          closeOnOverlay={false}
          overlayClassName="bg-black/60 backdrop-blur-sm"
        >
          <DialogHeader className="border-b-0 pb-0">
            <div className="flex flex-col items-center text-center gap-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  color: "var(--warning)",
                  backgroundColor:
                    "color-mix(in srgb, var(--warning) 15%, transparent)",
                }}
              >
                <FaStore className="w-7 h-7" />
              </div>
              <h3
                className="text-lg sm:text-xl font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Storefronts Are Closed
              </h3>
            </div>
          </DialogHeader>
          <DialogBody
            className="space-y-3 text-center text-sm sm:text-base"
            style={{ color: "var(--text-primary)" }}
          >
            <p>{storefrontsClosedMessage}</p>
            <p
              className="text-xs sm:text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Orders are paused for all storefronts until the admin reopens
              them.
            </p>
          </DialogBody>
          <DialogFooter justify="center" className="pt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Check Again
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      <StoreHeader
        theme={theme}
        storefront={storefront}
        branding={branding}
        storeLayout={storeLayout}
      />

      <StoreToolbar
        theme={theme}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedProvider={selectedProvider}
        onSelectProvider={setSelectedProvider}
        providers={providers}
        groupedBundles={groupedBundles as any}
        storeData={storeData}
        onOpenTrackDrawer={() => setShowTrackDrawer(true)}
        storeClosed={storeClosed}
        storeClosedMessage={storeClosedMessage}
        storefrontsClosed={storefrontsClosed}
        storefrontsClosedMessage={storefrontsClosedMessage}
        activeAnnouncement={activeAnnouncements[0] || null}
        onDismissAnnouncement={dismissAnnouncement}
      />

      <main>
        {/* Featured bundles section — Trending + Best Value tabs */}
        {(popularBundles.length > 0 || bundles.length > 0) && (
          <div className="max-w-7xl mx-auto">
            <FeaturedSection
              theme={theme}
              trendingBundles={popularBundles}
              allBundles={bundles}
              onSelect={openOrderDialog}
              getProviderLogoUrl={getProviderLogoUrl}
            />
          </div>
        )}

        {/* Ad Position B — between featured carousel and bundle grid */}
        <div className="max-w-7xl mx-auto px-4 py-3">
          <AdBanner adSlot="YOUR_AD_SLOT_ID_B" adFormat="horizontal" />
        </div>

        <BundleSections
          storeData={storeData}
          groupedBundles={groupedBundles as any}
          providers={providers}
          selectedProvider={selectedProvider}
          searchTerm={searchTerm}
          collapsedPackages={collapsedPackages}
          togglePackage={togglePackage}
          activeOrderBundleId={activeOrder?.bundle._id || null}
          ordersClosed={ordersClosed}
          openOrderDialog={openOrderDialog}
          getProviderLogoUrl={getProviderLogoUrl}
          EmptyBundlesComponent={EmptyBundles}
          PackageHeaderComponent={PackageHeader}
          AdBannerComponent={AdBanner}
          onClearSearch={() => { setSearchTerm(""); setSelectedProvider("all"); }}
        />
      </main>

      {/* Ad Position D — above footer */}
      <div className="max-w-7xl mx-auto px-4 pb-2 pt-2">
        <AdBanner adSlot="YOUR_AD_SLOT_ID_D" adFormat="horizontal" />
      </div>

      <StoreFooter storefront={storefront} branding={branding} />

      {/* Single-item order dialog */}
      {activeOrder && (
      <OrderDialog
        isOpen={showOrderDialog}
        onClose={closeOrderDialog}
        activeOrder={activeOrder}
        bundle={activeOrder.bundle}
        theme={theme}
        storeClosed={storeClosed}
        storeClosedMessage={storeClosedMessage}
        storefrontsClosed={storefrontsClosed}
        storefrontsClosedMessage={storefrontsClosedMessage}
        orderStep={orderStep}
        setOrderStep={setOrderStep}
        orderPhone={orderPhone}
        setOrderPhone={setOrderPhone}
        orderCustomerName={orderCustomerName}
        setOrderCustomerName={setOrderCustomerName}
        orderGhanaCard={orderGhanaCard}
        setOrderGhanaCard={setOrderGhanaCard}
        phoneOk={phoneOk}
        step1Valid={step1Valid}
        confirmDetails={confirmDetails}
        feeEstimate={feeEstimate}
        customerName={customerName}
        setCustomerName={setCustomerName}
        paymentType={paymentType}
        setPaymentType={setPaymentType}
        transactionRef={transactionRef}
        setTransactionRef={setTransactionRef}
        paymentMethods={(storefront.paymentMethods || []).map(pm => ({
          type: pm.type,
          details: pm.details,
          isActive: pm.isActive,
        }))}
        canSubmitOrder={canSubmitOrder}
        submitting={submitting}
        submitOrder={submitOrder}
        orderError={orderError}
        displayTotal={feeEstimate?.charge ?? activeOrder?.bundle.price ?? 0}
        orderResult={orderResult}
        paystackStatus={paystackStatus}
        openPaystackInline={openPaystackInline}
        closeOrderDialog={closeOrderDialog}
        setShowTrackDrawer={setShowTrackDrawer}
        storefrontContact={storefront.contactInfo}
      />
      )}

      {/* Track Order Drawer */}
      {businessName && (
        <TrackOrderDrawer
          businessName={businessName}
          theme={theme}
          isOpen={showTrackDrawer}
          onClose={() => setShowTrackDrawer(false)}
        />
      )}
        </>
      );
    })()}
    </div>
  );
};

export { PublicStore as PublicStorePage };
export default PublicStore;
