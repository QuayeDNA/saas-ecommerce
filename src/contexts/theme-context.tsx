import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { ThemeContext, type ThemeColor } from './theme-context-value';

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeColor;
}

export const ThemeProvider = ({ children, initialTheme = 'default' }: ThemeProviderProps) => {
  // Get theme from local storage or use initialTheme
  const [primaryColor, setPrimaryColor] = useState<ThemeColor>(() => {
    const savedTheme = localStorage.getItem('saas-telecom-theme');
    return (savedTheme as ThemeColor) || initialTheme;
  });

  // Apply theme class to body element when theme changes
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('saas-telecom-theme', primaryColor);
    
    // Remove all theme classes
    document.body.classList.remove(
      'theme-blue',
      'theme-purple',
      'theme-green',
      'theme-orange',
      'theme-red'
    );
    
    // Add new theme class if not default
    if (primaryColor !== 'default') {
      document.body.classList.add(`theme-${primaryColor}`);
    }
  }, [primaryColor]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    primaryColor,
    setPrimaryColor,
  }), [primaryColor]);

  // Provide theme context to children
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
