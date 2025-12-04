import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import "./index.css";
import App from "./App.tsx";

// Create a client for React Query
const queryClient = new QueryClient();

// Version check and cache busting for iPhone users
const APP_VERSION = import.meta.env.VITE_APP_VERSION;
const STORAGE_KEY = "app_version";

// Check if app version has changed (only if version is configured)
const checkVersion = () => {
  // Skip version check if no version is configured
  if (!APP_VERSION) {
    return true;
  }

  const storedVersion = localStorage.getItem(STORAGE_KEY);

  if (storedVersion && storedVersion !== APP_VERSION) {
    // Version changed - clear caches and reload
    console.log(
      `App version changed from ${storedVersion} to ${APP_VERSION}. Clearing caches...`
    );

    // Clear all caches
    if ("caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }

    // Update stored version
    localStorage.setItem(STORAGE_KEY, APP_VERSION);

    // Force hard reload
    window.location.reload();
    return false;
  }

  // Store current version
  localStorage.setItem(STORAGE_KEY, APP_VERSION);
  return true;
};

// Check version before rendering
if (checkVersion()) {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <App />
          <Analytics />
        </QueryClientProvider>
      </BrowserRouter>
    </StrictMode>
  );
}
