import {
    ArcElement,
    Chart as ChartJS,
    Legend,
    Tooltip,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Card, CardBody, CardHeader, Skeleton } from "../../design-system";
import { formatCurrency, formatNumber } from "./analytics-formatters";

ChartJS.register(ArcElement, Tooltip, Legend);

interface UserTypeBreakdown {
    agents: number;
    super_agents: number;
    dealers: number;
    super_dealers: number;
    super_admins: number;
}

interface OrderTypeLeader {
    orderType: string;
    count: number;
    revenue: number;
}

interface AnalyticsBreakdownStageProps {
    loading: boolean;
    userTypeBreakdown: UserTypeBreakdown;
    orderTypeLeaders: OrderTypeLeader[];
}

export function AnalyticsBreakdownStage({
    loading,
    userTypeBreakdown,
    orderTypeLeaders,
}: AnalyticsBreakdownStageProps) {
    const userTypesData = {
        labels: ["Agents", "Super Agents", "Dealers", "Super Dealers", "Super Admins"],
        datasets: [
            {
                data: [
                    userTypeBreakdown.agents,
                    userTypeBreakdown.super_agents,
                    userTypeBreakdown.dealers,
                    userTypeBreakdown.super_dealers,
                    userTypeBreakdown.super_admins,
                ],
                backgroundColor: [
                    "rgba(59, 130, 246, 0.85)",
                    "rgba(16, 185, 129, 0.85)",
                    "rgba(245, 158, 11, 0.85)",
                    "rgba(239, 68, 68, 0.85)",
                    "rgba(99, 102, 241, 0.85)",
                ],
                borderWidth: 1,
            },
        ],
    };

    const maxLeaderCount = Math.max(...orderTypeLeaders.map((item) => item.count), 1);

    return (
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            <Card className="p-4 sm:p-5">
                <CardHeader className="pb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900">User Type Distribution</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Distribution of users across platform roles.
                    </p>
                </CardHeader>

                <CardBody>
                    {loading ? (
                        <div className="space-y-4">
                            <Skeleton variant="rectangular" height="16rem" />
                        </div>
                    ) : (
                        <div className="min-h-[16rem] flex items-center justify-center">
                            <Doughnut
                                data={userTypesData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            position: "bottom",
                                            labels: { usePointStyle: true, padding: 14 },
                                        },
                                    },
                                }}
                            />
                        </div>
                    )}
                </CardBody>
            </Card>

            <Card className="p-4 sm:p-5">
                <CardHeader className="pb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900">Order Type Performance</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Order volume and revenue by order category.
                    </p>
                </CardHeader>

                <CardBody className="space-y-3">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="space-y-2">
                                <Skeleton width="150px" height="0.875rem" />
                                <Skeleton variant="rectangular" height="0.5rem" />
                            </div>
                        ))
                    ) : orderTypeLeaders.length === 0 ? (
                        <p className="text-sm text-slate-500">No order type data available for this period.</p>
                    ) : (
                        orderTypeLeaders.map((row) => {
                            const ratio = (row.count / maxLeaderCount) * 100;

                            return (
                                <div key={row.orderType} className="rounded-xl border border-slate-200 p-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 capitalize">
                                                {row.orderType.replace(/_/g, " ")}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {formatNumber(row.count)} orders
                                            </p>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-900">
                                            {formatCurrency(row.revenue)}
                                        </p>
                                    </div>

                                    <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-indigo-500"
                                            style={{ width: `${Math.max(8, ratio)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </CardBody>
            </Card>
        </section>
    );
}
