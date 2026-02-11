import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  FormField,
  Input,
  Select,
  Textarea,
  Badge,
  Alert,
  Switch,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../design-system";
import { useToast } from "../../design-system";
import {
  storefrontService,
  type StorefrontData,
} from "../../services/storefront.service";
import { getApiErrorMessage } from "../../utils/error-helpers";
import {
  Store,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Smartphone,
  Banknote,
  Share2,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Plus,
  X,
  Settings,
  Calendar,
  Info,
  Save,
  MessageCircle,
  Palette,
  Eye,
  Image,
  Type,
  Facebook,
  Instagram,
  Twitter,
  Globe,
} from "lucide-react";

// --- Types ---

interface StorefrontSettingsProps {
  storefront: StorefrontData;
  onUpdate: (updatedStorefront: StorefrontData) => void;
}

interface PaymentMethodForm {
  type: "mobile_money" | "bank_transfer";
  details: {
    accounts?: Array<{
      provider: string;
      number: string;
      accountName: string;
    }>;
    bank?: string;
    account?: string;
    name?: string;
  };
  isActive: boolean;
}

interface FormErrors {
  businessName?: string;
  phone?: string;
  email?: string;
  paymentMethods?: string;
}

// --- Constants ---

const PAYMENT_TYPE_OPTIONS = [
  { value: "mobile_money", label: "Mobile Money" },
  { value: "bank_transfer", label: "Bank Transfer" },
];

const MOMO_PROVIDER_OPTIONS = [
  { value: "", label: "Select provider" },
  { value: "MTN", label: "MTN" },
  { value: "Vodafone", label: "Vodafone" },
  { value: "AirtelTigo", label: "AirtelTigo" },
];

// --- Component ---

