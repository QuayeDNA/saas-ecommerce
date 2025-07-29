// src/contexts/UserContext.tsx
import React, { createContext, useState, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import {
  userService,
  type UpdateProfileData,
  type ChangePasswordData,
  type AfaRegistrationData,
  type UserStats,
  type AfaRegistration,
  type UsersResponse,
} from "../services/user.service";
import type { User } from "../types";
import { useToast } from "../design-system";

interface UserContextValue {
  // Profile management
  updateProfile: (data: UpdateProfileData) => Promise<User>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  getProfile: () => Promise<User>;
  // AFA Registration
  submitAfaRegistration: (
    data: AfaRegistrationData
  ) => Promise<AfaRegistration>;
  getAfaRegistration: () => Promise<AfaRegistration | null>;

  // User management
  getUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    userType?: string;
  }) => Promise<UsersResponse>;
  getUserById: (id: string) => Promise<User>;
  getUserStats: () => Promise<UserStats>;

  // Admin functions
  updateUserStatus: (
    id: string,
    data: { isVerified?: boolean; subscriptionStatus?: 'active' | 'inactive' | 'suspended' }
  ) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;

  // Loading states
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export { UserContext };

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback(
    (error: unknown, action: string) => {
      let message = `Failed to ${action}`;

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        message =
          axiosError.response?.data?.message ?? axiosError.message ?? message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      setError(message);
      addToast(message, "error");
      console.error(`UserContext Error (${action}):`, error);
    },
    [addToast]
  );

  const updateProfile = useCallback(
    async (data: UpdateProfileData): Promise<User> => {
      setIsLoading(true);
      setError(null);
      try {
        const user = await userService.updateProfile(data);
        addToast("Profile updated successfully", "success");
        return user;
      } catch (error) {
        handleError(error, "update profile");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [addToast, handleError]
  );

  const changePassword = useCallback(
    async (data: ChangePasswordData): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        await userService.changePassword(data);
        addToast("Password changed successfully", "success");
      } catch (error) {
        handleError(error, "change password");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [addToast, handleError]
  );

  const submitAfaRegistration = useCallback(
    async (data: AfaRegistrationData): Promise<AfaRegistration> => {
      setIsLoading(true);
      setError(null);
      try {
        const registration = await userService.submitAfaRegistration(data);
        addToast("AFA registration completed successfully", "success");
        return registration;
      } catch (error) {
        handleError(error, "submit AFA registration");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [addToast, handleError]
  );

  const getAfaRegistration =
    useCallback(async (): Promise<AfaRegistration | null> => {
      setIsLoading(true);
      setError(null);
      try {
        return await userService.getAfaRegistration();
      } catch (error) {
        handleError(error, "get AFA registration");
        throw error;
      } finally {
        setIsLoading(false);
      }
    }, [handleError]);

  const getUsers = useCallback(
    async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      userType?: string;
    }): Promise<UsersResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        return await userService.getUsers(params);
      } catch (error) {
        handleError(error, "get users");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError]
  );

  const getUserById = useCallback(
    async (id: string): Promise<User> => {
      setIsLoading(true);
      setError(null);
      try {
        return await userService.getUserById(id);
      } catch (error) {
        handleError(error, "get user");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError]
  );

  const getProfile = useCallback(async (): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      return await userService.getProfile();
    } catch (error) {
      handleError(error, "get profile");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const getUserStats = useCallback(async (): Promise<UserStats> => {
    setIsLoading(true);
    setError(null);
    try {
      return await userService.getUserStats();
    } catch (error) {
      handleError(error, "get user statistics");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const updateUserStatus = useCallback(
    async (
      id: string,
      data: {
        isVerified?: boolean;
        subscriptionStatus?: 'active' | 'inactive' | 'suspended';
      }
    ): Promise<User> => {
      setIsLoading(true);
      setError(null);
      try {
        const user = await userService.updateUser(id, data);
        addToast("User status updated successfully", "success");
        return user;
      } catch (error) {
        handleError(error, "update user status");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [addToast, handleError]
  );

  const deleteUser = useCallback(
    async (id: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        await userService.deleteUser(id);
        addToast("User deleted successfully", "success");
      } catch (error) {
        handleError(error, "delete user");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [addToast, handleError]
  );

  const value: UserContextValue = useMemo(
    () => ({
      updateProfile,
      changePassword,
      getProfile,
      submitAfaRegistration,
      getAfaRegistration,
      getUsers,
      getUserById,
      getUserStats,
      updateUserStatus,
      deleteUser,
      isLoading,
      error,
      clearError,
    }),
    [
      updateProfile,
      changePassword,
      getProfile,
      submitAfaRegistration,
      getAfaRegistration,
      getUsers,
      getUserById,
      getUserStats,
      updateUserStatus,
      deleteUser,
      isLoading,
      error,
      clearError,
    ]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
