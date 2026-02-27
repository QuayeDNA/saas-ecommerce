import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  Alert,
  Spinner,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  StatsGrid,
  StatCard,
} from "../../design-system";
import { useToast } from "../../design-system";
import {
  storefrontService,
  type StorefrontData,
  type StorefrontAnalytics,
  type StorefrontOrder,
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
} from "lucide-react";
import { getApiErrorMessage } from "../../utils/error-helpers";

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
  const [storefront, setStorefront] = useState<StorefrontData | null>(null);
  const [suspended, setSuspended] = useState(false);
  const [suspensionMessage, setSuspensionMessage] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  // Analytics & orders state
  const [analytics, setAnalytics] = useState<StorefrontAnalytics | null>(null);
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
      const [analyticsData, ordersData, bundlesData] = await Promise.all([
        storefrontService.getAnalytics(),
        storefrontService.getMyOrders({ limit: 5, offset: 0 }),
        storefrontService.getAvailableBundles(),
      ]);
      setAnalytics(analyticsData);
      setRecentOrders(ordersData.orders || []);
      setAvailableBundles(bundlesData);
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
    return `${window.location.origin}/store/${storefront.businessName}`;
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-3 text-sm text-gray-600">
            Loading your storefront...
          </p>
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

  // Carousel for profit metrics
  const ProfitCarousel: React.FC<{
    completed: number;
    pending: number;
    loading: boolean;
  }> = ({ completed, pending, loading }) => {
    const [index, setIndex] = useState(0);
    useEffect(() => {
      const iv = setInterval(() => setIndex((i) => (i + 1) % 2), 5000);
      return () => clearInterval(iv);
    }, []);

    const cards = [
      {
        title: "Profit",
        value: loading ? "—" : formatCurrency(completed),
        subtitle: "From completed orders",
        icon: <TrendingUp className="w-4 h-4" />,
      },
      {
        title: "Pending Profit",
        value: loading ? "—" : formatCurrency(pending),
        subtitle: "Markup on pending orders",
        icon: <Clock className="w-4 h-4" />,
      },
    ];

    const card = cards[index];
    return (
      <StatCard
        title={card.title}
        value={card.value}
        subtitle={card.subtitle}
        icon={card.icon}
        size="md"
      />
    );
  };

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
        <div className="bg-white rounded-lg border border-gray-200 px-3 sm:px-6 py-3 sm:py-4 overflow-x-auto">
          <TabsList className="inline-flex sm:grid sm:w-full sm:grid-cols-4 gap-1 min-w-max sm:min-w-0">
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
            {/* Analytics Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Orders"
                value={analyticsLoading ? "—" : analytics?.totalOrders ?? 0}
                subtitle={`${analytics?.completedOrders ?? 0} completed`}
                icon={<ShoppingCart className="w-4 h-4" />}
                size="md"
              />

              <StatCard
                title="Revenue"
                value={analyticsLoading ? "—" : formatCurrency(analytics?.totalRevenue ?? 0)}
                subtitle="Lifetime earnings"
                icon={<DollarSign className="w-4 h-4" />}
                size="md"
              />

              <ProfitCarousel
                completed={analytics?.totalProfit ?? 0}
                pending={analytics?.pendingProfit ?? 0}
                loading={analyticsLoading}
              />

              <StatCard
                title="Pending"
                value={analyticsLoading ? "—" : analytics?.pendingOrders ?? 0}
                subtitle="Awaiting action"
                icon={<Clock className="w-4 h-4" />}
                size="md"
              />
            </div>

            {/* Additional analytics row */}
            {analytics && !analyticsLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-0.5">Avg Order Value</p>
                  <p className="text-sm font-bold text-gray-900">
                    {formatCurrency(analytics.averageOrderValue)}
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-0.5">Confirmed</p>
                  <p className="text-sm font-bold text-blue-600">{analytics.confirmedOrders}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-0.5">Completed</p>
                  <p className="text-sm font-bold text-green-600">{analytics.completedOrders}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-0.5">Cancelled</p>
                  <p className="text-sm font-bold text-red-600">{analytics.cancelledOrders}</p>
                </div>
              </div>
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
                      <div className="flex items-center justify-center py-6">
                        <Spinner size="sm" />
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
                              <p className="text-sm font-bold text-gray-900">
                                {formatCurrency(order.total)}
                              </p>
                              <p className="text-xs text-gray-400">
                                {formatRelativeTime(order.createdAt)}
                              </p>
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
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
