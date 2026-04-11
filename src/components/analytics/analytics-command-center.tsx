import { Badge, Button, Card, CardBody, Select } from "../../design-system";
import type { SelectOption } from "../../design-system/components/select";
import { FaChartLine, FaDownload, FaRedo } from "react-icons/fa";
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
        <Card className="border border-slate-200 bg-white p-4 sm:p-6">
            <CardBody className="pt-0">
                <div className="space-y-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                            <Badge colorScheme="info" variant="subtle" className="w-fit">
                                Overview
                            </Badge>
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                                Sales & Operations Analytics
                            </h1>
                            <p className="text-sm text-slate-600 max-w-2xl">
                                Monitor platform performance across revenue, orders, users, commissions, and payouts.
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                <span className="inline-flex items-center gap-1.5">
                                    <FaChartLine className="text-slate-500" />
                                    Last updated: {generatedAt ? formatDateTime(generatedAt) : "Awaiting data"}
                                </span>
                                {source ? (
                                    <Badge colorScheme="gray" variant="subtle" className="text-[11px]">
                                        {source}
                                    </Badge>
                                ) : null}
                            </div>
                        </div>

                        <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-2 sm:items-center">
                            <Select
                                value={timeframe}
                                onChange={onTimeframeChange}
                                options={timeOptions}
                                className="min-w-[160px]"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-slate-300 text-slate-700 hover:bg-slate-50"
                                onClick={onRefresh}
                                disabled={loading}
                            >
                                <FaRedo className={loading ? "mr-2 animate-spin" : "mr-2"} />
                                Refresh
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-slate-300 text-slate-700 hover:bg-slate-50"
                                onClick={onExport}
                                disabled={loading}
                            >
                                <FaDownload className="mr-2" />
                                Export CSV
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                        {snapshots.map((snapshot) => (
                            <div
                                key={snapshot.label}
                                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
                            >
                                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                                    {snapshot.label}
                                </p>
                                <p className="mt-1 text-sm sm:text-base font-semibold text-slate-900">
                                    {snapshot.value}
                                </p>
                                {snapshot.tone ? (
                                    <Badge
                                        colorScheme={snapshot.tone}
                                        variant="subtle"
                                        className="mt-2 w-fit text-[10px]"
                                    >
                                        Current
                                    </Badge>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
