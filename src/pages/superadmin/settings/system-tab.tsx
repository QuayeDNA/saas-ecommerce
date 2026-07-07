import React from "react";
import { Button } from "../../../design-system/components/button";
import { Card } from "../../../design-system/components/card";
import { Badge } from "../../../design-system/components/badge";
import { DarkModeToggle } from "../../../components/common/dark-mode-toggle";
import { SectionHeader } from "./components/section-header";
import type { SystemInfo } from "../../../services/settings.service";

interface SystemTabProps {
  systemInfo: SystemInfo;
  testPushLoading: boolean;
  onSendTestPush: () => void;
}

export const SystemTab: React.FC<SystemTabProps> = ({ systemInfo, testPushLoading, onSendTestPush }) => (
  <div className="space-y-6">
    <Card>
      <SectionHeader title="System Information" subtitle="Health & metadata" />
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
          <div className="text-sm text-[var(--text-secondary)]">Version</div>
          <div className="font-medium mt-1 text-[var(--text-primary)]">{systemInfo.version}</div>
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
          <div className="text-sm text-[var(--text-secondary)]">Last updated</div>
          <div className="font-medium mt-1 text-[var(--text-primary)]">{systemInfo.lastUpdated}</div>
        </div>

        <div className="p-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: 'var(--bg-muted)' }}>
          <div>
            <div className="text-sm text-[var(--text-secondary)]">API Status</div>
            <div className="text-xs mt-1 text-[var(--text-secondary)]">{systemInfo.apiStatus}</div>
          </div>
          <Badge colorScheme={systemInfo.apiStatus === "healthy" ? "success" : "warning"}>{systemInfo.apiStatus}</Badge>
        </div>

        <div className="p-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: 'var(--bg-muted)' }}>
          <div>
            <div className="text-sm text-[var(--text-secondary)]">DB Status</div>
            <div className="text-xs mt-1 text-[var(--text-secondary)]">{systemInfo.databaseStatus}</div>
          </div>
          <Badge colorScheme={systemInfo.databaseStatus === "connected" ? "success" : "warning"}>{systemInfo.databaseStatus}</Badge>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button variant="primary" size="sm" onClick={onSendTestPush} isLoading={testPushLoading}>
          Send Test Push Notification
        </Button>
      </div>
    </Card>

    <Card>
      <SectionHeader title="Appearance" subtitle="Toggle dark mode" />
      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="font-medium text-[var(--text-primary)]">Dark Mode</p>
          <p className="text-sm text-[var(--text-secondary)]">Switch between light and dark theme</p>
        </div>
        <DarkModeToggle />
      </div>
    </Card>
  </div>
);
