import { FaArrowDown, FaArrowUp, FaLightbulb } from "react-icons/fa";
import { Badge, Card, CardBody, CardHeader, Skeleton } from "../../design-system";

interface Insight {
    title: string;
    type: "positive" | "warning" | "info";
    description: string;
}

interface AnalyticsInsightsStageProps {
    loading: boolean;
    insights: Insight[];
}

const insightStyleMap = {
    positive: {
        icon: <FaArrowUp style={{ color: "var(--success)" }} />,
        badge: "success" as const,
        label: "Positive",
    },
    warning: {
        icon: <FaArrowDown style={{ color: "var(--warning)" }} />,
        badge: "warning" as const,
        label: "Attention",
    },
    info: {
        icon: <FaLightbulb style={{ color: "var(--info)" }} />,
        badge: "info" as const,
        label: "Insight",
    },
};

export function AnalyticsInsightsStage({ loading, insights }: AnalyticsInsightsStageProps) {
    return (
        <section>
            <Card className="p-4 sm:p-5">
                <CardHeader className="pb-3">
                    <h3 className="text-base sm:text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Business Insights</h3>
                    <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                        Key takeaways to support operational and growth decisions.
                    </p>
                </CardHeader>

                <CardBody>
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="rounded-xl p-3 space-y-2" style={{ border: "1px solid var(--border-color)" }}>
                                    <Skeleton width="120px" height="0.9rem" />
                                    <Skeleton width="100%" height="0.9rem" />
                                    <Skeleton width="85%" height="0.9rem" />
                                </div>
                            ))}
                        </div>
                    ) : insights.length === 0 ? (
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No insights available for this period.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            {insights.map((insight, index) => {
                                const style = insightStyleMap[insight.type] || insightStyleMap.info;

                                return (
                                    <Card key={`${insight.title}-${index}`} className="p-3 sm:p-4" style={{ border: "1px solid var(--border-color)" }}>
                                        <CardBody className="pt-0">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1 text-lg">{style.icon}</div>
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h4 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{insight.title}</h4>
                                                        <Badge variant="subtle" colorScheme={style.badge} className="text-[10px]">
                                                            {style.label}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{insight.description}</p>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </CardBody>
            </Card>
        </section>
    );
}
