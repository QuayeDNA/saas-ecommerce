import React, { useState, useEffect } from "react";
import {
  Store,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Check,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  X,
  Smartphone,
  Banknote,
  Loader2,
  Plus,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardBody,
  Button,
  FormField,
  Input,
  Alert,
  Badge,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Select,
  LoadingCard,
} from "../../design-system";
import { getStoreUrl } from "../../utils/store-url";
import { useToast } from "../../design-system";
import {
  storefrontService,
  type StorefrontData,
} from "../../services/storefront.service";
import { getApiErrorMessage } from "../../utils/error-helpers";
import { useAuth, useUser } from "../../hooks";

interface StorefrontManagerProps {
  onStorefrontCreated?: (storefront: StorefrontData) => void;
  hasCheckedExisting?: boolean;
  /** When true, skip the "Create Your Online Store" screen and only render the wizard dialog */
  wizardOnly?: boolean;
  /** Controls wizard dialog open state in wizardOnly mode */
  isOpen?: boolean;
  /** Called when the wizard dialog is closed (for wizardOnly mode to update parent state) */
  onClose?: () => void;
}

interface FormData {
  businessName: string;
  displayName: string;
  phone: string;
  email: string;
  address: string;
  paymentMethods: Array<{
    type: "mobile_money" | "bank_transfer" | "paystack";
    details: {
      // Mobile Money: { accounts: Array<{ provider: string; number: string; accountName: string }> }
      // Bank Transfer: { bank: string; account: string; name: string }
      accounts?: Array<{
        provider: string;
        number: string;
        accountName: string;
      }>;
      bank?: string;
      account?: string;
      name?: string;
      subaccountId?: string;
    };
    isActive: boolean;
  }>;
}

interface FormErrors {
  businessName?: string;
  displayName?: string;
  phone?: string;
  email?: string;
  address?: string;
  paymentMethods?: string;
}

const StepProgress: React.FC<{ current: number; steps: string[] }> = ({ current, steps }) => (
  <div className="flex items-center gap-1.5">
    {steps.map((_, idx) => {
      const stepNum = idx + 1;
      return (
        <React.Fragment key={stepNum}>
          <div
            className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-black transition-all duration-300"
            style={stepNum <= current
              ? { backgroundColor: "var(--color-primary)", color: "#fff" }
              : { backgroundColor: "rgba(255,255,255,0.2)", color: "#fff" }}
          >
            {stepNum < current ? <Check className="w-3.5 h-3.5" /> : stepNum}
          </div>
          {stepNum < steps.length && (
            <div
              className="flex-1 h-1 rounded-full transition-all duration-300"
              style={{ backgroundColor: stepNum < current ? "#fff" : "rgba(255,255,255,0.2)" }}
            />
          )}
        </React.Fragment>
      );
    })}
    <span className="ml-2 text-xs font-semibold whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.8)' }}>
      {steps[current - 1]}
    </span>
  </div>
);

