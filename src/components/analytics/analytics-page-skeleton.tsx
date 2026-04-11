import { Card, CardBody, Skeleton } from "../../design-system";

export function AnalyticsPageSkeleton() {
    return (
        <div className="space-y-4 sm:space-y-6">
            <Card className="p-4 sm:p-6">
                <CardBody className="pt-0">
                    <div className="space-y-3">
                        <Skeleton width="220px" height="1.5rem" />
                        <Skeleton width="320px" height="1rem" />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton key={index} height="3.5rem" variant="rectangular" />
                            ))}
                        </div>
                    </div>
                </CardBody>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} className="p-4">
                        <CardBody className="pt-0 space-y-2">
                            <Skeleton width="120px" height="0.875rem" />
                            <Skeleton width="150px" height="1.75rem" />
                            <Skeleton width="170px" height="0.875rem" />
                        </CardBody>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
                <Card className="xl:col-span-2 p-4 sm:p-5">
                    <CardBody className="pt-0 space-y-4">
                        <Skeleton width="180px" height="1.2rem" />
                        <Skeleton height="18rem" variant="rectangular" />
                    </CardBody>
                </Card>
                <Card className="p-4 sm:p-5">
                    <CardBody className="pt-0 space-y-4">
                        <Skeleton width="160px" height="1.2rem" />
                        <Skeleton height="18rem" variant="rectangular" />
                    </CardBody>
                </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                <Card className="p-4 sm:p-5">
                    <CardBody className="pt-0 space-y-3">
                        <Skeleton width="200px" height="1.2rem" />
                        {Array.from({ length: 6 }).map((_, index) => (
                            <Skeleton key={index} height="1rem" />
                        ))}
                    </CardBody>
                </Card>
                <Card className="p-4 sm:p-5">
                    <CardBody className="pt-0 space-y-3">
                        <Skeleton width="200px" height="1.2rem" />
                        {Array.from({ length: 6 }).map((_, index) => (
                            <Skeleton key={index} height="1rem" />
                        ))}
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
