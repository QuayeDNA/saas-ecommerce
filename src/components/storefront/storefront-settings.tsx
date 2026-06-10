import React, { useState, useCallback, useEffect } from "react";
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
import { EarningsManager } from './earnings-manager';
import { useToast } from "../../design-system";
import {
  storefrontService,
  type StorefrontData,
} from "../../services/storefront.service";
import { getApiErrorMessage } from "../../utils/error-helpers";
import { getStoreUrl } from "../../utils/store-url";
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
  HelpCircle,
} from "lucide-react";

// --- Types ---

interface StorefrontSettingsProps {
  storefront: StorefrontData;
  onUpdate: (updatedStorefront: StorefrontData) => void;
  initialTab?: string;
  earningsDefaultTab?: 'payouts' | 'earnings';
}

interface PaymentMethodForm {
  type: "mobile_money" | "bank_transfer" | "paystack";
  details: {
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
}

interface FormErrors {
  businessName?: string;
  displayName?: string;
  phone?: string;
  email?: string;
  paymentMethods?: string;
}

// --- Constants ---

/** 20 system-generated taglines — shown on the public store when the agent hasn't set one */
const SYSTEM_TAGLINES = [
  "Fast data, great prices — always.",
  "Your trusted data partner in Ghana.",
  "Affordable bundles, delivered instantly.",
  "Stay connected without breaking the bank.",
  "Top-up in seconds. Browse all day.",
  "Ghana's most reliable data deals.",
  "Smart data for smart people.",
  "Always online, always affordable.",
  "Power up your connection today.",
  "Bundle up and save more.",
  "Reliable data at unbeatable prices.",
  "Your go-to stop for data bundles.",
  "Connecting Ghana, one bundle at a time.",
  "Fastest top-ups, happiest customers.",
  "Data deals that make sense.",
  "Browse more, pay less.",
  "Your network. Your savings. Our service.",
  "Quality bundles from a trusted source.",
  "Instant top-up, zero hassle.",
  "Because staying connected matters.",
];

/** Pick a deterministic tagline based on the storefront businessName so it's stable per store */
function getSystemTagline(businessName: string): string {
  let hash = 0;
  for (let i = 0; i < businessName.length; i++) {
    hash = (hash * 31 + businessName.charCodeAt(i)) >>> 0;
  }
  return SYSTEM_TAGLINES[hash % SYSTEM_TAGLINES.length];
}

/** Deterministic placeholder footer text when none is set */
function getSystemFooterText(businessName: string): string {
  const FOOTER_TEXTS = [
    "Powered by your go-to data partner.",
    "Fast top-ups, trusted by many.",
    "Your connection, our priority.",
    "Serving data bundles with care.",
    "Bringing you fast, reliable bundles.",
    "Stay connected, stay productive.",
    "Data made simple and affordable.",
    "Quick bundle top-ups, anytime.",
    "Trusted data deals for every network.",
    "Your one-stop data shop.",
    "Powered by great service and fast bundles.",
    "Top-up in seconds, connect for hours.",
    "Hassle-free data purchases every time.",
    "Your data, your way.",
    "Built for speed, designed for you.",
    "Smart bundles, smarter savings.",
    "Connecting Ghana, one bundle at a time.",
    "Reliable data — delivered instantly.",
    "Fast, friendly, and always available.",
    "Your favourite source for mobile bundles.",
  ];
  let hash = 0;
  for (let i = 0; i < businessName.length; i++) {
    hash = (hash * 31 + businessName.charCodeAt(i)) >>> 0;
  }
  return FOOTER_TEXTS[hash % FOOTER_TEXTS.length];
}

/** Deterministic placeholder description for stores without one */
function getSystemDescription(displayName: string): string {
  return `Welcome to ${displayName}! We offer fast, affordable data bundles from all major networks in Ghana. Order in seconds and stay connected all day.`;
}

/** SVG data-URI used as the store logo when none is set */
// Removed — frontend now uses /icons/store-icon.png as default

const PAYMENT_TYPE_OPTIONS = [
  { value: "paystack", label: "Paystack (online)" },
  { value: "bank_transfer", label: "Bank Transfer" },
];

const MOMO_PROVIDER_OPTIONS = [
  { value: "", label: "Select provider" },
  { value: "MTN", label: "MTN" },
  { value: "Vodafone", label: "Vodafone" },
  { value: "AirtelTigo", label: "AirtelTigo" },
];

// Inline tooltip for the disabled subaccount field
function SubaccountTooltip() {
  const [visible, setVisible] = React.useState(false);
  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        className="focus:outline-none"
        style={{ color: visible ? "var(--text-secondary)" : "var(--text-muted)" }}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        onClick={() => setVisible((v) => !v)}
        aria-label="Subaccount info"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
      {visible && (
        <span
          className="absolute left-5 top-1/2 -translate-y-1/2 z-50 w-64 rounded-lg text-white text-xs px-3 py-2 shadow-lg pointer-events-none"
          style={{ backgroundColor: "var(--text-primary)" }}
        >
          Paystack subaccount configuration is managed by the platform administrator. Contact support if you need a direct-payout subaccount linked to your store.
        </span>
      )}
    </span>
  );
}

