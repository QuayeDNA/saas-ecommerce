// src/hooks/use-commissions.ts
import { useContext } from "react";
import { CommissionContext } from "../contexts/CommissionContext";

export const useCommissions = () => {
  const context = useContext(CommissionContext);
  if (!context) {
    throw new Error("useCommissions must be used within a CommissionProvider");
  }
  return context;
};
