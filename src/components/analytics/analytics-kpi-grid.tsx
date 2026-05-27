import type { ReactNode } from "react";
import { FaArrowDown, FaArrowUp, FaMinus } from "react-icons/fa";
import { Card, CardBody } from "../../design-system";

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

const cardToneMap: Record<
    string,
    {
        cardClass: string;
        cardStyle?: React.CSSProperties;
        iconClass: string;
        titleClass: string;
        valueClass: string;
        upTrendClass: string;
        downTrendClass: string;
        flatTrendClass: string;
    }
> = {
    users: {
        cardClass: "border-transparent",
        iconClass: "",
        titleClass: "",
        valueClass: "",
        upTrendClass: "",
        downTrendClass: "",
        flatTrendClass: "",
        cardStyle: {
            background: "var(--gradient-brand-dark)",
            borderColor: "transparent",
        },
    },
    orders: {
        cardClass: "",
        iconClass: "",
        titleClass: "",
        valueClass: "",
        upTrendClass: "",
        downTrendClass: "",
        flatTrendClass: "",
        cardStyle: {
            backgroundColor: "color-mix(in srgb, var(--info) 10%, var(--bg-surface))",
            borderColor: "color-mix(in srgb, var(--info) 30%, transparent)",
        },
    },
    revenue: {
        cardClass: "",
        iconClass: "",
        titleClass: "",
        valueClass: "",
        upTrendClass: "",
        downTrendClass: "",
        flatTrendClass: "",
        cardStyle: {
            backgroundColor: "color-mix(in srgb, var(--success) 10%, var(--bg-surface))",
            borderColor: "color-mix(in srgb, var(--success) 30%, transparent)",
        },
    },
    wallet: {
        cardClass: "",
        iconClass: "",
        titleClass: "",
        valueClass: "",
        upTrendClass: "",
        downTrendClass: "",
        flatTrendClass: "",
        cardStyle: {
            backgroundColor: "color-mix(in srgb, var(--color-secondary) 10%, var(--bg-surface))",
            borderColor: "color-mix(in srgb, var(--color-secondary) 30%, transparent)",
        },
    },
    providers: {
        cardClass: "",
        iconClass: "",
        titleClass: "",
        valueClass: "",
        upTrendClass: "",
        downTrendClass: "",
        flatTrendClass: "",
        cardStyle: {
            backgroundColor: "color-mix(in srgb, var(--accent) 10%, var(--bg-surface))",
            borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)",
        },
    },
};

const fallbackTone = {
    cardClass: "",
    cardStyle: { backgroundColor: "var(--bg-surface-alt)", borderColor: "var(--border-color)" } as React.CSSProperties,
    iconClass: "",
    titleClass: "",
    valueClass: "",
    upTrendClass: "",
    downTrendClass: "",
    flatTrendClass: "",
};

function getTrendDetails(
    trend: AnalyticsKpiCardItem["trend"],
    tone: { upTrendClass: string; downTrendClass: string; flatTrendClass: string }
) {
    if (trend === "up") {
        return {
            icon: <FaArrowUp className="text-[10px]" />,
            className: tone.upTrendClass,
        };
    }

    if (trend === "down") {
        return {
            icon: <FaArrowDown className="text-[10px]" />,
            className: tone.downTrendClass,
        };
    }

    return {
        icon: <FaMinus className="text-[10px]" />,
        className: tone.flatTrendClass,
    };
}

export function AnalyticsKpiGrid({ cards }: AnalyticsKpiGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {cards.map((card) => {
                const tone = cardToneMap[card.id] ?? fallbackTone;
                const trend = getTrendDetails(card.trend, tone);

                return (
                    <Card
                        key={card.id}
                        variant="outlined"
                        className={`${tone.cardClass} p-3 sm:p-3.5`}
                        style={tone.cardStyle}
                    >
                        <CardBody className="pt-0">
                            <div className="flex items-center gap-3">
                                <div className={`shrink-0 text-base sm:text-lg ${tone.iconClass}`}
                                    style={{ color: card.id === "users" ? "var(--text-inverse)" : "var(--text-secondary)" }}>
                                    {card.icon}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className={`text-[10px] uppercase tracking-wide font-medium truncate ${tone.titleClass}`}
                                        style={{ color: card.id === "users" ? "color-mix(in srgb, var(--text-inverse) 70%, transparent)" : "var(--text-secondary)" }}>
                                        {card.title}
                                    </p>
                                    <p className={`text-base sm:text-lg font-bold leading-tight truncate ${tone.valueClass}`}
                                        style={{ color: card.id === "users" ? "var(--text-inverse)" : "var(--text-primary)" }}>
                                        {card.value}
                                    </p>
                                    <p className={`mt-0.5 text-[11px] font-medium truncate inline-flex items-center gap-1 ${trend.className}`}
                                        style={{ color: card.id === "users" ? "color-mix(in srgb, var(--text-inverse) 75%, transparent)" : "var(--success)" }}>
                                        {trend.icon}
                                        <span>{card.subtitle}</span>
                                    </p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                );
            })}
        </div>
    );
}

export type { AnalyticsKpiCardItem };
