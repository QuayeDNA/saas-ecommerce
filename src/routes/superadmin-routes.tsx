import React, { lazy } from "react";
import SuperAdminLayout from "../layouts/superadmin-layout";

const SuperAdminDashboard = lazy(() => import("../pages/superadmin/index"));
// Placeholder lazy imports for other pages
const UsersPage = lazy(() => import("../pages/superadmin/users"));
const ProvidersPage = lazy(() => import("../pages/superadmin/providers"));
const OrdersPage = lazy(() => import("../pages/superadmin/orders"));
const WalletPage = lazy(() => import("../pages/superadmin/wallet"));
const SettingsPage = lazy(() => import("../pages/superadmin/settings"));

const superadminRoutes = {
  path: "/superadmin",
  element: <SuperAdminLayout />,
  children: [
    { index: true, element: <SuperAdminDashboard /> },
    { path: "users", element: <UsersPage /> },
    { path: "providers", element: <ProvidersPage /> },
    { path: "orders", element: <OrdersPage /> },
    { path: "wallet", element: <WalletPage /> },
    { path: "settings", element: <SettingsPage /> },
  ],
};

export default superadminRoutes; 