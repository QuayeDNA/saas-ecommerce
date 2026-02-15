// src/utils/impersonation.ts

import Cookies from "js-cookie";
import type { User } from "../types/auth";

export interface ImpersonationData {
  adminToken: string;
  adminUser: User;
  impersonatedUser: User;
  impersonatedToken: string;
}

/**
 * Impersonation Utility Service
 *
 * Handles all impersonation-related functionality including:
 * - Starting impersonation
 * - Ending impersonation
 * - Checking impersonation status
 * - Managing localStorage and cookies
 */

export class ImpersonationService {
  private static readonly IMPERSONATION_KEY = "impersonation";
  private static readonly ADMIN_TOKEN_KEY = "adminToken";
  private static readonly USER_TOKEN_KEY = "token";

  /**
   * Start impersonating a user
   */
  static startImpersonation(
    adminToken: string,
    adminUser: User,
    impersonatedUser: User,
    impersonatedToken: string,
    impersonatedRefreshToken?: string
  ): void {
    try {
      // Store admin data for later restoration
      localStorage.setItem(this.ADMIN_TOKEN_KEY, adminToken);
      localStorage.setItem("adminUser", JSON.stringify(adminUser));

      // Also store admin refresh token if available
      const adminRefreshToken = Cookies.get("refreshToken");
      if (adminRefreshToken) {
        localStorage.setItem("adminRefreshToken", adminRefreshToken);
      }

      // Set impersonation flag
      localStorage.setItem(this.IMPERSONATION_KEY, "true");

      // Set impersonated user's token
      localStorage.setItem(this.USER_TOKEN_KEY, impersonatedToken);

      // Set cookies for the impersonated user (access token + user)
      Cookies.set("authToken", impersonatedToken, {
        secure: import.meta.env.PROD,
        sameSite: "strict",
        path: "/",
        expires: 7,
      });

      Cookies.set("user", JSON.stringify(impersonatedUser), {
        secure: import.meta.env.PROD,
        sameSite: "strict",
        path: "/",
        expires: 7,
      });

      // If backend provided a refresh token for impersonation, set it so
      // the impersonated session can refresh normally. Also save a local
      // copy (helps with cleanup/debugging).
      if (impersonatedRefreshToken) {
        Cookies.set("refreshToken", impersonatedRefreshToken, {
          secure: import.meta.env.PROD,
          sameSite: "strict",
          path: "/",
          expires: 7,
        });
        try {
          localStorage.setItem("impersonatedRefreshToken", impersonatedRefreshToken);
        } catch {}
      }

      console.log("✅ Impersonation started successfully");
    } catch (error) {
      console.error("❌ Failed to start impersonation:", error);
      throw error;
    }
  }

