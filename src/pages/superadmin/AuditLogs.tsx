import {
  AuditLogTable,
  RecentActivityFeed,
  AuditStatsWidget,
} from "../../components/audit";

import { Card, CardBody } from "../../design-system";

export default function AuditLogsPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="bg-gradient-to-r from-primary-600 to-primary-900 bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
          Audit Logs
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3 items-start">
        <div className="lg:col-span-2">
          <AuditStatsWidget />
        </div>

        <div className="lg:col-span-1">
          <RecentActivityFeed limit={10} />
        </div>
      </div>

      <Card>
        <CardBody>
          <AuditLogTable />
        </CardBody>
      </Card>
    </div>
  );
}
