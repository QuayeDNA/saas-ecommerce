import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      '@design-system': '/src/design-system',
      '@components': '/src/components',
      '@hooks': '/src/hooks',
      '@utils': '/src/utils',
      '@pages': '/src/pages',
      '@services': '/src/services',
      '@contexts': '/src/contexts',
      '@providers': '/src/providers',
      '@layouts': '/src/layouts',
      '@assets': '/src/assets',
      '@types': '/src/types',
      '@routes': '/src/routes',
    },
  },
  // Performance optimizations
  build: {
    // Rollup options for optimized bundling
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          icons: ['react-icons'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          http: ['axios', 'js-cookie'],
          ui: ['@tanstack/react-query'],
        },
      },
    },
    // Compress assets
    minify: 'terser',
    // Generate source maps for better debugging
    sourcemap: true,
  },
  // Development server optimizations
  server: {
    // Enable hot module replacement
    hmr: true,
    // Open browser on server start
    open: true,
  },
  // Enable dependency pre-bundling for faster cold starts
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
  },
})
