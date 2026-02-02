// src/pages/agent/storefront/OrderManagement.tsx
import { useState } from "react";
import { useStorefront } from "../../../hooks/useStorefront";
import {
  Card,
  Button,
  Input,
  Textarea,
  Table,
  useToast,
} from "../../../design-system";
import { Package, CheckCircle, Upload, Eye } from "lucide-react";
import type { OrderSummary } from "../../../services/storefront.service";

export default function OrderManagement() {
  const { pendingOrders, confirmPayment, uploadPaymentProof } = useStorefront();
  const [selectedOrder, setSelectedOrder] = useState<OrderSummary | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmationData, setConfirmationData] = useState({
    transactionId: "",
    amountPaid: "",
    notes: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { showToast } = useToast();

  const handleConfirmPayment = async () => {
    if (!selectedOrder) return;

    try {
      await confirmPayment(selectedOrder._id, {
        transactionId: confirmationData.transactionId,
        amountPaid: parseFloat(confirmationData.amountPaid),
        notes: confirmationData.notes,
      });

      showToast("Payment confirmed successfully", "success");
      setShowConfirmDialog(false);
      setSelectedOrder(null);
      setConfirmationData({ transactionId: "", amountPaid: "", notes: "" });
    } catch (error: unknown) {
      showToast(
        error instanceof Error ? error.message : "Failed to confirm payment",
        "error",
      );
    }
  };

  const handleFileUpload = async (orderId: string) => {
    if (!selectedFile) return;

    try {
      await uploadPaymentProof(orderId, selectedFile);
      showToast("Payment proof uploaded successfully", "success");
      setSelectedFile(null);
    } catch (error: unknown) {
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to upload payment proof",
        "error",
      );
    }
  };

  const getPaymentMethodDisplay = (method: {
    type: string;
    network?: string;
  }) => {
    switch (method.type) {
      case "mobile_money":
        return `${method.network?.toUpperCase() || "MOBILE"} - Mobile Money`;
      case "bank_transfer":
        return "Bank Transfer";
      case "paystack":
        return "Paystack";
      default:
        return method.type;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
        <p className="text-gray-600 mt-1">
          Manage pending orders and confirm payments from your customers.
        </p>
      </div>

      {/* Pending Orders Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Pending Orders
        </h3>

        {pendingOrders.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Payment Method</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingOrders.map((order) => (
                <tr key={order._id}>
                  <td className="font-medium">#{order.orderNumber}</td>
                  <td>
                    <div>
                      <p className="font-medium">{order.customerInfo.name}</p>
                      <p className="text-sm text-gray-600">
                        {order.customerInfo.phone}
                      </p>
                    </div>
                  </td>
                  <td>{getPaymentMethodDisplay(order.paymentMethod)}</td>
                  <td className="font-medium">GHS {order.total.toFixed(2)}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowConfirmDialog(true);
                        }}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Pending Orders
            </h3>
            <p className="text-gray-600">
              All orders have been processed. New orders will appear here.
            </p>
          </div>
        )}
      </Card>

      {/* Order Details Modal */}
      {selectedOrder && !showConfirmDialog && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Order #{selectedOrder.orderNumber}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedOrder(null)}
            >
              Close
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Customer Information
              </h4>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {selectedOrder.customerInfo.name}
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{" "}
                  {selectedOrder.customerInfo.phone}
                </p>
                {selectedOrder.customerInfo.email && (
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {selectedOrder.customerInfo.email}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Payment Information
              </h4>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Method:</span>{" "}
                  {selectedOrder.paymentMethod.type}
                </p>
                <p>
                  <span className="font-medium">Amount:</span> GHS{" "}
                  {selectedOrder.total.toFixed(2)}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  {selectedOrder.status}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Proof Upload */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium text-gray-900 mb-3">Payment Proof</h4>
            <div className="flex gap-3">
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <Button
                onClick={() => handleFileUpload(selectedOrder._id)}
                disabled={!selectedFile}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Proof
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Payment Confirmation Dialog */}
      {showConfirmDialog && selectedOrder && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Confirm Payment - Order #{selectedOrder.orderNumber}
          </h3>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleConfirmPayment();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Transaction ID/Reference <span className="text-red-500">*</span>
              </label>
              <Input
                value={confirmationData.transactionId}
                onChange={(e) =>
                  setConfirmationData((prev) => ({
                    ...prev,
                    transactionId: e.target.value,
                  }))
                }
                placeholder="Enter transaction reference"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Amount Paid (GHS) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                value={confirmationData.amountPaid}
                onChange={(e) =>
                  setConfirmationData((prev) => ({
                    ...prev,
                    amountPaid: e.target.value,
                  }))
                }
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Notes (Optional)
              </label>
              <Textarea
                value={confirmationData.notes}
                onChange={(e) =>
                  setConfirmationData((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                placeholder="Additional notes about the payment..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit">Confirm Payment</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowConfirmDialog(false);
                  setConfirmationData({
                    transactionId: "",
                    amountPaid: "",
                    notes: "",
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
