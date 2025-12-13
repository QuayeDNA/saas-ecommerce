import { createContext } from "react";

// Available theme options
export type ThemeColor =
  | "blue"
  | "black"
  | "teal"
  | "purple"
  | "green"
  | "orange"
  | "red"
  | "default";

// Theme context type
export interface ThemeContextType {
  primaryColor: ThemeColor;
  setPrimaryColor: (color: ThemeColor) => void;
}

// Create context with default values
export const ThemeContext = createContext<ThemeContextType>({
  primaryColor: "default",
  setPrimaryColor: () => {},
});
