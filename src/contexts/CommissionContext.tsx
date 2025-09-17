// src/contexts/CommissionContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  commissionService,
  type CommissionRecord,
  type CommissionStatistics,
  type CommissionSettings,
  type CommissionCalculation,
  type CommissionFilters,
  type PayCommissionData,
  type PayMultipleCommissionsData,
  type RejectCommissionData,
  type RejectMultipleCommissionsData,
  type GenerateMonthlyCommissionsData,
  type MonthlyGenerationResult,
  type MultiplePaymentResult,
} from "../services/commission.service";
import { websocketService } from "../services/websocket.service";
import { useAuth } from "../hooks/use-auth";

interface CommissionContextType {
  // State
  commissions: CommissionRecord[];
  statistics: CommissionStatistics | null;
  settings: CommissionSettings | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Filters and pagination
  filters: CommissionFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };

  // Actions
  loadCommissions: (
    filters?: CommissionFilters,
    page?: number
  ) => Promise<void>;
  loadStatistics: () => Promise<void>;
  loadSettings: () => Promise<void>;
  loadAllData: () => Promise<void>;

  // Commission operations
  payCommission: (
    commissionId: string,
    data?: PayCommissionData
  ) => Promise<void>;
  payMultipleCommissions: (
    data: PayMultipleCommissionsData
  ) => Promise<MultiplePaymentResult>;
  rejectCommission: (
    commissionId: string,
    data?: RejectCommissionData
  ) => Promise<void>;
  rejectMultipleCommissions: (
    data: RejectMultipleCommissionsData
  ) => Promise<MultiplePaymentResult>;
  generateMonthlyCommissions: (
    data?: GenerateMonthlyCommissionsData
  ) => Promise<MonthlyGenerationResult>;
  updateCommissionSettings: (
    settings: Partial<CommissionSettings>
  ) => Promise<void>;

  // Calculation
  calculateCommission: (data: {
    agentId: string;
    tenantId: string;
    startDate: string;
    endDate: string;
  }) => Promise<CommissionCalculation>;

  // Utility
  refreshData: () => Promise<void>;
  clearError: () => void;
  setFilters: (filters: CommissionFilters) => void;
  resetFilters: () => void;
}

const CommissionContext = createContext<CommissionContextType | undefined>(
  undefined
);

export { CommissionContext };

interface CommissionProviderProps {
  children: React.ReactNode;
}

