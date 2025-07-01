// src/components/storefront/StorefrontModal.tsx
import React, { useState, useEffect } from "react";
import { FaTimes, FaStore, FaPalette, FaCog, FaEye } from "react-icons/fa";
import { useStorefront } from "../../contexts/StorefrontContext";
import type { Storefront } from "../../types/storefront";

interface StorefrontModalProps {
  storefront: Storefront | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const StorefrontModal: React.FC<StorefrontModalProps> = ({
  storefront,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { createStorefront, updateStorefront, loading, checkSlugAvailability } =
    useStorefront();

  const [activeTab, setActiveTab] = useState("basic");
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
    theme: {
      primaryColor: "#3B82F6",
      secondaryColor: "#1F2937",
      accentColor: "#10B981",
      backgroundColor: "#FFFFFF",
      textColor: "#1F2937",
      fontFamily: "Inter",
      layout: "grid" as "grid" | "list" | "card",
      headerStyle: "modern" as "modern" | "minimal" | "classic", // Fix: Properly type the headerStyle
    },
    contactInfo: {
      email: "",
      phone: "",
      address: "",
      workingHours: "",
      socialLinks: {
        facebook: "",
        twitter: "",
        instagram: "",
        whatsapp: "",
        telegram: "",
        website: "",
      },
    },
    features: {
      showPrices: true,
      allowOrders: true,
      showInventory: false,
      requireCustomerInfo: true,
      enableWhatsAppOrders: false,
      enableSearch: true,
      enableCategories: true,
    },
    seo: {
      title: "",
      description: "",
      keywords: [] as string[],
      ogImage: "",
    },
    announcement: {
      text: "",
      isActive: false,
      type: "info" as "info" | "warning" | "success" | "error",
    },
  });

  useEffect(() => {
    if (storefront) {
      setFormData({
        name: storefront.name,
        description: storefront.description ?? "",
        slug: storefront.slug,
        theme: {
          ...storefront.theme,
          layout: storefront.theme.layout,
        },
        contactInfo: {
          email: storefront.contactInfo?.email ?? "",
          phone: storefront.contactInfo?.phone ?? "",
          address: storefront.contactInfo?.address ?? "",
          workingHours: storefront.contactInfo?.workingHours ?? "",
          socialLinks: {
            facebook: storefront.contactInfo?.socialLinks?.facebook ?? "",
            twitter: storefront.contactInfo?.socialLinks?.twitter ?? "",
            instagram: storefront.contactInfo?.socialLinks?.instagram ?? "",
            whatsapp: storefront.contactInfo?.socialLinks?.whatsapp ?? "",
            telegram: storefront.contactInfo?.socialLinks?.telegram ?? "",
            website: storefront.contactInfo?.socialLinks?.website ?? "",
          },
        },
        features: storefront.features,
        seo: {
          title: storefront.seo?.title ?? "",
          description: storefront.seo?.description ?? "",
          keywords: storefront.seo?.keywords ?? [],
          ogImage: storefront.seo?.ogImage ?? "",
        },
        announcement: {
          text: storefront.announcement?.text ?? "",
          isActive: storefront.announcement?.isActive ?? false,
          type: storefront.announcement?.type ?? "info",
        },
      });
    }
  }, [storefront]);

