import React from "react";
import { useTheme } from "../../hooks/use-theme";
import type { ThemeColor } from "../../contexts/theme-context-value";

interface ColorScheme {
  id: ThemeColor;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
}

const colorSchemes: ColorScheme[] = [
  {
    id: "blue",
    name: "Ocean Blue",
    description: "Professional and trustworthy",
    primaryColor: "#3b82f6",
    secondaryColor: "#60a5fa",
  },
  {
    id: "black",
    name: "Midnight Black",
    description: "Bold and modern",
    primaryColor: "#000000",
    secondaryColor: "#1a1a1a",
  },
];

export const ColorSchemeSelector: React.FC = () => {
  const { primaryColor, setPrimaryColor } = useTheme();

  const handleSchemeChange = (schemeId: ThemeColor) => {
    setPrimaryColor(schemeId);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Color Scheme</h3>
        <p className="text-sm text-gray-600 mt-1">
          Choose your preferred color theme for the interface
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {colorSchemes.map((scheme) => (
          <button
            key={scheme.id}
            onClick={() => handleSchemeChange(scheme.id)}
            className={`
              relative p-4 rounded-lg border-2 transition-all duration-200 text-left
              ${
                primaryColor === scheme.id
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              }
            `}
          >
            {/* Color Swatch */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-12 h-12 rounded-lg shadow-inner"
                style={{
                  background: `linear-gradient(135deg, ${scheme.primaryColor} 0%, ${scheme.secondaryColor} 100%)`,
                }}
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{scheme.name}</div>
                <div className="text-xs text-gray-500">
                  {scheme.description}
                </div>
              </div>
            </div>

            {/* Selected Indicator */}
            {primaryColor === scheme.id && (
              <div className="absolute top-3 right-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}

            {/* Preview Dots */}
            <div className="flex gap-1.5 mt-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: scheme.primaryColor }}
              />
              <div
                className="w-3 h-3 rounded-full opacity-80"
                style={{ backgroundColor: scheme.primaryColor }}
              />
              <div
                className="w-3 h-3 rounded-full opacity-60"
                style={{ backgroundColor: scheme.primaryColor }}
              />
              <div
                className="w-3 h-3 rounded-full opacity-40"
                style={{ backgroundColor: scheme.primaryColor }}
              />
            </div>
          </button>
        ))}
      </div>

      <div className="text-xs text-gray-500 mt-4">
        Your color scheme preference is saved automatically and will be applied
        across all pages.
      </div>
    </div>
  );
};
