// src/pages/packages-page.tsx
import React from "react";
import { PackageList } from "../components/products/PackageList";

export const PackageManagementPage: React.FC = () => {
  return (
    <div className="space-y-6">  
      <PackageList />
    </div>
  );
};
