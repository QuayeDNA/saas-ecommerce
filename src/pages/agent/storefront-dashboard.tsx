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
  StatsGrid,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../design-system";
import { useToast } from "../../design-system";
import {
  storefrontService,
  type StorefrontData,
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
  CreditCard,
  Phone,
  Share2,
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
    },
    {
      label: "Set up payment methods",
      done: activePaymentMethods > 0,
    },
    {
      label: "Configure bundle pricing",
      done: !!storefront.isApproved,
    },
    {
      label: "Share your store link",
      done: !!localStorage.getItem(`storefront-shared-${storefront._id}`),
    },
  ];

  const overviewStats = [
    {
      title: "Store Status",
      value: suspended
        ? "Suspended"
        : storefront.isActive
          ? "Active"
          : "Inactive",
      icon: (
        <Store
          className={`w-5 h-5 ${suspended ? "text-red-500" : storefront.isActive ? "text-green-500" : "text-gray-400"}`}
        />
      ),
    },
    {
      title: "Payment Methods",
      value: String(activePaymentMethods),
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      title: "Approval",
      value: storefront.isApproved ? "Approved" : "Pending",
      icon: (
        <CheckCircle
          className={`w-5 h-5 ${storefront.isApproved ? "text-green-500" : "text-yellow-500"}`}
        />
      ),
    },
  ];

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
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Storefront Overview
                </h2>

                {/* Stats */}
                <StatsGrid stats={overviewStats} columns={3} />

                {/* Quick actions + info grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Quick Actions */}
                  <Card variant="outlined">
                    <CardHeader>
                      <h3 className="text-base font-semibold">Quick Actions</h3>
                    </CardHeader>
                    <CardBody className="space-y-2">
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
                        onClick={() => setActiveTab("orders")}
                        className="w-full justify-start"
                        variant="outline"
                        size="sm"
                        leftIcon={<Package className="w-4 h-4" />}
                      >
                        View Orders
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
                    </CardBody>
                  </Card>

                  {/* Store Info */}
                  <Card variant="outlined">
                    <CardHeader>
                      <h3 className="text-base font-semibold">
                        Store Information
                      </h3>
                    </CardHeader>
                    <CardBody className="space-y-3 text-sm">
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

                  {/* Getting Started Checklist */}
                  <Card variant="outlined">
                    <CardHeader>
                      <h3 className="text-base font-semibold">
                        Getting Started
                      </h3>
                    </CardHeader>
                    <CardBody className="space-y-2.5">
                      {setupChecklist.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          {item.done ? (
                            <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-300 shrink-0" />
                          )}
                          <span
                            className={
                              item.done
                                ? "text-gray-500 line-through"
                                : "text-gray-700"
                            }
                          >
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </CardBody>
                  </Card>
                </div>

                {/* Share Store URL */}
                <Card variant="outlined">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-gray-600" />
                      <h3 className="text-base font-semibold">
                        Share Your Store
                      </h3>
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
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">
                      Share this link with customers so they can browse and
                      purchase bundles from your store.
                    </p>
                  </CardBody>
                </Card>
              </div>
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing">
                <PricingManager storefrontId={storefront._id!} />
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
                <OrderManager storefrontId={storefront._id!} />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
                <StorefrontSettings
                  storefront={storefront}
                  onUpdate={handleStorefrontUpdated}
                />
            </TabsContent>
      </Tabs>
    </div>
  );
};
