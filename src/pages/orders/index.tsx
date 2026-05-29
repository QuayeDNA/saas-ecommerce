import { useAuth } from "../../hooks/use-auth";
import { OrderProvider } from "../../contexts/OrderContext";
import { PackageProvider } from "../../contexts/package-context-value";
import { UnifiedOrderList } from "../../components/orders/UnifiedOrderList";
import { isAdminUser, canAccessBusinessFeatures } from "../../utils/userTypeHelpers";

export default function OrdersPage() {
  const { authState } = useAuth();
  const isAdmin = isAdminUser(authState.user?.userType || "");
  const isAgent = canAccessBusinessFeatures(authState.user?.userType || "");

  return (
    <OrderProvider>
      <PackageProvider>
        <UnifiedOrderList
          isAdmin={isAdmin}
          isAgent={isAgent}
          userType={authState.user?.userType}
        />
      </PackageProvider>
    </OrderProvider>
  );
}
