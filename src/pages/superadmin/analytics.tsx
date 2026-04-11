import { useCallback, useEffect, useMemo, useState } from "react";
import {
    AnalyticsActivityStage,
    AnalyticsBreakdownStage,
    AnalyticsCommandCenter,
    AnalyticsInsightsStage,
    AnalyticsKpiGrid,
    AnalyticsPageSkeleton,
    AnalyticsTrendStage,
    formatCurrency,
    formatNumber,
    formatPercent,
    growthDirection,
    growthText,
    type AnalyticsKpiCardItem,
    type TrendMetric,
} from "../../components/analytics";
import { Alert } from "../../design-system";
import {
    analyticsService,
    type AnalyticsData,
} from "../../services/analytics.service";
import {
    FaChartLine,
    FaMoneyBillWave,
    FaShoppingCart,
    FaStore,
    FaUsers,
    FaWallet,
} from "react-icons/fa";

const timeOptions = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
    { value: "365d", label: "Last year" },
];

type SnapshotTone =
    | "default"
    | "success"
    | "warning"
    | "error"
    | "info"
    | "gray";

type CommandSnapshotItem = {
    label: string;
    value: string;
    tone?: SnapshotTone;
};

export default function SuperAdminAnalyticsPage() {
    const [timeframe, setTimeframe] = useState("30d");
    const [selectedMetric, setSelectedMetric] = useState<TrendMetric>("revenue");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadAnalytics = useCallback(
        async (showLoader = true) => {
            try {
                if (showLoader) {
                    setLoading(true);
                } else {
                    setRefreshing(true);
                }

                setError(null);
                const analytics = await analyticsService.getSuperAdminAnalytics(timeframe);
                setData(analytics);
            } catch {
                setError("Failed to load analytics data.");
            } finally {
                if (showLoader) {
                    setLoading(false);
                }
                setRefreshing(false);
            }
        },
        [timeframe]
    );

    useEffect(() => {
        void loadAnalytics(true);
    }, [loadAnalytics]);

    const handleExport = () => {
        if (!data) return;

        const labels = data.charts?.labels || [];
        const rows = labels.map((label, index) => ({
            period: label,
            orders: data.charts.orders?.[index] || 0,
            completedOrders: data.charts.completedOrders?.[index] || 0,
            revenue: data.charts.revenue?.[index] || 0,
            users: data.charts.userRegistrations?.[index] || 0,
            commissions: data.charts.commissions?.[index] || 0,
        }));

        const header = [
            "Period",
            "Orders",
            "Completed Orders",
            "Revenue",
            "Users",
            "Commissions",
        ];

        const csv = [
            header.join(","),
            ...rows.map((row) =>
                [
                    row.period,
                    row.orders,
                    row.completedOrders,
                    row.revenue.toFixed(2),
                    row.users,
                    row.commissions.toFixed(2),
                ].join(",")
            ),
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `superadmin-analytics-${timeframe}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const overviewCards: AnalyticsKpiCardItem[] = useMemo(() => {
        if (!data) return [];

        const overview = data.overview;

        return [
            {
                id: "users",
                title: "Total Users",
                value: formatNumber(overview?.totalUsers ?? data.users.total),
                subtitle: growthText(data.growth?.users),
                icon: <FaUsers />,
                trend: growthDirection(data.growth?.users),
            },
            {
                id: "orders",
                title: "Total Orders",
                value: formatNumber(overview?.totalOrders ?? data.orders.total),
                subtitle: growthText(data.growth?.orders),
                icon: <FaShoppingCart />,
                trend: growthDirection(data.growth?.orders),
            },
            {
                id: "revenue",
                title: "Total Revenue",
                value: formatCurrency(overview?.totalRevenue ?? data.revenue.total),
                subtitle: growthText(data.growth?.revenue),
                icon: <FaMoneyBillWave />,
                trend: growthDirection(data.growth?.revenue),
            },
            {
                id: "commissions",
                title: "Total Commissions",
                value: formatCurrency(
                    overview?.totalCommissions ?? data.commissions.totalEarned
                ),
                subtitle: growthText(data.growth?.commissions),
                icon: <FaChartLine />,
                trend: growthDirection(data.growth?.commissions),
            },
            {
                id: "wallet",
                title: "Wallet Float",
                value: formatCurrency(
                    overview?.totalWalletBalance ?? data.wallet.totalBalance
                ),
                subtitle: `Credits ${formatCurrency(data.wallet.transactions.credits.amount)}`,
                icon: <FaWallet />,
                trend: "flat",
            },
            {
                id: "providers",
                title: "Active Providers",
                value: String(overview?.activeProviders ?? data.providers.active),
                subtitle: `${data.providers.newThisMonth} added this month`,
                icon: <FaStore />,
                trend: "flat",
            },
        ];
    }, [data]);

    const commandSnapshots = useMemo<CommandSnapshotItem[]>(() => {
        if (!data) {
            return [
                { label: "Order Success", value: "0.00%", tone: "gray" },
                { label: "Pending Payouts", value: "GHS 0", tone: "gray" },
                { label: "Average Order", value: "GHS 0", tone: "gray" },
                { label: "User Verification", value: "0.00%", tone: "gray" },
            ];
        }

        return [
            {
                label: "Order Success",
                value: formatPercent(data.orders.successRate),
                tone: data.orders.successRate >= 85 ? "success" : "warning",
            },
            {
                label: "Pending Payouts",
                value: formatCurrency(data.payouts?.pendingLiability || 0),
                tone: (data.payouts?.pendingLiability || 0) > 0 ? "warning" : "success",
            },
            {
                label: "Average Order",
                value: formatCurrency(data.revenue.averageOrderValue),
                tone: "info",
            },
            {
                label: "User Verification",
                value: formatPercent(data.rates?.userVerification || 0),
                tone: (data.rates?.userVerification || 0) >= 70 ? "success" : "warning",
            },
        ];
    }, [data]);

    const trendSeries = useMemo(() => {
        if (!data) return [];

        switch (selectedMetric) {
            case "users":
                return data.charts.userRegistrations || [];
            case "orders":
                return data.charts.orders || [];
            case "commissions":
                return data.charts.commissions || [];
            default:
                return data.charts.revenue || [];
        }
    }, [data, selectedMetric]);

    const orderStatus = useMemo(
        () => ({
            completed:
                data?.breakdowns?.orderStatuses?.completed ?? data?.orders.completed ?? 0,
            processing:
                data?.breakdowns?.orderStatuses?.processing ?? data?.orders.processing ?? 0,
            pending: data?.breakdowns?.orderStatuses?.pending ?? data?.orders.pending ?? 0,
            cancelled:
                data?.breakdowns?.orderStatuses?.cancelled ?? data?.orders.cancelled ?? 0,
            failed: data?.breakdowns?.orderStatuses?.failed ?? data?.orders.failed ?? 0,
            confirmed:
                data?.breakdowns?.orderStatuses?.confirmed ?? data?.orders.confirmed ?? 0,
            partiallyCompleted:
                data?.breakdowns?.orderStatuses?.partiallyCompleted ??
                data?.orders.partiallyCompleted ??
                0,
        }),
        [data]
    );

    const userTypeBreakdown = useMemo(
        () => ({
            agents: data?.breakdowns?.userTypes?.agents ?? data?.users.byType.agents ?? 0,
            super_agents:
                data?.breakdowns?.userTypes?.super_agents ??
                data?.users.byType.super_agents ??
                0,
            dealers: data?.breakdowns?.userTypes?.dealers ?? data?.users.byType.dealers ?? 0,
            super_dealers:
                data?.breakdowns?.userTypes?.super_dealers ??
                data?.users.byType.super_dealers ??
                0,
            super_admins:
                data?.breakdowns?.userTypes?.super_admins ??
                data?.users.byType.super_admins ??
                0,
        }),
        [data]
    );

    const sectionLoading = refreshing && Boolean(data);

    return (
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-8">
            <AnalyticsCommandCenter
                timeframe={timeframe}
                timeOptions={timeOptions}
                onTimeframeChange={setTimeframe}
                onRefresh={() => void loadAnalytics(false)}
                onExport={handleExport}
                loading={loading || refreshing}
                generatedAt={data?.generatedAt}
                source={data?.source}
                snapshots={commandSnapshots}
            />

            {error ? (
                <Alert status="error" variant="left-accent" title="Unable to load analytics">
                    {error}
                </Alert>
            ) : null}

            {loading && !data ? (
                <AnalyticsPageSkeleton />
            ) : data ? (
                <>
                    <AnalyticsKpiGrid cards={overviewCards} />

                    <AnalyticsInsightsStage
                        loading={sectionLoading}
                        insights={data.insights || []}
                    />

                    <AnalyticsTrendStage
                        loading={sectionLoading}
                        labels={data.charts.labels || []}
                        selectedMetric={selectedMetric}
                        onMetricChange={setSelectedMetric}
                        trendSeries={trendSeries}
                        orderStatus={orderStatus}
                    />

                    <AnalyticsBreakdownStage
                        loading={sectionLoading}
                        userTypeBreakdown={userTypeBreakdown}
                        orderTypeLeaders={data.topPerformers?.orderTypes || []}
                    />

                    <AnalyticsActivityStage
                        loading={sectionLoading}
                        activityFeed={data.activityFeed || []}
                        topAgents={data.topPerformers?.agents || []}
                        pendingCommissionAmount={data.commissions.pendingAmount || 0}
                        payoutQueueCount={data.payouts?.queuedCount || 0}
                        netFlow={data.earnings?.period.netFlow || 0}
                    />
                </>
            ) : (
                <Alert status="info" variant="left-accent" title="No analytics data">
                    No analytics data is available for the selected timeframe.
                </Alert>
            )}
        </div>
    );
}
