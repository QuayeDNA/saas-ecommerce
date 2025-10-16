import React, { useState, useEffect } from "react";
import { useUser } from "../hooks";
import {
  Button,
  Card,
  CardBody,
  Input,
  Alert,
  Badge,
  Container,
  Select,
} from "../design-system";
import { useNavigate } from "react-router-dom";
import type { AfaOrder } from "../services/user.service";
import type { Bundle } from "../types/package";
import { providerService } from "../services/provider.service";

export const AfaRegistrationPage: React.FC = () => {
  const { submitAfaRegistration, getAfaRegistration, getAfaBundles, isLoading } = useUser();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    bundleId: "",
    ghanaCardNumber: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [afaOrders, setAfaOrders] = useState<AfaOrder[]>([]);
  const [showOrders, setShowOrders] = useState(false);
  const [afaProviderActive, setAfaProviderActive] = useState(true);
  const [checkingProvider, setCheckingProvider] = useState(true);
  const [afaPlans, setAfaPlans] = useState<Bundle[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  useEffect(() => {
    // Load AFA plans, orders and check provider status
    const loadData = async () => {
      setCheckingProvider(true);
      setLoadingPlans(true);
      try {
        // Check AFA provider status
        const afaProvider = await providerService.getProviderByCode("afa");
        setAfaProviderActive(afaProvider?.isActive ?? false);

        if (afaProvider?.isActive) {
          // Load AFA plans
          const bundlesResult = await getAfaBundles();
          if (bundlesResult.bundles) {
            setAfaPlans(bundlesResult.bundles);
            // Auto-select if only one plan available
            if (bundlesResult.bundles.length === 1) {
              setFormData(prev => ({
                ...prev,
                bundleId: bundlesResult.bundles[0]._id || "",
                // Clear Ghana Card if not required for the auto-selected plan
                ghanaCardNumber: bundlesResult.bundles[0].requiresGhanaCard ? prev.ghanaCardNumber : "",
              }));
            }
          }
        }

        // Load AFA orders
        const result = await getAfaRegistration();
        if (result?.afaOrders) {
          setAfaOrders(result.afaOrders);
        }
      } catch (err) {
        console.error("Failed to load data:", err);
        setAfaProviderActive(false);
      } finally {
        setCheckingProvider(false);
        setLoadingPlans(false);
      }
    };

    loadData();
  }, [getAfaRegistration, getAfaBundles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate plan selection
    if (!formData.bundleId) {
      setError("Please select an AFA registration plan");
      return;
    }

    // Check if Ghana Card is required for selected plan
    const selectedPlan = afaPlans.find(b => b._id === formData.bundleId);
    if (selectedPlan?.requiresGhanaCard && !formData.ghanaCardNumber) {
      setError("Ghana Card number is required for this plan");
      return;
    }

    // Double-check AFA provider status before submitting
    try {
      const afaProvider = await providerService.getProviderByCode("afa");
      if (!afaProvider?.isActive) {
        setError(
          "AFA registration service is currently unavailable. Please try again later."
        );
        return;
      }
    } catch (err) {
      console.error("Failed to verify AFA provider status:", err);
      setError(
        "Unable to verify service availability. Please try again later."
      );
      return;
    }

    try {
      await submitAfaRegistration(formData);
      setSuccess(true);
      // Reload AFA orders
      const ordersResult = await getAfaRegistration();
      if (ordersResult?.afaOrders) {
        setAfaOrders(ordersResult.afaOrders);
      }
      // Navigate to orders page after successful creation
      setTimeout(() => {
        navigate("/agent/dashboard/orders");
      }, 2000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message ?? "Registration failed"
          : "Registration failed";
      setError(errorMessage);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBundleChange = (bundleId: string) => {
    setFormData((prev) => ({
      ...prev,
      bundleId,
      // Clear Ghana Card if not required for new plan
      ghanaCardNumber: afaPlans.find(b => b._id === bundleId)?.requiresGhanaCard
        ? prev.ghanaCardNumber
        : "",
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "processing":
        return "warning";
      case "failed":
        return "error";
      default:
        return "info";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen">
      <Container>
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                AFA Registration
              </h1>
              <p className="text-gray-600 mt-1">
                Create AFA registration orders
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowOrders(!showOrders)}
                className="text-sm"
              >
                {showOrders ? "Hide Orders" : "View Orders"}
              </Button>
            </div>
          </div>
        </div>

        {!showOrders ? (
          /* Registration Form */
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-lg">
              <CardBody className="p-6 sm:p-8">
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    Create AFA Registration
                  </h2>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Enter customer details to create an AFA registration order.
                  </p>
                </div>

                {error && (
                  <Alert status="error" className="mb-6">
                    {error}
                  </Alert>
                )}

                {!afaProviderActive && !checkingProvider && (
                  <Alert status="warning" className="mb-6">
                    AFA registration service is currently unavailable. Please
                    try again later.
                  </Alert>
                )}

                {success && (
                  <Alert status="success" className="mb-6">
                    AFA registration order created successfully! Redirecting to
                    orders page...
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="space-y-6 sm:space-y-8">
                    {/* Full Name Field */}
                    <div>
                      <label
                        htmlFor="fullName"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Full Name
                      </label>
                      <Input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter full name"
                        required
                        disabled={
                          isLoading || checkingProvider || !afaProviderActive
                        }
                        className="w-full"
                      />
                    </div>

                    {/* Phone Number Field */}
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter phone number (e.g., 0241234567)"
                        required
                        disabled={
                          isLoading || checkingProvider || !afaProviderActive
                        }
                        className="w-full"
                      />
                    </div>

                    {/* Bundle Selection */}
                    <div>
                      <label
                        htmlFor="bundleId"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        AFA Registration Plan
                      </label>
                      <Select
                        value={formData.bundleId}
                        onChange={handleBundleChange}
                        options={[
                          { value: "", label: loadingPlans ? "Loading plans..." : "Select a plan" },
                          ...afaPlans.map(plan => ({
                            value: plan._id || "",
                            label: `${plan.name} - GH¢${plan.price}${plan.requiresGhanaCard ? " (Requires Ghana Card)" : ""}`
                          }))
                        ]}
                        disabled={
                          isLoading || checkingProvider || !afaProviderActive || loadingPlans
                        }
                        className="w-full"
                      />
                      {formData.bundleId && (
                        <div className="mt-2 text-sm text-gray-600">
                          {(() => {
                            const selectedPlan = afaPlans.find(b => b._id === formData.bundleId);
                            return selectedPlan ? (
                              <div>
                                <p>{selectedPlan.description}</p>
                                {selectedPlan.features && selectedPlan.features.length > 0 && (
                                  <ul className="mt-1 list-disc list-inside">
                                    {selectedPlan.features.map((feature: string, index: number) => (
                                      <li key={index}>{feature}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ) : null;
                          })()}
                        </div>
                      )}
                    </div>

                    {/* Ghana Card Number Field (conditional) */}
                    {(() => {
                      const selectedPlan = afaPlans.find(b => b._id === formData.bundleId);
                      return selectedPlan?.requiresGhanaCard ? (
                        <div>
                          <label
                            htmlFor="ghanaCardNumber"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Ghana Card Number <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="text"
                            id="ghanaCardNumber"
                            name="ghanaCardNumber"
                            value={formData.ghanaCardNumber}
                            onChange={handleInputChange}
                            placeholder="Enter Ghana Card number (e.g., GHA-1234567890-1)"
                            required
                            disabled={
                              isLoading || checkingProvider || !afaProviderActive
                            }
                            className="w-full"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Format: GHA-XXXXXXXXXX-X (e.g., GHA-1234567890-1)
                          </p>
                        </div>
                      ) : null;
                    })()}

                    {/* Submit Button */}
                    <div className="pt-4 sm:pt-6">
                      <Button
                        type="submit"
                        className="w-full py-3 sm:py-4 text-base sm:text-lg font-medium"
                        disabled={
                          isLoading || checkingProvider || !afaProviderActive
                        }
                        isLoading={isLoading || checkingProvider}
                      >
                        {checkingProvider
                          ? "Checking availability..."
                          : !afaProviderActive
                          ? "AFA Service Unavailable"
                          : isLoading
                          ? "Creating Order..."
                          : "Create AFA Registration Order"}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardBody>
            </Card>
          </div>
        ) : (
          /* AFA Orders Table */
          <div className="max-w-6xl mx-auto">
            <Card className="shadow-lg">
              <CardBody className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    AFA Registration Orders
                  </h2>
                  <p className="text-gray-600 text-sm sm:text-base">
                    View all your AFA registration orders
                  </p>
                </div>

                {afaOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No AFA registration orders found.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order Number
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Phone
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {afaOrders.map((order) => (
                          <tr key={order._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {order.orderNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {order.customerInfo?.name || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {order.customerInfo?.phone || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              GH¢{order.total}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge colorScheme={getStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(order.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        )}
      </Container>
    </div>
  );
};

export default AfaRegistrationPage;
