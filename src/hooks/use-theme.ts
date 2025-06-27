import { useContext } from 'react';
import { ThemeContext } from '../contexts/theme-context-value';

// Hook for using the theme context
export const useTheme = () => useContext(ThemeContext);
