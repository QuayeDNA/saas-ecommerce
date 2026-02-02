// src/hooks/useStorefront.ts
import { useContext } from "react";
import { StorefrontContext } from "../contexts/StorefrontContext";

export const useStorefront = () => {
  const context = useContext(StorefrontContext);
  if (!context) {
    throw new Error("useStorefront must be used within a StorefrontProvider");
  }
  return context;
};