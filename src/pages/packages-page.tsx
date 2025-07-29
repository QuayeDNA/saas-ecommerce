// src/pages/packages-page.tsx
import React from "react";
import { PackageList } from "../components/products/PackageList";
import { SuperAdminPackageManagement } from "../components/products/SuperAdminPackageManagement";
import { useAuth } from '../hooks/use-auth';

export const PackageManagementPage: React.FC = () => {
  const { authState } = useAuth();
  const isSuperAdmin = authState.user?.userType === 'super_admin';
  return (
    <div className="space-y-6">  
      {isSuperAdmin ? <SuperAdminPackageManagement /> : <PackageList />}
    </div>
  );
};
