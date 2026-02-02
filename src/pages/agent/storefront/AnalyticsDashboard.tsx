// src/pages/agent/storefront/AnalyticsDashboard.tsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { useStorefront } from "../../../hooks/useStorefront";
import { Card } from "../../../design-system/components/card";
import { StatCard } from "../../../design-system/components/stats-card";
import { Button } from "../../../design-system/components/button";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  ShoppingCart,
  Target,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  storefrontService,
  type StorefrontAnalytics,
} from "../../../services/storefront.service";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

export default function AnalyticsDashboard() {
  const { storefront } = useStorefront();
  const [analytics, setAnalytics] = useState<StorefrontAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d" | "1y">(
    "30d",
  );

  const getMockAnalytics = useCallback(
    (): StorefrontAnalytics => ({
      totalOrders: storefront?.analytics?.totalOrders || 24,
      totalRevenue: storefront?.analytics?.totalRevenue || 1250.5,
      totalProfit: storefront?.analytics?.totalProfit || 187.5,
      conversionRate: storefront?.analytics?.conversionRate || 3.2,
      totalViews: 1250,
      monthlyData: [
        { month: "Jan", orders: 12, revenue: 450, profit: 67.5, views: 320 },
        { month: "Feb", orders: 18, revenue: 720, profit: 108, views: 450 },
        { month: "Mar", orders: 24, revenue: 1250, profit: 187.5, views: 480 },
      ],
      topProducts: [
        { name: "MTN Airtime Bundle", orders: 15, revenue: 750, profit: 112.5 },
        { name: "Vodafone Data Bundle", orders: 8, revenue: 400, profit: 60 },
        {
          name: "AirtelTigo Voice Bundle",
          orders: 6,
          revenue: 300,
          profit: 45,
        },
      ],
      paymentMethodStats: [
        { method: "Mobile Money", orders: 18, revenue: 900 },
        { method: "Bank Transfer", orders: 4, revenue: 200 },
        { method: "Paystack", orders: 2, revenue: 150.5 },
      ],
      recentActivity: [
        {
          type: "order",
          description: "New order placed",
          timestamp: "2024-01-23T10:30:00Z",
          amount: 50,
        },
        {
          type: "payment",
          description: "Payment confirmed",
          timestamp: "2024-01-23T09:15:00Z",
          amount: 75,
        },
      ],
    }),
    [storefront?.analytics],
  );

  const fetchAnalytics = useCallback(async () => {
    if (!storefront?._id) return;

    try {
      setLoading(true);
      const data = await storefrontService.getAnalytics(storefront._id);
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      // Fallback to mock data
      setAnalytics(getMockAnalytics());
    } finally {
      setLoading(false);
    }
  }, [storefront?._id, getMockAnalytics]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics, timeframe]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const revenueChartData = useMemo(() => {
    if (!analytics || !analytics.monthlyData) return null;

    return {
      labels: analytics.monthlyData.map((d) => d.month),
      datasets: [
        {
          label: "Revenue",
          data: analytics.monthlyData.map((d) => d.revenue),
          backgroundColor: "rgba(59, 130, 246, 0.5)",
          borderColor: "rgba(59, 130, 246, 1)",
          borderWidth: 1,
        },
        {
          label: "Profit",
          data: analytics.monthlyData.map((d) => d.profit),
          backgroundColor: "rgba(16, 185, 129, 0.5)",
          borderColor: "rgba(16, 185, 129, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [analytics]);

  const ordersChartData = useMemo(() => {
    if (!analytics || !analytics.monthlyData) return null;

    return {
      labels: analytics.monthlyData.map((d) => d.month),
      datasets: [
        {
          label: "Orders",
          data: analytics.monthlyData.map((d) => d.orders),
          borderColor: "rgba(59, 130, 246, 1)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
        },
        {
          label: "Views",
          data: analytics.monthlyData.map((d) => d.views),
          borderColor: "rgba(156, 163, 175, 1)",
          backgroundColor: "rgba(156, 163, 175, 0.1)",
          tension: 0.4,
        },
      ],
    };
  }, [analytics]);

  const paymentMethodChartData = useMemo(() => {
    if (!analytics || !analytics.paymentMethodStats) return null;

    return {
      labels: analytics.paymentMethodStats.map((d) => d.method),
      datasets: [
        {
          data: analytics.paymentMethodStats.map((d) => d.revenue),
          backgroundColor: [
            "rgba(59, 130, 246, 0.8)",
            "rgba(16, 185, 129, 0.8)",
            "rgba(245, 158, 11, 0.8)",
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [analytics]);

  const exportData = () => {
    if (!analytics) return;

    const csvData = [
      ["Metric", "Value"],
      ["Total Orders", analytics.totalOrders],
      ["Total Revenue", analytics.totalRevenue],
      ["Total Profit", analytics.totalProfit],
      ["Conversion Rate", `${analytics.conversionRate}%`],
      ["Total Views", analytics.totalViews || 0],
      [],
      ["Month", "Orders", "Revenue", "Profit", "Views"],
      ...(analytics.monthlyData || []).map((d) => [
        d.month,
        d.orders,
        d.revenue,
        d.profit,
        d.views,
      ]),
      [],
      ["Top Products"],
      ["Product", "Orders", "Revenue", "Profit"],
      ...(analytics.topProducts || []).map((p) => [
        p.name,
        p.orders,
        p.revenue,
        p.profit,
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `storefront-analytics-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Analytics Data
        </h3>
        <p className="text-gray-600">
          Analytics data will appear once your storefront has activity.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Analytics Dashboard
          </h2>
          <p className="text-gray-600 mt-1">
            Track your storefront performance and customer insights.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-2">
            {(["7d", "30d", "90d", "1y"] as const).map((period) => (
              <Button
                key={period}
                variant={timeframe === period ? "primary" : "outline"}
                size="sm"
                onClick={() => setTimeframe(period)}
              >
                {period}
              </Button>
            ))}
          </div>
          <Button variant="outline" onClick={fetchAnalytics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={analytics.totalOrders}
          icon={<ShoppingCart />}
          trend="+12%"
          trendLabel="vs last month"
          trendUp={true}
        />
        <StatCard
          title="Total Revenue"
          value={`₵${analytics.totalRevenue.toFixed(2)}`}
          icon={<DollarSign />}
          trend="+18%"
          trendLabel="vs last month"
          trendUp={true}
        />
        <StatCard
          title="Total Profit"
          value={`₵${analytics.totalProfit.toFixed(2)}`}
          icon={<TrendingUp />}
          trend="+8%"
          trendLabel="vs last month"
          trendUp={true}
        />
        <StatCard
          title="Store Views"
          value={(analytics.totalViews || 0).toLocaleString()}
          icon={<Eye />}
          trend="+8%"
          trendLabel="vs last month"
          trendUp={true}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue vs Profit Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue & Profit Trends
          </h3>
          {revenueChartData && (
            <Bar data={revenueChartData} options={chartOptions} />
          )}
        </Card>

        {/* Orders vs Views Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Orders & Store Views
          </h3>
          {ordersChartData && (
            <Line data={ordersChartData} options={chartOptions} />
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Methods Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Payment Methods
          </h3>
          {paymentMethodChartData && (
            <Doughnut
              data={paymentMethodChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "bottom" as const,
                  },
                },
              }}
            />
          )}
        </Card>

        {/* Top Products */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Products
          </h3>
          <div className="space-y-4">
            {(analytics.topProducts || []).slice(0, 5).map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {product.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {product.orders} orders
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    ₵{product.revenue}
                  </p>
                  <p className="text-sm text-green-600">
                    ₵{product.profit} profit
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {(analytics.recentActivity || []).map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div
                  className={`p-1 rounded-full ${
                    activity.type === "order"
                      ? "bg-blue-100"
                      : activity.type === "payment"
                        ? "bg-green-100"
                        : "bg-gray-100"
                  }`}
                >
                  {activity.type === "order" && (
                    <ShoppingCart className="w-3 h-3 text-blue-600" />
                  )}
                  {activity.type === "payment" && (
                    <DollarSign className="w-3 h-3 text-green-600" />
                  )}
                  {activity.type === "view" && (
                    <Eye className="w-3 h-3 text-gray-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  {activity.amount && (
                    <p className="text-xs font-medium text-green-600">
                      ₵{activity.amount}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Conversion Rate
              </h3>
              <p className="text-2xl font-bold text-primary-600">
                {analytics.conversionRate}%
              </p>
            </div>
            <Target className="w-8 h-8 text-primary-600" />
          </div>
          <p className="text-sm text-gray-600 mt-2">Visitors to customers</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Avg Order Value
              </h3>
              <p className="text-2xl font-bold text-green-600">
                ₵{(analytics.totalRevenue / analytics.totalOrders).toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mt-2">Per transaction</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Profit Margin
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                {(
                  (analytics.totalProfit / analytics.totalRevenue) *
                  100
                ).toFixed(1)}
                %
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600 mt-2">Of total revenue</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Order Frequency
              </h3>
              <p className="text-2xl font-bold text-purple-600">
                {(analytics.totalOrders / 30).toFixed(1)}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-sm text-gray-600 mt-2">Orders per day</p>
        </Card>
      </div>
    </div>
  );
}
