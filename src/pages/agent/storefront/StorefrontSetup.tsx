// src/pages/agent/storefront/StorefrontSetup.tsx
import { useState, useEffect } from "react";
import { useStorefront } from "../../../hooks/useStorefront";
import { useAuth } from "../../../hooks/use-auth";
import {
  Card,
  Button,
  Input,
  Textarea,
  FormField,
  Select,
  useToast,
} from "../../../design-system";
import { Store, ArrowRight, CheckCircle } from "lucide-react";
import type { PaymentMethod } from "../../../services/storefront.service";

interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export default function StorefrontSetup() {
  const { createStorefront } = useStorefront();
  const { authState } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showMobileMoneyForm, setShowMobileMoneyForm] = useState(false);

  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    businessName: "",
    displayName: "",
    description: "",
    contactEmail: "",
    contactPhone: "",
    paymentMethods: [] as PaymentMethod[],
  });

  const [mobileMoneyForm, setMobileMoneyForm] = useState({
    network: "",
    accountName: "",
    accountNumber: "",
  });

  // Auto-populate form data from user profile
  useEffect(() => {
    if (authState.user) {
      setFormData((prev) => ({
        ...prev,
        businessName: authState.user?.businessName || prev.businessName,
        displayName: authState.user?.fullName || prev.displayName,
        contactEmail: authState.user?.email || prev.contactEmail,
        contactPhone: authState.user?.phone || prev.contactPhone,
      }));
    }
  }, [authState.user]);

  const steps: SetupStep[] = [
    {
      id: "business",
      title: "Business Information",
      description: "Set up your business details",
      completed: !!(
        formData.businessName.trim() && formData.contactPhone.trim()
      ),
    },
    {
      id: "payments",
      title: "Payment Methods",
      description: "Configure how customers can pay you",
      completed: formData.paymentMethods.length > 0,
    },
    {
      id: "review",
      title: "Review & Launch",
      description: "Review your setup and launch your store",
      completed: false,
    },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddMobileMoney = () => {
    if (
      !mobileMoneyForm.network ||
      !mobileMoneyForm.accountName.trim() ||
      !mobileMoneyForm.accountNumber.trim()
    ) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    // Map network values to match database enum
    const networkMapping: Record<string, "MTN" | "Vodafone" | "AirtelTigo"> = {
      mtn: "MTN",
      vodafone: "Vodafone",
      airteltigo: "AirtelTigo",
    };

    const newPaymentMethod: PaymentMethod = {
      type: "mobile_money",
      mobileMoney: {
        network: networkMapping[mobileMoneyForm.network] as
          | "MTN"
          | "Vodafone"
          | "AirtelTigo",
        accountName: mobileMoneyForm.accountName.trim(),
        accountNumber: mobileMoneyForm.accountNumber.trim(),
      },
      instructions: "Send payment to this number and upload proof of payment",
      isActive: true,
    };

    setFormData((prev) => ({
      ...prev,
      paymentMethods: [...prev.paymentMethods, newPaymentMethod],
    }));

    setMobileMoneyForm({ network: "", accountName: "", accountNumber: "" });
    setShowMobileMoneyForm(false);
    showToast("Mobile Money account added successfully!", "success");
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Business info
        if (!formData.businessName.trim()) {
          showToast("Business name is required", "error");
          return false;
        }
        if (!formData.contactPhone.trim()) {
          showToast("Contact phone is required", "error");
          return false;
        }
        return true;
      case 1: // Payment methods
        if (formData.paymentMethods.length === 0) {
          showToast("At least one payment method is required", "error");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Transform business name to URL-safe slug
  const transformBusinessName = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Transform data before submission
      const transformedData = {
        ...formData,
        businessName: transformBusinessName(formData.businessName),
        displayName: formData.displayName || formData.businessName,
        settings: {
          contactInfo: {
            phone: formData.contactPhone,
            email: formData.contactEmail,
          },
        },
      };

      await createStorefront(transformedData);
      showToast("Storefront created successfully!", "success");
    } catch (error: unknown) {
      showToast(
        error instanceof Error ? error.message : "Failed to create storefront",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Store className="w-16 h-16 text-primary-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Business Information
              </h2>
              <p className="text-gray-600">
                Your business details have been pre-filled from your profile.
                You can edit them as needed.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Business Name" required>
                <div className="relative">
                  <Input
                    placeholder="e.g., TechHub Ghana"
                    value={formData.businessName}
                    onChange={(e) =>
                      handleInputChange("businessName", e.target.value)
                    }
                  />
                  {authState.user?.businessName &&
                    formData.businessName === authState.user.businessName && (
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        From Profile
                      </span>
                    )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  This will be your storefront URL:{" "}
                  <span className="font-mono text-primary-600">
                    {window.location.origin}/stores/
                    {transformBusinessName(formData.businessName) ||
                      "your-store"}
                  </span>
                </p>
              </FormField>

              <FormField label="Display Name">
                <div className="relative">
                  <Input
                    placeholder="e.g., TechHub Ghana Limited"
                    value={formData.displayName}
                    onChange={(e) =>
                      handleInputChange("displayName", e.target.value)
                    }
                  />
                  {authState.user?.fullName &&
                    formData.displayName === authState.user.fullName && (
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        From Profile
                      </span>
                    )}
                </div>
              </FormField>

              <FormField label="Contact Email">
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.contactEmail}
                    onChange={(e) =>
                      handleInputChange("contactEmail", e.target.value)
                    }
                  />
                  {authState.user?.email &&
                    formData.contactEmail === authState.user.email && (
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        From Profile
                      </span>
                    )}
                </div>
              </FormField>

              <FormField label="Contact Phone" required>
                <div className="relative">
                  <Input
                    placeholder="+233 XX XXX XXXX"
                    value={formData.contactPhone}
                    onChange={(e) =>
                      handleInputChange("contactPhone", e.target.value)
                    }
                  />
                  {authState.user?.phone &&
                    formData.contactPhone === authState.user.phone && (
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        From Profile
                      </span>
                    )}
                </div>
              </FormField>
            </div>

            <FormField label="Business Description">
              <Textarea
                placeholder="Describe your business and what you offer..."
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
              />
            </FormField>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Methods
              </h2>
              <p className="text-gray-600">
                Set up how your customers can pay for orders.
              </p>
            </div>

            {/* Payment Method Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Bank Transfer - Coming Soon */}
              <Card className="p-6 opacity-50 cursor-not-allowed">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">
                    Bank Transfer
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Direct bank transfers from customers
                  </p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    Coming Soon
                  </span>
                </div>
              </Card>

              {/* Paystack - Coming Soon */}
              <Card className="p-6 opacity-50 cursor-not-allowed">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">
                    Paystack
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Online payments via Paystack
                  </p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    Coming Soon
                  </span>
                </div>
              </Card>

              {/* Mobile Money - Active */}
              <Card
                className="p-6 cursor-pointer border-2 border-primary-200 hover:border-primary-300 transition-colors"
                onClick={() => setShowMobileMoneyForm(true)}
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-6 h-6 text-primary-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Mobile Money
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Direct mobile money transfers
                  </p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Available
                  </span>
                </div>
              </Card>
            </div>

            {/* Added Payment Methods */}
            {formData.paymentMethods.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Added Mobile Money Accounts ({formData.paymentMethods.length})
                </h3>
                {formData.paymentMethods.map((method, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {method.mobileMoney?.network} -{" "}
                          {method.mobileMoney?.accountName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {method.mobileMoney?.accountNumber}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              paymentMethods: prev.paymentMethods.filter(
                                (_, i) => i !== index,
                              ),
                            }));
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Mobile Money Form Modal */}
            {showMobileMoneyForm && (
              <Card className="p-6 border-2 border-primary-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Add Mobile Money Account
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMobileMoneyForm(false)}
                  >
                    Cancel
                  </Button>
                </div>

                <div className="space-y-4">
                  <FormField label="Network" required>
                    <Select
                      value={mobileMoneyForm.network}
                      onChange={(value) =>
                        setMobileMoneyForm((prev) => ({
                          ...prev,
                          network: value,
                        }))
                      }
                      options={[
                        { value: "", label: "Select Network" },
                        { value: "mtn", label: "MTN" },
                        { value: "vodafone", label: "Vodafone" },
                        { value: "airteltigo", label: "AirtelTigo" },
                      ]}
                      placeholder="Select Network"
                    />
                  </FormField>

                  <FormField label="Account Name" required>
                    <Input
                      placeholder="e.g., John Doe"
                      value={mobileMoneyForm.accountName}
                      onChange={(e) =>
                        setMobileMoneyForm((prev) => ({
                          ...prev,
                          accountName: e.target.value,
                        }))
                      }
                    />
                  </FormField>

                  <FormField label="Account Number" required>
                    <Input
                      placeholder="e.g., 0541234567"
                      value={mobileMoneyForm.accountNumber}
                      onChange={(e) =>
                        setMobileMoneyForm((prev) => ({
                          ...prev,
                          accountNumber: e.target.value,
                        }))
                      }
                    />
                  </FormField>

                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowMobileMoneyForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddMobileMoney}
                      disabled={
                        !mobileMoneyForm.network ||
                        !mobileMoneyForm.accountName.trim() ||
                        !mobileMoneyForm.accountNumber.trim()
                      }
                    >
                      Add Account
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Ready to Launch!
              </h2>
              <p className="text-gray-600">
                Review your information and launch your storefront.
              </p>
            </div>

            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Storefront Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Business Name:</span>
                  <span className="font-medium">{formData.businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Display Name:</span>
                  <span className="font-medium">
                    {formData.displayName || formData.businessName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contact Phone:</span>
                  <span className="font-medium">{formData.contactPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Methods:</span>
                  <span className="font-medium">
                    {formData.paymentMethods.length} configured
                  </span>
                </div>
              </div>
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">
                What happens next?
              </h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Your storefront will be created and activated</li>
                <li>• Customers can visit your store at your custom URL</li>
                <li>
                  • You can manage orders, pricing, and analytics from your
                  dashboard
                </li>
                <li>• Start earning commissions on every sale!</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create Your Storefront
        </h1>
        <p className="text-gray-600">
          Set up your personalized online store in just a few steps.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  index <= currentStep
                    ? "bg-primary-600 border-primary-600 text-white"
                    : "border-gray-300 text-gray-300"
                }`}
              >
                {index < currentStep ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-0.5 mx-4 ${
                    index < currentStep ? "bg-primary-600" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <h3 className="font-semibold text-gray-900">
            {steps[currentStep].title}
          </h3>
          <p className="text-gray-600">{steps[currentStep].description}</p>
        </div>
      </div>

      {/* Step Content */}
      <Card className="p-8 mb-8">{renderStepContent()}</Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          Previous
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating Storefront..." : "Launch Storefront"}
          </Button>
        )}
      </div>
    </div>
  );
}
