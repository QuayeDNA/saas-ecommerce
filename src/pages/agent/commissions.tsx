import { useState, useEffect } from "react";
import {
  commissionService,
  type CommissionRecord,
  type CommissionStatistics,
  type CommissionMonthlySummary,
  type CurrentMonthStatistics,
} from "../../services/commission.service";
import {
  Card,
  CardBody,
  CardHeader,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../design-system";
import {
  FaInfoCircle,
  FaCalendarAlt,
  FaClock,
  FaCalculator,
  FaTimes,
} from "react-icons/fa";
import { CurrentMonthStats } from "../../components/commissions/current-month-stats";
import { MonthlyCommissionList } from "../../components/commissions/monthly-commission-card";

export default function AgentCommissionPage() {
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [statistics, setStatistics] = useState<CommissionStatistics | null>(
    null
  );
  const [currentMonthStats, setCurrentMonthStats] =
    useState<CurrentMonthStatistics | null>(null);
  const [monthlySummaries, setMonthlySummaries] = useState<
    CommissionMonthlySummary[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [summariesLoading, setSummariesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInfoCards, setShowInfoCards] = useState(true);

  // Format currency function
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(amount);
  };

  useEffect(() => {
    fetchAgentCommissions();
    fetchCurrentMonthStats();
    fetchMonthlySummaries();
  }, []);

  const fetchAgentCommissions = async () => {
    try {
      setLoading(true);
      setError(null);

      const [commissionsData, statisticsData] = await Promise.all([
        commissionService.getAgentCommissions(),
        commissionService.getCommissionStatistics(),
      ]);

      setCommissions(commissionsData);
      setStatistics(statisticsData);
    } catch (err) {
      console.error("Failed to load agent commissions:", err);
      setError("Failed to load commission data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentMonthStats = async () => {
    try {
      const stats = await commissionService.getCurrentMonthStatistics();
      setCurrentMonthStats(stats);
    } catch (err) {
      console.error("Failed to load current month stats:", err);
    }
  };

  const fetchMonthlySummaries = async () => {
    try {
      setSummariesLoading(true);
      const summaries = await commissionService.getAgentMonthlySummaries({
        limit: 12, // Last 12 months
      });
      setMonthlySummaries(summaries);
    } catch (err) {
      console.error("Failed to load monthly summaries:", err);
    } finally {
      setSummariesLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "paid":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
      case "rejected":
        return "error";
      case "expired":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Paid";
      case "pending":
        return "Pending";
      case "cancelled":
        return "Cancelled";
      case "rejected":
        return "Rejected";
      case "expired":
        return "Expired";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
            <div className="mt-4">
              <button
                onClick={fetchAgentCommissions}
                className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Commissions</h1>
          <p className="text-gray-600">
            Track your earnings and commission payments
          </p>
        </div>
      </div>

      {/* Tabs for Current Month vs Historical */}
      <Tabs defaultValue="current-month" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="current-month">This Month</TabsTrigger>
          <TabsTrigger value="history">Previous Months</TabsTrigger>
          <TabsTrigger value="all-records">All Records</TabsTrigger>
        </TabsList>

        {/* Current Month Tab */}
        <TabsContent value="current-month" className="space-y-6">
          {currentMonthStats && (
            <CurrentMonthStats
              statistics={currentMonthStats}
              formatCurrency={formatCurrency}
              isAgent={true}
            />
          )}

          {/* Info Cards */}
          {showInfoCards && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4 sm:p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FaInfoCircle
                    className="text-xl flex-shrink-0"
                    style={{ color: "var(--color-primary-600)" }}
                  />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Understanding Your Commissions
                  </h3>
                </div>
                <button
                  onClick={() => setShowInfoCards(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Hide info cards"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <FaCalendarAlt className="text-green-600" />
                    <h4 className="font-semibold text-gray-900">
                      Automatic Calculation
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Your commissions are{" "}
                    <strong>
                      automatically calculated on the 1st of every month
                    </strong>{" "}
                    based on your completed orders from the previous month. No
                    action needed from you!
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <FaCalculator className="text-purple-600" />
                    <h4 className="font-semibold text-gray-900">
                      Your Commission Rate
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    You earn a <strong>percentage of each order</strong> you
                    process. The rate depends on your agent tier and is shown in
                    the "Rate" column of your history.
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <FaClock className="text-orange-600" />
                    <h4 className="font-semibold text-gray-900">
                      Payment Timeline
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Pending commissions <strong>expire after 30 days</strong> if
                    not paid. Make sure to follow up with admin for timely
                    payments.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FaInfoCircle style={{ color: "var(--color-primary-600)" }} />
                  Commission Status Guide
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                  <div>
                    <strong className="text-yellow-600">Pending:</strong>{" "}
                    Commission calculated and awaiting admin approval and
                    payment.
                  </div>
                  <div>
                    <strong className="text-green-600">Paid:</strong> Commission
                    successfully paid to your wallet. Check your transaction
                    history.
                  </div>
                  <div>
                    <strong className="text-red-600">Rejected:</strong>{" "}
                    Commission rejected by admin. Check the reason in the notes.
                  </div>
                  <div>
                    <strong className="text-orange-600">Expired:</strong>{" "}
                    Pending commission exceeded the 30-day waiting period and
                    was automatically expired.
                  </div>
                </div>
              </div>
            </div>
          )}

          {!showInfoCards && (
            <button
              onClick={() => setShowInfoCards(true)}
              className="text-sm font-medium flex items-center gap-2 transition-colors"
              style={{ color: "var(--color-primary-600)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--color-primary-800)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--color-primary-600)")
              }
            >
              <FaInfoCircle />
              <span>Show Commission System Info</span>
            </button>
          )}
        </TabsContent>

        {/* Previous Months Tab */}
        <TabsContent value="history" className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Historical Commission Summaries
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              View your commission history by month with payment status
              indicators
            </p>
          </div>

          <MonthlyCommissionList
            summaries={monthlySummaries}
            formatCurrency={formatCurrency}
            loading={summariesLoading}
          />
        </TabsContent>

        {/* All Records Tab */}
        <TabsContent value="all-records" className="space-y-6">
          {/* Statistics Cards */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium">Total Paid</h3>
                </CardHeader>
                <CardBody>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(statistics.totalPaid)}
                  </div>
                  <p className="text-xs text-gray-600">Successfully paid</p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium">Pending Payment</h3>
                </CardHeader>
                <CardBody>
                  <div className="text-2xl font-bold text-yellow-600">
                    {formatCurrency(statistics.totalPending)}
                  </div>
                  <p className="text-xs text-gray-600">Awaiting payment</p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium">Pending Count</h3>
                </CardHeader>
                <CardBody>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: "var(--color-primary-600)" }}
                  >
                    {statistics.pendingCount}
                  </div>
                  <p className="text-xs text-gray-600">Pending records</p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium">This Month Paid</h3>
                </CardHeader>
                <CardBody>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(statistics.thisMonth.totalPaid)}
                  </div>
                  <p className="text-xs text-gray-600">
                    Current month earnings
                  </p>
                </CardBody>
              </Card>
            </div>
          )}

          {/* Commission History */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Commission History</h3>
            </CardHeader>
            <CardBody>
              {commissions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg
                      className="mx-auto h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900">
                    No commissions yet
                  </h3>
                  <p className="text-sm text-gray-500">
                    Your commission history will appear here once you start
                    earning.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Period
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Orders
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Commission
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {commissions.map((commission) => (
                        <tr key={commission._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(
                              commission.createdAt
                            ).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {commission.period} ({commission.periodStart} -{" "}
                            {commission.periodEnd})
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {commission.totalOrders}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(commission.totalRevenue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {(commission.commissionRate * 100).toFixed(1)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            {formatCurrency(commission.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              colorScheme={getStatusBadgeColor(
                                commission.status
                              )}
                            >
                              {getStatusText(commission.status)}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