export const StorefrontManager: React.FC<StorefrontManagerProps> = ({
  onStorefrontCreated,
  hasCheckedExisting = false,
  wizardOnly = false,
  isOpen = false,
  onClose,
}) => {
  const [showWizard, setShowWizard] = useState(false);
  const [storefront, setStorefront] = useState<StorefrontData | null>(null);
  const [isLoading, setIsLoading] = useState(!wizardOnly);
  const [error, setError] = useState<string | null>(null);
  const { getProfile } = useUser();

  useEffect(() => {
    if (wizardOnly) {
      // Wizard-only mode: skip API call, don't auto-open wizard
      setIsLoading(false);
      return;
    }

    if (hasCheckedExisting) {
      // Dashboard already checked, no storefront exists, skip the API call
      setIsLoading(false);
      return;
    }

    const checkExistingStorefront = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if user already has a storefront
        try {
          const result = await storefrontService.getMyStorefront();
          if (result) {
            setStorefront(result.data);
          }
        } catch {
          // No existing storefront, continue to show setup wizard
        }
      } catch (err) {
        console.error("Failed to check storefront:", err);
        setError("Failed to load storefront information");
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingStorefront();
  }, [getProfile, hasCheckedExisting, wizardOnly]);

  const handleStorefrontCreated = (newStorefront: StorefrontData) => {
    setStorefront(newStorefront);
    setShowWizard(false);
    onStorefrontCreated?.(newStorefront);
  };

  const handleWizardCancel = () => {
    setShowWizard(false);
    onClose?.();
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <LoadingCard lines={5} showAvatar className="max-w-2xl mx-auto" />
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="elevated" className="max-w-2xl mx-auto">
        <CardBody className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--error)" }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            Something went wrong
          </h3>
          <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>{error}</p>
          <Button
            variant="primary"
            onClick={() => window.location.reload()}

          >
            Try Again
          </Button>
        </CardBody>
      </Card>
    );
  }

  if (storefront) {
    return (
      <Card variant="elevated" className="max-w-2xl mx-auto">
        <CardBody className="p-8 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `color-mix(in srgb, var(--success) 15%, transparent)` }}>
            <Store className="w-8 h-8" style={{ color: "var(--success)" }} />
          </div>
          <h3 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Your Storefront is Live!
          </h3>
          <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
            {storefront.businessName} is ready to accept orders
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="primary"
  
              className="flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              View Storefront
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              View Analytics
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  // Wizard-only mode: skip the "Create Your Online Store" screen
  if (wizardOnly) {
    return (
      <StoreSetupWizardDialog
        isOpen={isOpen}
        onClose={handleWizardCancel}
        onComplete={handleStorefrontCreated}
      />
    );
  }

  return (
    <>
      <Card variant="elevated" className="max-w-2xl mx-auto">
        <CardBody className="p-6 sm:p-8 text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              backgroundColor: `color-mix(in srgb, var(--color-primary) 15%, transparent)`,
            }}
          >
            <Store
              className="w-8 h-8"
              style={{
                color: "var(--color-primary)",
              }}
            />
          </div>

          <h3 className="text-2xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            Create Your Online Store
          </h3>

          <p className="mb-6 max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
            Set up your digital storefront in minutes and start selling airtime
            and data bundles online
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="text-center">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2"
                style={{
                  backgroundColor: `color-mix(in srgb, var(--color-primary) 15%, transparent)`,
                }}
              >
                <span
                  className="font-semibold text-sm"
                  style={{
                    color: "var(--color-primary)",
                  }}
                >
                  1
                </span>
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Business Details
              </p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Add your info</p>
            </div>

            <div className="text-center">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2"
                style={{
                  backgroundColor: `color-mix(in srgb, var(--color-primary) 15%, transparent)`,
                }}
              >
                <span
                  className="font-semibold text-sm"
                  style={{
                    color: "var(--color-primary)",
                  }}
                >
                  2
                </span>
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Payment Methods
              </p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Set up payments</p>
            </div>

            <div className="text-center">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2"
                style={{
                  backgroundColor: `color-mix(in srgb, var(--color-primary) 15%, transparent)`,
                }}
              >
                <span
                  className="font-semibold text-sm"
                  style={{
                    color: "var(--color-primary)",
                  }}
                >
                  3
                </span>
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Launch Store</p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Go live</p>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => setShowWizard(true)}

            className="w-full sm:w-auto px-8 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Your Storefront
          </Button>
        </CardBody>
      </Card>

      <StoreSetupWizardDialog
        isOpen={showWizard}
        onClose={handleWizardCancel}
        onComplete={handleStorefrontCreated}
      />
    </>
  );
};

interface StoreSetupWizardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (storefront: StorefrontData) => void;
}

