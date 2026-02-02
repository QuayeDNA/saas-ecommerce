// src/pages/superadmin/stores.tsx
import { ComingSoon } from "../../components/common/coming-soon";

export default function StoresPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ComingSoon
        title="Agent Stores Management"
        description="View and manage all agent stores across the platform. Monitor store performance and sub-agent relationships."
      />
    </div>
  );
}
