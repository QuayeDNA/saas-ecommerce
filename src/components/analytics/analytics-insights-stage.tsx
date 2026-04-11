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
        icon: <FaArrowUp className="text-green-500" />,
        badge: "success" as const,
        label: "Positive",
    },
    warning: {
        icon: <FaArrowDown className="text-amber-500" />,
        badge: "warning" as const,
        label: "Attention",
    },
    info: {
        icon: <FaLightbulb className="text-blue-500" />,
        badge: "info" as const,
        label: "Insight",
    },
};

export function AnalyticsInsightsStage({ loading, insights }: AnalyticsInsightsStageProps) {
    return (
        <section>
            <Card className="p-4 sm:p-5">
                <CardHeader className="pb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900">Business Insights</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Key takeaways to support operational and growth decisions.
                    </p>
                </CardHeader>

                <CardBody>
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="rounded-xl border border-slate-200 p-3 space-y-2">
                                    <Skeleton width="120px" height="0.9rem" />
                                    <Skeleton width="100%" height="0.9rem" />
                                    <Skeleton width="85%" height="0.9rem" />
                                </div>
                            ))}
                        </div>
                    ) : insights.length === 0 ? (
                        <p className="text-sm text-slate-500">No insights available for this period.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            {insights.map((insight, index) => {
                                const style = insightStyleMap[insight.type] || insightStyleMap.info;

                                return (
                                    <Card key={`${insight.title}-${index}`} className="border border-slate-200 p-3 sm:p-4">
                                        <CardBody className="pt-0">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1 text-lg">{style.icon}</div>
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h4 className="text-sm font-semibold text-slate-900">{insight.title}</h4>
                                                        <Badge variant="subtle" colorScheme={style.badge} className="text-[10px]">
                                                            {style.label}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-slate-600">{insight.description}</p>
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
