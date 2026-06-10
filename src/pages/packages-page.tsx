import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PackageManagement } from "../components/products/PackageManagement";
import { useAuth } from '../hooks/use-auth';
import { packageService } from "../services/package.service";
import {
  Card,
  CardBody,
  Skeleton,
  Container,
} from "../design-system";
import { FaBox, FaBuilding, FaArrowRight } from "react-icons/fa";
import type { Package } from "../types/package";

const AgentPackageGrid: React.FC = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const resp = await packageService.getPackages({ isActive: true });
        if (!cancelled) {
          setPackages(resp.packages?.filter((p) => p._id && p.provider !== "AFA") ?? []);
        }
      } catch {
        if (!cancelled) setPackages([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <Container padding="none">
        <div className="space-y-4">
          <Skeleton variant="text" height="1.75rem" width="220px" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rectangular" height="120px" className="rounded-xl" />
            ))}
          </div>
        </div>
      </Container>
    );
  }

  if (!packages.length) {
    return (
      <Container padding="none">
        <Card>
          <CardBody>
            <div className="text-center py-8">
              <FaBox className="mx-auto h-12 w-12 text-[var(--text-muted)]" />
              <h3 className="mt-3 text-lg font-semibold text-[var(--text-primary)]">
                No packages available
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Check back later for available data packages.
              </p>
            </div>
          </CardBody>
        </Card>
      </Container>
    );
  }

  return (
    <Container padding="none">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Available Packages
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Select a package to view bundles and place orders
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <button
              key={pkg._id}
              type="button"
              onClick={() => navigate(`/agent/dashboard/packages/${pkg._id}`)}
              className="text-left w-full rounded-xl border p-5 transition-all hover:shadow-md group"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-color)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `color-mix(in srgb, var(--color-primary) 12%, transparent)`,
                      color: "var(--color-primary)",
                    }}
                  >
                    <FaBuilding className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[var(--text-primary)] truncate">
                      {pkg.name}
                    </h3>
                    {pkg.description && (
                      <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                        {pkg.description}
                      </p>
                    )}
                  </div>
                </div>
                <FaArrowRight
                  className="w-4 h-4 shrink-0 text-[var(--text-muted)] group-hover:text-[var(--color-primary)] transition-colors"
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </Container>
  );
};

const PackageManagementPage: React.FC = () => {
  const { authState } = useAuth();
  const isSuperAdmin = authState.user?.userType === 'super_admin';

  if (isSuperAdmin) {
    return <PackageManagement isSuperAdmin />;
  }

  return <AgentPackageGrid />;
};

export default PackageManagementPage;