  /**
   * End impersonation and restore admin session
   */
  static async endImpersonation(): Promise<void> {
    try {
      console.log("🔄 Ending impersonation...");
      const adminToken = localStorage.getItem(this.ADMIN_TOKEN_KEY);
      const adminUserData = localStorage.getItem("adminUser");
      const adminRefreshToken = localStorage.getItem("adminRefreshToken");

      console.log("🔍 Stored admin data:", {
        hasToken: !!adminToken,
        hasUserData: !!adminUserData,
        hasRefreshToken: !!adminRefreshToken,
        tokenLength: adminToken?.length
      });

      if (adminUserData) {
        const adminUser = JSON.parse(adminUserData);
        let tokenToUse = adminToken;

        // If we have an admin refresh token, prefer refreshing the admin access
        // token using it (handles the case where the stored access token is expired).
        if (adminRefreshToken) {
          console.log("🔄 Attempting to refresh admin token using stored refresh token...");
          try {
            const authService = (await import("../services/auth.service")).authService;

            // Temporarily set the refresh token cookie so refreshAccessToken() can use it
            Cookies.set("refreshToken", adminRefreshToken, {
              secure: import.meta.env.PROD,
              sameSite: "strict",
              path: "/",
              expires: 7,
            });

            const refreshed = await authService.refreshAccessToken();
            if (refreshed) {
              tokenToUse = refreshed;
              console.log("✅ Refreshed admin access token using refresh token");
            }
          } catch (refreshError) {
            console.warn("⚠️ Failed to refresh admin token:", refreshError);
            // fall through to try stored adminToken below
          }
        }

        // If refresh didn't yield a token, fall back to the stored admin access token
        if (!tokenToUse && adminToken) {
          tokenToUse = adminToken;
        }

        if (tokenToUse) {
          console.log("👤 Restoring admin user:", adminUser.userType, adminUser.email);

          // Restore admin token and user data to cookies
          Cookies.set("authToken", tokenToUse, {
            secure: import.meta.env.PROD,
            sameSite: "strict",
            path: "/",
            expires: 7,
          });

          Cookies.set("user", JSON.stringify(adminUser), {
            secure: import.meta.env.PROD,
            sameSite: "strict",
            path: "/",
            expires: 7,
          });

          // Restore refresh token if available
          if (adminRefreshToken) {
            Cookies.set("refreshToken", adminRefreshToken, {
              secure: import.meta.env.PROD,
              sameSite: "strict",
              path: "/",
              expires: 7,
            });
          }

          // Also set in localStorage for compatibility
          localStorage.setItem(this.USER_TOKEN_KEY, tokenToUse);
        }

        // Clear impersonation data
        localStorage.removeItem(this.ADMIN_TOKEN_KEY);
        localStorage.removeItem("adminUser");
        localStorage.removeItem("adminRefreshToken");
        localStorage.removeItem(this.IMPERSONATION_KEY);
        localStorage.removeItem("impersonatedRefreshToken");

        // If we didn't restore an admin refresh token, remove any lingering
        // impersonated refresh token cookie so background refresh won't run
        if (!adminRefreshToken) {
          Cookies.remove("refreshToken", { path: "/" });
        }

        // Dispatch auth refresh event to trigger auth context refresh
        console.log("📡 Dispatching auth refresh event...");
        window.dispatchEvent(new CustomEvent("auth:refresh"));

        console.log("✅ Impersonation ended successfully");
      } else {
        console.warn("⚠️ Admin user data missing, clearing all auth data");
        this.clearAllAuthData();
      }
    } catch (error) {
      console.error("❌ Failed to end impersonation:", error);
      // Fallback: clear all auth data
      this.clearAllAuthData();
      throw error;
    }
  }

  /**
   * Check if currently impersonating
   */
  static isImpersonating(): boolean {
    return (
      typeof window !== "undefined" &&
      localStorage.getItem(this.IMPERSONATION_KEY) === "true"
    );
  }

  /**
   * Get admin token if available
   */
  static getAdminToken(): string | null {
    return localStorage.getItem(this.ADMIN_TOKEN_KEY);
  }

  /**
   * Clear all authentication data (fallback)
   */
  static clearAllAuthData(): void {
    try {
      // Clear localStorage
      localStorage.removeItem(this.ADMIN_TOKEN_KEY);
      localStorage.removeItem("adminUser");
      localStorage.removeItem("adminRefreshToken");
      localStorage.removeItem(this.IMPERSONATION_KEY);
      localStorage.removeItem(this.USER_TOKEN_KEY);

      // Clear cookies
      Cookies.remove("authToken", { path: "/" });
      Cookies.remove("user", { path: "/" });
      Cookies.remove("refreshToken", { path: "/" });
      Cookies.remove("rememberMe", { path: "/" });
    } catch (error) {
      console.error("❌ Failed to clear auth data:", error);
    }
  }

  /**
   * Force redirect to super admin dashboard
   */
  static redirectToSuperAdmin(): void {
    window.location.href = "/superadmin";
  }

  /**
   * Force redirect to login page
   */
  static redirectToLogin(): void {
    window.location.href = "/login";
  }
}

export default ImpersonationService;
