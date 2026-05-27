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
        cardStyle: React.CSSProperties;
        iconClass: string;
        titleClass: string;
        valueClass: string;
        subtitleClass: string;
        subtitleText: string;
        trendIcon: ReactNode;
    }
> = {
    default: {
        cardClass: "",
        cardStyle: { backgroundColor: "var(--bg-surface-alt)", borderColor: "var(--border-color)" },
        iconClass: "",
        titleClass: "",
        valueClass: "",
        subtitleClass: "",
        subtitleText: "Current level",
        trendIcon: <FaMinus className="text-[10px]" />,
    },
    success: {
        cardClass: "",
        cardStyle: { backgroundColor: "color-mix(in srgb, var(--success) 10%, var(--bg-surface))", borderColor: "color-mix(in srgb, var(--success) 30%, transparent)" },
        iconClass: "",
        titleClass: "",
        valueClass: "",
        subtitleClass: "",
        subtitleText: "Healthy trend",
        trendIcon: <FaArrowUp className="text-[10px]" />,
    },
    warning: {
        cardClass: "",
        cardStyle: { backgroundColor: "color-mix(in srgb, var(--warning) 10%, var(--bg-surface))", borderColor: "color-mix(in srgb, var(--warning) 30%, transparent)" },
        iconClass: "",
        titleClass: "",
        valueClass: "",
        subtitleClass: "",
        subtitleText: "Watch closely",
        trendIcon: <FaMinus className="text-[10px]" />,
    },
    error: {
        cardClass: "",
        cardStyle: { backgroundColor: "color-mix(in srgb, var(--error) 10%, var(--bg-surface))", borderColor: "color-mix(in srgb, var(--error) 30%, transparent)" },
        iconClass: "",
        titleClass: "",
        valueClass: "",
        subtitleClass: "",
        subtitleText: "Needs action",
        trendIcon: <FaArrowDown className="text-[10px]" />,
    },
    info: {
        cardClass: "",
        cardStyle: { backgroundColor: "color-mix(in srgb, var(--info) 10%, var(--bg-surface))", borderColor: "color-mix(in srgb, var(--info) 30%, transparent)" },
        iconClass: "",
        titleClass: "",
        valueClass: "",
        subtitleClass: "",
        subtitleText: "Reference metric",
        trendIcon: <FaMinus className="text-[10px]" />,
    },
    gray: {
        cardClass: "",
        cardStyle: { backgroundColor: "var(--bg-surface-alt)", borderColor: "var(--border-color-strong)" },
        iconClass: "",
        titleClass: "",
        valueClass: "",
        subtitleClass: "",
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
                    <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Sales & Operations Analytics</h1>
                    <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                        Monitor platform performance across revenue, orders, users, and payouts.
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                        <span className="inline-flex items-center gap-1.5">
                            <FaChartLine />
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
                                    style={tone.cardStyle}
                                >
                                    <CardBody className="pt-0">
                                        <div className="flex items-center gap-3">
                                            <div className={`shrink-0 text-base sm:text-lg ${tone.iconClass}`}>
                                                <FaDotCircle />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className={`text-[10px] uppercase tracking-wide font-medium truncate ${tone.titleClass}`} style={{ color: "var(--text-secondary)" }}>
                                                    {snapshot.label}
                                                </p>
                                                <p className={`text-base sm:text-lg font-bold leading-tight truncate ${tone.valueClass}`} style={{ color: "var(--text-primary)" }}>
                                                    {snapshot.value}
                                                </p>
                                                <p className={`mt-0.5 text-[11px] font-medium truncate inline-flex items-center gap-1 ${tone.subtitleClass}`} style={{ color: "var(--text-secondary)" }}>
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
