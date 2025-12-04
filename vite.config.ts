import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.svg",
        "favicon-16x16.png",
        "favicon-32x32.png",
        "android-chrome-192x192.png",
        "android-chrome-512x512.png",
      ],
      manifest: {
        name: "BryteLinks - Telecom Solutions Platform",
        short_name: "BryteLinks",
        description:
          "A modern SaaS platform for telecommunication services. Purchase airtime for MTN, Vodafone, and AirtelTigo networks in Ghana with ease.",
        theme_color: "#142850",
        background_color: "#142850",
        display: "standalone",
        orientation: "portrait-primary",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
          {
            src: "/favicon-16x16.png",
            sizes: "16x16",
            type: "image/png",
          },
          {
            src: "/favicon-32x32.png",
            sizes: "32x32",
            type: "image/png",
          },
          {
            src: "/logo-192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/logo-512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
        categories: ["business", "finance", "utilities"],
        shortcuts: [
          {
            name: "Dashboard",
            short_name: "Dashboard",
            description: "Access your dashboard",
            url: "/dashboard",
            icons: [{ src: "/favicon-32x32.png", sizes: "32x32" }],
          },
          {
            name: "Orders",
            short_name: "Orders",
            description: "View your orders",
            url: "/orders",
            icons: [{ src: "/favicon-32x32.png", sizes: "32x32" }],
          },
          {
            name: "Wallet",
            short_name: "Wallet",
            description: "Check your wallet balance",
            url: "/wallet",
            icons: [{ src: "/favicon-32x32.png", sizes: "32x32" }],
          },
        ],
      },
      strategies:
        process.env.NODE_ENV === "production" ? "injectManifest" : "generateSW",
      srcDir: "public",
      filename: "sw.js",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // Clean old caches on activation
        cleanupOutdatedCaches: true,
        // Skip waiting to activate new service worker immediately
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          // HTML pages - always fetch fresh from network
          {
            urlPattern: /\.html$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "html-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60, // 1 hour only
              },
              networkTimeoutSeconds: 5,
            },
          },
          // JS and CSS - Network first for latest features
          {
            urlPattern: /\.(?:js|css)$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "assets-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
              networkTimeoutSeconds: 5,
            },
          },
          {
            urlPattern: /^https:\/\/api\./i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          // Exclude API routes from service worker caching to prevent 404s
          {
            urlPattern: /\/api\//,
            handler: "NetworkOnly",
            options: {
              cacheName: "api-bypass",
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: "classic",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": "/src",
      "@design-system": "/src/design-system",
      "@components": "/src/components",
      "@hooks": "/src/hooks",
      "@utils": "/src/utils",
      "@pages": "/src/pages",
      "@services": "/src/services",
      "@contexts": "/src/contexts",
      "@providers": "/src/providers",
      "@layouts": "/src/layouts",
      "@assets": "/src/assets",
      "@types": "/src/types",
      "@routes": "/src/routes",
    },
  },
  // Performance optimizations
  build: {
    // Rollup options for optimized bundling
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          icons: ["react-icons"],
          forms: ["react-hook-form", "@hookform/resolvers", "zod"],
          http: ["axios", "js-cookie"],
          ui: ["@tanstack/react-query"],
        },
        // Add hash to filenames for cache busting
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
    // Compress assets
    minify: "terser",
    // Generate source maps for better debugging
    sourcemap: true,
  },
  // Development server optimizations
  server: {
    // Enable hot module replacement
    hmr: true,
    // Open browser on server start
    open: true,
    // Proxy API requests to backend
    proxy: {
      "/api": {
        target: "http://localhost:5050",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // Enable dependency pre-bundling for faster cold starts
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "axios"],
  },
});