export const CommissionProvider: React.FC<CommissionProviderProps> = ({
  children,
}) => {
  // State
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [statistics, setStatistics] = useState<CommissionStatistics | null>(
    null
  );
  const [settings, setSettings] = useState<CommissionSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Filters and pagination
  const [filters, setFiltersState] = useState<CommissionFilters>({
    status: "pending",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    hasMore: false,
  });

  // Refs for WebSocket cleanup
  const websocketCleanupRef = useRef<(() => void) | null>(null);

  const { authState } = useAuth();

  // Error handling utility
  const handleError = useCallback((error: unknown, defaultMessage: string) => {
    let message = defaultMessage;
    if (error && typeof error === "object") {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      message = err.response?.data?.message || err.message || defaultMessage;
    }
    setError(message);
    console.error("Commission Context Error:", error);
  }, []);

  // Load commissions with filters and pagination
  const loadCommissions = useCallback(
    async (newFilters?: CommissionFilters, page = 1) => {
      if (!authState.isAuthenticated) {
        return;
      }

      const userType = authState.user?.userType;
      const isSuperAdmin = userType === "super_admin";

      if (!isSuperAdmin) {
        return; // Only super_admin can load all commissions
      }

      try {
        setIsLoading(true);
        setError(null);

        const activeFilters = newFilters || filters;
        const response = await commissionService.getAllCommissions(
          activeFilters
        );

        if (page === 1) {
          setCommissions(response);
        } else {
          setCommissions((prev) => [...prev, ...response]);
        }

        setPagination((prev) => ({
          ...prev,
          page,
          total: response.length,
          hasMore: response.length === pagination.limit,
        }));

        setLastUpdated(new Date());
      } catch (error) {
        handleError(error, "Failed to load commissions");
      } finally {
        setIsLoading(false);
      }
    },
    [
      authState.isAuthenticated,
      authState.user?.userType,
      filters,
      pagination.limit,
      handleError,
    ]
  );

  // Load statistics
  const loadStatistics = useCallback(async () => {
    if (!authState.isAuthenticated) return;

    try {
      const stats = await commissionService.getCommissionStatistics();
      setStatistics(stats);
    } catch (error) {
      handleError(error, "Failed to load commission statistics");
    }
  }, [authState.isAuthenticated, handleError]);

  // Load settings
  const loadSettings = useCallback(async () => {
    if (!authState.isAuthenticated) {
      return;
    }

    const userType = authState.user?.userType;
    const isSuperAdmin = userType === "super_admin";

    if (!isSuperAdmin) {
      return; // Only super_admin can load settings
    }

    try {
      const settingsData = await commissionService.getCommissionSettings();
      setSettings(settingsData);
    } catch (error) {
      handleError(error, "Failed to load commission settings");
    }
  }, [authState.isAuthenticated, authState.user?.userType, handleError]);

  // Load all data
  const loadAllData = useCallback(async () => {
    if (!authState.isAuthenticated) {
      return;
    }

    if (!authState.user) {
      return;
    }

    const userType = authState.user?.userType;
    const isSuperAdmin = userType === "super_admin";

    setIsLoading(true);
    try {
      // Load data based on user type
      const promises = [loadStatistics()]; // Statistics are available to all business users

      if (isSuperAdmin) {
        promises.push(loadCommissions(), loadSettings());
      }

      await Promise.all(promises);
    } catch (error) {
      handleError(error, "Failed to load commission data");
    } finally {
      setIsLoading(false);
    }
  }, [
    authState.isAuthenticated,
    authState.user,
    loadCommissions,
    loadStatistics,
    loadSettings,
    handleError,
  ]);

  // Pay single commission
  const payCommission = useCallback(
    async (commissionId: string, data: PayCommissionData = {}) => {
      try {
        setError(null);
        const updatedCommission = await commissionService.payCommission(
          commissionId,
          data
        );

        // Update local state optimistically
        setCommissions((prev) =>
          prev.map((commission) =>
            commission._id === commissionId ? updatedCommission : commission
          )
        );

        // Refresh statistics
        await loadStatistics();
        setLastUpdated(new Date());
      } catch (error) {
        handleError(error, "Failed to pay commission");
        throw error; // Re-throw for component handling
      }
    },
    [loadStatistics, handleError]
  );

  // Pay multiple commissions
  const payMultipleCommissions = useCallback(
    async (data: PayMultipleCommissionsData) => {
      try {
        setError(null);
        const result = await commissionService.payMultipleCommissions(data);

        // Update local state for successful payments
        setCommissions((prev) =>
          prev.map((commission) => {
            const paymentResult = result.results.find(
              (r) => r.commissionId === commission._id
            );
            return paymentResult?.success
              ? paymentResult.commission!
              : commission;
          })
        );

        // Refresh statistics
        await loadStatistics();
        setLastUpdated(new Date());

        return result;
      } catch (error) {
        handleError(error, "Failed to pay multiple commissions");
        throw error;
      }
    },
    [loadStatistics, handleError]
  );

  // Reject single commission
  const rejectCommission = useCallback(
    async (commissionId: string, data: RejectCommissionData = {}) => {
      try {
        setError(null);
        const updatedCommission = await commissionService.rejectCommission(
          commissionId,
          data
        );

        // Update local state optimistically
        setCommissions((prev) =>
          prev.map((commission) =>
            commission._id === commissionId ? updatedCommission : commission
          )
        );

        // Refresh statistics
        await loadStatistics();
        setLastUpdated(new Date());
      } catch (error) {
        handleError(error, "Failed to reject commission");
        throw error;
      }
    },
    [loadStatistics, handleError]
  );

  // Reject multiple commissions
  const rejectMultipleCommissions = useCallback(
    async (data: RejectMultipleCommissionsData) => {
      try {
        setError(null);
        const result = await commissionService.rejectMultipleCommissions(data);

        // Update local state for successful rejections
        setCommissions((prev) =>
          prev.map((commission) => {
            const rejectionResult = result.results.find(
              (r) => r.commissionId === commission._id
            );
            return rejectionResult?.success
              ? rejectionResult.commission!
              : commission;
          })
        );

        // Refresh statistics
        await loadStatistics();
        setLastUpdated(new Date());

        return result;
      } catch (error) {
        handleError(error, "Failed to reject multiple commissions");
        throw error;
      }
    },
    [loadStatistics, handleError]
  );

  // Generate monthly commissions
  const generateMonthlyCommissions = useCallback(
    async (data: GenerateMonthlyCommissionsData = {}) => {
      try {
        setError(null);
        const result = await commissionService.generateMonthlyCommissions(data);

        // Refresh data after generation
        await loadAllData();

        return result;
      } catch (error) {
        handleError(error, "Failed to generate monthly commissions");
        throw error;
      }
    },
    [loadAllData, handleError]
  );

  // Update commission settings
  const updateCommissionSettings = useCallback(
    async (newSettings: Partial<CommissionSettings>) => {
      try {
        setError(null);
        const updatedSettings =
          await commissionService.updateCommissionSettings(newSettings);
        setSettings(updatedSettings);
      } catch (error) {
        handleError(error, "Failed to update commission settings");
        throw error;
      }
    },
    [handleError]
  );

  // Calculate commission
  const calculateCommission = useCallback(
    async (data: {
      agentId: string;
      tenantId: string;
      startDate: string;
      endDate: string;
    }) => {
      try {
        setError(null);
        return await commissionService.calculateCommission(data);
      } catch (error) {
        handleError(error, "Failed to calculate commission");
        throw error;
      }
    },
    [handleError]
  );

  // Refresh all data
  const refreshData = useCallback(async () => {
    await loadAllData();
  }, [loadAllData]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Set filters
  const setFilters = useCallback((newFilters: CommissionFilters) => {
    setFiltersState(newFilters);
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFiltersState({ status: "pending" });
  }, []);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!authState.isAuthenticated || !authState.user?._id) return;

    // Connect to WebSocket
    websocketService.connect(authState.user._id);

    // Handle commission-related events
    const handleCommissionUpdate = (data: unknown) => {
      // Type guard for commission data
      if (
        typeof data === "object" &&
        data !== null &&
        "type" in data &&
        "commission" in data
      ) {
        const commissionData = data as {
          type: string;
          commission: CommissionRecord;
        };

        if (commissionData.type === "commission_update") {
          // Update commission in local state
          setCommissions((prev) =>
            prev.map((commission) =>
              commission._id === commissionData.commission._id
                ? commissionData.commission
                : commission
            )
          );
          loadStatistics();
          setLastUpdated(new Date());
        }

        if (commissionData.type === "commission_created") {
          // Add new commission to the list
          setCommissions((prev) => [commissionData.commission, ...prev]);
          loadStatistics();
          setLastUpdated(new Date());
        }

        if (commissionData.type === "commission_paid") {
          // Update commission status
          setCommissions((prev) =>
            prev.map((commission) =>
              commission._id === commissionData.commission._id
                ? commissionData.commission
                : commission
            )
          );
          loadStatistics();
          setLastUpdated(new Date());
        }
      }
    };

    // Listen for commission events
    websocketService.on("commission", handleCommissionUpdate);

    // Store cleanup function
    websocketCleanupRef.current = () => {
      websocketService.off("commission", handleCommissionUpdate);
      websocketService.disconnect();
    };

    // Cleanup on unmount
    return () => {
      if (websocketCleanupRef.current) {
        websocketCleanupRef.current();
      }
    };
  }, [authState.isAuthenticated, authState.user?._id, loadStatistics]);

  // Initial data load
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      loadAllData();
    } else {
      // Clear data when user logs out
      setCommissions([]);
      setStatistics(null);
      setSettings(null);
      setLastUpdated(null);
    }
  }, [
    authState.isAuthenticated,
    authState.user,
    authState.user?.userType,
    loadAllData,
  ]);

  const value: CommissionContextType = {
    // State
    commissions,
    statistics,
    settings,
    isLoading,
    error,
    lastUpdated,

    // Filters and pagination
    filters,
    pagination,

    // Actions
    loadCommissions,
    loadStatistics,
    loadSettings,
    loadAllData,

    // Commission operations
    payCommission,
    payMultipleCommissions,
    rejectCommission,
    rejectMultipleCommissions,
    generateMonthlyCommissions,
    updateCommissionSettings,

    // Calculation
    calculateCommission,

    // Utility
    refreshData,
    clearError,
    setFilters,
    resetFilters,
  };

  return (
    <CommissionContext.Provider value={value}>
      {children}
    </CommissionContext.Provider>
  );
};
