// src/components/products/PackageManagement.tsx
import React, { useEffect, useState } from "react";
import { usePackage } from "../../hooks/use-package";
import { SearchAndFilter } from "../common";
import { getProviderColors } from "../../utils/provider-colors";
import {
  getPriceForUserType,
  formatCurrency,
} from "../../utils/pricingHelpers";
import { PackageFormModal } from "./PackageFormModal";
import { packageService } from "../../services/package.service";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/use-auth";
import type {
  Package,
  Bundle,
  CreatePackageData,
  UpdatePackageData,
} from "../../types/package";
import {
  FaBox,
  FaExclamationCircle,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
} from "react-icons/fa";

export interface PackageManagementProps {
  provider?: string;
  isSuperAdmin?: boolean;
}

// Utility to always include provider in filters if present
function getEffectiveFilters(
  baseFilters: Record<string, unknown>,
  provider?: string
) {
  return provider ? { ...baseFilters, provider } : baseFilters;
}

export const PackageManagement: React.FC<PackageManagementProps> = ({
  provider,
  isSuperAdmin = false,
}) => {
  const { authState } = useAuth();
  const userType = authState.user?.userType;
  const navigate = useNavigate();

  // State for modals and selected package
  const [showFormModal, setShowFormModal] = useState(false);
  const [editPackage, setEditPackage] = useState<Package | null>(null);
  const [deletePackage, setDeletePackage] = useState<Package | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    packages,
    bundles,
    loading,
    error,
    pagination,
    packageFilters,
    fetchPackages,
    fetchBundles,
    setPackageFilters,
  } = usePackage();

  const [searchTerm, setSearchTerm] = useState("");
  const [localFilters, setLocalFilters] = useState({
    provider: provider || "",
    isActive: "",
    includeDeleted: false,
  });
  const [viewMode, setViewMode] = useState<"packages" | "bundles">("packages");

  // Auto-detect super admin if not explicitly passed
  const isSuperAdminUser =
    isSuperAdmin || authState.user?.userType === "super_admin";

  useEffect(() => {
    if (viewMode === "packages") {
      fetchPackages();
    } else {
      fetchBundles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // Handle create or update
  const handleFormSubmit = async (
    data: CreatePackageData | UpdatePackageData
  ) => {
    setActionLoading(true);
    setActionError(null);
    try {
      if (editPackage?._id) {
        await packageService.updatePackage(
          editPackage._id,
          data as UpdatePackageData
        );
      } else {
        await packageService.createPackage(data as CreatePackageData);
      }
      setShowFormModal(false);
      setEditPackage(null);
      fetchPackages(undefined, {
        page: pagination.page,
        limit: pagination.limit,
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save package";
      setActionError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deletePackage?._id) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await packageService.deletePackage(deletePackage._id);
      setShowDeleteModal(false);
      setDeletePackage(null);
      fetchPackages(undefined, {
        page: pagination.page,
        limit: pagination.limit,
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete package";
      setActionError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newFilters = getEffectiveFilters(
      { ...packageFilters, search: searchTerm },
      provider
    );
    setPackageFilters(newFilters);
    if (viewMode === "packages") {
      fetchPackages(newFilters);
    } else {
      fetchBundles(newFilters);
    }
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    if (filterKey === "isActive") {
      setLocalFilters((prev) => ({ ...prev, isActive: value }));
    } else if (filterKey === "includeDeleted") {
      setLocalFilters((prev) => ({
        ...prev,
        includeDeleted: value === "true",
      }));
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setLocalFilters({
      provider: provider || "",
      isActive: "",
      includeDeleted: false,
    });
    const newFilters = provider ? { provider } : {};
    setPackageFilters(newFilters);
    if (viewMode === "packages") {
      fetchPackages(provider ? { provider } : undefined);
    } else {
      fetchBundles();
    }
  };

  const handlePageChange = (page: number) => {
    const newFilters = provider ? { provider } : packageFilters;
    if (viewMode === "packages") {
      fetchPackages(newFilters, { page });
    } else {
      fetchBundles(newFilters, { page });
    }
  };

  const currentItems = viewMode === "packages" ? packages || [] : bundles || [];

  // Filter options for the reusable component
  const filterOptions = {
    isActive: {
      value: localFilters.isActive,
      options: [
        { value: "", label: "All Status" },
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
      label: "Status",
      placeholder: "All Status",
    },
    includeDeleted: {
      value: localFilters.includeDeleted ? "true" : "false",
      options: [
        { value: "false", label: "Exclude Deleted" },
        { value: "true", label: "Include Deleted" },
      ],
      label: "Include Deleted",
      placeholder: "Exclude Deleted",
    },
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <FaExclamationCircle className="text-red-600" />
          </div>
          <div>
            <h3 className="font-medium text-red-800">
              Error Loading {viewMode === "packages" ? "Packages" : "Bundles"}
            </h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isSuperAdminUser
              ? "Package Management"
              : viewMode === "packages"
              ? "Package Groups"
              : "Data Bundles"}
          </h2>
          <p className="text-gray-600">
            {isSuperAdminUser
              ? "Create, update, and manage all packages"
              : `Manage your ${
                  viewMode === "packages" ? "package groups" : "data bundles"
                } and configurations`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Create Package Button (only for super admin or packages view) */}
          {(isSuperAdminUser || viewMode === "packages") && (
            <button
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => {
                setEditPackage(null);
                setShowFormModal(true);
              }}
            >
              <FaPlus className="mr-2" />
              Create Package
            </button>
          )}

          {/* View Mode Toggle (only for non-super admin) */}
          {!isSuperAdminUser && (
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("packages")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "packages"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Packages
              </button>
              <button
                onClick={() => setViewMode("bundles")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "bundles"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Bundles
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filters (only for non-super admin) */}
      {!isSuperAdminUser && (
        <SearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder={`Search ${
            viewMode === "packages" ? "packages" : "bundles"
          }...`}
          enableAutoSearch={true}
          debounceDelay={500}
          filters={filterOptions}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          onClearFilters={handleClearFilters}
          isLoading={loading}
        />
      )}

      {/* Error/Loading States */}
      {actionError && (
        <div className="text-red-600 text-sm mb-2">{actionError}</div>
      )}
      {(loading || actionLoading) && (
        <div className="text-gray-500 text-sm mb-2">Loading...</div>
      )}

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        </div>
      ) : currentItems.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center">
            <FaBox className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No {viewMode === "packages" ? "packages" : "bundles"} found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new{" "}
              {viewMode === "packages" ? "package" : "bundle"}.
            </p>
            <div className="mt-6">
              <p className="text-sm text-gray-500">
                {isSuperAdminUser
                  ? "Create a new package to get started."
                  : "Contact your administrator to add new packages."}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {viewMode === "packages" ? "Package" : "Bundle"} Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  {viewMode === "bundles" && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Validity
                      </th>
                    </>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {isSuperAdminUser && viewMode === "packages" && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(currentItems || []).map((item) => {
                  const providerColors = getProviderColors(
                    (item.provider || (item as Bundle).providerId) as string
                  );

                  return (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.name}
                          </div>
                          {item.description && (
                            <div className="text-sm text-gray-500">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: providerColors.background,
                            color: providerColors.text,
                          }}
                        >
                          {String(item.provider || "Unknown")}
                        </span>
                      </td>
                      {viewMode === "bundles" && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {(item as Bundle).dataVolume}{" "}
                            {(item as Bundle).dataUnit}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {(item as Bundle).validity}{" "}
                            {(item as Bundle).validityUnit}
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {viewMode === "bundles"
                          ? formatCurrency(
                              getPriceForUserType(item as Bundle, userType),
                              (item as Bundle).currency
                            )
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      {isSuperAdminUser && viewMode === "packages" && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                            {(item as Package).createdAt
                              ? (() => {
                                  const createdAt = (item as Package).createdAt;
                                  if (
                                    typeof createdAt === "string" ||
                                    typeof createdAt === "number"
                                  ) {
                                    return new Date(
                                      createdAt
                                    ).toLocaleDateString();
                                  }
                                  if (createdAt instanceof Date) {
                                    return createdAt.toLocaleDateString();
                                  }
                                  return "-";
                                })()
                              : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                            <button
                              className="text-blue-600 hover:text-blue-900"
                              onClick={() => {
                                setEditPackage(item as Package);
                                setShowFormModal(true);
                              }}
                              title="Edit Package"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={() => {
                                setDeletePackage(item as Package);
                                setShowDeleteModal(true);
                              }}
                              title="Delete Package"
                            >
                              <FaTrash />
                            </button>
                            <button
                              className="text-green-600 hover:text-green-900"
                              onClick={() =>
                                navigate(
                                  `/superadmin/packages/${item._id}/bundles`
                                )
                              }
                              title="View Bundles"
                            >
                              <FaEye />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {(pagination.page - 1) * pagination.limit + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(
                          pagination.page * pagination.limit,
                          pagination.total
                        )}
                      </span>{" "}
                      of <span className="font-medium">{pagination.total}</span>{" "}
                      results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.pages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal (only for super admin) */}
      {isSuperAdminUser && (
        <PackageFormModal
          open={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setEditPackage(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={editPackage}
        />
      )}

      {/* Delete Confirmation Modal (only for super admin) */}
      {isSuperAdminUser && showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h2 className="text-lg font-bold mb-4">Delete Package</h2>
            <p>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deletePackage?.name}</span>?
            </p>
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePackage(null);
                }}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                onClick={handleDelete}
                disabled={actionLoading}
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
