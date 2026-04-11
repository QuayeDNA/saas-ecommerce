import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { Card, CardBody, CardHeader, Select, Skeleton } from "../../design-system";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export type TrendMetric = "revenue" | "orders" | "users" | "commissions";

interface OrderStatusSnapshot {
    completed: number;
    processing: number;
    pending: number;
    confirmed: number;
    failed: number;
    cancelled: number;
    partiallyCompleted: number;
}

interface AnalyticsTrendStageProps {
    loading: boolean;
    labels: string[];
    selectedMetric: TrendMetric;
    onMetricChange: (value: TrendMetric) => void;
    trendSeries: number[];
    orderStatus: OrderStatusSnapshot;
}

const metricOptions = [
    { value: "revenue", label: "Revenue" },
    { value: "orders", label: "Orders" },
    { value: "users", label: "Users" },
    { value: "commissions", label: "Commissions" },
];

const trendLabelMap: Record<TrendMetric, string> = {
    revenue: "Revenue (GHS)",
    orders: "Orders",
    users: "Users",
    commissions: "Commissions (GHS)",
};

export function AnalyticsTrendStage({
    loading,
    labels,
    selectedMetric,
    onMetricChange,
    trendSeries,
    orderStatus,
}: AnalyticsTrendStageProps) {
    const trendChartData = {
        labels,
        datasets: [
            {
                label: trendLabelMap[selectedMetric],
                data: trendSeries,
                borderColor: "rgb(14, 116, 144)",
                backgroundColor: "rgba(6, 182, 212, 0.15)",
                tension: 0.35,
                fill: true,
                pointRadius: 2,
                pointHoverRadius: 5,
            },
        ],
    };

    const trendChartOptions = {
        responsive: true,
        plugins: {
            legend: { position: "top" as const },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value: number | string) => {
                        if (selectedMetric === "revenue" || selectedMetric === "commissions") {
                            return `GHS ${Number(value).toLocaleString()}`;
                        }
                        return Number(value).toLocaleString();
                    },
                },
            },
            x: {
                ticks: {
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 8,
                },
            },
        },
    };

    const statusLabels = [
        "Completed",
        "Processing",
        "Pending",
        "Confirmed",
        "Failed",
        "Cancelled",
        "Partial",
    ];
    const statusValues = [
        orderStatus.completed,
        orderStatus.processing,
        orderStatus.pending,
        orderStatus.confirmed,
        orderStatus.failed,
        orderStatus.cancelled,
        orderStatus.partiallyCompleted,
    ];

    const orderStatusData = {
        labels: statusLabels,
        datasets: [
            {
                label: "Orders",
                data: statusValues,
                backgroundColor: [
                    "rgba(16, 185, 129, 0.85)",
                    "rgba(59, 130, 246, 0.85)",
                    "rgba(245, 158, 11, 0.85)",
                    "rgba(6, 182, 212, 0.85)",
                    "rgba(239, 68, 68, 0.85)",
                    "rgba(107, 114, 128, 0.85)",
                    "rgba(168, 85, 247, 0.85)",
                ],
            },
        ],
    };

    const totalStatusOrders = statusValues.reduce((sum, value) => sum + value, 0);

    return (
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            <Card className="xl:col-span-2 p-4 sm:p-5">
                <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-base sm:text-lg font-semibold text-slate-900">Performance Trend</h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            Compare revenue, orders, users, and commissions over time.
                        </p>
                    </div>
                    <Select
                        value={selectedMetric}
                        onChange={(value) => onMetricChange(value as TrendMetric)}
                        options={metricOptions}
                        className="min-w-[160px]"
                    />
                </CardHeader>

                <CardBody>
                    {loading ? (
                        <div className="space-y-4">
                            <Skeleton width="180px" height="1rem" />
                            <Skeleton variant="rectangular" height="18rem" />
                        </div>
                    ) : (
                        <Line data={trendChartData} options={trendChartOptions} />
                    )}
                </CardBody>
            </Card>

            <Card className="p-4 sm:p-5">
                <CardHeader className="pb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900">Order Status Breakdown</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Distribution of order outcomes for the selected period.
                    </p>
                </CardHeader>

                <CardBody className="space-y-4">
                    {loading ? (
                        <>
                            <Skeleton variant="rectangular" height="11rem" />
                            <Skeleton height="1rem" />
                            <Skeleton height="1rem" />
                        </>
                    ) : (
                        <>
                            <Bar
                                data={orderStatusData}
                                options={{
                                    responsive: true,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        x: { ticks: { display: false } },
                                        y: { beginAtZero: true },
                                    },
                                }}
                            />

                            <div className="space-y-2">
                                {statusLabels.map((label, index) => {
                                    const value = statusValues[index];
                                    const ratio = totalStatusOrders > 0 ? (value / totalStatusOrders) * 100 : 0;

                                    return (
                                        <div key={label}>
                                            <div className="flex items-center justify-between text-xs text-slate-600">
                                                <span>{label}</span>
                                                <span>{value.toLocaleString()} ({ratio.toFixed(1)}%)</span>
                                            </div>
                                            <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-blue-500"
                                                    style={{ width: `${Math.min(100, ratio)}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </CardBody>
            </Card>
        </section>
    );
}
