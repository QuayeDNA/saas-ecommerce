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
      console.log("[Push] Service worker or PushManager not supported");
      return;
    }

    try {
      // Register service worker if not already registered
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("[Push] Service worker registered");

      // Get VAPID public key
      await this.fetchVapidPublicKey();

      // Check if already subscribed
      const subscription = await registration.pushManager.getSubscription();
      this.isSubscribed = !!subscription;
      console.log("[Push] Already subscribed:", this.isSubscribed);
    } catch (error) {
      console.error("[Push] Init failed:", error);
    }
  }

  /**
   * Fetch VAPID public key from server
   */
  private async fetchVapidPublicKey(): Promise<void> {
    try {
      const response = await apiClient.get("/api/push/vapid-public-key");

      if (response.data.success && response.data.publicKey) {
        this.vapidPublicKey = response.data.publicKey;
        console.log(
          "[Push] VAPID key fetched, length:",
          this.vapidPublicKey!.length
        );
      } else {
        console.warn("[Push] VAPID key fetch failed - no key in response");
      }
    } catch (error) {
      console.error("[Push] Failed to fetch VAPID key:", error);
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(): Promise<boolean> {
    console.log("[Push] Starting subscription process...");

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("[Push] Service worker or PushManager not available");
      return false;
    }

    // Check if we're in a secure context (required for push notifications)
    if (!window.isSecureContext) {
      console.warn("[Push] Not in secure context");
      return false;
    }

    // Ensure VAPID key is available
    if (!this.vapidPublicKey) {
      console.log("[Push] VAPID key not cached, fetching...");
      await this.fetchVapidPublicKey();
    }

    if (!this.vapidPublicKey) {
      console.error("[Push] No VAPID key available after fetch");
      return false;
    }

    // Validate VAPID key format (should decode to 65 bytes for P-256 key)
    try {
      const keyArray = this.urlBase64ToUint8Array(this.vapidPublicKey);
      if (keyArray.byteLength !== 65) {
        console.error("[Push] Invalid VAPID key length:", keyArray.byteLength);
        return false;
      }
      console.log("[Push] VAPID key validated");
    } catch (error) {
      console.error("[Push] VAPID key validation failed:", error);
      return false;
    }

    try {
      // Wait for service worker to be ready
      const registration = await navigator.serviceWorker.ready;
      console.log("[Push] Service worker ready");

      // Check for existing subscription and unsubscribe if exists
      const existingSubscription =
        await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log("[Push] Unsubscribing existing subscription");
        await existingSubscription.unsubscribe();
      }

      // Convert VAPID key
      const applicationServerKey = this.urlBase64ToUint8Array(
        this.vapidPublicKey
      );

      console.log("[Push] Creating new subscription...");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });
      console.log(
        "[Push] Subscription created, endpoint:",
        subscription.endpoint.substring(0, 50) + "..."
      );

      // Convert subscription to plain object with proper structure
      const subscriptionObject = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey("p256dh")!),
          auth: arrayBufferToBase64(subscription.getKey("auth")!),
        },
      };
      console.log("[Push] Subscription object created, sending to server...");

      // Send subscription to server
      const response = await apiClient.post("/api/push/subscribe", {
        subscription: subscriptionObject,
      });
      const data = response.data;

      if (data.success) {
        console.log("[Push] ✅ Subscription successful");
        this.isSubscribed = true;
        return true;
      } else {
        console.error("[Push] ❌ Server rejected subscription:", data);
        return false;
      }
    } catch (error) {
      console.error("[Push] ❌ Subscription failed:", error);
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
          return true;
        }
      }

      return false;
    } catch {
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
        return null;
      }
    } catch {
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
        return true;
      } else {
        return false;
      }
    } catch {
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

/**
 * Helper function to convert ArrayBuffer to Base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

const pushNotificationService = new PushNotificationService();
export default pushNotificationService;
