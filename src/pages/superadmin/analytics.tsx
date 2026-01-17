import { useState, useEffect } from "react";
import {
  FaChartLine,
  FaUsers,
  FaShoppingCart,
  FaWallet,
  FaMoneyBillWave,
  FaStore,
  FaDownload,
  FaRedo,
  FaLightbulb,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import {
  Card,
  CardHeader,
  CardBody,
} from "../../design-system/components/card";
import { Button } from "../../design-system/components/button";
import { Select } from "../../design-system/components/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../design-system/components/tabs";
import { colors } from "../../design-system/tokens";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Dummy data for analytics
const dummyAnalyticsData = {
  overview: {
    totalUsers: 1250,
    totalOrders: 3456,
    totalRevenue: 125000.5,
    totalCommissions: 18750.75,
    totalWalletBalance: 87500.25,
    activeProviders: 4,
  },
  trends: {
    userGrowth: [1200, 1150, 1180, 1220, 1190, 1230, 1250],
    orderVolume: [3200, 3100, 3300, 3400, 3350, 3420, 3456],
    revenue: [115000, 118000, 120500, 122000, 119500, 123500, 125000.5],
    commissions: [17500, 17200, 18000, 18200, 17900, 18500, 18750.75],
  },
  breakdowns: {
    userTypes: {
      agents: 450,
      superAgents: 120,
      dealers: 85,
      superDealers: 35,
      superAdmins: 5,
    },
    orderStatuses: {
      completed: 2890,
      processing: 456,
      pending: 89,
      cancelled: 21,
    },
    commissionStatuses: {
      paid: 1450,
      pending: 234,
      rejected: 12,
    },
  },
  recentActivity: [
    {
      id: 1,
      type: "user_registered",
      message: "New agent registered",
      time: "2 minutes ago",
    },
    {
      id: 2,
      type: "order_completed",
      message: "Order #1234 completed",
      time: "5 minutes ago",
    },
    {
      id: 3,
      type: "commission_paid",
      message: "Commission paid to Agent XYZ",
      time: "10 minutes ago",
    },
    {
      id: 4,
      type: "wallet_topup",
      message: "Wallet top-up of GHS 500",
      time: "15 minutes ago",
    },
    {
      id: 5,
      type: "user_approved",
      message: "Dealer account approved",
      time: "20 minutes ago",
    },
  ],
};

const insights = [
  {
    title: "User Growth Opportunity",
    description:
      "User registrations are up 12% this month. Consider increasing marketing efforts to capitalize on this trend.",
    type: "positive",
    icon: <FaArrowUp className="text-green-500" />,
  },
  {
    title: "Order Processing Bottleneck",
    description:
      "456 orders are still processing. Streamline the fulfillment process to reduce completion time.",
    type: "warning",
    icon: <FaArrowDown className="text-yellow-500" />,
  },
  {
    title: "Commission Payouts",
    description:
      "Pending commissions total GHS 3,750. Process payouts to maintain agent satisfaction.",
    type: "info",
    icon: <FaWallet className="text-blue-500" />,
  },
  {
    title: "Top Performer Recognition",
    description:
      "John Doe leads with 245 orders. Implement a rewards program to motivate other agents.",
    type: "positive",
    icon: <FaLightbulb className="text-purple-500" />,
  },
];

const chartLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

export default function SuperAdminAnalyticsPage() {
  const [timeframe, setTimeframe] = useState("30d");
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState("revenue");

  // Simulate loading
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [timeframe]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  // Stats cards data
  const statsData = [
    {
      title: "Total Users",
      value: formatNumber(dummyAnalyticsData.overview.totalUsers),
      subtitle: "+12% from last month",
      icon: <FaUsers />,
    },
    {
      title: "Total Orders",
      value: formatNumber(dummyAnalyticsData.overview.totalOrders),
      subtitle: "+8% from last month",
      icon: <FaShoppingCart />,
    },
    {
      title: "Total Revenue",
      value: formatCurrency(dummyAnalyticsData.overview.totalRevenue),
      subtitle: "+15% from last month",
      icon: <FaMoneyBillWave />,
    },
    {
      title: "Total Commissions",
      value: formatCurrency(dummyAnalyticsData.overview.totalCommissions),
      subtitle: "+10% from last month",
      icon: <FaChartLine />,
    },
    {
      title: "Wallet Balance",
      value: formatCurrency(dummyAnalyticsData.overview.totalWalletBalance),
      subtitle: "Available balance",
      icon: <FaWallet />,
    },
    {
      title: "Active Providers",
      value: dummyAnalyticsData.overview.activeProviders.toString(),
      subtitle: "Network providers",
      icon: <FaStore />,
    },
  ];

  // Chart data for trends
  const trendChartData = {
    labels: chartLabels,
    datasets: [
      {
        label:
          selectedMetric === "revenue"
            ? "Revenue (GHS)"
            : selectedMetric === "users"
            ? "Users"
            : selectedMetric === "orders"
            ? "Orders"
            : "Commissions (GHS)",
        data:
          selectedMetric === "revenue"
            ? dummyAnalyticsData.trends.revenue
            : selectedMetric === "users"
            ? dummyAnalyticsData.trends.userGrowth
            : selectedMetric === "orders"
            ? dummyAnalyticsData.trends.orderVolume
            : dummyAnalyticsData.trends.commissions,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const trendChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `${
          selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)
        } Trends`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: number | string) {
            if (
              selectedMetric === "revenue" ||
              selectedMetric === "commissions"
            ) {
              return "GHS " + Number(value).toLocaleString();
            }
            return Number(value).toLocaleString();
          },
        },
      },
    },
  };

  // User types breakdown chart
  const userTypesData = {
    labels: [
      "Agents",
      "Super Agents",
      "Dealers",
      "Super Dealers",
      "Super Admins",
    ],
    datasets: [
      {
        data: [
          dummyAnalyticsData.breakdowns.userTypes.agents,
          dummyAnalyticsData.breakdowns.userTypes.superAgents,
          dummyAnalyticsData.breakdowns.userTypes.dealers,
          dummyAnalyticsData.breakdowns.userTypes.superDealers,
          dummyAnalyticsData.breakdowns.userTypes.superAdmins,
        ],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(139, 69, 19, 0.8)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const userTypesOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "right" as const,
      },
      title: {
        display: true,
        text: "User Types Distribution",
      },
    },
  };

  // Order status breakdown
  const orderStatusData = {
    labels: ["Completed", "Processing", "Pending", "Cancelled"],
    datasets: [
      {
        label: "Orders",
        data: [
          dummyAnalyticsData.breakdowns.orderStatuses.completed,
          dummyAnalyticsData.breakdowns.orderStatuses.processing,
          dummyAnalyticsData.breakdowns.orderStatuses.pending,
          dummyAnalyticsData.breakdowns.orderStatuses.cancelled,
        ],
        backgroundColor: [
          "rgba(16, 185, 129, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
      },
    ],
  };

  const orderStatusOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Order Status Breakdown",
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1
              className="text-xl sm:text-2xl font-bold mb-2"
              style={{ color: colors.brand.primary }}
            >
              Analytics Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Comprehensive insights into your platform's performance and user
              activity
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select
              value={timeframe}
              onChange={setTimeframe}
              options={[
                { value: "7d", label: "Last 7 days" },
                { value: "30d", label: "Last 30 days" },
                { value: "90d", label: "Last 90 days" },
                { value: "365d", label: "Last year" },
              ]}
              className="min-w-[120px]"
            />
            <Button
              variant="outline"
              onClick={() => setLoading(true)}
              disabled={loading}
              size="sm"
            >
              <FaRedo className={loading ? "animate-spin mr-2" : "mr-2"} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <FaDownload className="mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="breakdowns">Breakdowns</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsData.map((stat, index) => (
              <Card
                key={index}
                className={`${
                  index === 0 ? "md:col-span-2 lg:col-span-2" : ""
                } ${index === 1 ? "lg:col-span-2" : ""}`}
              >
                <CardBody className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <p className="text-sm text-gray-500">{stat.subtitle}</p>
                    </div>
                    <div className="text-2xl text-blue-500">{stat.icon}</div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Trends
                  </h3>
                  <Select
                    value={selectedMetric}
                    onChange={setSelectedMetric}
                    options={[
                      { value: "revenue", label: "Revenue" },
                      { value: "users", label: "Users" },
                      { value: "orders", label: "Orders" },
                      { value: "commissions", label: "Commissions" },
                    ]}
                    className="min-w-[120px]"
                  />
                </div>
              </CardHeader>
              <CardBody>
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <Line data={trendChartData} options={trendChartOptions} />
                )}
              </CardBody>
            </Card>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">
                  Revenue vs Orders
                </h3>
              </CardHeader>
              <CardBody>
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <Bar data={orderStatusData} options={orderStatusOptions} />
                )}
              </CardBody>
            </Card>
          </div>
        </TabsContent>

        {/* Breakdowns Tab */}
        <TabsContent value="breakdowns" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">
                  User Types Distribution
                </h3>
              </CardHeader>
              <CardBody>
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <Doughnut data={userTypesData} options={userTypesOptions} />
                )}
              </CardBody>
            </Card>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">
                  Order Status Breakdown
                </h3>
              </CardHeader>
              <CardBody>
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <Bar data={orderStatusData} options={orderStatusOptions} />
                )}
              </CardBody>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Activity
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {dummyAnalyticsData.recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          activity.type === "user_registered"
                            ? "bg-green-500"
                            : activity.type === "order_completed"
                            ? "bg-blue-500"
                            : activity.type === "commission_paid"
                            ? "bg-yellow-500"
                            : activity.type === "wallet_topup"
                            ? "bg-purple-500"
                            : "bg-gray-500"
                        }`}
                      ></div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Top Performing Agents
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    {[
                      { name: "John Doe", orders: 245, revenue: 12500.5 },
                      { name: "Jane Smith", orders: 198, revenue: 9850.75 },
                      { name: "Bob Johnson", orders: 176, revenue: 8750.25 },
                      { name: "Alice Brown", orders: 154, revenue: 7620.0 },
                      { name: "Charlie Wilson", orders: 132, revenue: 6580.5 },
                    ].map((agent, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {agent.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {agent.orders} orders
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(agent.revenue)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Commission Summary
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    {[
                      { period: "This Month", paid: 15200.5, pending: 2550.25 },
                      { period: "Last Month", paid: 14850.75, pending: 2100.0 },
                      {
                        period: "This Quarter",
                        paid: 45200.25,
                        pending: 7650.5,
                      },
                      {
                        period: "This Year",
                        paid: 125000.0,
                        pending: 18750.75,
                      },
                    ].map((summary, index) => (
                      <div key={index} className="py-2">
                        <p className="text-sm font-medium text-gray-900">
                          {summary.period}
                        </p>
                        <div className="flex justify-between text-xs text-gray-600 mt-1">
                          <span>Paid: {formatCurrency(summary.paid)}</span>
                          <span>
                            Pending: {formatCurrency(summary.pending)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <Card key={index}>
                <CardBody className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-xl">{insight.icon}</div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {insight.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
