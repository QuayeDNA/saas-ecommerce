import { Badge, Card, CardBody, CardHeader, Skeleton, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "../../design-system";
import { formatCurrency, formatDateTime, formatNumber } from "./analytics-formatters";

interface ActivityFeedItem {
    id: string;
    type: string;
    message: string;
    createdAt: string;
    value?: number;
}

interface TopAgentItem {
    userId: string;
    fullName: string;
    userType: string;
    orders: number;
    revenue: number;
}

interface AnalyticsActivityStageProps {
    loading: boolean;
    activityFeed: ActivityFeedItem[];
    topAgents: TopAgentItem[];
    pendingCommissionAmount: number;
    payoutQueueCount: number;
    netFlow: number;
}

function getRankStyle(rank: number) {
    if (rank === 1) {
        return {
            label: "Gold",
            badgeClass: "bg-amber-100 text-amber-800 border border-amber-300",
            rowClass: "bg-amber-50/40",
        };
    }

    if (rank === 2) {
        return {
            label: "Silver",
            badgeClass: "bg-slate-100 text-slate-800 border border-slate-300",
            rowClass: "bg-slate-50/50",
        };
    }

    if (rank === 3) {
        return {
            label: "Bronze",
            badgeClass: "bg-orange-100 text-orange-800 border border-orange-300",
            rowClass: "bg-orange-50/40",
        };
    }

    return {
        label: "",
        badgeClass: "",
        rowClass: "",
    };
}

export function AnalyticsActivityStage({
    loading,
    activityFeed,
    topAgents,
    pendingCommissionAmount,
    payoutQueueCount,
    netFlow,
}: AnalyticsActivityStageProps) {
    const rankedTopAgents = [...topAgents].sort((a, b) => {
        const orderDiff = (b.orders || 0) - (a.orders || 0);
        if (orderDiff !== 0) {
            return orderDiff;
        }

        return (b.revenue || 0) - (a.revenue || 0);
    });

    return (
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            <Card className="xl:col-span-2 p-4 sm:p-5">
                <CardHeader className="pb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900">Recent Activity</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Latest events across users, orders, payouts, and commissions.
                    </p>
                </CardHeader>

                <CardBody>
                    {loading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div key={index} className="space-y-2">
                                    <Skeleton width="70%" height="0.95rem" />
                                    <Skeleton width="45%" height="0.8rem" />
                                </div>
                            ))}
                        </div>
                    ) : activityFeed.length === 0 ? (
                        <p className="text-sm text-slate-500">No recent activity available.</p>
                    ) : (
                        <div className="space-y-3">
                            {activityFeed.slice(0, 10).map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-xl border border-slate-200 px-3 py-2.5 flex items-start justify-between gap-3"
                                >
                                    <div className="space-y-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900">{item.message}</p>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="subtle" colorScheme="info" className="text-[10px] uppercase">
                                                {item.type.replace(/_/g, " ")}
                                            </Badge>
                                            <p className="text-xs text-slate-500">{formatDateTime(item.createdAt)}</p>
                                        </div>
                                    </div>
                                    {typeof item.value === "number" ? (
                                        <p className="text-xs font-semibold text-slate-700 shrink-0">
                                            {formatCurrency(item.value)}
                                        </p>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    )}
                </CardBody>
            </Card>

            <div className="space-y-4 sm:space-y-6">
                <Card className="p-4 sm:p-5">
                    <CardHeader className="pb-3">
                        <h3 className="text-base sm:text-lg font-semibold text-slate-900">Top Agents</h3>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            Ranked by completed orders, then revenue.
                        </p>
                    </CardHeader>

                    <CardBody>
                        {loading ? (
                            <div className="space-y-2">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <Skeleton key={index} height="1.2rem" />
                                ))}
                            </div>
                        ) : topAgents.length === 0 ? (
                            <p className="text-sm text-slate-500">No top performers in this period.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table size="sm">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHeaderCell>Rank</TableHeaderCell>
                                            <TableHeaderCell>Agent</TableHeaderCell>
                                            <TableHeaderCell>Orders</TableHeaderCell>
                                            <TableHeaderCell>Revenue</TableHeaderCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rankedTopAgents.slice(0, 10).map((agent, index) => {
                                            const rank = index + 1;
                                            const rankStyle = getRankStyle(rank);

                                            return (
                                                <TableRow key={agent.userId} className={rankStyle.rowClass}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                                                                {rank}
                                                            </span>
                                                            {rankStyle.label ? (
                                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${rankStyle.badgeClass}`}>
                                                                    {rankStyle.label}
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="text-xs font-semibold text-slate-900">{agent.fullName}</p>
                                                            <p className="text-[11px] text-slate-500 capitalize">
                                                                {agent.userType.replace(/_/g, " ")}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{formatNumber(agent.orders)}</TableCell>
                                                    <TableCell>{formatCurrency(agent.revenue)}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardBody>
                </Card>

                <Card className="p-4 sm:p-5">
                    <CardHeader className="pb-3">
                        <h3 className="text-base sm:text-lg font-semibold text-slate-900">Financial Summary</h3>
                    </CardHeader>

                    <CardBody className="space-y-3 text-sm">
                        {loading ? (
                            <>
                                <Skeleton height="1rem" />
                                <Skeleton height="1rem" />
                                <Skeleton height="1rem" />
                            </>
                        ) : (
                            <>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-slate-600">Pending commission</span>
                                    <span className="font-semibold text-slate-900">
                                        {formatCurrency(pendingCommissionAmount)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-slate-600">Payout queue</span>
                                    <span className="font-semibold text-slate-900">
                                        {formatNumber(payoutQueueCount)} requests
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-slate-600">Period net flow</span>
                                    <span className="font-semibold text-slate-900">{formatCurrency(netFlow)}</span>
                                </div>
                            </>
                        )}
                    </CardBody>
                </Card>
            </div>
        </section>
    );
}