export const StorefrontSettings: React.FC<StorefrontSettingsProps> = ({
  storefront,
  onUpdate,
}) => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    businessName: storefront.businessName || "",
    description: storefront.description || "",
    phone: storefront.contactInfo?.phone || "",
    email: storefront.contactInfo?.email || "",
    whatsapp: storefront.contactInfo?.whatsapp || "",
    address: storefront.contactInfo?.address || "",
  });

  // Branding state
  const [brandingData, setBrandingData] = useState({
    logoUrl: storefront.branding?.logoUrl || "",
    bannerUrl: storefront.branding?.bannerUrl || "",
    tagline: storefront.branding?.tagline || "",
    primaryColor: storefront.branding?.customColors?.primary || "",
    secondaryColor: storefront.branding?.customColors?.secondary || "",
    accentColor: storefront.branding?.customColors?.accent || "",
    facebook: storefront.branding?.socialLinks?.facebook || "",
    instagram: storefront.branding?.socialLinks?.instagram || "",
    twitter: storefront.branding?.socialLinks?.twitter || "",
    tiktok: storefront.branding?.socialLinks?.tiktok || "",
    layout: storefront.branding?.layout || "classic",
    showBanner: storefront.branding?.showBanner ?? true,
    footerText: storefront.branding?.footerText || "",
    theme: storefront.settings?.theme || "blue",
    showContact: storefront.settings?.showContact ?? true,
  });

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodForm[]>(
    storefront.paymentMethods || [],
  );

  const [errors, setErrors] = useState<FormErrors>({});

  // --- Validation ---

  const validateGeneral = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required";
    } else if (formData.businessName.length < 3) {
      newErrors.businessName = "Business name must be at least 3 characters";
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePaymentMethods = (): boolean => {
    const activePayments = paymentMethods.filter((pm) => pm.isActive);

    if (activePayments.length === 0) {
      setErrors({
        paymentMethods: "At least one payment method must be active",
      });
      return false;
    }

    for (const payment of activePayments) {
      if (payment.type === "mobile_money") {
        const accounts = payment.details.accounts || [];
        if (accounts.length === 0) {
          setErrors({
            paymentMethods: "At least one mobile money account is required",
          });
          return false;
        }
        for (let i = 0; i < accounts.length; i++) {
          const account = accounts[i];
          if (!account.provider) {
            setErrors({
              paymentMethods: `Account ${i + 1}: Please select a provider`,
            });
            return false;
          }
          if (!account.number) {
            setErrors({
              paymentMethods: `Account ${i + 1}: Phone number is required`,
            });
            return false;
          }
          if (!account.accountName) {
            setErrors({
              paymentMethods: `Account ${i + 1}: Account name is required`,
            });
            return false;
          }
        }
      }
      if (
        payment.type === "bank_transfer" &&
        (!payment.details.account || !payment.details.bank)
      ) {
        setErrors({
          paymentMethods:
            "Bank account details are required for active bank transfer method",
        });
        return false;
      }
    }

    setErrors({});
    return true;
  };

  // --- Handlers ---

  const handleFormChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBrandingChange = (field: string, value: unknown) => {
    setBrandingData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePaymentMethodChange = (
    index: number,
    field: string,
    value: string | boolean,
  ) => {
    const updated = [...paymentMethods];
    if (field === "isActive") {
      updated[index].isActive = value as boolean;
    } else {
      updated[index].details = { ...updated[index].details, [field]: value };
    }
    setPaymentMethods(updated);

    if (errors.paymentMethods) {
      setErrors((prev) => ({ ...prev, paymentMethods: undefined }));
    }
  };

  const updateMomoAccount = useCallback(
    (
      methodIndex: number,
      accountIndex: number,
      field: string,
      value: string,
    ) => {
      setPaymentMethods((prev) => {
        const updated = [...prev];
        const accounts = [...(updated[methodIndex].details.accounts || [])];
        accounts[accountIndex] = { ...accounts[accountIndex], [field]: value };
        updated[methodIndex] = {
          ...updated[methodIndex],
          details: { ...updated[methodIndex].details, accounts },
        };
        return updated;
      });
      if (errors.paymentMethods) {
        setErrors((prev) => ({ ...prev, paymentMethods: undefined }));
      }
    },
    [errors.paymentMethods],
  );

  const addPaymentMethod = (type: "mobile_money" | "bank_transfer") => {
    const newMethod: PaymentMethodForm = {
      type,
      details:
        type === "mobile_money"
          ? { accounts: [{ provider: "", number: "", accountName: "" }] }
          : { account: "", bank: "", name: "" },
      isActive: false,
    };
    setPaymentMethods((prev) => [...prev, newMethod]);
  };

  const removePaymentMethod = (index: number) => {
    setPaymentMethods((prev) => prev.filter((_, i) => i !== index));
  };

  const addMomoAccount = (methodIndex: number) => {
    setPaymentMethods((prev) => {
      const updated = [...prev];
      updated[methodIndex] = {
        ...updated[methodIndex],
        details: {
          ...updated[methodIndex].details,
          accounts: [
            ...(updated[methodIndex].details.accounts || []),
            { provider: "", number: "", accountName: "" },
          ],
        },
      };
      return updated;
    });
  };

  const removeMomoAccount = (methodIndex: number, accountIndex: number) => {
    setPaymentMethods((prev) => {
      const updated = [...prev];
      updated[methodIndex] = {
        ...updated[methodIndex],
        details: {
          ...updated[methodIndex].details,
          accounts: (updated[methodIndex].details.accounts || []).filter(
            (_, i) => i !== accountIndex,
          ),
        },
      };
      return updated;
    });
  };

  // --- API Actions ---

  const saveGeneralSettings = async () => {
    if (!validateGeneral()) return;

    try {
      setIsLoading(true);
      const updateData = {
        businessName: formData.businessName.trim(),
        description: formData.description.trim() || undefined,
        contactInfo: {
          phone: formData.phone.trim(),
          email: formData.email.trim() || undefined,
          whatsapp: formData.whatsapp.trim() || undefined,
          address: formData.address.trim() || undefined,
        },
      };
      const updatedStorefront =
        await storefrontService.updateStorefront(updateData);
      onUpdate(updatedStorefront);
      addToast("General settings updated successfully!", "success");
    } catch (error) {
      addToast(getApiErrorMessage(error, "Failed to update settings"), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const savePaymentSettings = async () => {
    if (!validatePaymentMethods()) return;

    try {
      setIsLoading(true);
      const updateData = {
        paymentMethods: paymentMethods.filter(
          (pm) =>
            pm.isActive ||
            paymentMethods.filter((p) => p.isActive).length === 0,
        ),
      };
      const updatedStorefront =
        await storefrontService.updateStorefront(updateData);
      onUpdate(updatedStorefront);
      addToast("Payment methods updated successfully!", "success");
    } catch (error) {
      addToast(
        getApiErrorMessage(error, "Failed to update payment methods"),
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const saveBrandingSettings = async () => {
    try {
      setIsLoading(true);
      const updateData = {
        branding: {
          logoUrl: brandingData.logoUrl.trim() || undefined,
          bannerUrl: brandingData.bannerUrl.trim() || undefined,
          tagline: brandingData.tagline.trim() || undefined,
          customColors: {
            primary: brandingData.primaryColor.trim() || undefined,
            secondary: brandingData.secondaryColor.trim() || undefined,
            accent: brandingData.accentColor.trim() || undefined,
          },
          socialLinks: {
            facebook: brandingData.facebook.trim() || undefined,
            instagram: brandingData.instagram.trim() || undefined,
            twitter: brandingData.twitter.trim() || undefined,
            tiktok: brandingData.tiktok.trim() || undefined,
          },
          layout: brandingData.layout,
          showBanner: brandingData.showBanner,
          footerText: brandingData.footerText.trim() || undefined,
        },
        settings: {
          theme: brandingData.theme,
          showContact: brandingData.showContact,
        },
      };
      const updatedStorefront =
        await storefrontService.updateStorefront(updateData);
      onUpdate(updatedStorefront);
      addToast("Branding settings updated successfully!", "success");
    } catch (error) {
      addToast(
        getApiErrorMessage(error, "Failed to update branding settings"),
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStoreStatus = async () => {
    try {
      setIsLoading(true);
      if (storefront.isActive) {
        await storefrontService.deactivateStorefront();
        onUpdate({ ...storefront, isActive: false });
        addToast(
          "Storefront deactivated. You can reactivate anytime.",
          "success",
        );
      } else {
        await storefrontService.reactivateStorefront();
        onUpdate({ ...storefront, isActive: true });
        addToast("Storefront reactivated!", "success");
      }
    } catch (error) {
      addToast(
        getApiErrorMessage(error, "Failed to update store status"),
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStorefront = async () => {
    try {
      setIsLoading(true);
      await storefrontService.deleteStorefront();
      addToast("Storefront deleted successfully", "success");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      addToast(
        getApiErrorMessage(error, "Failed to delete storefront"),
        "error",
      );
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const getStorefrontUrl = () =>
    `${window.location.origin}/store/${storefront.businessName}`;

  const copyStorefrontUrl = async () => {
    try {
      await navigator.clipboard.writeText(getStorefrontUrl());
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
      addToast("Storefront URL copied!", "success");
    } catch {
      addToast("Failed to copy URL", "error");
    }
  };

  // --- Computed ---

  const storeStatusColor = storefront.suspendedByAdmin
    ? "error"
    : storefront.isActive
      ? "success"
      : ("gray" as const);

  const storeStatusLabel = storefront.suspendedByAdmin
    ? "Suspended by Admin"
    : storefront.isActive
      ? "Active"
      : "Inactive";

  // --- Render: Payment method card ---

  const renderPaymentMethodCard = (
    method: PaymentMethodForm,
    index: number,
  ) => (
    <Card key={index} variant="outlined" className="mb-3 sm:mb-4">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="subtle"
              colorScheme={method.isActive ? "success" : "gray"}
            >
              {method.type === "mobile_money" && (
                <Smartphone className="w-3 h-3 mr-1" />
              )}
              {method.type === "bank_transfer" && (
                <Banknote className="w-3 h-3 mr-1" />
              )}
              {
                PAYMENT_TYPE_OPTIONS.find((opt) => opt.value === method.type)
                  ?.label
              }
            </Badge>
            <Switch
              size="sm"
              colorScheme="success"
              checked={method.isActive}
              onCheckedChange={(checked) =>
                handlePaymentMethodChange(index, "isActive", checked)
              }
              label="Active"
            />
          </div>
          {paymentMethods.length > 1 && (
            <Button
              variant="danger"
              size="xs"
              onClick={() => removePaymentMethod(index)}
              leftIcon={<X className="w-3.5 h-3.5" />}
            >
              Remove
            </Button>
          )}
        </div>
      </CardHeader>

      {method.isActive && (
        <CardBody className="pt-2">
          {method.type === "mobile_money" && (
            <div className="space-y-3 sm:space-y-4">
              {(method.details.accounts || []).map((account, accountIdx) => (
                <div
                  key={accountIdx}
                  className="p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium text-gray-900">
                      Account {accountIdx + 1}
                    </h5>
                    {(method.details.accounts || []).length > 1 && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => removeMomoAccount(index, accountIdx)}
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <FormField label="Provider">
                      <Select
                        value={account.provider}
                        onChange={(val) =>
                          updateMomoAccount(index, accountIdx, "provider", val)
                        }
                        options={MOMO_PROVIDER_OPTIONS}
                        placeholder="Select provider"
                        size="sm"
                      />
                    </FormField>
                    <FormField label="Phone Number">
                      <Input
                        value={account.number}
                        onChange={(e) =>
                          updateMomoAccount(
                            index,
                            accountIdx,
                            "number",
                            e.target.value,
                          )
                        }
                        placeholder="e.g., 0241234567"
                        leftIcon={<Phone className="w-3.5 h-3.5" />}
                        size="sm"
                      />
                    </FormField>
                    <FormField label="Account Name">
                      <Input
                        value={account.accountName}
                        onChange={(e) =>
                          updateMomoAccount(
                            index,
                            accountIdx,
                            "accountName",
                            e.target.value,
                          )
                        }
                        placeholder="Account holder name"
                        size="sm"
                      />
                    </FormField>
                  </div>
                </div>
              ))}
              {(method.details.accounts || []).length < 2 && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => addMomoAccount(index)}
                  className="w-full"
                >
                  Add Another Account (max 2)
                </Button>
              )}
            </div>
          )}

          {method.type === "bank_transfer" && (
            <div className="space-y-3">
              <FormField label="Bank Name" required>
                <Input
                  value={method.details.bank || ""}
                  onChange={(e) =>
                    handlePaymentMethodChange(
                      index,
                      "bank",
                      e.target.value,
                    )
                  }
                  placeholder="e.g., GCB Bank"
                  leftIcon={<Banknote className="w-4 h-4" />}
                />
              </FormField>
              <FormField label="Account Number" required>
                <Input
                  value={method.details.account || ""}
                  onChange={(e) =>
                    handlePaymentMethodChange(
                      index,
                      "account",
                      e.target.value,
                    )
                  }
                  placeholder="Account number"
                  leftIcon={<CreditCard className="w-4 h-4" />}
                />
              </FormField>
              <FormField label="Account Name" required>
                <Input
                  value={method.details.name || ""}
                  onChange={(e) =>
                    handlePaymentMethodChange(
                      index,
                      "name",
                      e.target.value,
                    )
                  }
                  placeholder="Account holder name"
                />
              </FormField>
            </div>
          )}
        </CardBody>
      )}
    </Card>
  );

  // --- Render ---

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-gray-700 shrink-0" />
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Storefront Settings
          </h2>
          <p className="text-sm text-gray-500">
            Manage your storefront configuration and preferences
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto -mx-1 px-1 sticky top-0 z-10 bg-white pb-2">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 min-w-max sm:min-w-0">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="sharing">Share</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
        </div>

        {/* ===== General Settings ===== */}
        <TabsContent value="general" className="space-y-6">
          {/* Store Status banner */}
          <div className="p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge colorScheme={storeStatusColor}>
                  {storeStatusLabel}
                </Badge>
                <span className="text-sm text-gray-600">
                  {storefront.suspendedByAdmin
                    ? "Suspended by an administrator"
                    : storefront.isActive
                      ? "Customers can place orders"
                      : "Customers cannot place orders"}
                </span>
              </div>
              {!storefront.suspendedByAdmin && (
                <Button
                  variant={storefront.isActive ? "danger" : "success"}
                  size="sm"
                  onClick={toggleStoreStatus}
                  isLoading={isLoading}
                >
                  {storefront.isActive ? "Deactivate Store" : "Reactivate Store"}
                </Button>
              )}
            </div>
            {storefront.suspendedByAdmin && storefront.suspensionReason && (
              <Alert status="error" variant="left-accent">
                <AlertTriangle className="w-4 h-4" />
                <span className="ml-2">Reason: {storefront.suspensionReason}</span>
              </Alert>
            )}
          </div>

          {/* Business Information */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <Store className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Business Information
              </h3>
            </div>

            <FormField label="Business Name" required>
              <Input
                value={formData.businessName}
                onChange={(e) => handleFormChange("businessName", e.target.value)}
                placeholder="Your business name"
                leftIcon={<Store className="w-4 h-4" />}
              />
              {errors.businessName && (
                <p className="text-sm text-red-600 mt-1">{errors.businessName}</p>
              )}
            </FormField>

            <FormField label="Business Description">
              <Textarea
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleFormChange("description", e.target.value)
                }
                placeholder="Describe your store — what you sell, why customers should shop here (max 500 chars)"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {formData.description.length}/500
              </p>
            </FormField>
          </section>

          {/* Contact Details */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <Phone className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Contact Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Contact Phone" required>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleFormChange("phone", e.target.value)}
                  placeholder="Phone number"
                  leftIcon={<Phone className="w-4 h-4" />}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                )}
              </FormField>

              <FormField label="Email Address">
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  placeholder="Optional email"
                  leftIcon={<Mail className="w-4 h-4" />}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
              </FormField>

              <FormField label="WhatsApp Number">
                <Input
                  value={formData.whatsapp}
                  onChange={(e) => handleFormChange("whatsapp", e.target.value)}
                  placeholder="Optional WhatsApp number"
                  leftIcon={<MessageCircle className="w-4 h-4" />}
                />
              </FormField>
            </div>

            <FormField label="Business Address">
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <Textarea
                  value={formData.address}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleFormChange("address", e.target.value)
                  }
                  placeholder="Optional business address"
                  rows={2}
                  className="pl-10"
                />
              </div>
            </FormField>
          </section>

          {/* Save */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={saveGeneralSettings}
              isLoading={isLoading}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save General Settings
            </Button>
          </div>
        </TabsContent>

        {/* ===== Branding & Customization ===== */}
        <TabsContent value="branding" className="space-y-6">
          {/* Appearance & Theme */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <Palette className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Appearance & Theme
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Store Theme Color">
                <Select
                  value={brandingData.theme}
                  onChange={(val) => handleBrandingChange("theme", val)}
                  options={[
                    { value: "blue", label: "Blue" },
                    { value: "green", label: "Green" },
                    { value: "purple", label: "Purple" },
                    { value: "red", label: "Red" },
                    { value: "orange", label: "Orange" },
                    { value: "teal", label: "Teal" },
                    { value: "indigo", label: "Indigo" },
                    { value: "pink", label: "Pink" },
                  ]}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Sets the accent color on your public storefront page
                </p>
              </FormField>

              <FormField label="Store Layout">
                <Select
                  value={brandingData.layout}
                  onChange={(val) => handleBrandingChange("layout", val)}
                  options={[
                    { value: "classic", label: "Classic — Standard header" },
                    { value: "modern", label: "Modern — Large banner overlay" },
                    { value: "minimal", label: "Minimal — Clean, text-focused" },
                  ]}
                />
                <p className="text-xs text-gray-500 mt-1">
                  How your public storefront looks to customers
                </p>
              </FormField>
            </div>

            <FormField label="Store Tagline">
              <Input
                value={brandingData.tagline}
                onChange={(e) => handleBrandingChange("tagline", e.target.value)}
                placeholder="e.g. Best data deals in town!"
                leftIcon={<Type className="w-4 h-4" />}
                maxLength={120}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {brandingData.tagline.length}/120
              </p>
            </FormField>

            <FormField label="Footer Text">
              <Input
                value={brandingData.footerText}
                onChange={(e) => handleBrandingChange("footerText", e.target.value)}
                placeholder="e.g. © 2025 My Business. All rights reserved."
                maxLength={200}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {brandingData.footerText.length}/200 — Shown at the bottom of your store
              </p>
            </FormField>

            {/* Toggle row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Show Contact Info</p>
                    <p className="text-xs text-gray-500">Phone, email on public store</p>
                  </div>
                </div>
                <Switch
                  checked={brandingData.showContact}
                  onCheckedChange={(checked) => handleBrandingChange("showContact", checked)}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Show Banner</p>
                    <p className="text-xs text-gray-500">Display banner on public store</p>
                  </div>
                </div>
                <Switch
                  checked={brandingData.showBanner}
                  onCheckedChange={(checked) => handleBrandingChange("showBanner", checked)}
                />
              </div>
            </div>
          </section>

          {/* Logo & Banner */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <Image className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Logo & Banner
              </h3>
            </div>

            <FormField label="Logo URL">
              <Input
                value={brandingData.logoUrl}
                onChange={(e) => handleBrandingChange("logoUrl", e.target.value)}
                placeholder="https://example.com/logo.png"
                leftIcon={<Image className="w-4 h-4" />}
              />
              <p className="text-xs text-gray-500 mt-1">
                Paste a URL to your logo image (recommended: square, 200x200px)
              </p>
              {brandingData.logoUrl && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                  <img
                    src={brandingData.logoUrl}
                    alt="Logo preview"
                    className="w-12 h-12 rounded-lg object-cover border"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <span className="text-sm text-gray-600">Logo preview</span>
                </div>
              )}
            </FormField>

            <FormField label="Banner Image URL">
              <Input
                value={brandingData.bannerUrl}
                onChange={(e) => handleBrandingChange("bannerUrl", e.target.value)}
                placeholder="https://example.com/banner.jpg"
                leftIcon={<Image className="w-4 h-4" />}
              />
              <p className="text-xs text-gray-500 mt-1">
                A wide banner for your store header (recommended: 1200x300px)
              </p>
              {brandingData.bannerUrl && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={brandingData.bannerUrl}
                    alt="Banner preview"
                    className="w-full h-24 rounded-lg object-cover border"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
            </FormField>
          </section>

          {/* Social Links */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <Globe className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Social Links
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Facebook">
                <Input
                  value={brandingData.facebook}
                  onChange={(e) => handleBrandingChange("facebook", e.target.value)}
                  placeholder="https://facebook.com/yourbusiness"
                  leftIcon={<Facebook className="w-4 h-4" />}
                />
              </FormField>
              <FormField label="Instagram">
                <Input
                  value={brandingData.instagram}
                  onChange={(e) => handleBrandingChange("instagram", e.target.value)}
                  placeholder="https://instagram.com/yourbusiness"
                  leftIcon={<Instagram className="w-4 h-4" />}
                />
              </FormField>
              <FormField label="Twitter / X">
                <Input
                  value={brandingData.twitter}
                  onChange={(e) => handleBrandingChange("twitter", e.target.value)}
                  placeholder="https://x.com/yourbusiness"
                  leftIcon={<Twitter className="w-4 h-4" />}
                />
              </FormField>
              <FormField label="TikTok">
                <Input
                  value={brandingData.tiktok}
                  onChange={(e) => handleBrandingChange("tiktok", e.target.value)}
                  placeholder="https://tiktok.com/@yourbusiness"
                  leftIcon={<Globe className="w-4 h-4" />}
                />
              </FormField>
            </div>
          </section>

          {/* Save */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={saveBrandingSettings}
              isLoading={isLoading}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Branding Settings
            </Button>
          </div>
        </TabsContent>

        {/* ===== Payment Methods ===== */}
        <TabsContent value="payment" className="space-y-6">
          <section className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Payment Methods
                </h3>
              </div>
              <p className="text-xs text-gray-500 hidden sm:block">
                Configure how customers can pay
              </p>
            </div>

            {errors.paymentMethods && (
              <Alert status="error" variant="left-accent">
                <AlertTriangle className="w-4 h-4" />
                <span className="ml-2">{errors.paymentMethods}</span>
              </Alert>
            )}

            <div className="space-y-3">
              {paymentMethods.map((method, index) =>
                renderPaymentMethodCard(method, index),
              )}
            </div>

            {/* Add payment method */}
            <div className="pt-3 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add payment method:
              </p>
              <div className="flex flex-wrap gap-2">
                {PAYMENT_TYPE_OPTIONS.filter(
                  (option) =>
                    !paymentMethods.some((pm) => pm.type === option.value),
                ).map((option) => (
                  <Button
                    key={option.value}
                    variant="outline"
                    size="sm"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={() =>
                      addPaymentMethod(
                        option.value as "mobile_money" | "bank_transfer",
                      )
                    }
                  >
                    Add {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </section>

          {/* Save */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={savePaymentSettings}
              isLoading={isLoading}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Payment Methods
            </Button>
          </div>
        </TabsContent>

        {/* ===== Share & Promote ===== */}
        <TabsContent value="sharing" className="space-y-6">
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <Share2 className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Share Your Storefront
              </h3>
            </div>

            <FormField label="Your Storefront URL">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={getStorefrontUrl()}
                  readOnly
                  className="flex-1 bg-gray-50"
                />
                <Button
                  variant={urlCopied ? "success" : "outline"}
                  onClick={copyStorefrontUrl}
                  leftIcon={
                    urlCopied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )
                  }
                  className="shrink-0"
                >
                  {urlCopied ? "Copied!" : "Copy Link"}
                </Button>
              </div>
            </FormField>

            <Alert status="info" variant="left-accent">
              <Info className="w-4 h-4" />
              <span className="ml-2">
                Share this link with your customers so they can browse and
                purchase bundles from your storefront.
              </span>
            </Alert>

            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Promotion Tips</h4>
              <ul className="text-sm text-gray-600 space-y-1.5">
                <li>• Share on WhatsApp groups and social media</li>
                <li>• Include in business cards and promotional materials</li>
                <li>• Add to your WhatsApp status and social media bios</li>
                <li>• Send directly to customers who inquire about bundles</li>
              </ul>
            </div>
          </section>
        </TabsContent>

        {/* ===== Advanced Settings ===== */}
        <TabsContent value="advanced" className="space-y-6">
          {/* Storefront Information */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <Info className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Storefront Information
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-0.5">
                  <Calendar className="w-3 h-3" /> Created
                </p>
                <p className="font-medium text-sm">
                  {new Date(storefront.createdAt!).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-0.5">
                  <Calendar className="w-3 h-3" /> Updated
                </p>
                <p className="font-medium text-sm">
                  {new Date(storefront.updatedAt!).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Status</p>
                <Badge variant="subtle" colorScheme={storeStatusColor}>
                  {storefront.suspendedByAdmin ? (
                    "Suspended"
                  ) : storefront.isActive ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                    </>
                  ) : (
                    "Inactive"
                  )}
                </Badge>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-xs text-gray-500 mb-0.5">Storefront ID</p>
                <p className="font-mono text-xs truncate">{storefront._id}</p>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section>
            <div className="border border-red-200 rounded-xl p-4 bg-red-50">
              <h4 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Danger Zone
              </h4>
              <p className="text-sm text-red-700 mb-4">
                Deleting your storefront is permanent and cannot be undone. All
                custom pricing and order history will be lost.
              </p>
              <Button
                variant="danger"
                leftIcon={<Trash2 className="w-4 h-4" />}
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete Storefront
              </Button>
            </div>
          </section>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <DialogHeader>
          <h3 className="text-lg font-semibold text-red-900">
            Delete Storefront
          </h3>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-4">
            <Alert status="error" variant="left-accent">
              <AlertTriangle className="w-5 h-5" />
              <div className="ml-2">
                <strong>Warning:</strong> This action cannot be undone!
              </div>
            </Alert>

            <p className="text-gray-700 text-sm sm:text-base">
              Are you sure you want to delete your storefront &quot;
              {storefront.businessName}&quot;? This will permanently remove:
            </p>

            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Your custom bundle pricing</li>
              <li>Order history and customer data</li>
              <li>Payment method configurations</li>
              <li>Public storefront link access</li>
            </ul>

            <p className="text-sm text-gray-700">
              You can create a new storefront later, but all data will be
              lost.
            </p>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowDeleteDialog(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteStorefront}
            isLoading={isLoading}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Delete Storefront
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};