  // Fix: Updated handleInputChange with proper typing
  const handleInputChange = (
    section: keyof typeof formData | "",
    field: string,
    value: string | boolean
  ) => {
    if (section === "") {
      // Handle top-level fields
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    } else {
      // Handle nested fields
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...(prev[section] as Record<string, unknown>),
          [field]: value,
        },
      }));
    }
  };

  // Alternative: More specific handler for nested objects
  const handleNestedChange = <T extends keyof typeof formData>(
    section: T,
    field: string,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, unknown>),
        [field]: value,
      },
    }));
  };

  const handleSlugCheck = async (slug: string) => {
    if (!slug || slug === storefront?.slug) {
      setSlugAvailable(null);
      return;
    }

    setCheckingSlug(true);
    try {
      const available = await checkSlugAvailability(slug);
      setSlugAvailable(available);
    } catch (error) {
      console.error("Error checking slug availability:", error);
      setSlugAvailable(false);
    } finally {
      setCheckingSlug(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (storefront) {
        await updateStorefront(formData);
      } else {
        await createStorefront(formData);
      }
      onSuccess();
    } catch (error) {
      console.error("Failed to save storefront:", error);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: "basic", label: "Basic Info", icon: FaStore },
    { id: "theme", label: "Design", icon: FaPalette },
    { id: "features", label: "Features", icon: FaCog },
    { id: "seo", label: "SEO", icon: FaEye },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {storefront ? "Edit Storefront" : "Create Storefront"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={16} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6">
            {/* Basic Info Tab */}
            {activeTab === "basic" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="store-name" className="block text-sm font-medium text-gray-700 mb-2">
                      Store Name *
                    </label>
                    <input
                      type="text"
                      id="store-name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("", "name", e.target.value)
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="My Awesome Store"
                    />
                  </div>

                  <div>
                    <label htmlFor="store-url" className="block text-sm font-medium text-gray-700 mb-2">
                      Store URL *
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        /store/
                      </span>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => {
                          const slug = e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "-");
                          handleInputChange("", "slug", slug);
                          handleSlugCheck(slug);
                        }}
                        required
                        className={`flex-1 px-3 py-2 border rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          slugAvailable === false
                            ? "border-red-300"
                            : slugAvailable === true
                            ? "border-green-300"
                            : "border-gray-300"
                        }`}
                        placeholder="my-store"
                      />
                    </div>
                    {checkingSlug && (
                      <p className="text-sm text-gray-500 mt-1">
                        Checking availability...
                      </p>
                    )}
                    {slugAvailable === false && (
                      <p className="text-sm text-red-600 mt-1">
                        This URL is already taken
                      </p>
                    )}
                    {slugAvailable === true && (
                      <p className="text-sm text-green-600 mt-1">
                        This URL is available
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="store-description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("", "description", e.target.value)
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell customers about your store..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="store-email" className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={formData.contactInfo.email}
                      onChange={(e) =>
                        handleNestedChange("contactInfo", "email", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="contact@mystore.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="store-phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.contactInfo.phone}
                      onChange={(e) =>
                        handleNestedChange("contactInfo", "phone", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="store-address" className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={formData.contactInfo.address}
                    onChange={(e) =>
                      handleNestedChange("contactInfo", "address", e.target.value)
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123 Main St, City, Country"
                  />
                </div>
              </div>
            )}

            {/* Theme Tab */}
            {activeTab === "theme" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="store-primary-color" className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Color
                    </label>
                    <input
                      type="color"
                      value={formData.theme.primaryColor}
                      onChange={(e) =>
                        handleNestedChange("theme", "primaryColor", e.target.value)
                      }
                      className="w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label htmlFor="store-secondary-color" className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Color
                    </label>
                    <input
                      type="color"
                      value={formData.theme.secondaryColor}
                      onChange={(e) =>
                        handleNestedChange("theme", "secondaryColor", e.target.value)
                      }
                      className="w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label htmlFor="store-accent-color" className="block text-sm font-medium text-gray-700 mb-2">
                      Accent Color
                    </label>
                    <input
                      type="color"
                      value={formData.theme.accentColor}
                      onChange={(e) =>
                        handleNestedChange("theme", "accentColor", e.target.value)
                      }
                      className="w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="store-layout" className="block text-sm font-medium text-gray-700 mb-2">
                      Layout Style
                    </label>
                    <select
                      value={formData.theme.layout}
                      onChange={(e) =>
                        handleNestedChange("theme", "layout", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="grid">Grid</option>
                      <option value="list">List</option>
                      <option value="card">Card</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="store-header-style" className="block text-sm font-medium text-gray-700 mb-2">
                      Header Style
                    </label>
                    <select
                      value={formData.theme.headerStyle}
                      onChange={(e) =>
                        handleNestedChange("theme", "headerStyle", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="minimal">Minimal</option>
                      <option value="classic">Classic</option>
                      <option value="modern">Modern</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Features Tab */}
            {activeTab === "features" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(formData.features).map(([key, value]) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) =>
                          handleNestedChange("features", key, e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === "seo" && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="store-seo-title" className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={formData.seo.title}
                    onChange={(e) =>
                      handleNestedChange("seo", "title", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Best Mobile Bundles Store"
                  />
                </div>

                <div>
                  <label htmlFor="store-seo-description" className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Description
                  </label>
                  <textarea
                    value={formData.seo.description}
                    onChange={(e) =>
                      handleNestedChange("seo", "description", e.target.value)
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Find the best mobile data bundles at great prices..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (!!formData.slug && slugAvailable === false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : storefront
                ? "Update Storefront"
                : "Create Storefront"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};