import { useMemo, useState } from "react";
import {
    Badge,
    Card,
    CardBody,
    CardHeader,
    Select,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from "../../design-system";
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

interface TopStorefrontItem {
    storefrontId: string;
    storefrontName: string;
    businessName?: string;
    agentName?: string;
    totalOrders?: number;
    netProfit?: number;
    grossRevenue?: number;
    orders: number;
    revenue: number;
}

interface SelectOption {
    value: string;
    label: string;
}

interface AnalyticsActivityStageProps {
    loading: boolean;
    performanceLoading?: boolean;
    activityFeed: ActivityFeedItem[];
    topAgents: TopAgentItem[];
    topStorefronts: TopStorefrontItem[];
    performanceTimeframe: string;
    performanceTimeOptions: SelectOption[];
    onPerformanceTimeframeChange: (value: string) => void;
    pendingCommissionAmount: number;
    payoutQueueCount: number;
    netFlow: number;
}

type PerformanceMode = "agents" | "storefronts";

interface PerformerRow {
    id: string;
    primary: string;
    secondary: string;
    orders: number;
    value: number;
}

function getRankStyle(rank: number) {
    if (rank === 1) {
        return {
            label: "Gold",
            badgeClass: "bg-amber-400/20 text-amber-100 border border-amber-300/40",
            rowClass: "border-amber-300/35 bg-amber-400/10",
        };
    }

    if (rank === 2) {
        return {
            label: "Silver",
            badgeClass: "bg-slate-300/20 text-slate-100 border border-slate-300/35",
            rowClass: "border-slate-300/35 bg-slate-300/10",
        };
    }

    if (rank === 3) {
        return {
            label: "Bronze",
            badgeClass: "bg-orange-300/20 text-orange-100 border border-orange-300/40",
            rowClass: "border-orange-300/35 bg-orange-300/10",
        };
    }

    return {
        label: "",
        badgeClass: "",
        rowClass: "border-white/15 bg-white/5",
    };
}

export function AnalyticsActivityStage({
    loading,
    performanceLoading = false,
    activityFeed,
    topAgents,
    topStorefronts,
    performanceTimeframe,
    performanceTimeOptions,
    onPerformanceTimeframeChange,
    pendingCommissionAmount,
    payoutQueueCount,
    netFlow,
}: AnalyticsActivityStageProps) {
    const [performanceMode, setPerformanceMode] = useState<PerformanceMode>("agents");
    const [topPerformersCount, setTopPerformersCount] = useState<number>(5);

    const rankedTopAgents = useMemo(
        () =>
            [...topAgents].sort((a, b) => {
                const orderDiff = (b.orders || 0) - (a.orders || 0);
                if (orderDiff !== 0) {
                    return orderDiff;
                }

                return (b.revenue || 0) - (a.revenue || 0);
            }),
        [topAgents]
    );

    const rankedTopStorefronts = useMemo(
        () =>
            [...topStorefronts].sort((a, b) => {
                const orderDiff = (b.orders || 0) - (a.orders || 0);
                if (orderDiff !== 0) {
                    return orderDiff;
                }

                return (b.revenue || 0) - (a.revenue || 0);
            }),
        [topStorefronts]
    );

    const currentRows = useMemo<PerformerRow[]>(() => {
        if (performanceMode === "storefronts") {
            return rankedTopStorefronts.map((storefront) => ({
                id: storefront.storefrontId,
                primary: storefront.storefrontName,
                secondary: storefront.agentName
                    ? `Owner: ${storefront.agentName}`
                    : storefront.businessName || "Storefront",
                orders: storefront.totalOrders ?? storefront.orders ?? 0,
                value: storefront.netProfit ?? storefront.revenue ?? 0,
            }));
        }

        return rankedTopAgents.map((agent) => ({
            id: agent.userId,
            primary: agent.fullName,
            secondary: String(agent.userType || "user").replace(/_/g, " "),
            orders: agent.orders,
            value: agent.revenue,
        }));
    }, [performanceMode, rankedTopAgents, rankedTopStorefronts]);

    const currentTitle =
        performanceMode === "agents"
            ? "Top Agent Performance"
            : "Top Storefront Performance";

    const valueColumnLabel =
        performanceMode === "agents" ? "Revenue" : "Net Profit";

    const ordersColumnLabel =
        performanceMode === "agents" ? "Orders" : "Completed Orders";

    const performanceEmptyText =
        performanceMode === "agents"
            ? "No top agents in this period."
            : "No storefront performance in this period.";

    const togglePerformanceMode = (direction: "prev" | "next") => {
        setPerformanceMode((current) => {
            if (direction === "prev") {
                return current === "agents" ? "storefronts" : "agents";
            }
            return current === "agents" ? "storefronts" : "agents";
        });
    };

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
                <Card className="overflow-hidden bg-gradient-to-r from-primary-500 to-primary-700 text-white p-4 sm:p-5">
                    <CardHeader className="pb-3 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-base sm:text-lg font-semibold text-white">Performance Leaderboard</h3>
                                    <Badge
                                        size="xs"
                                        className="bg-white/15 text-white border border-white/30"
                                    >
                                        {performanceMode === "agents" ? "Agents" : "Storefronts"}
                                    </Badge>
                                </div>
                                <p className="text-xs sm:text-sm text-white/75 mt-1">
                                    Same list component for agents and storefronts.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    aria-label="Show previous leaderboard"
                                    onClick={() => togglePerformanceMode("prev")}
                                    className="h-8 w-8 rounded-lg border border-white/30 bg-white/10 text-white hover:bg-white/20"
                                >
                                    {"<"}
                                </button>
                                <button
                                    type="button"
                                    aria-label="Show next leaderboard"
                                    onClick={() => togglePerformanceMode("next")}
                                    className="h-8 w-8 rounded-lg border border-white/30 bg-white/10 text-white hover:bg-white/20"
                                >
                                    {">"}
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-white">{currentTitle}</p>
                                <p className="text-xs text-white/75 mt-0.5">
                                    Ranked by completed orders, then revenue.
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="w-28">
                                    <Select
                                        value={performanceTimeframe}
                                        onChange={onPerformanceTimeframeChange}
                                        options={performanceTimeOptions}
                                    />
                                </div>
                                <div className="w-24">
                                    <Select
                                        value={topPerformersCount.toString()}
                                        onChange={(value) => setTopPerformersCount(Number(value))}
                                        options={[
                                            { value: "5", label: "Top 5" },
                                            { value: "10", label: "Top 10" },
                                            { value: "1000", label: "All Users" },
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardBody>
                        {performanceLoading || loading ? (
                            <div className="space-y-2">
                                {Array.from({ length: topPerformersCount }).map((_, index) => (
                                    <Skeleton key={index} height="1.2rem" />
                                ))}
                            </div>
                        ) : currentRows.length === 0 ? (
                            <p className="text-sm text-white/75">{performanceEmptyText}</p>
                        ) : (
                            <>
                                <div className="sm:hidden space-y-3 mt-2">
                                    {currentRows.slice(0, topPerformersCount).map((row, index) => {
                                        const rank = index + 1;
                                        const rankStyle = getRankStyle(rank);

                                        return (
                                            <div
                                                key={row.id}
                                                className={`rounded-xl border p-3 ${rankStyle.rowClass}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-sm font-semibold text-white shrink-0">
                                                        #{rank}
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-col">
                                                            <p className="text-sm font-bold text-white truncate">{row.primary}</p>
                                                            <p className="text-[11px] text-white/75 capitalize">
                                                                {row.secondary}
                                                                {rankStyle.label ? ` • ${rankStyle.label}` : ""}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex justify-between bg-white/10 rounded-lg p-2 border border-white/20">
                                                    <div className="text-center w-1/2 border-r border-white/20">
                                                        <span className="block text-[10px] text-white/70 uppercase tracking-wider mb-0.5">{ordersColumnLabel}</span>
                                                        <span className="font-semibold text-white">{formatNumber(row.orders)}</span>
                                                    </div>
                                                    <div className="text-center w-1/2">
                                                        <span className="block text-[10px] text-white/70 uppercase tracking-wider mb-0.5">{valueColumnLabel}</span>
                                                        <span className="font-semibold text-white">{formatCurrency(row.value)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="hidden sm:block overflow-x-auto mt-2">
                                    <Table size="sm">
                                        <TableHeader>
                                            <TableRow className="border-white/20">
                                                <TableHeaderCell className="text-white/80">Rank</TableHeaderCell>
                                                <TableHeaderCell className="text-white/80">Name</TableHeaderCell>
                                                <TableHeaderCell className="text-white/80">{ordersColumnLabel}</TableHeaderCell>
                                                <TableHeaderCell className="text-white/80">{valueColumnLabel}</TableHeaderCell>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentRows.slice(0, topPerformersCount).map((row, index) => {
                                                const rank = index + 1;
                                                const rankStyle = getRankStyle(rank);

                                                return (
                                                    <TableRow key={row.id} className={`${rankStyle.rowClass} border-white/15`}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-xs font-semibold text-white">
                                                                    {rank}
                                                                </span>
                                                                {rankStyle.label ? (
                                                                    <span
                                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${rankStyle.badgeClass}`}
                                                                    >
                                                                        {rankStyle.label}
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <p className="text-sm font-semibold text-white">{row.primary}</p>
                                                                <p className="text-xs text-white/75 capitalize">
                                                                    {row.secondary}
                                                                </p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-medium text-white">{formatNumber(row.orders)}</TableCell>
                                                        <TableCell className="font-semibold text-white">{formatCurrency(row.value)}</TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            </>
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
