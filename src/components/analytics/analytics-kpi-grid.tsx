import type { ReactNode } from "react";
import { Badge, Card, CardBody } from "../../design-system";

interface AnalyticsKpiCardItem {
    id: string;
    title: string;
    value: string;
    subtitle: string;
    icon: ReactNode;
    trend: "up" | "down" | "flat";
}

interface AnalyticsKpiGridProps {
    cards: AnalyticsKpiCardItem[];
}

const trendBadgeMap: Record<
    AnalyticsKpiCardItem["trend"],
    { label: string; color: "success" | "error" | "gray" }
> = {
    up: { label: "Rising", color: "success" },
    down: { label: "Cooling", color: "error" },
    flat: { label: "Stable", color: "gray" },
};

export function AnalyticsKpiGrid({ cards }: AnalyticsKpiGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {cards.map((card) => {
                const trend = trendBadgeMap[card.trend];

                return (
                    <Card
                        key={card.id}
                        variant="interactive"
                        className="border border-slate-200 bg-white p-4 sm:p-5"
                    >
                        <CardBody className="pt-0">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1 space-y-1.5">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">{card.title}</p>
                                    <p className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{card.value}</p>
                                    <p className="text-xs text-slate-500 truncate">{card.subtitle}</p>
                                </div>

                                <div className="shrink-0 rounded-xl bg-slate-100 text-slate-700 p-2.5 text-lg">
                                    {card.icon}
                                </div>
                            </div>

                            <Badge
                                colorScheme={trend.color}
                                variant="subtle"
                                className="mt-3 w-fit text-[11px]"
                            >
                                {trend.label}
                            </Badge>
                        </CardBody>
                    </Card>
                );
            })}
        </div>
    );
}

export type { AnalyticsKpiCardItem };
