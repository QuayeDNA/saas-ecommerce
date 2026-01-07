// src/components/PushNotificationInitializer.tsx
import { useEffect } from "react";
import { useAuth } from "../hooks";
import pushNotificationService from "../services/pushNotificationService";

const PushNotificationInitializer: React.FC = () => {
  const { authState } = useAuth();

  useEffect(() => {
    const initPushNotifications = async () => {
      const isImpersonating =
        typeof window !== "undefined" &&
        localStorage.getItem("impersonation") === "true";

      if (authState.user && !isImpersonating) {
        try {
          console.log("Initializing push notifications...");
          await pushNotificationService.init();
          console.log("Push notifications initialized");

          // Request permission if not already granted
          const permission = await pushNotificationService.requestPermission();
          console.log("Notification permission:", permission);

          if (permission === "granted") {
            console.log("Subscribing to push notifications...");
            const subscribed = await pushNotificationService.subscribe();
            console.log("Subscription result:", subscribed);
          }
        } catch (error) {
          console.error("Failed to initialize push notifications:", error);
        }
      }
    };

    initPushNotifications();
  }, [authState.user]);

  return null; // This component doesn't render anything
};

export default PushNotificationInitializer;
