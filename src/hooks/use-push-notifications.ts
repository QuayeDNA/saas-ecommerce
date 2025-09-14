import { useState, useEffect, useCallback, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission;
  isLoading: boolean;
}

export const usePushNotifications = () => {
  const { authState } = useContext(AuthContext)!;
  const { user } = authState;
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isSubscribed: false,
    permission: "default",
    isLoading: false,
  });

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = () => {
      const isSupported =
        "serviceWorker" in navigator && "PushManager" in window;
      setState((prev) => ({ ...prev, isSupported }));

      if (isSupported) {
        setState((prev) => ({ ...prev, permission: Notification.permission }));
      }
    };

    checkSupport();
  }, []);

  const checkSubscriptionStatus = useCallback(async () => {
    if (!state.isSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setState((prev) => ({ ...prev, isSubscribed: !!subscription }));
    } catch (error) {
      console.error("Error checking subscription status:", error);
    }
  }, [state.isSupported]);

  const subscribeToNotifications = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported || !user) return false;

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const registration = await navigator.serviceWorker.ready;

      // Get VAPID public key from server
      const response = await fetch("/api/push/vapid-public-key");
      const { publicKey } = await response.json();

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // Send subscription to server
      const subscribeResponse = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ subscription }),
      });

      const result = await subscribeResponse.json();

      if (result.success) {
        setState((prev) => ({ ...prev, isSubscribed: true, isLoading: false }));
        return true;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error subscribing to notifications:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [state.isSupported, user]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      setState((prev) => ({ ...prev, permission }));

      if (permission === "granted") {
        return await subscribeToNotifications();
      }

      return false;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, [state.isSupported, subscribeToNotifications]);

  // Check subscription status when user changes
  useEffect(() => {
    if (user && state.isSupported) {
      checkSubscriptionStatus();
    }
  }, [user, state.isSupported, checkSubscriptionStatus]);

  const unsubscribeFromNotifications =
    useCallback(async (): Promise<boolean> => {
      if (!state.isSupported) return false;

      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
          await subscription.unsubscribe();

          // Notify server
          await fetch("/api/push/unsubscribe", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
        }

        setState((prev) => ({
          ...prev,
          isSubscribed: false,
          isLoading: false,
        }));
        return true;
      } catch (error) {
        console.error("Error unsubscribing from notifications:", error);
        setState((prev) => ({ ...prev, isLoading: false }));
        return false;
      }
    }, [state.isSupported]);

  const sendTestNotification = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await fetch("/api/push/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title: "Test Notification",
          body: "This is a test push notification from BryteLinks!",
        }),
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error("Error sending test notification:", error);
      return false;
    }
  }, [user]);

  return {
    ...state,
    requestPermission,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    sendTestNotification,
  };
};

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  return Uint8Array.from(rawData, (char) => char.charCodeAt(0));
}
