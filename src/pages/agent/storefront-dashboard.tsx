import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Badge,
  Alert,
  Skeleton,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  StatCard,
} from "../../design-system";
import { useToast } from "../../design-system";
import { useSiteStatus } from "../../contexts/site-status-context";
import {
  storefrontService,
  type StorefrontData,
  type StorefrontAnalytics,
  type StorefrontEarnings,
  type StorefrontOrder,
  type AgentBundle,
} from "../../services/storefront.service";
import {
  Store,
  DollarSign,
  Package,
  Settings,
  ExternalLink,
  Copy,
  CheckCircle,
  Circle,
  AlertTriangle,
  Phone,
  Share2,
  TrendingUp,
  ShoppingCart,
  Clock,
  Eye,
  EyeOff,
  ChevronRight,
  RefreshCw,
  Zap,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import { getApiErrorMessage } from "../../utils/error-helpers";
import { getStoreUrl } from "../../utils/store-url";

// Import storefront components
import { StorefrontManager } from "../../components/storefront/store-setup-wizard";
import { PricingManager } from "../../components/storefront/pricing-manager";
import { OrderManager } from "../../components/storefront/order-manager";
import { StorefrontSettings } from "../../components/storefront/storefront-settings";

const TABS = [
  { id: "overview", label: "Overview", icon: Store },
  { id: "pricing", label: "Pricing", icon: DollarSign },
  { id: "orders", label: "Orders", icon: Package },
  { id: "settings", label: "Settings", icon: Settings },
];

export const StorefrontDashboardPage: React.FC = () => {
  const { addToast } = useToast();
  const { siteStatus } = useSiteStatus();
  const [storefront, setStorefront] = useState<StorefrontData | null>(null);
  const [suspended, setSuspended] = useState(false);
  const [suspensionMessage, setSuspensionMessage] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [settingsInitialTab, setSettingsInitialTab] = useState<string | undefined>(undefined);
  const [earningsDefaultTab, setEarningsDefaultTab] = useState<'payouts' | 'earnings' | undefined>(undefined);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [showBreakdownInfoModal, setShowBreakdownInfoModal] = useState(false);

  // Analytics & orders state
  const [analytics, setAnalytics] = useState<StorefrontAnalytics | null>(null);
  const [earnings, setEarnings] = useState<StorefrontEarnings | null>(null);
  const [recentOrders, setRecentOrders] = useState<StorefrontOrder[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  // bundles that the agent has enabled/disabled (used for checklist logic)
  const [availableBundles, setAvailableBundles] = useState<AgentBundle[]>([]);

  // Checklist visibility — auto-hide when all done, or manually hidden
  const [checklistManuallyHidden, setChecklistManuallyHidden] = useState(() =>
    localStorage.getItem("storefront-checklist-hidden") === "true"
  );

  const loadStorefront = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await storefrontService.getMyStorefront();
      if (result) {
        setStorefront(result.data);
        setSuspended(!!result.suspended);
        setSuspensionMessage(result.suspensionMessage || null);
      } else {
        setStorefront(null);
        setShowSetupWizard(true);
      }
    } catch (error) {
      console.error("Failed to load storefront:", error);
      addToast(
        getApiErrorMessage(error, "Failed to load storefront information"),
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadStorefront();
  }, [loadStorefront]);

  // Load analytics, orders and bundle availability when storefront is available
  const loadAnalyticsAndOrders = useCallback(async () => {
    if (!storefront) return;
    setAnalyticsLoading(true);
    try {
      const [analyticsData, ordersData, bundlesData, earningsData] = await Promise.all([
        storefrontService.getAnalytics(),
        storefrontService.getMyOrders({ limit: 5, offset: 0 }),
        storefrontService.getAvailableBundles(),
        storefrontService.getEarnings().catch(() => null),
      ]);
      setAnalytics(analyticsData);
      setRecentOrders(ordersData.orders || []);
      setAvailableBundles(bundlesData);
      if (earningsData) setEarnings(earningsData);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [storefront]);

  useEffect(() => {
    loadAnalyticsAndOrders();
  }, [loadAnalyticsAndOrders]);

  const handleStorefrontCreated = (newStorefront: StorefrontData) => {
    setStorefront(newStorefront);
    setShowSetupWizard(false);
    addToast("Welcome to your new storefront!", "success");
  };

  const handleStorefrontUpdated = (updatedStorefront: StorefrontData) => {
    setStorefront(updatedStorefront);
  };

  const getStorefrontUrl = () => {
    if (!storefront) return "";
    return getStoreUrl(storefront.businessName);
  };

  const copyStoreUrl = async () => {
    if (!storefront) return;
    try {
      await navigator.clipboard.writeText(getStorefrontUrl());
      setUrlCopied(true);
      localStorage.setItem(`storefront-shared-${storefront._id}`, "true");
      addToast("Store URL copied!", "success");
      setTimeout(() => setUrlCopied(false), 2000);
    } catch {
      addToast("Failed to copy URL", "error");
    }
  };

  // Loading state — skeleton placeholders per section
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header skeleton */}
        <Card>
          <CardBody>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Skeleton variant="text" height="2rem" width="220px" />
                  <Skeleton variant="rectangular" height="1.25rem" width="60px" />
                </div>
                <Skeleton variant="text" height="0.875rem" width="180px" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton variant="rectangular" height="2rem" width="100px" />
                <Skeleton variant="rectangular" height="2rem" width="90px" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Tab bar skeleton */}
        <div className="bg-white rounded-lg border border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-wrap justify-center gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height="2.25rem"
                width="100px"
              />
            ))}
          </div>
        </div>

        {/* Dashboard skeleton sections */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardBody>
                <Skeleton variant="text" height="0.75rem" width="70px" className="mb-2" />
                <Skeleton variant="text" height="1.75rem" width="110px" className="mb-1" />
                <Skeleton variant="text" height="0.75rem" width="90px" />
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i} variant="outlined">
              <CardHeader>
                <Skeleton variant="text" height="1.25rem" width="150px" />
              </CardHeader>
              <CardBody className="space-y-3">
                {[...Array(4)].map((_, j) => (
                  <Skeleton key={j} variant="rectangular" height="2.5rem" />
                ))}
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i} variant="outlined">
              <CardHeader>
                <Skeleton variant="text" height="1.25rem" width="140px" />
              </CardHeader>
              <CardBody className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <Skeleton key={j} variant="rectangular" height="3rem" />
                ))}
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Setup wizard
  if (!storefront || showSetupWizard) {
    return (
      <div className="max-w-4xl mx-auto">
        <StorefrontManager
          onStorefrontCreated={handleStorefrontCreated}
          hasCheckedExisting={true}
        />
      </div>
    );
  }

  const activePaymentMethods =
    storefront.paymentMethods?.filter((pm) => pm.isActive).length || 0;

  const isStoreLive =
    !suspended && storefront.isActive && storefront.isApproved;

  // Checklist items
  const setupChecklist = [
    {
      label: "Activate your storefront",
      done: storefront.isActive,
      action: () => setActiveTab("settings"),
    },
    {
      label: "Set up payment methods",
      done: activePaymentMethods > 0,
      action: () => setActiveTab("settings"),
    },
    {
      label: "Configure bundle pricing",
      // consider pricing configured only if the store has at least one enabled bundle
      done: availableBundles.some(b => b.isEnabled),
      action: () => setActiveTab("pricing"),
    },
    {
      label: "Share your store link",
      done: !!localStorage.getItem(`storefront-shared-${storefront._id}`),
      action: () => copyStoreUrl(),
    },
  ];

  const allChecklistDone = setupChecklist.every((item) => item.done);
  const showChecklist = !allChecklistDone && !checklistManuallyHidden;

  const toggleChecklist = () => {
    const newVal = !checklistManuallyHidden;
    setChecklistManuallyHidden(newVal);
    localStorage.setItem("storefront-checklist-hidden", String(newVal));
  };

  // Format helpers
  const formatCurrency = (amount: number) =>
    `GH₵ ${amount.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatRelativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "success";
      case "confirmed":
      case "processing": return "info";
      case "pending_payment":
      case "pending": return "warning";
      case "failed":
      case "cancelled": return "error";
      default: return "gray";
    }
  };

  const storefrontsOpen = siteStatus?.storefrontsOpen ?? true;

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                  {storefront.businessName}
                </h1>
                <Badge
                  colorScheme={
                    suspended
                      ? "error"
                      : storefront.isActive
                        ? "success"
                        : "gray"
                  }
                  variant="subtle"
                  rounded
                >
                  {suspended
                    ? "Suspended"
                    : storefront.isActive
                      ? "Active"
                      : "Inactive"}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Your online storefront dashboard
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={copyStoreUrl}
                leftIcon={
                  urlCopied ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )
                }
              >
                {urlCopied ? "Copied!" : "Copy Link"}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.open(getStorefrontUrl(), "_blank")}
                leftIcon={<ExternalLink className="w-4 h-4" />}
                disabled={!isStoreLive}
              >
                <span className="hidden sm:inline">View Store</span>
                <span className="sm:hidden">Visit</span>
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {!storefrontsOpen && (
        <Alert status="warning" variant="left-accent">
          All storefronts are currently closed by the admin. Customers cannot place new orders at this time.
        </Alert>
      )}

      {/* Suspension alert */}
      {suspended && suspensionMessage && (
        <Alert status="error" variant="left-accent">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Your storefront has been suspended</p>
              <p className="text-sm mt-1">{suspensionMessage}</p>
            </div>
          </div>
        </Alert>
      )}

      {/* Inactive alert */}
      {!storefront.isActive && !suspended && (
        <Alert status="warning" variant="left-accent">
          Your storefront is currently inactive. Customers cannot place orders
          until you reactivate it in Settings.
        </Alert>
      )}

      {/* Pending approval alert */}
      {!storefront.isApproved && !suspended && (
        <Alert status="info" variant="left-accent">
          Your storefront is pending admin approval. You'll be notified once
          it's approved.
        </Alert>
      )}

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Tab bar */}
        <div className="bg-white rounded-lg border border-gray-200 px-3 sm:px-6 py-3 sm:py-4 overflow-x-auto flex justify-center">
          <TabsList className="inline-flex justify-center sm:grid sm:w-full sm:grid-cols-4 sm:justify-items-center gap-1 min-w-max sm:min-w-0">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap px-3 sm:px-4"
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="space-y-4 sm:space-y-6">
            {/* ── Analytics Stats ─────────────────────────────────────────── */}
            {/* Row 1: primary KPIs — 2 cols mobile / 5 cols desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
              <StatCard
                title="Gross Revenue"
                value={analyticsLoading ? "—" : formatCurrency(analytics?.totalRevenue ?? 0)}
                subtitle="From paid customer orders"
                icon={<DollarSign className="w-4 h-4" />}
                size="md"
              />
              <StatCard
                title="Net Profit (All Time)"
                value={analyticsLoading ? "—" : formatCurrency(analytics?.totalProfit ?? 0)}
                subtitle="Secured (completed orders)"
                icon={<TrendingUp className="w-4 h-4" />}
                size="md"
              />
              <StatCard
                title="Net Profit (Today)"
                value={analyticsLoading ? "—" : formatCurrency(analytics?.todayNetProfit ?? 0)}
                subtitle={`${analytics?.todayCompletedOrders ?? 0} completed today`}
                icon={<CheckCircle2 className="w-4 h-4" />}
                size="md"
              />
              <StatCard
                title="Available Earnings"
                value={analyticsLoading ? "—" : formatCurrency(earnings?.availableBalance ?? 0)}
                subtitle="Ready to withdraw"
                icon={<Wallet className="w-4 h-4" />}
                size="md"
              />
              <StatCard
                title="Withdrawn Earnings"
                value={analyticsLoading ? "—" : formatCurrency(earnings?.totalWithdrawn ?? 0)}
                subtitle="Completed payouts"
                icon={<ArrowDownRight className="w-4 h-4" />}
                size="md"
              />
              <StatCard
                title="Total Orders"
                value={analyticsLoading ? "—" : analytics?.totalOrders ?? 0}
                subtitle={`${analytics?.completedOrders ?? 0} completed`}
                icon={<ShoppingCart className="w-4 h-4" />}
                size="md"
              />
            </div>



            <Dialog
              isOpen={showBreakdownInfoModal}
              onClose={() => setShowBreakdownInfoModal(false)}
              size="md"
            >
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-base font-semibold">Profit vs Earnings Explained</h3>
                </div>
              </DialogHeader>
              <DialogBody className="space-y-3 text-sm text-gray-700">
                {analytics && earnings ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                        <p className="text-xs text-gray-500">Net Profit (All Time)</p>
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(analytics.totalProfit)}</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                        <p className="text-xs text-gray-500">Net Profit (Today)</p>
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(analytics.todayNetProfit ?? 0)}</p>
                      </div>
                      <div className="rounded-lg border border-green-100 bg-green-50 px-3 py-2">
                        <p className="text-xs text-green-700">Total Earned (Credited)</p>
                        <p className="text-sm font-bold text-green-800">{formatCurrency(earnings.totalEarned)}</p>
                      </div>
                      <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
                        <p className="text-xs text-blue-700">Total Withdrawn (Completed)</p>
                        <p className="text-sm font-bold text-blue-800">{formatCurrency(earnings.totalWithdrawn)}</p>
                      </div>
                      <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 sm:col-span-2">
                        <p className="text-xs text-emerald-700">Available Earnings</p>
                        <p className="text-sm font-bold text-emerald-800">{formatCurrency(earnings.availableBalance)}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Net Profit tracks completed storefront order markup. Earnings tracks credited ledger balance and payout movements.
                      Available Earnings reflects what can be withdrawn now.
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500">Breakdown data is not available yet.</p>
                )}
              </DialogBody>
              <DialogFooter justify="end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBreakdownInfoModal(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </Dialog>

            {/* Row 2: Revenue breakdown + Order status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Revenue Breakdown */}
              <Card variant="outlined">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-indigo-500" />
                      <h3 className="text-base font-semibold">Revenue Breakdown</h3>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setShowBreakdownInfoModal(true)}
                      leftIcon={<Info className="w-3.5 h-3.5" />}
                    >
                      Info
                    </Button>
                  </div>
                </CardHeader>
                <CardBody>
                  {analyticsLoading ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100">
                          <Skeleton variant="text" height="0.75rem" width="120px" />
                          <Skeleton variant="text" height="0.75rem" width="90px" />
                        </div>
                      ))}
                    </div>
                  ) : analytics ? (
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <ArrowUpRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="text-sm text-gray-600">Gross Revenue</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(analytics.totalRevenue)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <ArrowDownRight className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                          <span className="text-sm text-gray-600">Fulfilment Cost</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          − {formatCurrency(analytics.totalCost)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2.5">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-3.5 h-3.5 text-green-600 shrink-0" />
                          <span className="text-sm font-medium text-gray-800">Net Profit</span>
                        </div>
                        <span className="text-sm font-bold text-green-700">
                          {formatCurrency(analytics.totalProfit)}
                        </span>
                      </div>

                      {/* Pipeline markup (not yet secured) */}
                      {(analytics.pendingProfit > 0 ||
                        analytics.confirmedProfit > 0 ||
                        analytics.processingProfit > 0) && (
                          <div className="pt-2 mt-1 border-t border-dashed border-gray-200">
                            <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">
                              Pipeline — not yet earned
                            </p>
                            <div className="space-y-1.5">
                              {analytics.pendingProfit > 0 && (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-amber-600 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Pending orders
                                  </span>
                                  <span className="text-xs font-semibold text-amber-600">
                                    {formatCurrency(analytics.pendingProfit)}
                                  </span>
                                </div>
                              )}
                              {analytics.confirmedProfit > 0 && (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-blue-600 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Confirmed orders
                                  </span>
                                  <span className="text-xs font-semibold text-blue-600">
                                    {formatCurrency(analytics.confirmedProfit)}
                                  </span>
                                </div>
                              )}
                              {analytics.processingProfit > 0 && (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-indigo-600 flex items-center gap-1">
                                    <RefreshCw className="w-3 h-3" /> Processing orders
                                  </span>
                                  <span className="text-xs font-semibold text-indigo-600">
                                    {formatCurrency(analytics.processingProfit)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-sm text-gray-400">No data yet</div>
                  )}
                </CardBody>
              </Card>

              {/* Order Status Breakdown */}
              <Card variant="outlined">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-500" />
                    <h3 className="text-base font-semibold">Order Status</h3>
                  </div>
                </CardHeader>
                <CardBody>
                  {analyticsLoading ? (
                    <div className="grid grid-cols-2 gap-2">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="p-2 bg-gray-100 rounded-lg">
                          <Skeleton variant="text" height="0.75rem" width="80px" className="mb-2" />
                          <Skeleton variant="text" height="1.1rem" width="70px" />
                        </div>
                      ))}
                    </div>
                  ) : analytics ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                        <div>
                          <p className="text-xs text-green-700">Completed</p>
                          <p className="text-sm font-bold text-green-800">
                            {analytics.completedOrders}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <p className="text-xs text-blue-700">Confirmed</p>
                          <p className="text-sm font-bold text-blue-800">
                            {analytics.confirmedOrders}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-indigo-50 rounded-lg">
                        <RefreshCw className="w-4 h-4 text-indigo-600 shrink-0" />
                        <div>
                          <p className="text-xs text-indigo-700">Processing</p>
                          <p className="text-sm font-bold text-indigo-800">
                            {analytics.processingOrders}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                        <div>
                          <p className="text-xs text-amber-700">Pending</p>
                          <p className="text-sm font-bold text-amber-800">
                            {analytics.pendingOrders}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <XCircle className="w-4 h-4 text-gray-400 shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Cancelled</p>
                          <p className="text-sm font-bold text-gray-700">
                            {analytics.cancelledOrders}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                        <div>
                          <p className="text-xs text-red-600">Failed</p>
                          <p className="text-sm font-bold text-red-700">
                            {analytics.failedOrders}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-sm text-gray-400">No order data</div>
                  )}
                </CardBody>
              </Card>
            </div>

            {/* Earnings History */}
            {earnings && earnings.recentTransactions.length > 0 && (
              <Card variant="outlined">
                <CardHeader>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-green-600" />
                      <h3 className="text-base font-semibold">Earnings History</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSettingsInitialTab("earnings");
                          setEarningsDefaultTab("earnings");
                          setActiveTab("settings");
                        }}
                      >
                        Show all
                      </Button>
                      <span className="text-xs text-gray-500">
                        Balance:{" "}
                        <span className="font-semibold text-green-700">
                          {formatCurrency(earnings.availableBalance)}
                        </span>
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-1">
                    {earnings.recentTransactions.slice(0, 8).map((txn) => (
                      <div
                        key={txn._id}
                        className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-gray-50 transition"
                      >
                        <div
                          className={`p-1.5 rounded-full shrink-0 ${txn.type === "credit"
                            ? "bg-green-100"
                            : "bg-red-100"
                            }`}
                        >
                          {txn.type === "credit" ? (
                            <ArrowUpRight className="w-3.5 h-3.5 text-green-600" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 truncate">{txn.description}</p>
                          <p className="text-xs text-gray-400">
                            {formatRelativeTime(txn.createdAt)}
                            {txn.reference && (
                              <span className="ml-1.5 font-mono text-gray-300">
                                · {txn.reference}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p
                            className={`text-sm font-semibold ${txn.type === "credit"
                              ? "text-green-700"
                              : "text-red-600"
                              }`}
                          >
                            {txn.type === "credit" ? "+" : "−"}
                            {formatCurrency(txn.amount)}
                          </p>
                          <p className="text-xs text-gray-400">
                            bal {formatCurrency(txn.balanceAfter)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {earnings.recentTransactions.length > 8 && (
                    <p className="text-xs text-center text-gray-400 mt-2 pt-2 border-t border-gray-100">
                      Showing 8 of {earnings.recentTransactions.length} recent transactions
                    </p>
                  )}
                </CardBody>
              </Card>
            )}

            {/* Two-column: Quick Actions + (Checklist OR Recent Orders) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Quick Actions */}
              <Card variant="outlined">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <h3 className="text-base font-semibold">Quick Actions</h3>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => setActiveTab("orders")}
                      className="w-full justify-start"
                      variant="outline"
                      size="sm"
                      leftIcon={<Package className="w-4 h-4" />}
                    >
                      View Orders
                    </Button>
                    <Button
                      onClick={() => setActiveTab("pricing")}
                      className="w-full justify-start"
                      variant="outline"
                      size="sm"
                      leftIcon={<DollarSign className="w-4 h-4" />}
                    >
                      Manage Pricing
                    </Button>
                    <Button
                      onClick={() => setActiveTab("settings")}
                      className="w-full justify-start"
                      variant="outline"
                      size="sm"
                      leftIcon={<Settings className="w-4 h-4" />}
                    >
                      Store Settings
                    </Button>
                    <Button
                      onClick={() => window.open(getStorefrontUrl(), "_blank")}
                      className="w-full justify-start"
                      variant="outline"
                      size="sm"
                      leftIcon={<ExternalLink className="w-4 h-4" />}
                      disabled={!isStoreLive}
                    >
                      Visit Store
                    </Button>
                    <Button
                      onClick={copyStoreUrl}
                      className="w-full justify-start"
                      variant="outline"
                      size="sm"
                      leftIcon={urlCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    >
                      {urlCopied ? "Copied!" : "Copy Link"}
                    </Button>
                    <Button
                      onClick={loadAnalyticsAndOrders}
                      className="w-full justify-start"
                      variant="outline"
                      size="sm"
                      leftIcon={<RefreshCw className={`w-4 h-4 ${analyticsLoading ? "animate-spin" : ""}`} />}
                      disabled={analyticsLoading}
                    >
                      Refresh Data
                    </Button>
                  </div>
                </CardBody>
              </Card>

              {/* Getting Started Checklist (auto-hide when done, manual hide) */}
              {showChecklist ? (
                <Card variant="outlined">
                  <CardHeader>
                    <div className="flex items-center justify-between w-full">
                      <h3 className="text-base font-semibold">Getting Started</h3>
                      <button
                        onClick={toggleChecklist}
                        className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition"
                      >
                        <EyeOff className="w-3 h-3" /> Hide
                      </button>
                    </div>
                  </CardHeader>
                  <CardBody className="space-y-2.5">
                    {setupChecklist.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={item.action}
                        className="flex items-center gap-2 text-sm w-full text-left hover:bg-gray-50 rounded-lg p-1.5 -m-1.5 transition group"
                      >
                        {item.done ? (
                          <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-300 shrink-0" />
                        )}
                        <span
                          className={
                            item.done ? "text-gray-500 line-through" : "text-gray-700"
                          }
                        >
                          {item.label}
                        </span>
                        {!item.done && (
                          <ChevronRight className="w-3 h-3 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition" />
                        )}
                      </button>
                    ))}
                    <div className="pt-1.5 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full transition-all duration-500"
                            style={{
                              width: `${(setupChecklist.filter((i) => i.done).length / setupChecklist.length) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">
                          {setupChecklist.filter((i) => i.done).length}/{setupChecklist.length}
                        </span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ) : (
                /* Recent Orders — shown when checklist is hidden or all done */
                <Card variant="outlined">
                  <CardHeader>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-500" />
                        <h3 className="text-base font-semibold">Latest Orders</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {!allChecklistDone && (
                          <button
                            onClick={toggleChecklist}
                            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition"
                          >
                            <Eye className="w-3 h-3" /> Show setup
                          </button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveTab("orders")}
                          className="text-xs"
                        >
                          View all <ChevronRight className="w-3 h-3 ml-0.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody>
                    {analyticsLoading ? (
                      <div className="space-y-3 py-4">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100"
                          >
                            <div className="flex-1 min-w-0">
                              <Skeleton variant="text" height="1rem" width="40%" className="mb-2" />
                              <Skeleton variant="text" height="0.85rem" width="55%" className="mb-1" />
                              <Skeleton variant="text" height="0.75rem" width="30%" />
                            </div>
                            <div className="text-right">
                              <Skeleton variant="text" height="1rem" width="60px" />
                              <Skeleton variant="text" height="0.75rem" width="60px" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : recentOrders.length === 0 ? (
                      <div className="text-center py-6">
                        <ShoppingCart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No orders yet</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Orders from your store will appear here
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {recentOrders.map((order) => (
                          <div
                            key={order._id}
                            className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition cursor-pointer"
                            onClick={() => setActiveTab("orders")}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm text-gray-900">
                                  #{order.orderNumber}
                                </span>
                                <Badge
                                  colorScheme={getOrderStatusColor(order.status) as "success" | "error" | "warning" | "info" | "gray" | "default"}
                                  size="xs"
                                  variant="subtle"
                                >
                                  {order.status.replace(/_/g, " ")}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5 truncate">
                                {order.storefrontData?.customerInfo?.name || "Customer"}
                                {order.storefrontData?.customerInfo?.ghanaCardNumber && (
                                  <span className="ml-1 text-blue-600">
                                    • {order.storefrontData.customerInfo.ghanaCardNumber}
                                  </span>
                                )}
                                {" • "}
                                {order.storefrontData?.items?.length ?? 0} item
                                {(order.storefrontData?.items?.length ?? 0) !== 1 ? "s" : ""}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              {(() => {
                                const tierCost = order.storefrontData?.totalTierCost;
                                const markup = order.storefrontData?.totalMarkup;
                                const hasMarkup = typeof tierCost === "number" && typeof markup === "number";
                                const displayPrice = hasMarkup
                                  ? tierCost + markup
                                  : order.total;
                                return (
                                  <>
                                    <p className="text-sm font-bold text-gray-900">
                                      {formatCurrency(displayPrice)}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {hasMarkup && markup > 0 && (
                                        <span className="text-gray-300 line-through mr-1">
                                          {formatCurrency(tierCost)}
                                        </span>
                                      )}
                                      {formatRelativeTime(order.createdAt)}
                                    </p>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardBody>
                </Card>
              )}
            </div>

            {/* Store Info + Share URL row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Store Info */}
              <Card variant="outlined">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-gray-500" />
                    <h3 className="text-base font-semibold">Store Information</h3>
                  </div>
                </CardHeader>
                <CardBody className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Status</span>
                    <Badge
                      colorScheme={
                        suspended ? "error" : storefront.isActive ? "success" : "gray"
                      }
                      size="xs"
                      variant="subtle"
                    >
                      {suspended
                        ? "Suspended"
                        : storefront.isActive
                          ? "Active"
                          : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Approval</span>
                    <Badge
                      colorScheme={storefront.isApproved ? "success" : "warning"}
                      size="xs"
                      variant="subtle"
                    >
                      {storefront.isApproved ? "Approved" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Business</span>
                    <span className="font-medium text-gray-900 truncate ml-2">
                      {storefront.businessName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Contact
                    </span>
                    <span className="font-medium text-gray-900">
                      {storefront.contactInfo?.phone || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Payments</span>
                    <span className="font-medium text-gray-900">
                      {activePaymentMethods} active
                    </span>
                  </div>
                </CardBody>
              </Card>

              {/* Share Store URL */}
              <Card variant="outlined">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-gray-500" />
                    <h3 className="text-base font-semibold">Share Your Store</h3>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1">
                      <Input
                        value={getStorefrontUrl()}
                        readOnly
                        className="bg-gray-50 text-sm"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={copyStoreUrl}
                      leftIcon={
                        urlCopied ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )
                      }
                      className="shrink-0"
                    >
                      {urlCopied ? "Copied!" : "Copy Link"}
                    </Button>
                  </div>

                  {/* Share preview */}
                  <div className="mt-4 border border-gray-200 rounded-lg bg-gray-50 p-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={storefront.branding?.logoUrl || '/logo-192.svg'}
                        alt="Store logo"
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900 line-clamp-2">
                          {storefront.displayName || storefront.businessName} | DirectData
                        </div>
                        <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {storefront.description || 'Instant data bundles from trusted agents across Ghana.'}
                        </div>
                        <div className="text-xs text-blue-600 mt-2 truncate">
                          {getStorefrontUrl()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    Share this link with customers so they can browse and
                    purchase bundles from your store.
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing">
          <div data-tour="storefront-pricing">
            <PricingManager storefrontId={storefront._id!} />
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <OrderManager storefrontId={storefront._id!} />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div data-tour="storefront-settings">
            <StorefrontSettings
              storefront={storefront}
              onUpdate={handleStorefrontUpdated}
              initialTab={settingsInitialTab}
              earningsDefaultTab={earningsDefaultTab}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
