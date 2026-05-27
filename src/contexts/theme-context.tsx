import { useState, useEffect, useMemo, useCallback, type ReactNode } from "react";
import { ThemeContext, type Theme } from "./theme-context-value";

const STORAGE_KEY = "brytelinks-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return "light";
}

function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

function updatePWAThemeColor(theme: Theme) {
  const color = theme === "dark" ? "#050b16" : "#003b8f";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", color);
  const tileMeta = document.querySelector('meta[name="msapplication-TileColor"]');
  if (tileMeta) tileMeta.setAttribute("content", color);
}

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: Theme;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);
    applyThemeClass(theme);
    updatePWAThemeColor(theme);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const contextValue = useMemo(
    () => ({
      theme,
      toggleTheme,
      setTheme,
      isDark: theme === "dark",
    }),
    [theme, toggleTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
