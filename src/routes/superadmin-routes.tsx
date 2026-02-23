import { lazy, Suspense } from "react";
import type { RouteObject } from "react-router-dom";
import SuperAdminLayout from "../layouts/superadmin-layout";
import { PageLoader } from "../components/page-loader";
import { ProtectedRoute } from "../components/protected-route";

const SuperAdminDashboard = lazy(() => import("../pages/superadmin/index"));
// Placeholder lazy imports for other pages
const UsersPage = lazy(() => import("../pages/superadmin/users"));
const UserDetailsPage = lazy(() => import("../pages/superadmin/user-details"));
const ProvidersPage = lazy(() => import("../pages/superadmin/providers"));
const OrdersPage = lazy(() => import("../pages/superadmin/orders"));
const WalletPage = lazy(() => import("../pages/superadmin/wallet"));
const WalletTopUpsPage = lazy(
  () => import("../pages/superadmin/wallet-top-ups")
);
const WalletHistoryPage = lazy(
  () => import("../pages/superadmin/wallet-history")
);
const SettingsPage = lazy(() => import("../pages/superadmin/settings"));
const PackagesPage = lazy(() => import("../pages/superadmin/packages"));
const BundleManagementPage = lazy(() =>
  import("../pages/admin/bundle-management-page").then((m) => ({
    default: m.BundleManagementPage,
  }))
);
const CommissionsPage = lazy(() => import("../pages/superadmin/commissions"));
const AnnouncementsPage = lazy(
  () => import("../pages/superadmin/announcements")
);
const StoresPage = lazy(() => import("../pages/superadmin/stores"));
const PayoutsPage = lazy(() => import("../pages/superadmin/payouts"));
const AnalyticsPage = lazy(() => import("../pages/superadmin/analytics"));

const superadminRoutes: RouteObject = {
  path: "/superadmin",
  element: <ProtectedRoute allowedUserTypes={["super_admin"]} />,
  children: [
    {
      path: "",
      element: <SuperAdminLayout />,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<PageLoader />}>
              <SuperAdminDashboard />
            </Suspense>
          ),
        },
        {
          path: "analytics",
          element: (
            <Suspense fallback={<PageLoader />}>
              <AnalyticsPage />
            </Suspense>
          ),
        },
        {
          path: "users",
          element: (
            <Suspense fallback={<PageLoader />}>
              <UsersPage />
            </Suspense>
          ),
        },
        {
          path: "users/:id",
          element: (
            <Suspense fallback={<PageLoader />}>
              <UserDetailsPage />
            </Suspense>
          ),
        },
        {
          path: "packages",
          element: (
            <Suspense fallback={<PageLoader />}>
              <PackagesPage />
            </Suspense>
          ),
        },
        {
          path: "providers",
          element: (
            <Suspense fallback={<PageLoader />}>
              <ProvidersPage />
            </Suspense>
          ),
        },
        {
          path: "orders",
          element: (
            <Suspense fallback={<PageLoader />}>
              <OrdersPage />
            </Suspense>
          ),
        },
        {
          path: "wallet",
          children: [
            {
              index: true,
              element: (
                <Suspense fallback={<PageLoader />}>
                  <WalletPage />
                </Suspense>
              ),
            },
            {
              path: "top-ups",
              element: (
                <Suspense fallback={<PageLoader />}>
                  <WalletTopUpsPage />
                </Suspense>
              ),
            },
            {
              path: "history",
              element: (
                <Suspense fallback={<PageLoader />}>
                  <WalletHistoryPage />
                </Suspense>
              ),
            },
          ],
        },
        {
          path: "settings",
          element: (
            <Suspense fallback={<PageLoader />}>
              <SettingsPage />
            </Suspense>
          ),
        },
        {
          path: "packages/:packageId/bundles",
          element: (
            <Suspense fallback={<PageLoader />}>
              <BundleManagementPage />
            </Suspense>
          ),
        },
        {
          path: "commissions",
          element: (
            <Suspense fallback={<PageLoader />}>
              <CommissionsPage />
            </Suspense>
          ),
        },
        {
          path: "announcements",
          element: (
            <Suspense fallback={<PageLoader />}>
              <AnnouncementsPage />
            </Suspense>
          ),
        },
        {
          path: "stores",
          element: (
            <Suspense fallback={<PageLoader />}>
              <StoresPage />
            </Suspense>
          ),
        },
        {
          path: "payouts",
          element: (
            <Suspense fallback={<PageLoader />}>
              <PayoutsPage />
            </Suspense>
          ),
        },
      ],
    },
  ],
};

export default superadminRoutes;
