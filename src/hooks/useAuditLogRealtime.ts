import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { websocketService } from "../services/websocket.service";
import { useToast } from "../design-system";
import type { AuditLog } from "../types/auditLog";

function isAuditLogPayload(value: unknown): value is AuditLog {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<AuditLog>;
  return (
    typeof candidate.action === "string" &&
    typeof candidate.severity === "string" &&
    typeof candidate.timestamp === "string"
  );
}

export const useAuditLogRealtime = (enabled = true) => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  useEffect(() => {
    if (!enabled) return;

    const handleAuditLog = (event: unknown) => {
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
      queryClient.invalidateQueries({ queryKey: ["audit-logs-infinite"] });
      queryClient.invalidateQueries({ queryKey: ["audit-stats"] });

      if (isAuditLogPayload(event) && event.severity === "critical") {
        addToast(`Critical activity: ${event.action}`, "warning");
      }
    };

    websocketService.on("audit_log", handleAuditLog);

    return () => {
      websocketService.off("audit_log", handleAuditLog);
    };
  }, [addToast, enabled, queryClient]);
};
