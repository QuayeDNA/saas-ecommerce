// src/contexts/StorefrontContext.tsx
import React, {
  createContext,
  useReducer,
  useEffect,
  type ReactNode,
} from "react";
import {
  storefrontService,
  type Storefront,
  type OrderSummary,
  type CreateStorefrontData,
  type PaymentMethod,
  type UploadResult,
} from "../services/storefront.service";
import { useAuth } from "./AuthContext";

interface StorefrontAnalytics {
  totalOrders: number;
  totalRevenue: number;
  totalProfit: number;
  conversionRate: number;
  totalViews?: number;
  recentOrders?: OrderSummary[];
  revenueByPeriod?: Array<{
    period: string;
    revenue: number;
    profit: number;
  }>;
  monthlyData?: Array<{
    month: string;
    orders: number;
    revenue: number;
    profit: number;
    views: number;
  }>;
  topProducts?: Array<{
    name: string;
    orders: number;
    revenue: number;
    profit: number;
  }>;
  paymentMethodStats?: Array<{
    method: string;
    orders: number;
    revenue: number;
  }>;
  recentActivity?: Array<{
    type: string;
    description: string;
    timestamp: string;
    amount?: number;
  }>;
}

interface PublicStorefront {
  _id: string;
  businessName: string;
  displayName?: string;
  description?: string;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
  paymentMethods: PaymentMethod[];
  settings: {
    contactInfo: {
      phone?: string;
      email?: string;
      whatsapp?: string;
    };
  };
  isActive: boolean;
  isPublic?: boolean;
}

interface StorefrontBundle {
  _id: string;
  name: string;
  description?: string;
  price: number;
  customPrice?: number;
  markup?: number;
  provider: string;
  category: string;
  isActive: boolean;
}

interface StorefrontState {
  storefront: Storefront | null;
  pendingOrders: OrderSummary[];
  loading: boolean;
  error: string | null;
}

type StorefrontAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_STOREFRONT"; payload: Storefront | null }
  | { type: "SET_PENDING_ORDERS"; payload: OrderSummary[] }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "UPDATE_STOREFRONT"; payload: Partial<Storefront> }
  | { type: "ADD_PENDING_ORDER"; payload: OrderSummary }
  | { type: "REMOVE_PENDING_ORDER"; payload: string };

const initialState: StorefrontState = {
  storefront: null,
  pendingOrders: [],
  loading: false,
  error: null,
};

function storefrontReducer(
  state: StorefrontState,
  action: StorefrontAction,
): StorefrontState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_STOREFRONT":
      return { ...state, storefront: action.payload, error: null };
    case "SET_PENDING_ORDERS":
      return { ...state, pendingOrders: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "UPDATE_STOREFRONT":
      return {
        ...state,
        storefront: state.storefront
          ? { ...state.storefront, ...action.payload }
          : null,
      };
    case "ADD_PENDING_ORDER":
      return {
        ...state,
        pendingOrders: [action.payload, ...state.pendingOrders],
      };
    case "REMOVE_PENDING_ORDER":
      return {
        ...state,
        pendingOrders: state.pendingOrders.filter(
          (order) => order._id !== action.payload,
        ),
      };
    default:
      return state;
  }
}

interface StorefrontContextType extends StorefrontState {
  // Storefront management
  loadStorefront: () => Promise<void>;
  refreshStorefront: () => Promise<void>;
  createStorefront: (data: CreateStorefrontData) => Promise<void>;
  updateStorefront: (
    storefrontId: string,
    data: Partial<CreateStorefrontData>,
  ) => Promise<void>;

  // Payment methods
  addPaymentMethod: (
    storefrontId: string,
    paymentMethod: PaymentMethod,
  ) => Promise<void>;
  updatePaymentMethod: (
    storefrontId: string,
    methodId: string,
    paymentMethod: PaymentMethod,
  ) => Promise<void>;

  // Pricing
  setPricing: (
    storefrontId: string,
    pricing: { bundleId: string; customPrice: number }[],
  ) => Promise<void>;

  // Orders
  loadPendingOrders: () => Promise<void>;
  confirmPayment: (
    orderId: string,
    data: { transactionId: string; amountPaid: number; notes?: string },
  ) => Promise<void>;
  uploadPaymentProof: (orderId: string, file: File) => Promise<UploadResult>;

  // Analytics
  getAnalytics: (storefrontId: string) => Promise<StorefrontAnalytics>;

  // Public access
  getPublicStorefront: (businessName: string) => Promise<PublicStorefront>;
  getStorefrontBundles: (businessName: string) => Promise<StorefrontBundle[]>;
}

const StorefrontContext = createContext<StorefrontContextType | undefined>(
  undefined,
);

export { StorefrontContext };

