import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;
  userId: string;
  userType: string;
  tenantId?: string;
}

class TokenRefreshService {
  private refreshTimeout: NodeJS.Timeout | null = null;
  private readonly REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry

  /**
   * Start proactive token refresh
   */
  startTokenRefresh(): void {
    this.scheduleNextRefresh();
  }

  /**
   * Stop token refresh
   */
  stopTokenRefresh(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  /**
   * Schedule the next token refresh
   */
  private scheduleNextRefresh(): void {
    const token = Cookies.get('authToken');
    if (!token) {
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const now = Date.now();
      const expiryTime = decoded.exp * 1000; // Convert to milliseconds
      const timeUntilExpiry = expiryTime - now;
      const timeUntilRefresh = timeUntilExpiry - this.REFRESH_THRESHOLD;

      // If token expires soon, refresh immediately
      if (timeUntilRefresh <= 0) {
        this.refreshToken();
        return;
      }

      // Schedule refresh before expiry
      this.refreshTimeout = setTimeout(() => {
        this.refreshToken();
      }, timeUntilRefresh);

      console.log(`Token refresh scheduled in ${Math.round(timeUntilRefresh / 1000 / 60)} minutes`);
    } catch (error) {
      console.error('Failed to decode token for refresh scheduling:', error);
    }
  }

  /**
   * Refresh the access token
   */
  private async refreshToken(): Promise<void> {
    try {
      const refreshToken = Cookies.get('refreshToken');
      if (!refreshToken) {
        console.warn('No refresh token available');
        return;
      }

      console.log('🔄 Proactively refreshing token...');

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL ?? 'http://localhost:5050'}/api/auth/refresh`,
        { refreshToken },
        { withCredentials: true }
      );

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      const rememberMe = !!Cookies.get('rememberMe');

      // Store new tokens
      this.storeTokens(accessToken, newRefreshToken, rememberMe);

      console.log('✅ Token refreshed successfully');

      // Schedule next refresh
      this.scheduleNextRefresh();
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      
      // Clear tokens and trigger logout
      this.clearTokens();
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
  }

  /**
   * Store tokens in cookies
   */
  private storeTokens(accessToken: string, refreshToken: string, rememberMe: boolean): void {
    const cookieExpires = rememberMe ? 30 : 7;
    const cookieOptions = {
      secure: import.meta.env.PROD,
      sameSite: 'strict' as const,
      path: '/',
      expires: cookieExpires
    };

    Cookies.set('authToken', accessToken, cookieOptions);
    if (refreshToken) {
      Cookies.set('refreshToken', refreshToken, cookieOptions);
    }
  }

  /**
   * Clear all tokens
   */
  private clearTokens(): void {
    Cookies.remove('authToken');
    Cookies.remove('refreshToken');
    Cookies.remove('user');
  }

  /**
   * Check if token is about to expire
   */
  isTokenExpiringSoon(): boolean {
    const token = Cookies.get('authToken');
    if (!token) {
      return false;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const now = Date.now();
      const expiryTime = decoded.exp * 1000;
      const timeUntilExpiry = expiryTime - now;

      return timeUntilExpiry <= this.REFRESH_THRESHOLD;
    } catch (error) {
      console.error('Failed to decode token for expiry check:', error);
      return false;
    }
  }

  /**
   * Get token expiry time in minutes
   */
  getTokenExpiryMinutes(): number {
    const token = Cookies.get('authToken');
    if (!token) {
      return 0;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const now = Date.now();
      const expiryTime = decoded.exp * 1000;
      const timeUntilExpiry = expiryTime - now;

      return Math.round(timeUntilExpiry / 1000 / 60);
    } catch (error) {
      console.error('Failed to decode token for expiry calculation:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const tokenRefreshService = new TokenRefreshService(); 