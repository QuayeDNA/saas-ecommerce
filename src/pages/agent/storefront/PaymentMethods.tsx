// src/pages/agent/storefront/PaymentMethods.tsx
import React, { useState } from "react";
import { useStorefront } from "../../../hooks/useStorefront";
import {
  Card,
  Button,
  Input,
  Select,
  FormField,
  useToast,
} from "../../../design-system";
import { CreditCard, Plus, Edit, Smartphone, Building } from "lucide-react";

export default function PaymentMethods() {
  const { storefront, addPaymentMethod, updatePaymentMethod } = useStorefront();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState<number | null>(null);

  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    type: "mobile_money" as "mobile_money" | "bank_transfer" | "paystack",
    network: "mtn" as "mtn" | "vodafone" | "airteltigo",
    accountName: "",
    accountNumber: "",
    bankName: "",
    instructions: "",
    publicKey: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Map network values to match database enum
      const networkMapping: Record<string, "MTN" | "Vodafone" | "AirtelTigo"> =
        {
          mtn: "MTN",
          vodafone: "Vodafone",
          airteltigo: "AirtelTigo",
        };

      const paymentMethod = {
        type: formData.type,
        instructions:
          formData.instructions || "Send payment and upload proof of payment",
        isActive: true,
        ...(formData.type === "mobile_money" && {
          mobileMoney: {
            network: networkMapping[formData.network] as
              | "MTN"
              | "Vodafone"
              | "AirtelTigo",
            accountName: formData.accountName,
            accountNumber: formData.accountNumber,
          },
        }),
        ...(formData.type === "bank_transfer" && {
          bankTransfer: {
            bankName: formData.bankName,
            accountName: formData.accountName,
            accountNumber: formData.accountNumber,
          },
        }),
        ...(formData.type === "paystack" && {
          paystack: {
            publicKey: formData.publicKey,
          },
        }),
      };

      if (editingMethod !== null) {
        await updatePaymentMethod(
          storefront!._id,
          editingMethod.toString(),
          paymentMethod,
        );
        showToast("Payment method updated successfully", "success");
      } else {
        await addPaymentMethod(storefront!._id, paymentMethod);
        showToast("Payment method added successfully", "success");
      }

      setShowAddForm(false);
      setEditingMethod(null);
      resetForm();
    } catch (error: unknown) {
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to save payment method",
        "error",
      );
    }
  };

  const resetForm = () => {
    setFormData({
      type: "mobile_money",
      network: "mtn",
      accountName: "",
      accountNumber: "",
      bankName: "",
      instructions: "",
      publicKey: "",
    });
  };

  const startEdit = (index: number) => {
    const method = storefront!.paymentMethods[index];

    // Reverse mapping from database enum to frontend values
    const reverseNetworkMapping: Record<
      string,
      "mtn" | "vodafone" | "airteltigo"
    > = {
      MTN: "mtn",
      Vodafone: "vodafone",
      AirtelTigo: "airteltigo",
    };

    setEditingMethod(index);
    setFormData({
      type: method.type,
      network: method.mobileMoney?.network
        ? reverseNetworkMapping[method.mobileMoney.network] || "mtn"
        : "mtn",
      accountName:
        method.mobileMoney?.accountName ||
        method.bankTransfer?.accountName ||
        "",
      accountNumber:
        method.mobileMoney?.accountNumber ||
        method.bankTransfer?.accountNumber ||
        "",
      bankName: method.bankTransfer?.bankName || "",
      instructions: method.instructions || "",
      publicKey: method.paystack?.publicKey || "",
    });
    setShowAddForm(true);
  };

  if (!storefront) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Methods</h2>
          <p className="text-gray-600 mt-1">
            Configure how customers can pay for orders on your storefront.
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>
          <Plus className="w-4 h-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingMethod ? "Edit Payment Method" : "Add Payment Method"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Payment Type <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.type}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: value as
                      | "mobile_money"
                      | "bank_transfer"
                      | "paystack",
                  }))
                }
                options={[
                  { value: "mobile_money", label: "Mobile Money" },
                  { value: "bank_transfer", label: "Bank Transfer" },
                  { value: "paystack", label: "Paystack" },
                ]}
              />
            </div>

            {formData.type === "mobile_money" && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Network <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.network}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        network: value as "mtn" | "vodafone" | "airteltigo",
                      }))
                    }
                    options={[
                      { value: "mtn", label: "MTN" },
                      { value: "vodafone", label: "Vodafone" },
                      { value: "airteltigo", label: "AirtelTigo" },
                    ]}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Account Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.accountName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          accountName: e.target.value,
                        }))
                      }
                      placeholder="Account holder name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.accountNumber}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          accountNumber: e.target.value,
                        }))
                      }
                      placeholder="10-digit number"
                    />
                  </div>
                </div>
              </>
            )}

            {formData.type === "bank_transfer" && (
              <>
                <FormField label="Bank Name" required>
                  <Input
                    value={formData.bankName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        bankName: e.target.value,
                      }))
                    }
                    placeholder="e.g., GT Bank, Ecobank"
                  />
                </FormField>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Account Name" required>
                    <Input
                      value={formData.accountName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          accountName: e.target.value,
                        }))
                      }
                      placeholder="Account holder name"
                    />
                  </FormField>
                  <FormField label="Account Number" required>
                    <Input
                      value={formData.accountNumber}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          accountNumber: e.target.value,
                        }))
                      }
                      placeholder="Account number"
                    />
                  </FormField>
                </div>
              </>
            )}

            {formData.type === "paystack" && (
              <FormField label="Public Key" required>
                <Input
                  value={formData.publicKey}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      publicKey: e.target.value,
                    }))
                  }
                  placeholder="pk_test_..."
                />
              </FormField>
            )}

            <FormField label="Payment Instructions">
              <Input
                value={formData.instructions}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    instructions: e.target.value,
                  }))
                }
                placeholder="Instructions for customers"
              />
            </FormField>

            <div className="flex gap-3 pt-4">
              <Button type="submit">
                {editingMethod ? "Update Method" : "Add Method"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingMethod(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Payment Methods List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {storefront.paymentMethods.map((method, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {method.type === "mobile_money" && (
                  <Smartphone className="w-5 h-5 text-green-600" />
                )}
                {method.type === "bank_transfer" && (
                  <Building className="w-5 h-5 text-blue-600" />
                )}
                {method.type === "paystack" && (
                  <CreditCard className="w-5 h-5 text-purple-600" />
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 capitalize">
                    {method.type.replace("_", " ")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {method.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => startEdit(index)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {method.mobileMoney && (
                <>
                  <p>
                    <span className="font-medium">Network:</span>{" "}
                    {method.mobileMoney.network.toUpperCase()}
                  </p>
                  <p>
                    <span className="font-medium">Account:</span>{" "}
                    {method.mobileMoney.accountName}
                  </p>
                  <p>
                    <span className="font-medium">Number:</span>{" "}
                    {method.mobileMoney.accountNumber}
                  </p>
                </>
              )}
              {method.bankTransfer && (
                <>
                  <p>
                    <span className="font-medium">Bank:</span>{" "}
                    {method.bankTransfer.bankName}
                  </p>
                  <p>
                    <span className="font-medium">Account:</span>{" "}
                    {method.bankTransfer.accountName}
                  </p>
                  <p>
                    <span className="font-medium">Number:</span>{" "}
                    {method.bankTransfer.accountNumber}
                  </p>
                </>
              )}
              {method.paystack && (
                <p>
                  <span className="font-medium">Public Key:</span>{" "}
                  {method.paystack.publicKey.substring(0, 20)}...
                </p>
              )}
              {method.instructions && (
                <p>
                  <span className="font-medium">Instructions:</span>{" "}
                  {method.instructions}
                </p>
              )}
            </div>
          </Card>
        ))}

        {storefront.paymentMethods.length === 0 && !showAddForm && (
          <Card className="p-6 col-span-full">
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Payment Methods
              </h3>
              <p className="text-gray-600 mb-4">
                Add payment methods to start accepting orders.
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Payment Method
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
