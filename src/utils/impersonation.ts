// src/utils/impersonation.ts

import Cookies from "js-cookie";

export interface ImpersonationData {
  adminToken: string;
  impersonatedUser: any;
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
    impersonatedUser: any,
    impersonatedToken: string
  ): void {
    try {
      // Store admin token for later restoration
      localStorage.setItem(this.ADMIN_TOKEN_KEY, adminToken);

      // Set impersonation flag
      localStorage.setItem(this.IMPERSONATION_KEY, "true");

      // Set impersonated user's token
      localStorage.setItem(this.USER_TOKEN_KEY, impersonatedToken);

      // Set cookies for the impersonated user
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

      console.log("✅ Impersonation started successfully");
    } catch (error) {
      console.error("❌ Failed to start impersonation:", error);
      throw error;
    }
  }

  /**
   * End impersonation and restore admin session
   */
  static endImpersonation(): void {
    try {
      const adminToken = localStorage.getItem(this.ADMIN_TOKEN_KEY);

      if (adminToken) {
        // Restore admin token to cookies (auth service uses cookies)
        Cookies.set("authToken", adminToken, {
          secure: import.meta.env.PROD,
          sameSite: "strict",
          path: "/",
          expires: 7,
        });

        // Also set in localStorage for compatibility
        localStorage.setItem(this.USER_TOKEN_KEY, adminToken);

        // Clear impersonation data
        localStorage.removeItem(this.ADMIN_TOKEN_KEY);
        localStorage.removeItem(this.IMPERSONATION_KEY);

        // Clear impersonated user cookies
        Cookies.remove("user", { path: "/" });
        Cookies.remove("refreshToken", { path: "/" });
        Cookies.remove("rememberMe", { path: "/" });

        // Dispatch auth refresh event to trigger auth context refresh
        window.dispatchEvent(new CustomEvent("auth:refresh"));

        console.log("✅ Impersonation ended successfully");
      } else {
        console.warn("⚠️ No admin token found, clearing all auth data");
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
