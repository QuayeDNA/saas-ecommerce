import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Select,
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  Alert,
  Pagination,
  FormField,
  Spinner,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Textarea,
} from "../../design-system";
import { useToast } from "../../design-system";
import {
  storefrontService,
  type StorefrontOrder,
} from "../../services/storefront.service";
import { getApiErrorMessage } from "../../utils/error-helpers";
import {
  Search,
  RotateCcw,
  CheckCircle,
  XCircle,
  ExternalLink,
  ShoppingBag,
  Eye,
  LayoutGrid,
  List,
  Table2,
} from "lucide-react";

interface OrderManagerProps {
  storefrontId?: string;
}

type ViewMode = "table" | "card" | "list";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "pending_payment", label: "Awaiting Payment" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "failed", label: "Failed" },
];

const ITEMS_PER_PAGE = 10;

const STATUS_BADGE_MAP: Record<string, "success" | "error" | "info" | "warning" | "gray"> = {
  completed: "success",
  failed: "error",
  cancelled: "error",
  processing: "info",
  confirmed: "info",
  pending: "warning",
  pending_payment: "warning",
  partially_completed: "warning",
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatStatus = (status: string) =>
  status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const OrderManager: React.FC<OrderManagerProps> = () => {
  const { addToast } = useToast();
  const [orders, setOrders] = useState<StorefrontOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem("storefront-orders-view");
    return (saved as ViewMode) || "card";
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Order detail (mobile)
  const [selectedOrder, setSelectedOrder] = useState<StorefrontOrder | null>(
    null,
  );

  // Order verification modal
  const [verificationModal, setVerificationModal] = useState<{
    isOpen: boolean;
    order: StorefrontOrder | null;
    action: "verify" | "reject";
  }>({
    isOpen: false,
    order: null,
    action: "verify",
  });
  const [verificationNotes, setVerificationNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters: Record<string, string | number> = {
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
      };
      if (statusFilter) filters.status = statusFilter;

      const data = await storefrontService.getMyOrders(filters);
      setOrders(data.orders);
      setTotalOrders(data.total);
    } catch (error) {
      console.error("Failed to load orders:", error);
      addToast(getApiErrorMessage(error, "Failed to load orders"), "error");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, addToast]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    localStorage.setItem("storefront-orders-view", viewMode);
  }, [viewMode]);

  // --- Verification handlers ---
  const openVerificationModal = (
    order: StorefrontOrder,
    action: "verify" | "reject",
  ) => {
    setVerificationModal({ isOpen: true, order, action });
    setVerificationNotes("");
  };

  const closeVerificationModal = () => {
    setVerificationModal({ isOpen: false, order: null, action: "verify" });
    setVerificationNotes("");
  };

  const handleOrderVerification = async () => {
    if (!verificationModal.order) return;

    try {
      setIsProcessing(true);

      if (verificationModal.action === "verify") {
        await storefrontService.verifyPayment(
          verificationModal.order._id,
          verificationNotes,
        );
        addToast(
          "Payment verified! Wallet deducted — order is ready for fulfillment.",
          "success",
        );
      } else {
        if (!verificationNotes.trim()) {
          addToast("Please provide a reason for rejection", "error");
          return;
        }
        await storefrontService.rejectPayment(
          verificationModal.order._id,
          verificationNotes,
        );
        addToast("Order rejected", "success");
      }

      closeVerificationModal();
      loadOrders();
    } catch (error) {
      console.error("Failed to process order:", error);
      addToast(getApiErrorMessage(error, "Failed to process order"), "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetFilters = () => {
    setStatusFilter("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  // --- Computed ---
  const displayedOrders = searchTerm
    ? orders.filter((order) => {
      const search = searchTerm.toLowerCase();
      const name =
        order.storefrontData?.customerInfo?.name?.toLowerCase() || "";
      const phone = order.storefrontData?.customerInfo?.phone || "";
      const orderNum = order.orderNumber?.toLowerCase() || "";
      return (
        name.includes(search) ||
        phone.includes(search) ||
        orderNum.includes(search)
      );
    })
    : orders;

  const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);

  const needsVerification = (order: StorefrontOrder) =>
    order.status === "pending_payment" &&
    !order.storefrontData?.paymentMethod?.verified;

  // --- Loading ---
  if (isLoading) {
    return (
      <Card>
        <CardBody className="flex items-center justify-center py-12">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-3 text-sm text-gray-600">Loading orders...</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Storefront Orders
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage customer orders and payment verification
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* View mode toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                {([
                  { mode: "card" as ViewMode, icon: LayoutGrid, label: "Cards" },
                  { mode: "list" as ViewMode, icon: List, label: "List" },
                  { mode: "table" as ViewMode, icon: Table2, label: "Table" },
                ] as const).map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`p-1.5 rounded-md transition-all ${viewMode === mode
                        ? "bg-white shadow-sm text-gray-900"
                        : "text-gray-500 hover:text-gray-700"
                      }`}
                    title={`${label} view`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
              <Badge colorScheme="gray" variant="subtle" size="lg">
                {totalOrders} Total
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardBody>
          {/* Filters */}
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField label="Search">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Name, phone, or order #..."
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </FormField>

              <FormField label="Status">
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={STATUS_OPTIONS}
                />
              </FormField>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Reset
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Showing {displayedOrders.length} of {totalOrders} orders
            </p>
          </div>

          {/* === TABLE VIEW === */}
          {viewMode === "table" && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>Order #</TableHeaderCell>
                    <TableHeaderCell>Customer</TableHeaderCell>
                    <TableHeaderCell>Items</TableHeaderCell>
                    <TableHeaderCell>Amount</TableHeaderCell>
                    <TableHeaderCell>Payment</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Date</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {order.orderNumber || order._id?.slice(-8)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {order.storefrontData?.customerInfo?.name || "N/A"}
                          </p>
                          {order.storefrontData?.customerInfo?.phone && (
                            <p className="text-xs text-gray-500">
                              Contact: {order.storefrontData.customerInfo.phone}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {(order.storefrontData?.items || []).map((item, idx) => (
                          <div key={idx} className="text-sm">
                            <p className="text-gray-900">{item.bundleName} x{item.quantity}</p>
                            {item.customerPhone && (
                              <p className="text-xs text-gray-400">→ {item.customerPhone}</p>
                            )}
                          </div>
                        ))}
                        {(!order.storefrontData?.items ||
                          order.storefrontData.items.length === 0) && (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-gray-900">
                          GHS {(order.total || 0).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge colorScheme="gray" variant="subtle" size="sm">
                            {(
                              order.storefrontData?.paymentMethod?.type || ""
                            )
                              .replace("_", " ")
                              .toUpperCase()}
                          </Badge>
                          {order.storefrontData?.paymentMethod?.reference && (
                            <p className="text-xs text-gray-500">
                              Ref:{" "}
                              {order.storefrontData.paymentMethod.reference}
                            </p>
                          )}
                          {order.storefrontData?.paymentMethod
                            ?.paymentProofUrl && (
                              <a
                                href={
                                  order.storefrontData.paymentMethod
                                    .paymentProofUrl
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                              >
                                <ExternalLink className="w-3 h-3" /> Proof
                              </a>
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          colorScheme={
                            STATUS_BADGE_MAP[order.status] || "gray"
                          }
                          variant="subtle"
                        >
                          {formatStatus(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {formatDate(order.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {needsVerification(order) ? (
                          <div className="flex gap-1.5">
                            <Button
                              size="xs"
                              variant="success"
                              onClick={() =>
                                openVerificationModal(order, "verify")
                              }
                              leftIcon={
                                <CheckCircle className="w-3.5 h-3.5" />
                              }
                            >
                              Verify
                            </Button>
                            <Button
                              size="xs"
                              variant="danger"
                              onClick={() =>
                                openVerificationModal(order, "reject")
                              }
                              leftIcon={<XCircle className="w-3.5 h-3.5" />}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <Badge
                            colorScheme={
                              STATUS_BADGE_MAP[order.status] || "gray"
                            }
                            variant="subtle"
                            size="sm"
                          >
                            {formatStatus(order.status)}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* === CARD VIEW === */}
          {viewMode === "card" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {displayedOrders.map((order) => (
                <Card
                  key={order._id}
                  variant="outlined"
                  className="hover:shadow-sm transition-shadow"
                >
                  <CardBody className="p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium text-gray-900">
                          #{order.orderNumber || order._id?.slice(-8)}
                        </span>
                        <Badge
                          colorScheme={
                            STATUS_BADGE_MAP[order.status] || "gray"
                          }
                          variant="subtle"
                          size="sm"
                        >
                          {formatStatus(order.status)}
                        </Badge>
                      </div>
                      <p className="font-bold text-gray-900">
                        GHS {(order.total || 0).toFixed(2)}
                      </p>
                    </div>

                    {/* Customer */}
                    <div className="space-y-1 mb-3">
                      <p className="text-sm font-medium text-gray-900">
                        {order.storefrontData?.customerInfo?.name || "N/A"}
                      </p>
                      {order.storefrontData?.customerInfo?.phone && (
                        <p className="text-xs text-gray-500">
                          Contact: {order.storefrontData.customerInfo.phone}
                        </p>
                      )}
                    </div>

                    {/* Items - fully visible */}
                    {(order.storefrontData?.items || []).length > 0 && (
                      <div className="mb-3 space-y-1.5">
                        {order.storefrontData!.items.map((item, idx) => (
                          <div key={idx} className="text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-700">
                                {item.bundleName} x{item.quantity}
                              </span>
                              <span className="text-gray-500">
                                GHS {(item.totalPrice || 0).toFixed(2)}
                              </span>
                            </div>
                            {item.customerPhone && (
                              <p className="text-xs text-gray-400">→ {item.customerPhone}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Payment + Date */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <Badge colorScheme="gray" variant="subtle" size="xs">
                          {(
                            order.storefrontData?.paymentMethod?.type || ""
                          )
                            .replace("_", " ")
                            .toUpperCase()}
                        </Badge>
                        {order.storefrontData?.paymentMethod
                          ?.paymentProofUrl && (
                            <a
                              href={
                                order.storefrontData.paymentMethod
                                  .paymentProofUrl
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Eye className="w-3 h-3" /> Proof
                            </a>
                          )}
                      </div>
                      <span>{formatDate(order.createdAt)}</span>
                    </div>

                    {/* Quick verify/reject */}
                    {needsVerification(order) && (
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="success"
                          className="flex-1"
                          onClick={() =>
                            openVerificationModal(order, "verify")
                          }
                          leftIcon={
                            <CheckCircle className="w-3.5 h-3.5" />
                          }
                        >
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          className="flex-1"
                          onClick={() =>
                            openVerificationModal(order, "reject")
                          }
                          leftIcon={<XCircle className="w-3.5 h-3.5" />}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardBody>
                </Card>
              ))}
            </div>
          )}

          {/* === LIST VIEW === */}
          {viewMode === "list" && (
            <div className="space-y-2">
              {displayedOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  {/* Status dot */}
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${order.status === "completed"
                        ? "bg-green-500"
                        : order.status === "failed" ||
                          order.status === "cancelled"
                          ? "bg-red-500"
                          : order.status === "pending_payment"
                            ? "bg-yellow-500"
                            : order.status === "processing" ||
                              order.status === "confirmed"
                              ? "bg-blue-500"
                              : "bg-gray-400"
                      }`}
                  />

                  {/* Order number */}
                  <span className="font-mono text-sm font-medium text-gray-900 shrink-0 w-20">
                    #{order.orderNumber || order._id?.slice(-8)}
                  </span>

                  {/* Customer */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      {order.storefrontData?.customerInfo?.name || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500 sm:hidden">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  {/* Items count */}
                  <span className="text-xs text-gray-500 shrink-0 hidden sm:block">
                    {(order.storefrontData?.items || []).length} item
                    {(order.storefrontData?.items || []).length !== 1
                      ? "s"
                      : ""}
                  </span>

                  {/* Amount */}
                  <span className="font-bold text-sm text-gray-900 shrink-0">
                    GHS {(order.total || 0).toFixed(2)}
                  </span>

                  {/* Date (hidden on mobile) */}
                  <span className="text-xs text-gray-500 shrink-0 hidden sm:block w-28 text-right">
                    {formatDate(order.createdAt)}
                  </span>

                  {/* Action */}
                  {needsVerification(order) && (
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="xs"
                        variant="success"
                        onClick={(e) => {
                          e.stopPropagation();
                          openVerificationModal(order, "verify");
                        }}
                        leftIcon={<CheckCircle className="w-3 h-3" />}
                      >
                        Verify
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {displayedOrders.length === 0 && (
            <div className="text-center py-10">
              <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                {searchTerm || statusFilter
                  ? "No orders match your current filters"
                  : "No orders yet. Orders will appear here when customers make purchases."}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 sm:mt-6 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalOrders}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Mobile Order Detail Dialog */}
      <Dialog
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      >
        {selectedOrder && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Order #{selectedOrder.orderNumber || selectedOrder._id?.slice(-8)}
                </h3>
                <Badge
                  colorScheme={
                    STATUS_BADGE_MAP[selectedOrder.status] || "gray"
                  }
                  variant="subtle"
                >
                  {formatStatus(selectedOrder.status)}
                </Badge>
              </div>
            </DialogHeader>

            <DialogBody>
              <div className="space-y-4">
                {/* Customer */}
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  <h4 className="font-medium text-gray-900 mb-1.5">Customer</h4>
                  <p className="font-medium">
                    {selectedOrder.storefrontData?.customerInfo?.name || "N/A"}
                  </p>
                  {selectedOrder.storefrontData?.customerInfo?.phone && (
                    <p className="text-gray-500 text-xs mt-0.5">
                      Contact: {selectedOrder.storefrontData.customerInfo.phone}
                    </p>
                  )}
                </div>

                {/* Items with recipient phones */}
                {(selectedOrder.storefrontData?.items || []).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-900">
                      Items
                    </h4>
                    {selectedOrder.storefrontData!.items.map((item, idx) => (
                      <div key={idx} className="p-2.5 bg-gray-50 rounded-lg text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-900">{item.bundleName} x{item.quantity}</span>
                          <span className="font-medium">
                            GHS {(item.totalPrice || 0).toFixed(2)}
                          </span>
                        </div>
                        {item.customerPhone && (
                          <p className="text-xs text-gray-500">📱 Recipient: <span className="font-medium text-gray-700">{item.customerPhone}</span></p>
                        )}
                      </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between font-bold text-sm">
                      <span>Total</span>
                      <span>
                        GHS {(selectedOrder.total || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Payment */}
                <div className="space-y-1.5 text-sm">
                  <h4 className="font-medium text-gray-900">Payment</h4>
                  <Badge colorScheme="gray" variant="subtle">
                    {(
                      selectedOrder.storefrontData?.paymentMethod?.type || ""
                    )
                      .replace("_", " ")
                      .toUpperCase()}
                  </Badge>
                  {selectedOrder.storefrontData?.paymentMethod?.reference && (
                    <p className="text-gray-500">
                      Ref:{" "}
                      {selectedOrder.storefrontData.paymentMethod.reference}
                    </p>
                  )}
                  {selectedOrder.storefrontData?.paymentMethod
                    ?.paymentProofUrl && (
                      <a
                        href={
                          selectedOrder.storefrontData.paymentMethod
                            .paymentProofUrl
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Payment Proof
                      </a>
                    )}
                </div>

                <p className="text-xs text-gray-400">
                  {formatDate(selectedOrder.createdAt)}
                </p>
              </div>
            </DialogBody>

            <DialogFooter>
              {needsVerification(selectedOrder) ? (
                <div className="flex gap-2 w-full">
                  <Button
                    variant="success"
                    className="flex-1"
                    onClick={() => {
                      setSelectedOrder(null);
                      openVerificationModal(selectedOrder, "verify");
                    }}
                    leftIcon={<CheckCircle className="w-4 h-4" />}
                  >
                    Verify
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1"
                    onClick={() => {
                      setSelectedOrder(null);
                      openVerificationModal(selectedOrder, "reject");
                    }}
                    leftIcon={<XCircle className="w-4 h-4" />}
                  >
                    Reject
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </Dialog>

      {/* Verification Modal */}
      <Dialog
        isOpen={verificationModal.isOpen}
        onClose={closeVerificationModal}
      >
        <DialogHeader>
          <h3 className="text-lg font-semibold">
            {verificationModal.action === "verify"
              ? "Verify Payment"
              : "Reject Payment"}
          </h3>
        </DialogHeader>

        <DialogBody>
          {verificationModal.order && (
            <div className="space-y-4">
              {/* Order summary */}
              <div className="p-3 sm:p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                <h4 className="font-medium text-gray-900">Order Details</h4>
                <p>
                  <strong>Order:</strong>{" "}
                  {verificationModal.order.orderNumber ||
                    verificationModal.order._id?.slice(-8)}
                </p>
                <p>
                  <strong>Customer:</strong>{" "}
                  {verificationModal.order.storefrontData?.customerInfo
                    ?.name || "N/A"}{" "}
                  (
                  {verificationModal.order.storefrontData?.customerInfo
                    ?.phone || ""}
                  )
                </p>
                {verificationModal.order.storefrontData?.customerInfo
                  ?.ghanaCardNumber && (
                  <p>
                    <strong>Ghana Card:</strong>{" "}
                    {verificationModal.order.storefrontData.customerInfo.ghanaCardNumber}
                  </p>
                )}
                <p>
                  <strong>Amount:</strong> GHS{" "}
                  {(verificationModal.order.total || 0).toFixed(2)}
                </p>
                <p>
                  <strong>Payment:</strong>{" "}
                  {(
                    verificationModal.order.storefrontData?.paymentMethod
                      ?.type || ""
                  )
                    .replace("_", " ")
                    .toUpperCase()}
                </p>
                {verificationModal.order.storefrontData?.paymentMethod
                  ?.reference && (
                    <p>
                      <strong>Reference:</strong>{" "}
                      {
                        verificationModal.order.storefrontData.paymentMethod
                          .reference
                      }
                    </p>
                  )}
                {verificationModal.order.storefrontData?.paymentMethod
                  ?.paymentProofUrl && (
                    <a
                      href={
                        verificationModal.order.storefrontData.paymentMethod
                          .paymentProofUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View Payment
                      Proof
                    </a>
                  )}

                {/* Items with recipient phones */}
                {(verificationModal.order.storefrontData?.items || [])
                  .length > 0 && (
                    <div className="mt-2 pt-2 border-t space-y-1.5">
                      <h5 className="font-medium text-gray-900">Items:</h5>
                      {verificationModal.order.storefrontData.items.map(
                        (item, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between">
                              <span>
                                {item.bundleName} x{item.quantity}
                              </span>
                              <span>
                                GHS {(item.totalPrice || 0).toFixed(2)}
                              </span>
                            </div>
                            {item.customerPhone && (
                              <p className="text-xs text-gray-500">📱 Recipient: <span className="font-medium text-gray-700">{item.customerPhone}</span></p>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  )}
              </div>

              {/* Notes */}
              <FormField
                label={
                  verificationModal.action === "verify"
                    ? "Verification Notes (Optional)"
                    : "Rejection Reason (Required)"
                }
              >
                <Textarea
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder={
                    verificationModal.action === "verify"
                      ? "Add any notes about the verification..."
                      : "Please explain why this payment is being rejected..."
                  }
                  rows={3}
                />
              </FormField>

              {verificationModal.action === "verify" && (
                <Alert status="info" variant="left-accent">
                  Verifying this payment will deduct the cost from your wallet
                  and process the order for delivery to the customer.
                </Alert>
              )}

              {verificationModal.action === "reject" && (
                <Alert status="warning" variant="left-accent">
                  Rejecting this payment will cancel the order.
                </Alert>
              )}
            </div>
          )}
        </DialogBody>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={closeVerificationModal}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            variant={
              verificationModal.action === "verify" ? "success" : "danger"
            }
            onClick={handleOrderVerification}
            isLoading={isProcessing}
            leftIcon={
              verificationModal.action === "verify" ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )
            }
          >
            {verificationModal.action === "verify"
              ? "Verify & Fulfill"
              : "Reject Payment"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};