const StoreSetupWizardDialog: React.FC<StoreSetupWizardDialogProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { authState } = useAuth();
  const { getProfile } = useUser();
  const { addToast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    businessName: "",
    displayName: "",
    phone: "",
    email: "",
    address: "",
    paymentMethods: [],
  });

  const slugifyBusinessName = (value: string) => {
    return value
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9_-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const businessUrlPreview = () => {
    const slug = slugifyBusinessName(formData.businessName || '');
    return slug ? getStoreUrl(slug) : '';
  };
  const [errors, setErrors] = useState<FormErrors>({});

  // Wizard steps configuration
  const STEPS = [
    {
      id: "business-details",
      title: "Business Details",
      description: "Tell us about your business",
    },
    {
      id: "payment-methods",
      title: "Payment Methods",
      description: "Set up how customers can pay you",
    },
    {
      id: "review",
      title: "Review & Launch",
      description: "Review your information and create your store",
    },
  ];

  // Payment method options
  const PAYMENT_OPTIONS = [
    {
      type: "paystack",
      label: "Paystack (online)",
      description: "Online checkout via Paystack (recommended)",
      icon: CreditCard,
      available: true,
    },
    {
      type: "mobile_money",
      label: "Mobile Money",
      description:
        "Accept payments via mobile money (Coming Soon)",
      icon: Smartphone,
      available: false,
    },
    {
      type: "cash",
      label: "Cash on Delivery",
      description: "Customers pay you directly in cash (Coming Soon)",
      icon: Banknote,
      available: false,
    },
  ];

  // Auto-populate form with profile data
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setIsLoadingProfile(true);
        const profile = await getProfile();

        setFormData({
          businessName: profile.businessName || profile.fullName || "",
          displayName: profile.businessName || profile.fullName || "",
          phone: profile.phone || "",
          email: profile.email || "",
          address: "", // Address not available in User interface
          paymentMethods: [
            {
              type: "mobile_money" as const,
              details: {
                accounts: [{
                  provider: "",
                  number: profile.phone || "",
                  accountName: profile.fullName || ""
                }]
              },
              isActive: false,
            },
          ],
        });
      } catch (error) {
        console.error("Failed to load profile:", error);
        setFormData((prev) => ({
          ...prev,
          displayName: authState.user?.fullName || "",
          phone: authState.user?.phone || "",
          email: authState.user?.email || "",
          paymentMethods: [
            {
              type: "mobile_money",
              details: {
                accounts: [{
                  provider: "",
                  number: authState.user?.phone || "",
                  accountName: authState.user?.fullName || ""
                }]
              },
              isActive: false,
            },
          ],
        }));
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (isOpen) {
      loadProfileData();
      setCurrentStep(0);
      setErrors({});
    }
  }, [isOpen, getProfile, authState.user]);

  // Form validation
  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};
    setErrors({});

    if (step === 0) {
      if (!formData.businessName.trim()) {
        newErrors.businessName = "Business name is required";
      } else if (formData.businessName.length < 3) {
        newErrors.businessName = "Must be at least 3 characters";
      }

      if (!formData.displayName.trim()) {
        newErrors.displayName = "Display name is required";
      } else if (formData.displayName.length < 3) {
        newErrors.displayName = "Must be at least 3 characters";
      }

      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      } else if (!/^[+]?[0-9\-()\s]+$/.test(formData.phone)) {
        newErrors.phone = "Please enter a valid phone number";
      }

      if (
        formData.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      ) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    if (step === 1) {
      const activePayments = formData.paymentMethods.filter(
        (pm) => pm.isActive,
      );
      if (activePayments.length === 0) {
        newErrors.paymentMethods = "Please select at least one payment method";
      }

      for (const payment of activePayments) {
        if (payment.type === "mobile_money") {
          const accounts = payment.details.accounts || [];
          if (accounts.length === 0) {
            newErrors.paymentMethods = "At least one mobile money account is required";
            break;
          }
          for (let i = 0; i < accounts.length; i++) {
            const account = accounts[i];
            if (!account.provider) {
              newErrors.paymentMethods = `Account ${i + 1}: Please select a provider`;
              break;
            }
            if (!account.number) {
              newErrors.paymentMethods = `Account ${i + 1}: Phone number is required`;
              break;
            }
            if (!account.accountName) {
              newErrors.paymentMethods = `Account ${i + 1}: Account name is required`;
              break;
            }
          }
          if (newErrors.paymentMethods) break;
        }

        // Paystack requires no storefront-level credentials for platform checkout
        if (payment.type === 'paystack') {
          continue;
        }

        if (
          payment.type === "bank_transfer" &&
          (!payment.details.account || !payment.details.bank)
        ) {
          newErrors.paymentMethods = "Bank account details are required";
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form handlers
  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const togglePaymentMethod = (type: "mobile_money" | "bank_transfer" | "paystack") => {
    // Only allow toggling for available payment methods
    const option = PAYMENT_OPTIONS.find(opt => opt.type === type);
    if (!option?.available) return;

    setFormData((prev) => {
      const existingIndex = prev.paymentMethods.findIndex(
        (pm) => pm.type === type,
      );

      if (existingIndex >= 0) {
        // Create new array with a new object for the toggled item (immutable update)
        const updated = prev.paymentMethods.map((pm, index) =>
          index === existingIndex
            ? { ...pm, isActive: !pm.isActive }
            : pm
        );
        return { ...prev, paymentMethods: updated };
      } else {
        const newMethod = {
          type,
          details:
            type === "mobile_money"
              ? { accounts: [{ provider: "", number: prev.phone, accountName: "" }] }
              : { bank: "", account: "", name: "" },
          isActive: true,
        };
        return { ...prev, paymentMethods: [...prev.paymentMethods, newMethod] };
      }
    });
  };

  const updatePaymentDetails = (type: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map((pm) => {
        if (pm.type !== type) return pm;

        if (type === "mobile_money" && field.startsWith("accounts.")) {
          // Handle mobile money account updates: accounts.0.provider, accounts.1.number, etc.
          const [, accountIndex, accountField] = field.split(".");
          const index = parseInt(accountIndex);
          const accounts = [...(pm.details.accounts || [])];

          if (accounts[index]) {
            accounts[index] = { ...accounts[index], [accountField]: value };
          }

          return { ...pm, details: { ...pm.details, accounts } };
        } else {
          // Handle bank transfer and other simple fields
          return { ...pm, details: { ...pm.details, [field]: value } };
        }
      }),
    }));
  };

  const addMobileMoneyAccount = () => {
    setFormData((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map((pm) =>
        pm.type === "mobile_money"
          ? {
            ...pm,
            details: {
              ...pm.details,
              accounts: [
                ...(pm.details.accounts || []),
                { provider: "", number: "", accountName: "" }
              ]
            }
          }
          : pm
      ),
    }));
  };

  const removeMobileMoneyAccount = (accountIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map((pm) =>
        pm.type === "mobile_money"
          ? {
            ...pm,
            details: {
              ...pm.details,
              accounts: (pm.details.accounts || []).filter((_, index) => index !== accountIndex)
            }
          }
          : pm
      ),
    }));
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    try {
      const storefrontData = {
        businessName: formData.businessName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '').replace(/-+/g, '-'),
        displayName: formData.displayName.trim(),
        isActive: true,
        paymentMethods: formData.paymentMethods.filter((pm) => pm.isActive),
        contactInfo: {
          phone: formData.phone.trim(),
          email: formData.email.trim() || undefined,
          address: formData.address.trim() || undefined,
        },
      };

      const result =
        await storefrontService.createStorefront(storefrontData);
      addToast(result.message || "Storefront created successfully!", "success");
      onComplete(result.data);
    } catch (error) {
      console.error("Failed to create storefront:", error);
      addToast(getApiErrorMessage(error, "Failed to create storefront"), "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <Dialog isOpen={isOpen} onClose={onClose} size="md">
        <DialogBody className="p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: "var(--color-primary)" }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            Setting up your wizard
          </h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Loading your profile information...
          </p>
        </DialogBody>
      </Dialog>
    );
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="xl">
      <DialogHeader
        className="relative p-6"
        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--text-inverse)' }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4"
          style={{ color: 'var(--text-inverse)' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--text-inverse) 20%, transparent)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--text-inverse) 20%, transparent)' }}>
            <Store className="w-6 h-6" style={{ color: 'var(--text-inverse)' }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-inverse)' }}>Create Your Store</h2>
            <p className="text-sm" style={{ color: 'color-mix(in srgb, var(--text-inverse) 80%, transparent)' }}>
              Launch your digital storefront in minutes
            </p>
          </div>
        </div>

        <div className="mt-6">
          <StepProgress
            current={currentStep + 1}
            steps={STEPS.map((step) => step.title)}
          />
        </div>
      </DialogHeader>

      <DialogBody className="p-6 overflow-y-auto max-h-[60vh]">
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
            {STEPS[currentStep].title}
          </h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {STEPS[currentStep].description}
          </p>
        </div>

        {/* Step Content */}
        {currentStep === 0 && (
          <div className="space-y-5">
            <FormField
              label="Business Name (URL slug)"
              required
            >
              <Input
                value={formData.businessName}
                onChange={(e) =>
                  handleFieldChange("businessName", e.target.value)
                }
                placeholder="your-business-name"
                leftIcon={<Store className="w-4 h-4" />}
    
              />
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                This is used in your storefront URL and must be lowercase with no spaces.
              </p>
              {businessUrlPreview() && (
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  Preview: <span className="font-mono">{businessUrlPreview()}</span>
                </p>
              )}
            </FormField>

            <FormField
              label="Display Name"
              required
            >
              <Input
                value={formData.displayName}
                onChange={(e) =>
                  handleFieldChange("displayName", e.target.value)
                }
                placeholder="How your store appears to customers"
                leftIcon={<Store className="w-4 h-4" />}
    
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Contact Phone" required>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                  placeholder="Customer contact number"
                  leftIcon={<Phone className="w-4 h-4" />}
      
                />
              </FormField>

              <FormField label="Email Address">
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  placeholder="Optional email address"
                  leftIcon={<Mail className="w-4 h-4" />}
      
                />
              </FormField>
            </div>

            <FormField label="Business Address">
              <Input
                value={formData.address}
                onChange={(e) => handleFieldChange("address", e.target.value)}
                placeholder="Optional business location"
                leftIcon={<MapPin className="w-4 h-4" />}
    
              />
            </FormField>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-5">
            {errors.paymentMethods && (
              <Alert status="error">
                <AlertCircle className="w-4 h-4" />
                {errors.paymentMethods}
              </Alert>
            )}

            <div className="space-y-3">
              {PAYMENT_OPTIONS.map((option) => {
                const isSelected = formData.paymentMethods.some(
                  (pm) => pm.type === option.type && pm.isActive,
                );
                const method = formData.paymentMethods.find(
                  (pm) => pm.type === option.type,
                );
                const IconComponent = option.icon;

                return (
                  <div key={option.type} className="space-y-3">
                    <Card
                      variant={isSelected ? "elevated" : "outlined"}
                      className={`transition-all border-2 ${option.available ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                      style={
                        isSelected
                          ? {
                            borderColor: "var(--color-primary)",
                            backgroundColor: `color-mix(in srgb, var(--color-primary) 8%, transparent)`,
                          }
                          : option.available
                            ? { borderColor: "var(--border-color)" }
                            : { borderColor: "var(--border-color)", opacity: 0.6 }
                      }
                    >
                      <CardBody
                        className="p-4"
                        onClick={(event) => {
                          event.stopPropagation();
                          if (option.available) {
                            togglePaymentMethod(
                              option.type as "mobile_money" | "bank_transfer",
                            );
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{
                              backgroundColor: isSelected
                                ? `color-mix(in srgb, var(--color-primary) 15%, transparent)`
                                : "var(--bg-surface-alt)",
                            }}
                          >
                            <IconComponent
                              className="w-5 h-5"
                              style={{
                                color: isSelected
                                  ? "var(--color-primary)"
                                  : "var(--text-secondary)",
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium" style={{ color: "var(--text-primary)" }}>
                              {option.label}
                            </h4>
                            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                              {option.description}
                            </p>
                          </div>
                          <div
                            className="w-5 h-5 border-2 rounded-full flex items-center justify-center"
                            style={{
                              borderColor: isSelected ? "var(--color-primary)" : "var(--border-color)",
                              backgroundColor: isSelected ? "var(--color-primary)" : "transparent",
                            }}
                          >
                            {isSelected && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    {isSelected && method && (
                      <div className="ml-4 space-y-3 p-4 rounded-lg" style={{ backgroundColor: "var(--bg-surface-alt)" }}>
                        {option.type === "mobile_money" && (
                          <div className="space-y-4">
                            {(method.details.accounts || []).map((account, accountIndex) => (
                              <div key={accountIndex} className="p-4 rounded-lg" style={{ border: "1px solid var(--border-color)" }}>
                                <div className="flex items-center justify-between mb-3">
                                  <h5 className="font-medium" style={{ color: "var(--text-primary)" }}>
                                    Account {accountIndex + 1}
                                  </h5>
                                  {(method.details.accounts || []).length > 1 && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeMobileMoneyAccount(accountIndex)}
                                      style={{ color: "var(--error)" }}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <FormField label="Provider">
                                    <Select
                                      value={account.provider}
                                      onChange={(value) =>
                                        updatePaymentDetails(
                                          option.type,
                                          `accounts.${accountIndex}.provider`,
                                          value,
                                        )
                                      }
                                      options={[
                                        { value: "MTN", label: "MTN" },
                                        { value: "Vodafone", label: "Vodafone" },
                                        { value: "AirtelTigo", label: "AirtelTigo" },
                                      ]}
                                      placeholder="Select provider"
                                    />
                                  </FormField>
                                  <FormField label="Phone Number">
                                    <Input
                                      value={account.number}
                                      onChange={(e) =>
                                        updatePaymentDetails(
                                          option.type,
                                          `accounts.${accountIndex}.number`,
                                          e.target.value,
                                        )
                                      }
                                      placeholder="e.g., 0241234567"
                          
                                    />
                                  </FormField>
                                  <FormField label="Account Name">
                                    <Input
                                      value={account.accountName}
                                      onChange={(e) =>
                                        updatePaymentDetails(
                                          option.type,
                                          `accounts.${accountIndex}.accountName`,
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Account holder name"
                          
                                    />
                                  </FormField>
                                </div>
                              </div>
                            ))}
                            {(method.details.accounts || []).length < 2 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={addMobileMoneyAccount}
                                className="w-full"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Another Account
                              </Button>
                            )}
                          </div>
                        )}

                        {option.type === "bank_transfer" && (
                          <div className="space-y-3">
                            <FormField label="Bank Name">
                              <Input
                                value={String(method.details.bank || "")}
                                onChange={(e) =>
                                  updatePaymentDetails(
                                    option.type,
                                    "bank",
                                    e.target.value,
                                  )
                                }
                                placeholder="e.g., GCB Bank"
                    
                              />
                            </FormField>
                            <FormField label="Account Number">
                              <Input
                                value={String(method.details.account || "")}
                                onChange={(e) =>
                                  updatePaymentDetails(
                                    option.type,
                                    "account",
                                    e.target.value,
                                  )
                                }
                                placeholder="Account number"
                    
                              />
                            </FormField>
                            <FormField label="Account Name">
                              <Input
                                value={String(method.details.name || "")}
                                onChange={(e) =>
                                  updatePaymentDetails(
                                    option.type,
                                    "name",
                                    e.target.value,
                                  )
                                }
                                placeholder="Account holder name"
                    
                              />
                            </FormField>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <Card
              variant="outlined"
              style={{
                borderColor: `color-mix(in srgb, var(--success) 30%, transparent)`,
                backgroundColor: `color-mix(in srgb, var(--success) 6%, transparent)`,
              }}
            >
              <CardBody className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `color-mix(in srgb, var(--success) 15%, transparent)` }}>
                    <Store className="w-4 h-4" style={{ color: "var(--success)" }} />
                  </div>
                  <h4 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                    Business Details
                  </h4>
                </div>
                <div className="text-sm space-y-1" style={{ color: "var(--text-primary)" }}>
                  <p>
                    <strong>Name:</strong> {formData.businessName}
                  </p>
                  <p>
                    <strong>Phone:</strong> {formData.phone}
                  </p>
                  {formData.email && (
                    <p>
                      <strong>Email:</strong> {formData.email}
                    </p>
                  )}
                  {formData.address && (
                    <p>
                      <strong>Address:</strong> {formData.address}
                    </p>
                  )}
                </div>
              </CardBody>
            </Card>

            <Card
              variant="outlined"
              style={{
                borderColor: `color-mix(in srgb, var(--color-primary) 30%, transparent)`,
                backgroundColor: `color-mix(in srgb, var(--color-primary) 6%, transparent)`,
              }}
            >
              <CardBody className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: `color-mix(in srgb, var(--color-primary) 15%, transparent)`,
                    }}
                  >
                    <CreditCard
                      className="w-4 h-4"
                      style={{
                        color: "var(--color-primary)",
                      }}
                    />
                  </div>
                  <h4 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                    Payment Methods
                  </h4>
                </div>
                <div className="space-y-2">
                  {formData.paymentMethods
                    .filter((pm) => pm.isActive)
                    .map((method, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Badge variant="subtle" colorScheme="success">
                          {
                            PAYMENT_OPTIONS.find(
                              (opt) => opt.type === method.type,
                            )?.label
                          }
                        </Badge>
                        {method.type === "mobile_money" && method.details.accounts && method.details.accounts.length > 0 && (
                          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                            {method.details.accounts.map((account, idx) => (
                              <div key={idx}>
                                {account.provider} - {account.number}
                                {idx < (method.details.accounts?.length || 0) - 1 && ", "}
                              </div>
                            ))}
                          </div>
                        )}
                        {method.type === "bank_transfer" &&
                          Boolean(method.details.bank) && (
                            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                              ({String(method.details.bank)} -{" "}
                              {String(method.details.account)})
                            </span>
                          )}
                      </div>
                    ))}
                </div>
              </CardBody>
            </Card>

            <Alert status="info">
              <Check className="w-4 h-4" />
              You're all set! After creating your storefront, you can customize
              pricing and manage orders.
            </Alert>
          </div>
        )}
      </DialogBody>

      <DialogFooter justify="between" style={{ backgroundColor: "var(--bg-surface-alt)" }}>
        <Button
          variant="outline"
          onClick={currentStep === 0 ? onClose : handleBack}
        >
          {currentStep === 0 ? (
            <>
              <X className="w-4 h-4 mr-2" /> Cancel
            </>
          ) : (
            <>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </>
          )}
        </Button>

        <div className="text-sm" style={{ color: "var(--text-muted)" }}>
          Step {currentStep + 1} of {STEPS.length}
        </div>

        <Button
          variant="primary"
          onClick={currentStep === STEPS.length - 1 ? handleSubmit : handleNext}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...
            </>
          ) : currentStep === STEPS.length - 1 ? (
            <>
              <Check className="w-4 h-4 mr-2" /> Create Store
            </>
          ) : (
            <>
              Next <ArrowRight className="w-4 h-4 mr-2" />
            </>
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
