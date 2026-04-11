import type { ReactNode } from "react";
import { Badge, Button, Card, CardBody, Select } from "../../design-system";
import type { SelectOption } from "../../design-system/components/select";
import {
    FaArrowDown,
    FaArrowUp,
    FaChartLine,
    FaDotCircle,
    FaDownload,
    FaMinus,
    FaRedo,
} from "react-icons/fa";
import { formatDateTime } from "./analytics-formatters";

interface CommandSnapshot {
    label: string;
    value: string;
    tone?: "default" | "success" | "warning" | "error" | "info" | "gray";
}

interface AnalyticsCommandCenterProps {
    timeframe: string;
    timeOptions: SelectOption[];
    onTimeframeChange: (value: string) => void;
    onRefresh: () => void;
    onExport: () => void;
    loading?: boolean;
    generatedAt?: string;
    source?: string;
    snapshots: CommandSnapshot[];
}

type SnapshotTone = NonNullable<CommandSnapshot["tone"]>;

const snapshotToneMap: Record<
    SnapshotTone,
    {
        cardClass: string;
        iconClass: string;
        titleClass: string;
        valueClass: string;
        subtitleClass: string;
        subtitleText: string;
        trendIcon: ReactNode;
    }
> = {
    default: {
        cardClass: "bg-slate-50 border border-slate-200",
        iconClass: "text-slate-600",
        titleClass: "text-slate-600",
        valueClass: "text-slate-900",
        subtitleClass: "text-slate-600",
        subtitleText: "Current level",
        trendIcon: <FaMinus className="text-[10px]" />,
    },
    success: {
        cardClass: "bg-emerald-50 border border-emerald-200",
        iconClass: "text-emerald-600",
        titleClass: "text-emerald-700",
        valueClass: "text-emerald-950",
        subtitleClass: "text-emerald-700",
        subtitleText: "Healthy trend",
        trendIcon: <FaArrowUp className="text-[10px]" />,
    },
    warning: {
        cardClass: "bg-amber-50 border border-amber-200",
        iconClass: "text-amber-600",
        titleClass: "text-amber-700",
        valueClass: "text-amber-950",
        subtitleClass: "text-amber-700",
        subtitleText: "Watch closely",
        trendIcon: <FaMinus className="text-[10px]" />,
    },
    error: {
        cardClass: "bg-rose-50 border border-rose-200",
        iconClass: "text-rose-600",
        titleClass: "text-rose-700",
        valueClass: "text-rose-950",
        subtitleClass: "text-rose-700",
        subtitleText: "Needs action",
        trendIcon: <FaArrowDown className="text-[10px]" />,
    },
    info: {
        cardClass: "bg-blue-50 border border-blue-200",
        iconClass: "text-blue-600",
        titleClass: "text-blue-700",
        valueClass: "text-blue-950",
        subtitleClass: "text-blue-700",
        subtitleText: "Reference metric",
        trendIcon: <FaMinus className="text-[10px]" />,
    },
    gray: {
        cardClass: "bg-slate-100 border border-slate-300",
        iconClass: "text-slate-600",
        titleClass: "text-slate-600",
        valueClass: "text-slate-900",
        subtitleClass: "text-slate-600",
        subtitleText: "Awaiting update",
        trendIcon: <FaMinus className="text-[10px]" />,
    },
};

export function AnalyticsCommandCenter({
    timeframe,
    timeOptions,
    onTimeframeChange,
    onRefresh,
    onExport,
    loading = false,
    generatedAt,
    source,
    snapshots,
}: AnalyticsCommandCenterProps) {
    return (
        <div className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Sales & Operations Analytics</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Monitor platform performance across revenue, orders, users, commissions, and payouts.
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1.5">
                            <FaChartLine className="text-gray-500" />
                            Last updated: {generatedAt ? formatDateTime(generatedAt) : "Awaiting data"}
                        </span>
                        {source ? (
                            <Badge colorScheme="gray" variant="subtle" className="text-[11px]">
                                {source}
                            </Badge>
                        ) : null}
                    </div>
                </div>

                <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="sm:min-w-[170px]">
                        <Select
                            value={timeframe}
                            onChange={onTimeframeChange}
                            options={timeOptions}
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="justify-center"
                        onClick={onRefresh}
                        disabled={loading}
                    >
                        <FaRedo className={loading ? "mr-2 animate-spin" : "mr-2"} />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="justify-center"
                        onClick={onExport}
                        disabled={loading}
                    >
                        <FaDownload className="mr-2" />
                        Export CSV
                    </Button>
                </div>
            </div>

            <Card>
                <CardBody>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                        {snapshots.map((snapshot) => {
                            const tone = snapshotToneMap[snapshot.tone || "default"];

                            return (
                                <Card
                                    key={snapshot.label}
                                    variant="outlined"
                                    className={`${tone.cardClass} p-3 sm:p-3.5`}
                                >
                                    <CardBody className="pt-0">
                                        <div className="flex items-center gap-3">
                                            <div className={`shrink-0 text-base sm:text-lg ${tone.iconClass}`}>
                                                <FaDotCircle />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className={`text-[10px] uppercase tracking-wide font-medium truncate ${tone.titleClass}`}>
                                                    {snapshot.label}
                                                </p>
                                                <p className={`text-base sm:text-lg font-bold leading-tight truncate ${tone.valueClass}`}>
                                                    {snapshot.value}
                                                </p>
                                                <p className={`mt-0.5 text-[11px] font-medium truncate inline-flex items-center gap-1 ${tone.subtitleClass}`}>
                                                    {tone.trendIcon}
                                                    <span>{tone.subtitleText}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            );
                        })}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
