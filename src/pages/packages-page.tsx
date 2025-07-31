// src/pages/packages-page.tsx
import React from "react";
import { useLocation } from "react-router-dom";
import { PackageManagement } from "../components/products/PackageManagement";
import { useAuth } from '../hooks/use-auth';

const PackageManagementPage: React.FC = () => {
  const { authState } = useAuth();
  const location = useLocation();
  const isSuperAdmin = authState.user?.userType === 'super_admin';
  const isSuperAdminRoute = location.pathname.startsWith('/superadmin');
  
  return (
    <PackageManagement 
      isSuperAdmin={isSuperAdmin || isSuperAdminRoute}
    />
  );
};

export default PackageManagementPage;
