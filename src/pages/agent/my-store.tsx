// src/pages/agent/my-store.tsx
import { useState } from "react";
import { useStorefront } from "../../hooks/useStorefront";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../design-system/components/tabs";
import { Card } from "../../design-system/components/card";
import { Button } from "../../design-system/components/button";
import {
  Store,
  CreditCard,
  DollarSign,
  BarChart3,
  Package,
  Settings,
} from "lucide-react";

// Import sub-components
import StorefrontSetup from "./storefront/StorefrontSetup";
import PaymentMethods from "./storefront/PaymentMethods";
import PricingManagement from "./storefront/PricingManagement";
import OrderManagement from "./storefront/OrderManagement";
import AnalyticsDashboard from "./storefront/AnalyticsDashboard";
import StorefrontOverview from "./storefront/StorefrontOverview";
import StorefrontSettings from "./storefront/StorefrontSettings";

export default function MyStorePage() {
  const { storefront, loading, error } = useStorefront();
  const [activeTab, setActiveTab] = useState("overview");

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your storefront...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <Store className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error Loading Storefront
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </Card>
      </div>
    );
  }

  // If no storefront exists, show setup wizard
  if (!storefront) {
    return <StorefrontSetup />;
  }

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: Store,
      component: StorefrontOverview,
    },
    {
      id: "payments",
      label: "Payment Methods",
      icon: CreditCard,
      component: PaymentMethods,
    },
    {
      id: "pricing",
      label: "Pricing",
      icon: DollarSign,
      component: PricingManagement,
    },
    {
      id: "orders",
      label: "Orders",
      icon: Package,
      component: OrderManagement,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      component: AnalyticsDashboard,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      component: StorefrontSettings,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Storefront</h1>
        <p className="text-gray-600">
          Manage your personalized storefront and track your business
          performance.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {tabs.map((tab) => {
          const Component = tab.component;
          return (
            <TabsContent key={tab.id} value={tab.id}>
              <Component />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
