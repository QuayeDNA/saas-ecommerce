/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from "react";
import { FaSync, FaExchangeAlt } from "react-icons/fa";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Pagination,
  Spinner,
} from "../../design-system";
import { useToast } from "../../design-system/components/toast";
import { walletService } from "../../services/wallet-service";
import type { CrossAppTransfer, CrossAppTransferStatus } from "../../types/wallet";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(n);

function statusBadge(status: CrossAppTransferStatus) {
  return (
    <Badge
      colorScheme={status === "completed" ? "success" : status === "failed" ? "error" : "warning"}
    >
      {status}
    </Badge>
  );
}

export function CrossAppTransfersView() {
  const { addToast } = useToast();
  const [transfers, setTransfers] = useState<CrossAppTransfer[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [loading, setLoading] = useState(false);

  const fetchTransfers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const resp = await walletService.adminGetTransfers(page, pagination.limit);
      setTransfers(resp.transfers);
      setPagination(resp.pagination);
    } catch {
      addToast("Failed to load transfers", "error");
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, addToast]);

  useEffect(() => {
    void fetchTransfers(1);
  }, [fetchTransfers]);

  return (
    <Card>
      <CardHeader
        className="p-4"
        style={{ borderBottom: "1px solid var(--border-color)" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaExchangeAlt style={{ color: "var(--color-secondary)" }} />
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              Cross-App Transfers
            </h2>
          </div>
          <Button
            size="xs"
            variant="outline"
            leftIcon={<FaSync />}
            onClick={() => void fetchTransfers(pagination.page)}
          >
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardBody className="p-0">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : transfers.length === 0 ? (
          <p className="text-sm py-10 text-center" style={{ color: "var(--text-muted)" }}>
            No cross-app transfers yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: "var(--text-muted)" }}>
                  <th className="text-left px-4 py-3 font-medium">Reference</th>
                  <th className="text-left px-4 py-3 font-medium">Agent</th>
                  <th className="text-left px-4 py-3 font-medium">Destination</th>
                  <th className="text-left px-4 py-3 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((t) => (
                  <tr key={t.reference} style={{ borderTop: "1px solid var(--border-color)" }}>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text-primary)" }}>
                      {t.reference}
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>
                      {t.sourceUserEmail || "-"}
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>
                      {t.destAppName || t.destAppId}
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>
                      {fmt(t.amount)}
                    </td>
                    <td className="px-4 py-3">{statusBadge(t.status)}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                      {new Date(t.createdAt).toLocaleString("en-GB")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && !loading && (
          <div className="border-t px-4 py-3" style={{ borderColor: "var(--border-color)" }}>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={(p) => void fetchTransfers(p)}
              onItemsPerPageChange={(n) => {
                setPagination((prev) => ({ ...prev, limit: n, page: 1 }));
                void fetchTransfers(1);
              }}
            />
          </div>
        )}
      </CardBody>
    </Card>
  );
}