interface StorefrontProviderProps {
  children: ReactNode;
}

export const StorefrontProvider: React.FC<StorefrontProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(storefrontReducer, initialState);
  const { authState } = useAuth();
  const { user } = authState;

  // Load storefront when user changes
  useEffect(() => {
    if (user && user.userType === "agent") {
      loadStorefront();
      loadPendingOrders();
    } else {
      dispatch({ type: "SET_STOREFRONT", payload: null });
      dispatch({ type: "SET_PENDING_ORDERS", payload: [] });
    }
  }, [user]);

  const loadStorefront = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const storefront = await storefrontService.getAgentStorefront();
      dispatch({ type: "SET_STOREFRONT", payload: storefront });
    } catch (error: unknown) {
      // If no storefront exists, that's okay - user needs to create one
      if (
        error instanceof Error &&
        "response" in error &&
        (error as { response?: { status?: number } }).response?.status === 404
      ) {
        dispatch({ type: "SET_STOREFRONT", payload: null });
      } else {
        dispatch({
          type: "SET_ERROR",
          payload:
            error instanceof Error
              ? error.message
              : "Failed to load storefront",
        });
      }
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const createStorefront = async (data: CreateStorefrontData) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const storefront = await storefrontService.createStorefront(data);
      dispatch({ type: "SET_STOREFRONT", payload: storefront });
    } catch (error: unknown) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error
            ? error.message
            : "Failed to create storefront",
      });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const updateStorefront = async (
    storefrontId: string,
    data: Partial<CreateStorefrontData>,
  ) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const storefront = await storefrontService.updateStorefront(
        storefrontId,
        data,
      );
      dispatch({ type: "UPDATE_STOREFRONT", payload: storefront });
    } catch (error: unknown) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error
            ? error.message
            : "Failed to update storefront",
      });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const addPaymentMethod = async (
    storefrontId: string,
    paymentMethod: PaymentMethod,
  ) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const storefront = await storefrontService.addPaymentMethod(
        storefrontId,
        paymentMethod,
      );
      dispatch({ type: "UPDATE_STOREFRONT", payload: storefront });
    } catch (error: unknown) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error
            ? error.message
            : "Failed to add payment method",
      });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const updatePaymentMethod = async (
    storefrontId: string,
    methodId: string,
    paymentMethod: PaymentMethod,
  ) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const storefront = await storefrontService.updatePaymentMethod(
        storefrontId,
        methodId,
        paymentMethod,
      );
      dispatch({ type: "UPDATE_STOREFRONT", payload: storefront });
    } catch (error: unknown) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error
            ? error.message
            : "Failed to update payment method",
      });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const setPricing = async (
    storefrontId: string,
    pricing: { bundleId: string; customPrice: number }[],
  ) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const storefront = await storefrontService.setPricing(
        storefrontId,
        pricing,
      );
      dispatch({ type: "UPDATE_STOREFRONT", payload: storefront });
    } catch (error: unknown) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to set pricing",
      });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const loadPendingOrders = async () => {
    try {
      const orders = await storefrontService.getPendingOrders();
      dispatch({ type: "SET_PENDING_ORDERS", payload: orders });
    } catch (error: unknown) {
      console.error("Failed to load pending orders:", error);
    }
  };

  const confirmPayment = async (
    orderId: string,
    data: { transactionId: string; amountPaid: number; notes?: string },
  ) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      await storefrontService.confirmPayment(orderId, data);
      dispatch({ type: "REMOVE_PENDING_ORDER", payload: orderId });
    } catch (error: unknown) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to confirm payment",
      });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const uploadPaymentProof = async (orderId: string, file: File) => {
    return await storefrontService.uploadPaymentProof(orderId, file);
  };

  const getAnalytics = async (
    storefrontId: string,
  ): Promise<StorefrontAnalytics> => {
    return await storefrontService.getAnalytics(storefrontId);
  };

  const getPublicStorefront = async (
    businessName: string,
  ): Promise<PublicStorefront> => {
    return await storefrontService.getPublicStorefront(businessName);
  };

  const getStorefrontBundles = async (
    businessName: string,
  ): Promise<StorefrontBundle[]> => {
    return await storefrontService.getStorefrontBundles(businessName);
  };

  const contextValue: StorefrontContextType = {
    ...state,
    loadStorefront,
    refreshStorefront: loadStorefront, // Alias for consistency
    createStorefront,
    updateStorefront,
    addPaymentMethod,
    updatePaymentMethod,
    setPricing,
    loadPendingOrders,
    confirmPayment,
    uploadPaymentProof,
    getAnalytics,
    getPublicStorefront,
    getStorefrontBundles,
  };

  return (
    <StorefrontContext.Provider value={contextValue}>
      {children}
    </StorefrontContext.Provider>
  );
};
