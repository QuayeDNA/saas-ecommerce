import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  FormField,
  Input,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "../../design-system";
import { useToast } from "../../design-system";
import { SearchAndFilter } from "../../components/common/SearchAndFilter";
import type { PayoutDestination, PayoutRequestItem } from "../../types/wallet";
import { walletService } from "../../services/wallet-service";
import {
  ArrowRightCircle,
  DollarSign,
  RefreshCw,
  Users,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
  { value: "failed", label: "Failed" },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(amount);
}

function formatDate(value: string | Date | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function userDisplay(user: unknown) {
  if (!user) return "Unknown";
  if (typeof user === "string") return user;
  if (typeof user === "object" && user !== null) {
    const asUser = user as Record<string, unknown>;
    return (
      (asUser.fullName as string) ||
      (asUser.email as string) ||
      (asUser._id as string) ||
      "Unknown"
    );
  }
  return "Unknown";
}

function userEmail(user: unknown) {
  if (!user) return "";
  if (typeof user === "object" && user !== null) {
    return (user as { email?: string }).email || "";
  }
  return "";
}

function destinationDisplay(dest?: PayoutDestination) {
  if (!dest) return "—";
  if (dest.type === "mobile_money") {
    const provider = dest.mobileProvider ? `${dest.mobileProvider} ` : "";
    return `${provider}${dest.phoneNumber || ""}`.trim();
  }
  if (dest.type === "bank_account") {
    const account = dest.accountNumber || "";
    const bank = dest.bankCode ? ` (${dest.bankCode})` : "";
    return `${account}${bank}`;
  }
  return "—";
}

function statusColor(status: string) {
  switch (status) {
    case "pending":
      return "warning";
    case "approved":
      return "info";
    case "processing":
      return "info";
    case "completed":
      return "success";
    case "rejected":
    case "failed":
      return "error";
    default:
      return "gray";
  }
}

export default function PayoutHistoryPage() {
  const { addToast } = useToast();
  const [payouts, setPayouts] = useState<PayoutRequestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: "process" | "markPaid" | null;
    payout?: PayoutRequestItem;
    transferRef?: string;
  }>({ open: false, type: null });
  const [confirmInput, setConfirmInput] = useState("");

  const fetchPayouts = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const result = await walletService.getAdminPayoutHistory(
          page,
          pagination.limit,
          statusFilter === "all" ? undefined : statusFilter,
          undefined,
          searchTerm || undefined,
          dateRange.startDate || undefined,
          dateRange.endDate || undefined
        );
        setPayouts(result.payouts);
        setPagination(result.pagination);
      } catch {
        addToast("Failed to load payouts", "error");
      } finally {
        setLoading(false);
      }
    },
    [addToast, dateRange.endDate, dateRange.startDate, pagination.limit, searchTerm, statusFilter]
  );

  useEffect(() => {
    fetchPayouts(1);
  }, [fetchPayouts]);

  const hasFilters = useMemo(
    () =>
      statusFilter !== "all" ||
      !!searchTerm.trim() ||
      !!dateRange.startDate ||
      !!dateRange.endDate,
    [dateRange.endDate, dateRange.startDate, searchTerm, statusFilter]
  );

  const refresh = () => fetchPayouts(pagination.page);

  const openProcessModal = (payout: PayoutRequestItem) => {
    setConfirmInput('');
    setConfirmModal({ open: true, type: 'process', payout });
  };

  const openMarkPaidModal = (payout: PayoutRequestItem) => {
    setConfirmInput('');
    setConfirmModal({ open: true, type: 'markPaid', payout });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ open: false, type: null });
    setConfirmInput('');
  };

  const handleApprove = async (payoutId: string) => {
    setActionLoading(payoutId);
    try {
      await walletService.approvePayout(payoutId);
      addToast("Payout approved — earnings deducted; you can now send the transfer.", "success");
      void refresh();
    } catch (err: unknown) {
      addToast((err instanceof Error ? err.message : "Failed to approve payout") || "Failed to approve payout", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (payoutId: string) => {
    const reason = window.prompt("Reason for rejection (optional)");
    if (reason === null) return; // canceled
    setActionLoading(payoutId);
    try {
      await walletService.rejectPayout(payoutId, reason || undefined);
      addToast("Payout rejected", "success");
      void refresh();
    } catch (err: unknown) {
      addToast((err instanceof Error ? err.message : "Failed to reject payout") || "Failed to reject payout", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleProcess = async (payoutId: string) => {
    setActionLoading(payoutId);
    try {
      const updated = await walletService.processPayout(payoutId);
      addToast("Paystack transfer initiated — awaiting webhook confirmation", "success");
      setPayouts((prev) => prev.map((p) => (p._id === payoutId ? { ...p, ...updated, status: "processing" } : p)));
      void refresh();
    } catch (err: unknown) {
      type ApiErrorData = { code?: string; status?: string; message?: string };
      type ApiError = { response?: { data?: ApiErrorData } };
      const apiErr = (err as ApiError).response?.data;
      const code = apiErr?.code;
      const message = apiErr?.message ?? (err instanceof Error ? err.message : "Failed to process payout transfer");

      if (code === "NOT_APPROVED") {
        addToast("This payout must be approved before sending. Approve first.", "warning");
      } else if (code === "ALREADY_PROCESSING") {
        addToast("This payout is already being processed. Please wait and refresh.", "info");
      } else if (code === "PAYSTACK_NOT_CONFIGURED") {
        addToast("Paystack transfers are not configured — use manual payout or enable Paystack.", "error");
      } else if (code === "TRANSFER_FAILED") {
        addToast(`Transfer failed: ${message}. You can send funds manually and then mark as paid.`, "error");
      } else {
        addToast(message, "error");
      }

      // Force refresh to ensure status is updated (e.g., marked failed and refunded)
      void refresh();
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkPaid = async (payoutId: string, transferReference?: string) => {
    setActionLoading(payoutId);
    try {
      await walletService.markPayoutComplete(payoutId, transferReference);
      addToast("Payout marked as completed", "success");
      void refresh();
    } catch (err: unknown) {
      addToast((err instanceof Error ? err.message : "Failed to mark payout as completed") || "Failed to mark payout as completed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <DollarSign className="text-xl sm:text-2xl" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold">Payout Requests</h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Review and manage agent payout requests across the platform.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="self-start sm:self-auto border-white/40 text-white hover:bg-white/10"
            onClick={() => refresh()}
          >
            <RefreshCw className="mr-1.5" />
            Refresh
          </Button>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-white/15 rounded-lg px-3 py-2.5 flex items-center gap-2">
            <Users className="text-white/60 text-sm flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-white/70 text-[10px] font-medium uppercase tracking-wide">Total</p>
              <p className="text-white font-bold text-sm sm:text-base">{pagination.total}</p>
              <p className="text-slate-300/80 text-[10px]">payout requests</p>
            </div>
          </div>
          <div className="bg-green-500/30 border border-green-400/30 rounded-lg px-3 py-2.5 flex items-center gap-2">
            <ArrowRightCircle className="text-green-300 text-sm flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-white/70 text-[10px] font-medium uppercase tracking-wide">Approved</p>
              <p className="text-white font-bold text-sm sm:text-base">
                {payouts.filter((p) => p.status === "approved").length}
              </p>
              <p className="text-slate-300/80 text-[10px]">on this page</p>
            </div>
          </div>
          <div className="bg-indigo-500/30 border border-indigo-400/30 rounded-lg px-3 py-2.5 flex items-center gap-2">
            <RefreshCw className="text-indigo-300 text-sm flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-white/70 text-[10px] font-medium uppercase tracking-wide">Processing</p>
              <p className="text-white font-bold text-sm sm:text-base">
                {payouts.filter((p) => p.status === "processing").length}
              </p>
              <p className="text-slate-300/80 text-[10px]">on this page</p>
            </div>
          </div>
          <div className="bg-red-500/30 border border-red-400/30 rounded-lg px-3 py-2.5 flex items-center gap-2">
            <ArrowRightCircle className="text-red-300 text-sm flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-white/70 text-[10px] font-medium uppercase tracking-wide">Completed</p>
              <p className="text-white font-bold text-sm sm:text-base">
                {payouts.filter((p) => p.status === "completed").length}
              </p>
              <p className="text-slate-300/80 text-[10px]">on this page</p>
            </div>
          </div>
        </div>
      </div>

      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={(v) => {
          setSearchTerm(v);
          setPagination((p) => ({ ...p, page: 1 }));
        }}
        searchPlaceholder="Search by agent, reference or phone..."
        filters={{
          status: { value: statusFilter, options: STATUS_OPTIONS, label: "Status" },
        }}
        onFilterChange={(key, value) => {
          if (key === "status") setStatusFilter(value);
          setPagination((p) => ({ ...p, page: 1 }));
        }}
        onSearch={(e) => e.preventDefault()}
        onClearFilters={() => {
          setSearchTerm("");
          setStatusFilter("all");
          setDateRange({ startDate: "", endDate: "" });
          setPagination((p) => ({ ...p, page: 1 }));
        }}
        showDateRange
        dateRange={dateRange}
        onDateRangeChange={(start, end) => {
          setDateRange({ startDate: start, endDate: end });
          setPagination((p) => ({ ...p, page: 1 }));
        }}
        showSearchButton={false}
        isLoading={loading}
      />

      <Card noPadding>
        <div className="overflow-x-auto">
          <Table className="min-w-[720px]" variant="simple" size="md">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Requested</TableHeaderCell>
                <TableHeaderCell>Agent</TableHeaderCell>
                <TableHeaderCell>Amount</TableHeaderCell>
                <TableHeaderCell>Destination</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell className="text-right">Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="py-8 text-center text-sm text-gray-500">Loading payouts…</div>
                </TableCell>
              </TableRow>
            ) : payouts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="py-10 text-center text-sm text-gray-500">
                    {hasFilters
                      ? "No payouts match your filters."
                      : "No payout requests found."}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              payouts.map((payout) => {
                const isPending = payout.status === "pending";
                const isApproved = payout.status === "approved";
                const isProcessing = payout.status === "processing";
                const isCompleted = payout.status === "completed";
                const isFailed = payout.status === "failed" || payout.status === "rejected";
                return (
                  <TableRow key={payout._id}>
                    <TableCell>
                      <div className="text-sm font-medium text-gray-900">{formatDate(payout.requestedAt)}</div>
                      <div className="text-xs text-gray-500">{formatDate(payout.createdAt)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-gray-900">{userDisplay(payout.user)}</div>
                      <div className="text-xs text-gray-500">{userEmail(payout.user)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-semibold text-gray-900">{formatCurrency(payout.amount)}</div>
                      {typeof payout.netAmount === "number" && (
                        <div className="text-xs text-gray-500">Net: {formatCurrency(payout.netAmount)}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">{destinationDisplay(payout.destination)}</div>
                      {payout.destination?.type === "mobile_money" && (
                        <div className="text-xs text-gray-500">{payout.destination.mobileProvider}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge colorScheme={statusColor(payout.status)} size="sm">
                        {payout.status}
                      </Badge>
                      {payout.paystackTransfer?.failureReason && (
                        <div className="text-xs text-red-600 mt-1">
                          {payout.paystackTransfer.failureReason}
                        </div>
                      )}
                      {payout.status === 'failed' && (
                        <div className="text-xs text-gray-500 mt-1">
                          Tip: Send funds manually (MoMo/bank), then click “Mark Paid”.
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        {isPending && (
                          <>
                            <Button
                              size="xs"
                              variant="success"
                              onClick={() => handleApprove(payout._id)}
                              isLoading={actionLoading === payout._id}
                            >
                              Approve
                            </Button>
                            <Button
                              size="xs"
                              variant="danger"
                              onClick={() => handleReject(payout._id)}
                              isLoading={actionLoading === payout._id}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {isApproved && (
                          <>
                            <Button
                              size="xs"
                              onClick={() => openProcessModal(payout)}
                              isLoading={actionLoading === payout._id}
                            >
                              Send via Paystack
                            </Button>
                            <Button
                              size="xs"
                              variant="success"
                              onClick={() => openMarkPaidModal(payout)}
                              isLoading={actionLoading === payout._id}
                            >
                              Mark Paid
                            </Button>
                          </>
                        )}
                        {isProcessing && (
                          <span className="text-xs text-blue-600">Processing…</span>
                        )}
                        {isCompleted && (
                          <span className="text-xs text-green-600">Completed</span>
                        )}
                        {isFailed && (
                          <span className="text-xs text-red-600">Needs attention</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      </Card>

      <div className="flex items-center justify-end">
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={(page) => {
            setPagination((p) => ({ ...p, page }));
            void fetchPayouts(page);
          }}
        />
      </div>

      <Dialog isOpen={confirmModal.open} onClose={closeConfirmModal} size="sm">
        <DialogHeader>
          {confirmModal.type === 'process' ? 'Send via Paystack' : 'Mark payout as paid'}
        </DialogHeader>
        <DialogBody>
          {confirmModal.type === 'process' ? (
            <>
              <p className="text-sm text-gray-700">
                This will attempt to transfer funds to the agent via Paystack.
                If the transfer fails, the system will automatically refund the agent's earnings and mark the payout as failed.
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-3 space-y-1">
                <li>Step 1: Ensure the payout is approved (deducts the agent's earnings).</li>
                <li>Step 2: The system initiates a Paystack transfer (platform pays out).</li>
                <li>
                  Step 3: If the transfer fails, you can pay the agent manually and then use
                  “Mark paid” to finalize.
                </li>
              </ul>
              {confirmModal.payout?.paystackTransfer?.failureReason && (
                <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  <div className="font-medium">Last failure:</div>
                  <div>{confirmModal.payout.paystackTransfer.failureReason}</div>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-gray-700">
                Marking a payout as paid does not initiate a transfer. Only do this after you have manually sent funds to the agent.
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-3 space-y-1">
                <li>Step 1: Send money to the agent (MoMo / bank transfer).</li>
                <li>Step 2: Enter a reference (optional) and confirm to complete the payout record.</li>
              </ul>
              <FormField label="Transfer reference (optional)" className="mt-4">
                <Input
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder="e.g. MoMo txn ID or bank ref"
                />
              </FormField>
            </>
          )}
        </DialogBody>
        <DialogFooter>
          <div className="flex gap-2 justify-end w-full">
            <Button variant="secondary" onClick={closeConfirmModal} disabled={!!actionLoading}>
              Cancel
            </Button>
            <Button
              variant={confirmModal.type === 'process' ? 'primary' : 'success'}
              onClick={async () => {
                if (!confirmModal.payout) return;
                if (confirmModal.type === 'process') {
                  await handleProcess(confirmModal.payout._id);
                } else {
                  await handleMarkPaid(confirmModal.payout._id, confirmInput || undefined);
                }
                closeConfirmModal();
              }}
              isLoading={!!actionLoading}
            >
              {confirmModal.type === 'process' ? 'Start Transfer' : 'Mark Paid'}
            </Button>
          </div>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
