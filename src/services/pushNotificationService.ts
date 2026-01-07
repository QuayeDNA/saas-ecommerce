// src/services/pushNotificationService.ts
import { apiClient } from "../utils/api-client";
interface PushNotificationPreferences {
  enabled: boolean;
  orderUpdates: boolean;
  walletUpdates: boolean;
  commissionUpdates: boolean;
  announcements: boolean;
}
class PushNotificationService {
  private vapidPublicKey: string | null = null;
  private isSubscribed = false;

  /**
   * Initialize push notifications
   */
  async init(): Promise<void> {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push notifications not supported");
      return;
    }

    try {
      // Register service worker if not already registered
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered");

      // Get VAPID public key
      await this.fetchVapidPublicKey();

      // Check if already subscribed
      const subscription = await registration.pushManager.getSubscription();
      this.isSubscribed = !!subscription;

      if (this.isSubscribed) {
        console.log("Already subscribed to push notifications");
      }
    } catch (error) {
      console.error("Failed to initialize push notifications:", error);
    }
  }

  /**
   * Fetch VAPID public key from server
   */
  private async fetchVapidPublicKey(): Promise<void> {
    try {
      console.log(
        "Fetching VAPID public key from:",
        `${apiClient.defaults.baseURL}/api/push/vapid-public-key`
      );
      const response = await apiClient.get("/api/push/vapid-public-key");
      console.log("VAPID response status:", response.status);
      console.log("VAPID response data:", response.data);

      if (response.data.success && response.data.publicKey) {
        this.vapidPublicKey = response.data.publicKey;
        console.log(
          "VAPID public key set successfully:",
          this.vapidPublicKey!.substring(0, 20) + "..."
        );
      } else {
        console.error(
          "Failed to fetch VAPID public key - invalid response:",
          response.data
        );
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error fetching VAPID public key:", err.message);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response: { status: number; data: unknown };
        };
        console.error("Response status:", axiosError.response.status);
        console.error("Response data:", axiosError.response.data);
      }
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(): Promise<boolean> {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push notifications not supported in this browser");
      return false;
    }

    // Check if we're in a secure context (required for push notifications)
    if (!window.isSecureContext) {
      console.warn("Push notifications require a secure context (HTTPS)");
      return false;
    }

    // Ensure VAPID key is available
    if (!this.vapidPublicKey) {
      console.log("VAPID public key not available, fetching...");
      await this.fetchVapidPublicKey();
    }

    if (!this.vapidPublicKey) {
      console.error("Failed to get VAPID public key");
      return false;
    }

    // Validate VAPID key format (should decode to 65 bytes for P-256 key)
    try {
      const keyArray = this.urlBase64ToUint8Array(this.vapidPublicKey);
      if (keyArray.byteLength !== 65) {
        console.error(
          "Invalid VAPID key: decoded to",
          keyArray.byteLength,
          "bytes, expected 65 bytes"
        );
        return false;
      }
    } catch (err) {
      console.error("Failed to decode VAPID key:", err);
      return false;
    }

    console.log("VAPID key available, proceeding with subscription...");

    try {
      // Wait for service worker to be ready
      console.log("Waiting for service worker to be ready...");
      const registration = await navigator.serviceWorker.ready;
      console.log("Service worker ready, checking controller...");

      // Check if service worker is controlling the page
      if (!navigator.serviceWorker.controller) {
        console.warn(
          "Service worker is not controlling the page. Push notifications may not work."
        );
      }

      console.log(
        "Service worker controller:",
        navigator.serviceWorker.controller
      );
      console.log("Creating subscription...");

      // Check for existing subscription and unsubscribe if exists
      const existingSubscription =
        await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log("Found existing subscription, unsubscribing first...");
        await existingSubscription.unsubscribe();
      }

      // Convert VAPID key
      console.log(
        "Converting VAPID key:",
        this.vapidPublicKey.substring(0, 20) + "..."
      );
      const applicationServerKey = this.urlBase64ToUint8Array(
        this.vapidPublicKey
      );
      console.log(
        "Application server key length:",
        applicationServerKey.byteLength
      );
      const keyArray =
        applicationServerKey instanceof Uint8Array
          ? applicationServerKey
          : new Uint8Array(applicationServerKey as ArrayBuffer);
      console.log(
        "Application server key (first 10 bytes):",
        Array.from(keyArray.slice(0, 10))
      );

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });

      console.log("Subscription created successfully:", subscription.endpoint);

      console.log("Subscription created, sending to server...");

      // Send subscription to server
      const response = await apiClient.post("/api/push/subscribe", {
        subscription,
      });
      const data = response.data;

      if (data.success) {
        this.isSubscribed = true;
        console.log("Successfully subscribed to push notifications");
        return true;
      } else {
        console.error("Failed to subscribe:", data.message);
        return false;
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error subscribing to push notifications:", err);
      console.error("Error name:", err.name);
      console.error("Error message:", err.message);

      // Check if it's a common error
      if (err.name === "AbortError") {
        console.error(
          "Push service registration failed. This might be due to:"
        );
        console.error("- Invalid VAPID key format");
        console.error(
          "- Push service not available in this browser/environment"
        );
        console.error(
          "- HTTPS requirement not met (push notifications require HTTPS in production)"
        );
      }

      return false;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Notify server
        const response = await apiClient.post("/api/push/unsubscribe");
        const data = response.data;

        if (data.success) {
          this.isSubscribed = false;
          console.log("Successfully unsubscribed from push notifications");
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
      return false;
    }
  }

  /**
   * Get current subscription status
   */
  getSubscriptionStatus(): boolean {
    return this.isSubscribed;
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      return "denied";
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  /**
   * Get notification preferences from server
   */
  async getPreferences(): Promise<PushNotificationPreferences | null> {
    try {
      const response = await apiClient.get("/api/push/preferences");
      if (response.data.success) {
        return response.data.preferences;
      } else {
        console.error("Failed to get preferences:", response.data.message);
        return null;
      }
    } catch (error) {
      console.error("Error getting preferences:", error);
      return null;
    }
  }

  /**
   * Update notification preferences on server
   */
  async updatePreferences(
    preferences: Partial<PushNotificationPreferences>
  ): Promise<boolean> {
    try {
      const response = await apiClient.put("/api/push/preferences", {
        preferences,
      });
      if (response.data.success) {
        console.log("Preferences updated successfully");
        return true;
      } else {
        console.error("Failed to update preferences:", response.data.message);
        return false;
      }
    } catch (error) {
      console.error("Error updating preferences:", error);
      return false;
    }
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): BufferSource {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }
}

const pushNotificationService = new PushNotificationService();
export default pushNotificationService;
