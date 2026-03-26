/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import "./index.css";
import App from "./App.tsx";

// Create a client for React Query
const queryClient = new QueryClient();

// SECURITY: silence verbose console output in PRODUCTION builds to avoid leaking tokens or user data
if (import.meta.env.PROD) {
  console.log = (..._args: any[]) => {};
  console.info = (..._args: any[]) => {};
  console.debug = (..._args: any[]) => {};
  console.table = (..._args: any[]) => {};
}

// Version check and cache busting for iPhone users
const APP_VERSION = import.meta.env.VITE_APP_VERSION;
const STORAGE_KEY = "app_version";

const checkVersion = () => {
  if (!APP_VERSION) return true;

  const storedVersion = localStorage.getItem(STORAGE_KEY);
  if (storedVersion && storedVersion !== APP_VERSION) {
    if ("caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
    localStorage.setItem(STORAGE_KEY, APP_VERSION);
    window.location.reload();
    return false;
  }

  localStorage.setItem(STORAGE_KEY, APP_VERSION);
  return true;
};

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