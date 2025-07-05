// src/pages/packages-page.tsx
import React, { useState } from "react";
import {
  FaBox,
  FaMobile,
  FaChartLine,
  FaExclamationTriangle,
  FaPlus,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { PackageList } from "../components/products/PackageList";
import { ProviderList } from "../components/products/ProviderList";

const SECTIONS = [
  { 
    id: "packages", 
    label: "Data Packages", 
    icon: FaBox,
    description: "Manage your mobile data bundle inventory"
  },
  {
    id: "providers",
    label: "Network Providers",
    icon: FaMobile,
    description: "Configure network provider settings"
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: FaChartLine,
    description: "Track performance and sales metrics"
  },
  {
    id: "alerts",
    label: "Alerts",
    icon: FaExclamationTriangle,
    description: "Monitor low stock and system alerts"
  },
];

export const PackageManagementPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState("packages");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeItem = SECTIONS.find(section => section.id === activeSection);

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "packages":
        return <PackageList />;
      case "providers":
        return <ProviderList />;
      case "analytics":
        return (
          <div className="text-center py-12">
            <div className="bg-blue-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <FaChartLine className="text-blue-600 text-2xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Track your data package performance, sales metrics, and customer insights.
            </p>
            <div className="bg-gray-50 rounded-lg p-8 text-gray-500">
              Coming Soon
            </div>
          </div>
        );
      case "alerts":
        return (
          <div className="text-center py-12">
            <div className="bg-orange-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <FaExclamationTriangle className="text-orange-600 text-2xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">System Alerts</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Stay informed about low stock levels and important system notifications.
            </p>
            <div className="bg-gray-50 rounded-lg p-8 text-gray-500">
              No alerts at this time
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {activeItem && (
              <>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <activeItem.icon className="text-blue-600 text-lg" />
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900">{activeItem.label}</h1>
                  <p className="text-xs text-gray-600">{activeItem.description}</p>
                </div>
              </>
            )}
          </div>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <FaTimes className="text-gray-600" />
            ) : (
              <FaBars className="text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-gray-200 bg-white">
            <div className="py-2">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      activeSection === section.id
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className={`text-lg ${
                      activeSection === section.id ? "text-blue-600" : "text-gray-400"
                    }`} />
                    <div>
                      <div className="font-medium">{section.label}</div>
                      <div className="text-sm text-gray-500">{section.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="lg:flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-80 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Package Management</h1>
            <p className="text-gray-600 text-sm mt-1">
              Manage your mobile data bundles and network providers
            </p>
          </div>
          
          <nav className="p-4">
            <div className="space-y-2">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id)}
                    className={`w-full flex items-start gap-3 p-4 rounded-lg text-left transition-all duration-200 ${
                      activeSection === section.id
                        ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-200"
                        : "text-gray-700 hover:bg-gray-50 hover:shadow-sm"
                    }`}
                  >
                    <Icon className={`text-xl mt-0.5 ${
                      activeSection === section.id ? "text-blue-600" : "text-gray-400"
                    }`} />
                    <div>
                      <div className="font-medium">{section.label}</div>
                      <div className="text-sm text-gray-500 mt-1">{section.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Desktop Header */}
          <div className="hidden lg:block bg-white border-b border-gray-200 px-6 py-4">
            {activeItem && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <activeItem.icon className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{activeItem.label}</h2>
                    <p className="text-gray-600">{activeItem.description}</p>
                  </div>
                </div>
                
                {activeSection === "packages" && (
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <FaPlus size={14} />
                    Add Package
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="p-4 lg:p-6">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Mobile FAB for Add Package */}
      {activeSection === "packages" && (
        <button className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center z-30">
          <FaPlus size={20} />
        </button>
      )}
    </div>
  );
};
