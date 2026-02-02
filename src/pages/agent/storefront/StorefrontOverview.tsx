// src/pages/agent/storefront/StorefrontOverview.tsx
import { useState } from "react";
import { useStorefront } from "../../../hooks/useStorefront";
import { Card } from "../../../design-system/components/card";
import { Button } from "../../../design-system/components/button";
import { StatCard } from "../../../design-system/components/stats-card";
import { useToast } from "../../../design-system";
import {
  Store,
  DollarSign,
  Package,
  TrendingUp,
  Eye,
  ExternalLink,
  Settings,
  CreditCard,
  Power,
  PowerOff,
  Loader2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { storefrontService } from "../../../services/storefront.service";

export default function StorefrontOverview() {
  const { storefront, pendingOrders, refreshStorefront } = useStorefront();
  const { showToast } = useToast();

  const [isActivating, setIsActivating] = useState(false);

  const handleActivation = async (activate: boolean) => {
    if (!storefront) return;

    try {
      setIsActivating(true);

      if (activate) {
        await storefrontService.activateStorefront(storefront._id);
        showToast("Storefront activated successfully!", "success");
      } else {
        await storefrontService.deactivateStorefront(storefront._id);
        showToast("Storefront deactivated successfully!", "success");
      }

      // Refresh the storefront data
      await refreshStorefront();
    } catch (error) {
      console.error("Failed to update storefront status:", error);
      showToast(
        `Failed to ${activate ? "activate" : "deactivate"} storefront. Please try again.`,
        "error",
      );
    } finally {
      setIsActivating(false);
    }
  };

  if (!storefront) {
    return (
      <div className="text-center py-12">
        <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Storefront Found
        </h3>
        <p className="text-gray-600">
          Please create a storefront to get started.
        </p>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Orders",
      value: storefront.analytics?.totalOrders || 0,
      icon: <Package />,
      trend: "+12%",
      trendLabel: "vs last month",
    },
    {
      title: "Total Revenue",
      value: `GHS ${storefront.analytics?.totalRevenue?.toFixed(2) || "0.00"}`,
      icon: <DollarSign />,
      trend: "+8%",
      trendLabel: "vs last month",
    },
    {
      title: "Total Profit",
      value: `GHS ${storefront.analytics?.totalProfit?.toFixed(2) || "0.00"}`,
      icon: <TrendingUp />,
      trend: "+15%",
      trendLabel: "vs last month",
    },
    {
      title: "Pending Orders",
      value: pendingOrders.length,
      icon: <Package />,
      trend: null,
      trendLabel: "requires attention",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            {storefront.displayName || storefront.businessName}
            {storefront.isActive ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            )}
          </h2>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your storefront.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          {/* Activation/Deactivation Button */}
          <Button
            onClick={() => handleActivation(!storefront.isActive)}
            disabled={isActivating}
            variant={storefront.isActive ? "outline" : "primary"}
            size="sm"
          >
            {isActivating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : storefront.isActive ? (
              <PowerOff className="w-4 h-4 mr-2" />
            ) : (
              <Power className="w-4 h-4 mr-2" />
            )}
            {isActivating
              ? "Updating..."
              : storefront.isActive
                ? "Deactivate"
                : "Activate Store"}
          </Button>

          <Button variant="outline" size="sm" disabled={!storefront.isActive}>
            <Eye className="w-4 h-4 mr-2" />
            Preview Store
          </Button>

          <Button
            size="sm"
            disabled={!storefront.isActive}
            onClick={() => {
              if (storefront.isActive) {
                window.open(`/stores/${storefront.businessName}`, "_blank");
              }
            }}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Visit Store
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            trendLabel={stat.trendLabel}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
          >
            <Package className="w-6 h-6 text-primary-600" />
            <span className="text-sm font-medium">View Orders</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
          >
            <CreditCard className="w-6 h-6 text-primary-600" />
            <span className="text-sm font-medium">Payment Methods</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
          >
            <DollarSign className="w-6 h-6 text-primary-600" />
            <span className="text-sm font-medium">Set Pricing</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
          >
            <Settings className="w-6 h-6 text-primary-600" />
            <span className="text-sm font-medium">Store Settings</span>
          </Button>
        </div>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Orders
          </h3>
          {pendingOrders.length > 0 ? (
            <div className="space-y-3">
              {pendingOrders.slice(0, 5).map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      Order #{order.orderNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.customerInfo.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      GHS {order.total.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.paymentMethod.type}
                    </p>
                  </div>
                </div>
              ))}
              {pendingOrders.length > 5 && (
                <p className="text-sm text-gray-600 text-center pt-2">
                  +{pendingOrders.length - 5} more pending orders
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No pending orders</p>
              <p className="text-sm text-gray-500">
                New orders will appear here
              </p>
            </div>
          )}
        </Card>

        {/* Storefront Info */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Storefront Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Store URL
              </label>
              <p className="text-sm text-primary-600 font-mono">
                https://brytelinks.com/store/{storefront.businessName}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Status
              </label>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={`w-2 h-2 rounded-full ${storefront.isActive ? "bg-green-500" : "bg-red-500"}`}
                />
                <span className="text-sm text-gray-900">
                  {storefront.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Payment Methods
              </label>
              <p className="text-sm text-gray-900 mt-1">
                {storefront.paymentMethods.filter((pm) => pm.isActive).length}{" "}
                active methods
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Contact
              </label>
              <p className="text-sm text-gray-900 mt-1">
                {storefront.settings.contactInfo?.phone || "Not set"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Performance Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 mb-1">
              {storefront.analytics?.conversionRate || 0}%
            </div>
            <p className="text-sm text-gray-600">Conversion Rate</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              GHS{" "}
              {(
                (storefront.analytics?.totalRevenue || 0) /
                Math.max(storefront.analytics?.totalOrders || 1, 1)
              ).toFixed(2)}
            </div>
            <p className="text-sm text-gray-600">Average Order Value</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {Math.round(
                ((storefront.analytics?.totalProfit || 0) /
                  Math.max(storefront.analytics?.totalRevenue || 1, 1)) *
                  100,
              )}
              %
            </div>
            <p className="text-sm text-gray-600">Profit Margin</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