// --- Component ---

export const StorefrontSettings: React.FC<StorefrontSettingsProps> = ({
  storefront,
  onUpdate,
  initialTab,
  earningsDefaultTab,
}) => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab || "general");
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    businessName: storefront.businessName || "",
    displayName: storefront.displayName || "",
    description: storefront.description || "",
    phone: storefront.contactInfo?.phone || "",
    email: storefront.contactInfo?.email || "",
    whatsapp: storefront.contactInfo?.whatsapp || "",
    address: storefront.contactInfo?.address || "",
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

  // Branding state
  const [brandingData, setBrandingData] = useState({
    logoUrl: storefront.branding?.logoUrl || "",
    bannerUrl: storefront.branding?.bannerUrl || "",
    tagline: storefront.branding?.tagline || "",
    storeColor: storefront.branding?.customColors?.primary === "#0B1120" ? "midnight" : "brand",
    facebook: storefront.branding?.socialLinks?.facebook || "",
    instagram: storefront.branding?.socialLinks?.instagram || "",
    twitter: storefront.branding?.socialLinks?.twitter || "",
    tiktok: storefront.branding?.socialLinks?.tiktok || "",
    layout: storefront.branding?.layout || "classic",
    showBanner: storefront.branding?.showBanner ?? true,
    footerText: storefront.branding?.footerText || "",
    showContact: storefront.settings?.showContact ?? true,
  });

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodForm[]>(
    storefront.paymentMethods && storefront.paymentMethods.length > 0
      ? (storefront.paymentMethods as PaymentMethodForm[])
      : [{ type: 'paystack', details: {}, isActive: false }],
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

    if (!formData.displayName.trim()) {
      newErrors.displayName = "Display name is required";
    } else if (formData.displayName.length < 3) {
      newErrors.displayName = "Display name must be at least 3 characters";
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

      // Paystack (platform checkout) requires no storefront-level credentials by default
      if (payment.type === 'paystack') {
        // Accept as valid — optional storefront `paystackSubaccountId` may be present but not required
        continue;
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

  const normalizeWhatsappNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("+")) return digits.replace(/\D/g, "");
    if (digits.startsWith("233")) return digits;
    if (digits.startsWith("0")) return `233${digits.slice(1)}`;
    return digits;
  };

  const saveGeneralSettings = async () => {
    if (!validateGeneral()) return;

    try {
      setIsLoading(true);
      const normalizedWhatsapp = normalizeWhatsappNumber(formData.whatsapp);
      const updateData = {
        businessName: slugifyBusinessName(formData.businessName.trim()),
        displayName: formData.displayName.trim(),
        description: formData.description.trim() || undefined,
        contactInfo: {
          phone: formData.phone.trim(),
          email: formData.email.trim() || undefined,
          whatsapp: normalizedWhatsapp || undefined,
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
      // Inject system-generated placeholders when the agent leaves fields blank.
      // These are stored in the DB so the public store always has something to show.
      const resolvedTagline = brandingData.tagline.trim()
        || getSystemTagline(formData.businessName || storefront.businessName);
      const resolvedDescription = formData.description.trim()
        || getSystemDescription(storefront.displayName || formData.businessName || storefront.businessName);
      const resolvedLogoUrl = brandingData.logoUrl.trim() || undefined;

      const resolvedFooterText =
        brandingData.footerText.trim() ||
        getSystemFooterText(formData.businessName || storefront.businessName);

      const updateData = {
        description: resolvedDescription,
        branding: {
          logoUrl: resolvedLogoUrl,
          bannerUrl: brandingData.bannerUrl.trim() || undefined,
          tagline: resolvedTagline,
          customColors: {
            primary: brandingData.storeColor === "midnight" ? "#0B1120" : "#2563EB",
          },
          socialLinks: {
            facebook: brandingData.facebook.trim() || undefined,
            instagram: brandingData.instagram.trim() || undefined,
            twitter: brandingData.twitter.trim() || undefined,
            tiktok: brandingData.tiktok.trim() || undefined,
          },
          layout: brandingData.layout,
          showBanner: brandingData.showBanner,
          footerText: resolvedFooterText,
        },
        settings: {
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

  const businessSlugPreview = slugifyBusinessName(formData.businessName || storefront.businessName || '');
  const storefrontUrlPreview = getStoreUrl(businessSlugPreview);
  const getStorefrontUrl = () => getStoreUrl(storefront.businessName);

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
              {method.type === "paystack" && (
                <CreditCard className="w-3 h-3 mr-1" />
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
                  className="p-3 border rounded-lg"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      Account {accountIdx + 1}
                    </h5>
                    {(method.details.accounts || []).length > 1 && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => removeMomoAccount(index, accountIdx)}
                      >
                        <X className="w-4 h-4" style={{ color: "var(--error)" }} />
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

          {method.type === 'paystack' && (
            <div className="space-y-3 text-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Paystack Subaccount</span>
                  <SubaccountTooltip />
                </div>
                <Input
                  value={method.details?.subaccountId || storefront.paystackSubaccountId || ''}
                  onChange={() => { }}
                  placeholder="Managed by platform"
                  size="sm"
                  disabled
                  className="cursor-not-allowed"
                  style={{ backgroundColor: "var(--bg-surface-alt)" }}
                />
              </div>
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
        <Settings className="w-6 h-6 shrink-0" style={{ color: "var(--text-primary)" }} />
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Storefront Settings
          </h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
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
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="sharing">Share</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
        </div>

        {/* ===== General Settings ===== */}
        <TabsContent value="general" className="space-y-6">
          {/* Store Status banner */}
          <div
            className="p-3 sm:p-4 border rounded-xl space-y-3"
            style={{ backgroundColor: "var(--bg-surface-alt)", borderColor: "var(--border-color)" }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge colorScheme={storeStatusColor}>
                  {storeStatusLabel}
                </Badge>
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
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
            <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: "var(--border-color)" }}>
              <Store className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
              <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--text-primary)" }}>
                Business Information
              </h3>
            </div>

            <FormField label="Business Name (URL slug)" required>
              <Input
                value={formData.businessName}
                onChange={(e) => handleFormChange("businessName", e.target.value)}
                placeholder="your-business-name"
                leftIcon={<Store className="w-4 h-4" />}
              />
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                This controls your storefront URL and must be lowercase with no spaces.
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                Preview: <span className="font-mono">{storefrontUrlPreview}</span>
              </p>
              {errors.businessName && (
                <p className="text-sm mt-1" style={{ color: "var(--error)" }}>{errors.businessName}</p>
              )}
            </FormField>

            <FormField label="Display Name" required>
              <Input
                value={formData.displayName}
                onChange={(e) => handleFormChange("displayName", e.target.value)}
                placeholder="Your store name"
                leftIcon={<Store className="w-4 h-4" />}
              />
              {errors.displayName && (
                <p className="text-sm mt-1" style={{ color: "var(--error)" }}>{errors.displayName}</p>
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
              <p className="text-xs mt-1 text-right" style={{ color: "var(--text-muted)" }}>
                {formData.description.length}/500
              </p>
            </FormField>
          </section>

          {/* Contact Details */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: "var(--border-color)" }}>
              <Phone className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
              <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--text-primary)" }}>
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
                  <p className="text-sm mt-1" style={{ color: "var(--error)" }}>{errors.phone}</p>
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
                  <p className="text-sm mt-1" style={{ color: "var(--error)" }}>{errors.email}</p>
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
                  <MapPin className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
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
        <TabsContent value="branding" className="space-y-6" data-tour="storefront-branding">
          {/* Appearance & Theme */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: "var(--border-color)" }}>
              <Palette className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
              <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--text-primary)" }}>
                Appearance & Theme
              </h3>
            </div>

            <FormField label="Store Color">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "brand", label: "Brand Blue", color: "#2563EB" },
                  { value: "midnight", label: "Midnight Black", color: "#0B1120" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleBrandingChange("storeColor", opt.value)}
                    className="flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all"
                    style={{
                      borderColor: brandingData.storeColor === opt.value ? opt.color : "var(--border-color)",
                      backgroundColor: brandingData.storeColor === opt.value ? `${opt.color}0D` : "transparent",
                    }}
                  >
                    <span
                      className="w-8 h-8 rounded-lg shrink-0 border"
                      style={{ backgroundColor: opt.color, borderColor: `${opt.color}33` }}
                    />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{opt.label}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{opt.color}</p>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                Primary accent color for your public storefront
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
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  How your public storefront looks to customers
                </p>
              </FormField>

            <FormField label="Store Tagline">
              <Input
                value={brandingData.tagline}
                onChange={(e) => handleBrandingChange("tagline", e.target.value)}
                placeholder={getSystemTagline(formData.businessName || storefront.businessName)}
                leftIcon={<Type className="w-4 h-4" />}
                maxLength={120}
              />
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {brandingData.tagline.trim()
                  ? `${brandingData.tagline.length}/120`
                  : `Auto-generated when left blank: "${getSystemTagline(formData.businessName || storefront.businessName)}"`}
              </p>
            </FormField>

            <FormField label="Footer Text">
              <Input
                value={brandingData.footerText}
                onChange={(e) => handleBrandingChange("footerText", e.target.value)}
                placeholder="Optional — leave blank to auto-generate a footer message."
                maxLength={200}
              />
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {brandingData.footerText.trim()
                  ? `${brandingData.footerText.length}/200`
                  : `Auto-generated when left blank: "${getSystemFooterText(
                    formData.businessName || storefront.businessName,
                  )}"`}
              </p>
            </FormField>

            {/* Toggle row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: "var(--bg-surface-alt)" }}>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Show Contact Info</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Phone, email on public store</p>
                  </div>
                </div>
                <Switch
                  checked={brandingData.showContact}
                  onCheckedChange={(checked) => handleBrandingChange("showContact", checked)}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: "var(--bg-surface-alt)" }}>
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Show Banner</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Display banner on public store</p>
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
            <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: "var(--border-color)" }}>
              <Image className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
              <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--text-primary)" }}>
                Logo & Banner
              </h3>
            </div>

            {/* Logo */}
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Store Logo</label>
              <div
                className="flex items-center gap-3 p-3 rounded-xl border"
                style={{ backgroundColor: "var(--bg-surface-alt)", borderColor: "var(--border-color)" }}
              >
                <img
                  src={brandingData.logoUrl || "/icons/store-icon.png"}
                  alt="Store logo"
                  className="w-14 h-14 rounded-xl object-cover border shadow-sm shrink-0"
                  style={{ borderColor: "var(--border-color)" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/icons/store-icon.png";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {brandingData.logoUrl ? 'Custom logo uploaded' : 'Using default app icon'}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {brandingData.logoUrl ? 'Click change to upload a new logo' : 'Upload a square image (200×200 px) for your store.'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsUploadingLogo(true);
                        try {
                          const { uploadService } = await import("../../services/upload.service");
                          const url = await uploadService.uploadImage(file);
                          handleBrandingChange("logoUrl", url);
                        } catch (err) {
                          addToast(err instanceof Error ? err.message : "Logo upload failed", "error");
                        } finally {
                          setIsUploadingLogo(false);
                        }
                      }}
                    />
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                    >
                      {isUploadingLogo ? "Uploading…" : "Change"}
                    </span>
                  </label>
                  {brandingData.logoUrl && (
                    <button
                      type="button"
                      onClick={() => handleBrandingChange("logoUrl", "")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border hover:opacity-80 transition-opacity"
                      style={{ borderColor: "var(--border-color)", color: "var(--error)" }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Banner */}
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Store Banner</label>
              <div
                className="p-3 rounded-xl border space-y-2"
                style={{ backgroundColor: "var(--bg-surface-alt)", borderColor: "var(--border-color)" }}
              >
                {/* Banner preview */}
                {brandingData.bannerUrl ? (
                  <img
                    src={brandingData.bannerUrl}
                    alt="Store banner"
                    className="w-full h-24 rounded-lg object-cover border"
                    style={{ borderColor: "var(--border-color)" }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div
                    className="w-full h-24 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                    style={{
                      background: brandingData.storeColor === "midnight"
                        ? 'linear-gradient(135deg, #0B1120 0%, #1C2538 100%)'
                        : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    }}
                  >
                    {formData.businessName || 'Your Store'}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsUploadingBanner(true);
                        try {
                          const { uploadService } = await import("../../services/upload.service");
                          const url = await uploadService.uploadImage(file);
                          handleBrandingChange("bannerUrl", url);
                        } catch (err) {
                          addToast(err instanceof Error ? err.message : "Banner upload failed", "error");
                        } finally {
                          setIsUploadingBanner(false);
                        }
                      }}
                    />
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                    >
                      {isUploadingBanner ? "Uploading…" : "Upload Banner"}
                    </span>
                  </label>
                  {brandingData.bannerUrl && (
                    <button
                      type="button"
                      onClick={() => handleBrandingChange("bannerUrl", "")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border hover:opacity-80 transition-opacity"
                      style={{ borderColor: "var(--border-color)", color: "var(--error)" }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {brandingData.bannerUrl
                    ? 'Your custom banner image will be shown on the storefront.'
                    : 'Wide image recommended (1200×300 px). A gradient is shown when no image is set.'}
                </p>
              </div>
            </div>
          </section>

          {/* Social Links */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: "var(--border-color)" }}>
              <Globe className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
              <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--text-primary)" }}>
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

        {/* ===== Earnings / Payouts ===== */}
        <TabsContent value="earnings" className="space-y-6">
          <EarningsManager defaultTab={earningsDefaultTab} />
        </TabsContent>

        {/* ===== Payment Methods ===== */}
        <TabsContent value="payment" className="space-y-6">
          <section className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: "var(--border-color)" }}>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--text-primary)" }}>
                  Payment Methods
                </h3>
              </div>
              <p className="text-xs hidden sm:block" style={{ color: "var(--text-secondary)" }}>
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

            {/* Add payment method — disabled; Paystack is the only supported method */}
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
            <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: "var(--border-color)" }}>
              <Share2 className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
              <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--text-primary)" }}>
                Share Your Storefront
              </h3>
            </div>

            <FormField label="Your Storefront URL">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={getStorefrontUrl()}
                  readOnly
                  className="flex-1"
                  style={{ backgroundColor: "var(--bg-surface-alt)" }}
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

            <div className="p-3 sm:p-4 rounded-lg" style={{ backgroundColor: "var(--bg-surface-alt)" }}>
              <h4 className="font-medium mb-2" style={{ color: "var(--text-primary)" }}>Promotion Tips</h4>
              <ul className="text-sm space-y-1.5" style={{ color: "var(--text-secondary)" }}>
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
            <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: "var(--border-color)" }}>
              <Info className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
              <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--text-primary)" }}>
                Storefront Information
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg" style={{ backgroundColor: "var(--bg-surface-alt)" }}>
              <div>
                <p className="text-xs flex items-center gap-1 mb-0.5" style={{ color: "var(--text-secondary)" }}>
                  <Calendar className="w-3 h-3" /> Created
                </p>
                <p className="font-medium text-sm">
                  {new Date(storefront.createdAt!).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs flex items-center gap-1 mb-0.5" style={{ color: "var(--text-secondary)" }}>
                  <Calendar className="w-3 h-3" /> Updated
                </p>
                <p className="font-medium text-sm">
                  {new Date(storefront.updatedAt!).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs mb-0.5" style={{ color: "var(--text-secondary)" }}>Status</p>
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
                <p className="text-xs mb-0.5" style={{ color: "var(--text-secondary)" }}>Storefront ID</p>
                <p className="font-mono text-xs truncate">{storefront._id}</p>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section>
            <div
              className="border rounded-xl p-4"
              style={{
                borderColor: 'color-mix(in srgb, var(--error) 20%, transparent)',
                backgroundColor: 'color-mix(in srgb, var(--error) 8%, transparent)',
              }}
            >
              <h4 className="font-medium mb-2 flex items-center gap-2" style={{ color: "var(--error)" }}>
                <AlertTriangle className="w-5 h-5" /> Danger Zone
              </h4>
              <p className="text-sm mb-4" style={{ color: "var(--error)" }}>
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
          <h3 className="text-lg font-semibold" style={{ color: "var(--error)" }}>
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

            <p className="text-sm sm:text-base" style={{ color: "var(--text-primary)" }}>
              Are you sure you want to delete your storefront &quot;
              {storefront.businessName}&quot;? This will permanently remove:
            </p>

            <ul className="list-disc list-inside text-sm space-y-1" style={{ color: "var(--text-secondary)" }}>
              <li>Your custom bundle pricing</li>
              <li>Order history and customer data</li>
              <li>Payment method configurations</li>
              <li>Public storefront link access</li>
            </ul>

            <p className="text-sm" style={{ color: "var(--text-primary)" }}>
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
