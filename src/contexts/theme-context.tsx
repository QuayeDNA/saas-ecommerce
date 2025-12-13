import { useState, useEffect, useMemo, type ReactNode } from "react";
import { ThemeContext, type ThemeColor } from "./theme-context-value";

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeColor;
}

// Map theme colors to their hex values for PWA
const THEME_COLORS: Record<ThemeColor, string> = {
  default: "#142850", // Default blue
  blue: "#142850",
  black: "#000000",
  teal: "#14b8a6",
  purple: "#8b5cf6",
  green: "#10b981",
  orange: "#f59e0b",
  red: "#ef4444",
};

export const ThemeProvider = ({
  children,
  initialTheme = "default",
}: ThemeProviderProps) => {
  // Get theme from local storage or use initialTheme
  const [primaryColor, setPrimaryColor] = useState<ThemeColor>(() => {
    const savedTheme = localStorage.getItem("saas-telecom-theme");
    return (savedTheme as ThemeColor) || initialTheme;
  });

  // Apply theme class to body element and update PWA colors when theme changes
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem("saas-telecom-theme", primaryColor);

    // Remove all theme classes
    document.body.classList.remove(
      "theme-blue",
      "theme-black",
      "theme-teal",
      "theme-purple",
      "theme-green",
      "theme-orange",
      "theme-red"
    );

    // Add new theme class if not default
    if (primaryColor !== "default") {
      document.body.classList.add(`theme-${primaryColor}`);
    }

    // Update PWA theme color
    const themeColor = THEME_COLORS[primaryColor];
    updatePWAThemeColor(themeColor);
  }, [primaryColor]);

  // Function to update PWA theme color
  const updatePWAThemeColor = (color: string) => {
    // Update theme-color meta tag
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", color);
    }

    // Update msapplication-TileColor meta tag
    const tileColorMeta = document.querySelector(
      'meta[name="msapplication-TileColor"]'
    );
    if (tileColorMeta) {
      tileColorMeta.setAttribute("content", color);
    }

    // Update manifest link to include theme parameter for dynamic manifest
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      manifestLink.setAttribute(
        "href",
        `/manifest?theme=${encodeURIComponent(color)}`
      );
    }
  };

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      primaryColor,
      setPrimaryColor,
    }),
    [primaryColor]
  );

  // Provide theme context to children
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
