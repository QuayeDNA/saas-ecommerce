// src/pages/agent/my-store.tsx
import { ComingSoon } from "../../components/common/coming-soon";

export default function MyStorePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ComingSoon
        title="My Store"
        description="Create and manage your personalized storefront. This feature will allow you to host your own version of products and manage sub-agents."
      />
    </div>
  );
}
