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
            badgeStyle: {
                backgroundColor: "color-mix(in srgb, var(--warning) 20%, transparent)",
                color: "var(--warning)",
                border: "1px solid color-mix(in srgb, var(--warning) 40%, transparent)",
            } as React.CSSProperties,
            rowStyle: {
                borderColor: "color-mix(in srgb, var(--warning) 35%, transparent)",
                backgroundColor: "color-mix(in srgb, var(--warning) 10%, transparent)",
            } as React.CSSProperties,
        };
    }

    if (rank === 2) {
        return {
            label: "Silver",
            badgeStyle: {
                backgroundColor: "color-mix(in srgb, var(--text-secondary) 20%, transparent)",
                color: "var(--text-secondary)",
                border: "1px solid color-mix(in srgb, var(--text-secondary) 35%, transparent)",
            } as React.CSSProperties,
            rowStyle: {
                borderColor: "color-mix(in srgb, var(--text-secondary) 35%, transparent)",
                backgroundColor: "color-mix(in srgb, var(--text-secondary) 10%, transparent)",
            } as React.CSSProperties,
        };
    }

    if (rank === 3) {
        return {
            label: "Bronze",
            badgeStyle: {
                backgroundColor: "color-mix(in srgb, #b45309 20%, transparent)",
                color: "#b45309",
                border: "1px solid color-mix(in srgb, #b45309 40%, transparent)",
            } as React.CSSProperties,
            rowStyle: {
                borderColor: "color-mix(in srgb, #b45309 35%, transparent)",
                backgroundColor: "color-mix(in srgb, #b45309 10%, transparent)",
            } as React.CSSProperties,
        };
    }

    return {
        label: "",
        badgeStyle: {} as React.CSSProperties,
        rowStyle: {
            borderColor: "color-mix(in srgb, var(--text-inverse) 15%, transparent)",
            backgroundColor: "color-mix(in srgb, var(--text-inverse) 5%, transparent)",
        } as React.CSSProperties,
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
            return rankedTopStorefronts.filter(Boolean).map((storefront) => ({
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
                    <h3 className="text-base sm:text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Recent Activity</h3>
                    <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                        Latest events across users, orders, and payouts.
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
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No recent activity available.</p>
                    ) : (
                        <div className="space-y-3">
                            {activityFeed.slice(0, 10).map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-xl px-3 py-2.5 flex items-start justify-between gap-3"
                                    style={{ border: "1px solid var(--border-color)" }}
                                >
                                    <div className="space-y-1 min-w-0">
                                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.message}</p>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="subtle" colorScheme="info" className="text-[10px] uppercase">
                                                {item.type.replace(/_/g, " ")}
                                            </Badge>
                                            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{formatDateTime(item.createdAt)}</p>
                                        </div>
                                    </div>
                                    {typeof item.value === "number" ? (
                                        <p className="text-xs font-semibold shrink-0" style={{ color: "var(--text-primary)" }}>
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
                <Card className="overflow-hidden p-4 sm:p-5" style={{ background: "var(--gradient-brand-dark)" }}>
                    <CardHeader className="pb-3 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-base sm:text-lg font-semibold" style={{ color: "var(--text-inverse)" }}>Performance Leaderboard</h3>
                                    <Badge
                                        size="xs"
                                        style={{
                                            backgroundColor: "color-mix(in srgb, var(--text-inverse) 15%, transparent)",
                                            color: "var(--text-inverse)",
                                            border: "1px solid color-mix(in srgb, var(--text-inverse) 30%, transparent)",
                                        }}
                                    >
                                        {performanceMode === "agents" ? "Agents" : "Storefronts"}
                                    </Badge>
                                </div>
                                <p className="text-xs sm:text-sm mt-1" style={{ color: "color-mix(in srgb, var(--text-inverse) 75%, transparent)" }}>
                                    Same list component for agents and storefronts.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    aria-label="Show previous leaderboard"
                                    onClick={() => togglePerformanceMode("prev")}
                                    className="h-8 w-8 rounded-lg"
                                    style={{
                                        border: "1px solid color-mix(in srgb, var(--text-inverse) 30%, transparent)",
                                        backgroundColor: "color-mix(in srgb, var(--text-inverse) 10%, transparent)",
                                        color: "var(--text-inverse)",
                                    }}
                                >
                                    {"<"}
                                </button>
                                <button
                                    type="button"
                                    aria-label="Show next leaderboard"
                                    onClick={() => togglePerformanceMode("next")}
                                    className="h-8 w-8 rounded-lg"
                                    style={{
                                        border: "1px solid color-mix(in srgb, var(--text-inverse) 30%, transparent)",
                                        backgroundColor: "color-mix(in srgb, var(--text-inverse) 10%, transparent)",
                                        color: "var(--text-inverse)",
                                    }}
                                >
                                    {">"}
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold" style={{ color: "var(--text-inverse)" }}>{currentTitle}</p>
                                <p className="text-xs mt-0.5" style={{ color: "color-mix(in srgb, var(--text-inverse) 75%, transparent)" }}>
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
                            <p className="text-sm" style={{ color: "color-mix(in srgb, var(--text-inverse) 75%, transparent)" }}>{performanceEmptyText}</p>
                        ) : (
                            <>
                                <div className="sm:hidden space-y-3 mt-2">
                                    {currentRows.slice(0, topPerformersCount).map((row, index) => {
                                        const rank = index + 1;
                                        const rankStyle = getRankStyle(rank);

                                        return (
                                            <div
                                                key={row.id}
                                                className="rounded-xl border p-3"
                                                style={rankStyle.rowStyle}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold shrink-0"
                                                        style={{
                                                            backgroundColor: "color-mix(in srgb, var(--text-inverse) 15%, transparent)",
                                                            color: "var(--text-inverse)",
                                                        }}
                                                    >
                                                        #{rank}
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-col">
                                                            <p className="text-sm font-bold truncate" style={{ color: "var(--text-inverse)" }}>{row.primary}</p>
                                                            <p className="text-[11px] capitalize" style={{ color: "color-mix(in srgb, var(--text-inverse) 75%, transparent)" }}>
                                                                {row.secondary}
                                                                {rankStyle.label ? ` • ${rankStyle.label}` : ""}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex justify-between rounded-lg p-2"
                                                    style={{
                                                        backgroundColor: "color-mix(in srgb, var(--text-inverse) 10%, transparent)",
                                                        border: "1px solid color-mix(in srgb, var(--text-inverse) 20%, transparent)",
                                                    }}
                                                >
                                                    <div className="text-center w-1/2" style={{ borderRight: "1px solid color-mix(in srgb, var(--text-inverse) 20%, transparent)" }}>
                                                        <span className="block text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "color-mix(in srgb, var(--text-inverse) 70%, transparent)" }}>{ordersColumnLabel}</span>
                                                        <span className="font-semibold" style={{ color: "var(--text-inverse)" }}>{formatNumber(row.orders)}</span>
                                                    </div>
                                                    <div className="text-center w-1/2">
                                                        <span className="block text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "color-mix(in srgb, var(--text-inverse) 70%, transparent)" }}>{valueColumnLabel}</span>
                                                        <span className="font-semibold" style={{ color: "var(--text-inverse)" }}>{formatCurrency(row.value)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="hidden sm:block overflow-x-auto mt-2">
                                    <Table size="sm">
                                        <TableHeader>
                                            <TableRow style={{ borderColor: "color-mix(in srgb, var(--text-inverse) 20%, transparent)" }}>
                                                <TableHeaderCell style={{ color: "color-mix(in srgb, var(--text-inverse) 80%, transparent)" }}>Rank</TableHeaderCell>
                                                <TableHeaderCell style={{ color: "color-mix(in srgb, var(--text-inverse) 80%, transparent)" }}>Name</TableHeaderCell>
                                                <TableHeaderCell style={{ color: "color-mix(in srgb, var(--text-inverse) 80%, transparent)" }}>{ordersColumnLabel}</TableHeaderCell>
                                                <TableHeaderCell style={{ color: "color-mix(in srgb, var(--text-inverse) 80%, transparent)" }}>{valueColumnLabel}</TableHeaderCell>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentRows.slice(0, topPerformersCount).map((row, index) => {
                                                const rank = index + 1;
                                                const rankStyle = getRankStyle(rank);

                                                return (
                                                    <TableRow key={row.id}
                                                        style={{ ...rankStyle.rowStyle, borderColor: "color-mix(in srgb, var(--text-inverse) 15%, transparent)" }}
                                                    >
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold"
                                                                    style={{
                                                                        backgroundColor: "color-mix(in srgb, var(--text-inverse) 15%, transparent)",
                                                                        color: "var(--text-inverse)",
                                                                    }}
                                                                >
                                                                    {rank}
                                                                </span>
                                                                {rankStyle.label ? (
                                                                    <span
                                                                        className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                                                        style={rankStyle.badgeStyle}
                                                                    >
                                                                        {rankStyle.label}
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <p className="text-sm font-semibold" style={{ color: "var(--text-inverse)" }}>{row.primary}</p>
                                                                <p className="text-xs capitalize" style={{ color: "color-mix(in srgb, var(--text-inverse) 75%, transparent)" }}>
                                                                    {row.secondary}
                                                                </p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-medium" style={{ color: "var(--text-inverse)" }}>{formatNumber(row.orders)}</TableCell>
                                                        <TableCell className="font-semibold" style={{ color: "var(--text-inverse)" }}>{formatCurrency(row.value)}</TableCell>
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
                        <h3 className="text-base sm:text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Financial Summary</h3>
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
                                    <span style={{ color: "var(--text-secondary)" }}>Payout queue</span>
                                    <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                                        {formatNumber(payoutQueueCount)} requests
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span style={{ color: "var(--text-secondary)" }}>Period net flow</span>
                                    <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{formatCurrency(netFlow)}</span>
                                </div>
                            </>
                        )}
                    </CardBody>
                </Card>
            </div>
        </section>
    );
}
