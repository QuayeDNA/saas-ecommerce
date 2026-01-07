// Service Worker for Push Notifications
// This is a minimal service worker focused on push notifications
// Workbox caching is handled by VitePWA generated service worker

// Workbox manifest placeholder - required for injectManifest strategy
// This will be replaced during build with the actual precache manifest
self.__WB_MANIFEST;

// Handle push notifications
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.body,
    icon: "/android-chrome-192x192.png",
    badge: "/favicon-32x32.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey,
      url: data.url || "/",
    },
    actions: [
      {
        action: "view",
        title: "View Details",
        icon: "/favicon-32x32.png",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "view") {
    const urlToOpen = event.notification.data.url || "/";

    event.waitUntil(
      clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((windowClients) => {
          // Check if there is already a window/tab open with the target URL
          for (let client of windowClients) {
            if (client.url === urlToOpen && "focus" in client) {
              return client.focus();
            }
          }
          // If not, open a new window/tab with the target URL
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// Handle install event
self.addEventListener("install", (event) => {
  console.log("Push Notification Service Worker installing.");
  self.skipWaiting();
});

// Handle activate event
self.addEventListener("activate", (event) => {
  console.log("Push Notification Service Worker activating.");
  event.waitUntil(clients.claim());
});
