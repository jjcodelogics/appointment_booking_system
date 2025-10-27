import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to the backend server
      '/api': {
        target: 'http://localhost:3000', // Your backend server
        changeOrigin: true, // Recommended for virtual hosts
      },
    },
  },
  // Build directly into the `public` directory so the Express server can serve the built frontend.
  // Set `emptyOutDir: false` to avoid deleting existing static assets (images) already in `public`.
  build: {
    outDir: 'public',
    emptyOutDir: false,
  },
});