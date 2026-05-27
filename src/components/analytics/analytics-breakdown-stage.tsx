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
    const leaders = (orderTypeLeaders ?? []).filter(Boolean);
    const root = document.documentElement;
    const primaryColor = getComputedStyle(root).getPropertyValue("--color-primary").trim() || "#3b82f6";
    const successColor = getComputedStyle(root).getPropertyValue("--success").trim() || "#00c781";
    const warningColor = getComputedStyle(root).getPropertyValue("--warning").trim() || "#f5a524";
    const errorColor = getComputedStyle(root).getPropertyValue("--error").trim() || "#ff4d67";
    const infoColor = getComputedStyle(root).getPropertyValue("--info").trim() || "#3ba4ff";

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
                    `${primaryColor}D9`,
                    `${successColor}D9`,
                    `${warningColor}D9`,
                    `${errorColor}D9`,
                    `${infoColor}D9`,
                ],
                borderWidth: 1,
            },
        ],
    };

    const maxLeaderCount = Math.max(...leaders.map((item) => item.count), 1);

    return (
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            <Card className="p-4 sm:p-5">
                <CardHeader className="pb-3">
                    <h3 className="text-base sm:text-lg font-semibold" style={{ color: "var(--text-primary)" }}>User Type Distribution</h3>
                    <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
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
                    <h3 className="text-base sm:text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Order Type Performance</h3>
                    <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
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
                    ) : leaders.length === 0 ? (
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No order type data available for this period.</p>
                    ) : (
                        leaders.map((row) => {
                            const ratio = (row.count / maxLeaderCount) * 100;

                            return (
                                <div key={row.orderType} className="rounded-xl p-3" style={{ border: "1px solid var(--border-color)" }}>
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold capitalize" style={{ color: "var(--text-primary)" }}>
                                                {row.orderType.replace(/_/g, " ")}
                                            </p>
                                            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                                {formatNumber(row.count)} orders
                                            </p>
                                        </div>
                                        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                                            {formatCurrency(row.revenue)}
                                        </p>
                                    </div>

                                    <div className="mt-2 h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-surface-alt)" }}>
                                        <div
                                            className="h-full rounded-full"
                                            style={{ width: `${Math.max(8, ratio)}%`, backgroundColor: primaryColor }}
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
